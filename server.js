const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const cors = require('cors');

const app = express();

// --- 1. Middleware ---
app.use(cors());
// This allows the server to understand JSON sent from your fetch() call
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
    secret: 'indian_stay_secret',
    resave: false,
    saveUninitialized: true
}));

// --- 2. Database Connection ---
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',      // XAMPP default
    password: '',      // XAMPP default is blank
    database: 'bookmysuite_db'
});

db.connect(err => {
    if (err) {
        console.error('Database connection failed: ' + err.stack);
        return;
    }
    console.log('Connected to MySQL via XAMPP');
});

// --- 3. Authentication Routes ---

// SIGNUP ROUTE
app.post('/signup', (req, res) => {
    const { name, email, password, role } = req.body;
    const sql = 'INSERT INTO Users (full_name, email, password_hash, role) VALUES (?, ?, ?, ?)';
    
    db.query(sql, [name, email, password, role || 'user'], (err) => {
        if (err) {
            return res.status(500).json({ success: false, message: "Registration failed. Email might exist." });
        }
        res.json({ success: true, message: "Signup successful! Please login." });
    });
});

// LOGIN ROUTE
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const sql = 'SELECT * FROM Users WHERE email = ? AND password_hash = ?';
    
    db.query(sql, [email, password], (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: "Database error." });
        }

        if (results.length > 0) {
            // Store user in session
            req.session.user = results[0];
            
            // Send JSON with the redirect path back to the frontend
            res.json({ 
                success: true, 
                message: "Login successful",
                redirect: results[0].role === 'admin' ? '/admin.html' : '/homepage.html' 
            });
        } else {
            res.status(401).json({ success: false, message: "Invalid email or password." });
        }
    });
});

// --- 4. Booking Route ---
app.post('/api/book', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ success: false, message: "Please login first." });
    }
    
    const { room_name, amount } = req.body;
    const sql = 'INSERT INTO Bookings (user_id, room_name, total_amount) VALUES (?, ?, ?)';
    
    db.query(sql, [req.session.user.user_id, room_name, amount], (err) => {
        if (err) {
            return res.status(500).json({ success: false, message: "Booking error." });
        }
        res.json({ success: true, message: "Booking successful!" });
    });
});

// --- 5. Static Files (MUST BE LAST) ---
// This serves your HTML, CSS, and JS files
app.use(express.static(__dirname)); 

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`BookMySuite running at http://localhost:${PORT}`);
});