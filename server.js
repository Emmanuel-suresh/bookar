const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');

const app = express();

// Database Connection for XAMPP
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

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname)); 
app.use(session({
    secret: 'indian_stay_secret',
    resave: false,
    saveUninitialized: true
}));

// --- Authentication Routes ---

app.post('/signup', (req, res) => {
    const { name, email, password, role } = req.body;
    const sql = 'INSERT INTO Users (full_name, email, password_hash, role) VALUES (?, ?, ?, ?)';
    db.query(sql, [name, email, password, role], (err) => {
        if (err) return res.send("Registration failed. Email might already exist.");
        res.redirect('/login.html');
    });
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const sql = 'SELECT * FROM Users WHERE email = ? AND password_hash = ?';
    db.query(sql, [email, password], (err, results) => {
        if (results.length > 0) {
            req.session.user = results[0];
            res.redirect(results[0].role === 'admin' ? '/admin.html' : '/homepage.html');
        } else {
            res.send("Invalid login credentials.");
        }
    });
});

// --- Booking Route ---
app.post('/api/book', (req, res) => {
    if (!req.session.user) return res.status(401).send("Please login first.");
    const { room_name, amount } = req.body;
    const sql = 'INSERT INTO Bookings (user_id, room_name, total_amount) VALUES (?, ?, ?)';
    db.query(sql, [req.session.user.user_id, room_name, amount], (err) => {
        if (err) return res.status(500).send("Booking error.");
        res.redirect('/homepage.html');
    });
});

app.listen(3000, () => console.log('BookMySuite running at http://localhost:3000'));