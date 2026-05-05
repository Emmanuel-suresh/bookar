const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const db = mysql.createConnection({
    host: 'localhost', user: 'root', password: '', database: 'bookmysuite_db'
});

// User Registration with Unique ID Generation
app.post('/signup', (req, res) => {
    const { name, email, password, role, phone } = req.body;
    // Format: BMS-YEAR-RANDOM (e.g., BMS-2026-8821)
    const userId = `BMS-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const sql = 'INSERT INTO Users (user_id, full_name, email, password_hash, role, phone) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(sql, [userId, name, email, password, role, phone], (err) => {
        if (err) return res.status(500).json({ success: false });
        res.json({ success: true, userId });
    });
});

// Booking Submission & Room Update
app.post('/book', (req, res) => {
    const { userId, roomId, checkIn, checkOut, amount } = req.body;
    const sql = 'INSERT INTO Bookings (user_id, room_id, check_in, check_out, amount, status) VALUES (?, ?, ?, ?, ?, "Booked")';
    db.query(sql, [userId, roomId, checkIn, checkOut, amount], (err) => {
        // Also update the Room status to 'In Use'
        db.query('UPDATE Rooms SET status = "In Use" WHERE room_id = ?', [roomId]);
        res.json({ success: true });
    });
});
res.json({
    success: true,
    userId: user.user_id, // This maps the DB column 'user_id' to the JSON key 'userId'
    userName: user.full_name,
    role: user.role,
    redirect: user.role === 'admin' ? 'admin.html' : 'homepage.html'
});
app.post('/book-room', (req, res) => {
    const { user_id, room_id, check_in, check_out } = req.body;

    const sql = 'INSERT INTO Bookings (user_id, room_id, check_in, check_out) VALUES (?, ?, ?, ?)';
    
    db.query(sql, [user_id, room_id, check_in, check_out], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: "Database Error" });
        }
        res.json({ success: true, message: "Booking saved!" });
    });
});
app.listen(3000, () => console.log('BookMySuite Secure Server active on port 3000'));