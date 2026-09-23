-- Campus 360 School ERP Database Schema
-- Compatible with MySQL 8.0+

CREATE DATABASE IF NOT EXISTS campus360_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE campus360_db;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'teacher', 'student', 'accountant', 'driver', 'gate') NOT NULL,
    phone VARCHAR(20),
    avatar VARCHAR(255) DEFAULT 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_role (role),
    INDEX idx_user_email (email)
) ENGINE=InnoDB;

-- 2. Student Profiles
CREATE TABLE IF NOT EXISTS student_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    roll_number VARCHAR(50) NOT NULL UNIQUE,
    grade VARCHAR(20) NOT NULL,
    section VARCHAR(10) NOT NULL,
    parent_name VARCHAR(120),
    parent_phone VARCHAR(20),
    bus_route_id INT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 3. Teacher Profiles
CREATE TABLE IF NOT EXISTS teacher_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    employee_code VARCHAR(50) NOT NULL UNIQUE,
    department VARCHAR(80) NOT NULL,
    designation VARCHAR(80) DEFAULT 'Subject Teacher',
    qualification VARCHAR(100),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 4. Attendance
CREATE TABLE IF NOT EXISTS attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    date DATE NOT NULL,
    status ENUM('present', 'absent', 'late', 'excused') DEFAULT 'present',
    marked_by INT NOT NULL,
    remarks VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_student_date (student_id, date),
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (marked_by) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 5. Fees & Invoices
CREATE TABLE IF NOT EXISTS fees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    invoice_no VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(150) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    paid_amount DECIMAL(10, 2) DEFAULT 0.00,
    due_date DATE NOT NULL,
    status ENUM('paid', 'partial', 'pending', 'overdue') DEFAULT 'pending',
    payment_method VARCHAR(50),
    payment_date DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 6. Transport & Fleet
CREATE TABLE IF NOT EXISTS transport_routes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    route_number VARCHAR(20) NOT NULL UNIQUE,
    route_name VARCHAR(150) NOT NULL,
    bus_number VARCHAR(30) NOT NULL,
    driver_id INT NULL,
    capacity INT DEFAULT 45,
    status ENUM('on_route', 'idle', 'maintenance', 'delayed') DEFAULT 'idle',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (driver_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS route_stops (
    id INT AUTO_INCREMENT PRIMARY KEY,
    route_id INT NOT NULL,
    stop_name VARCHAR(120) NOT NULL,
    stop_order INT NOT NULL,
    estimated_pickup_time TIME,
    estimated_drop_time TIME,
    FOREIGN KEY (route_id) REFERENCES transport_routes(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 7. Gate Security & Visitor Passes
CREATE TABLE IF NOT EXISTS visitor_passes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pass_number VARCHAR(50) NOT NULL UNIQUE,
    visitor_name VARCHAR(120) NOT NULL,
    visitor_phone VARCHAR(20) NOT NULL,
    purpose VARCHAR(255) NOT NULL,
    host_name VARCHAR(120) NOT NULL,
    vehicle_number VARCHAR(30),
    check_in TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    check_out TIMESTAMP NULL,
    status ENUM('active', 'approved', 'checked_out', 'denied') DEFAULT 'active',
    issued_by INT NOT NULL,
    FOREIGN KEY (issued_by) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 8. Cross-Role Tickets & Workflow Requests
CREATE TABLE IF NOT EXISTS tickets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ticket_number VARCHAR(50) NOT NULL UNIQUE,
    sender_id INT NOT NULL,
    sender_role ENUM('admin', 'teacher', 'student', 'accountant', 'driver', 'gate') NOT NULL,
    target_role ENUM('admin', 'teacher', 'student', 'accountant', 'driver', 'gate') NOT NULL,
    category ENUM('attendance', 'fee', 'transport', 'technical', 'academic', 'salary', 'leave', 'security', 'visitor', 'financial_approval', 'other') NOT NULL,
    subject VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    status ENUM('open', 'in_progress', 'resolved', 'rejected') DEFAULT 'open',
    resolution_notes TEXT,
    resolved_by INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (resolved_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_ticket_target (target_role),
    INDEX idx_ticket_status (status)
) ENGINE=InnoDB;

-- 9. Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    target_role ENUM('admin', 'teacher', 'student', 'accountant', 'driver', 'gate', 'all') DEFAULT 'all',
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('info', 'warning', 'success', 'urgent') DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;
