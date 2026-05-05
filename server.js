const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const db = mysql.createConnection({
    host: 'localhost', 
    user: 'root', 
    password: '', 
    database: 'bookmysuite_db'
});

// 1. User Registration
app.post('/signup', (req, res) => {
    const { name, email, password, role, phone } = req.body;
    const userId = `BMS-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const sql = 'INSERT INTO Users (user_id, full_name, email, password_hash, role, phone) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(sql, [userId, name, email, password, role, phone], (err) => {
        if (err) {
            console.error("Signup Error:", err.message);
            return res.status(500).json({ success: false });
        }
        res.json({ success: true, userId });
    });
});

// 2. User Login
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const sql = 'SELECT * FROM Users WHERE email = ? AND password_hash = ?';
    
    db.query(sql, [email, password], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: "Server Error" });

        if (results.length > 0) {
            const user = results[0];
            res.json({
                success: true,
                userId: user.user_id,
                userName: user.full_name,
                role: user.role,
                redirect: user.role === 'admin' ? 'admin.html' : 'homepage.html'
            });
        } else {
            res.status(401).json({ success: false, message: "Invalid email or password." });
        }
    });
});

// 3. Room Booking (Fixed for room_id and identity_proof)
app.post('/book-room', (req, res) => {
    const { user_id, room_id, check_in, check_out, identity_proof } = req.body;

    const sql = 'INSERT INTO Bookings (user_id, room_id, check_in, check_out, identity_proof) VALUES (?, ?, ?, ?, ?)';
    
    db.query(sql, [user_id, room_id, check_in, check_out, identity_proof], (err, result) => {
        if (err) {
            console.error("DATABASE ERROR:", err.message); 
            return res.status(500).json({ success: false, message: err.message });
        }
        
        // Update room status to 'In Use'
        db.query('UPDATE Rooms SET status = "In Use" WHERE room_id = ?', [room_id]);
        res.json({ success: true, message: "Booking saved!" });
    });
});

// 4. Admin View
app.get('/admin/bookings', (req, res) => {
    const sql = `
        SELECT b.user_id, u.full_name, b.room_id, b.check_in, b.check_out, b.identity_proof 
        FROM Bookings b 
        JOIN Users u ON b.user_id = u.user_id
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.listen(3000, () => console.log('BookMySuite Server active on port 3000'));