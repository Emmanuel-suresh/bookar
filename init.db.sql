-- Tell MySQL to use your new database
USE bookmysuite_db;

-- 1. Users Table (Handles Login & Admin Roles)
CREATE TABLE Users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Bookings Table (Stores Guest Reservations)
CREATE TABLE Bookings (
    booking_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    room_name VARCHAR(100) NOT NULL,
    check_in_date DATE,
    total_amount DECIMAL(10, 2), -- Indian Standard: Total in INR
    booking_status ENUM('Pending', 'Confirmed', 'Cancelled') DEFAULT 'Pending',
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);