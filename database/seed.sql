-- Campus 360 Initial Seed Data
USE campus360_db;

-- Clear previous data in order
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE notifications;
TRUNCATE TABLE tickets;
TRUNCATE TABLE visitor_passes;
TRUNCATE TABLE route_stops;
TRUNCATE TABLE transport_routes;
TRUNCATE TABLE fees;
TRUNCATE TABLE attendance;
TRUNCATE TABLE teacher_profiles;
TRUNCATE TABLE student_profiles;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Insert Users (Password for all accounts is 'password123')
-- Hash: $2b$10$f66r8mYw50F0hR/6x0cRzOzU8x7j2.TfR.2tP1UaZ0.3iJzBfZi9i (bcrypt of 'password123')
INSERT INTO users (id, name, email, password_hash, role, phone, avatar, status) VALUES
(1, 'Dr. Sarah Jenkins', 'admin@campus360.edu', '$2b$10$f66r8mYw50F0hR/6x0cRzOzU8x7j2.TfR.2tP1UaZ0.3iJzBfZi9i', 'admin', '+1-555-0101', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80', 'active'),
(2, 'Prof. Marcus Vance', 'teacher@campus360.edu', '$2b$10$f66r8mYw50F0hR/6x0cRzOzU8x7j2.TfR.2tP1UaZ0.3iJzBfZi9i', 'teacher', '+1-555-0102', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80', 'active'),
(3, 'Aiden Montgomery', 'student@campus360.edu', '$2b$10$f66r8mYw50F0hR/6x0cRzOzU8x7j2.TfR.2tP1UaZ0.3iJzBfZi9i', 'student', '+1-555-0103', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80', 'active'),
(4, 'Rachel Sterling, CPA', 'accountant@campus360.edu', '$2b$10$f66r8mYw50F0hR/6x0cRzOzU8x7j2.TfR.2tP1UaZ0.3iJzBfZi9i', 'accountant', '+1-555-0104', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80', 'active'),
(5, 'Robert Henderson', 'driver@campus360.edu', '$2b$10$f66r8mYw50F0hR/6x0cRzOzU8x7j2.TfR.2tP1UaZ0.3iJzBfZi9i', 'driver', '+1-555-0105', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80', 'active'),
(6, 'Officer Vikram Singh', 'gate@campus360.edu', '$2b$10$f66r8mYw50F0hR/6x0cRzOzU8x7j2.TfR.2tP1UaZ0.3iJzBfZi9i', 'gate', '+1-555-0106', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80', 'active');

-- 2. Student & Teacher Profiles
INSERT INTO student_profiles (user_id, roll_number, grade, section, parent_name, parent_phone, bus_route_id) VALUES
(3, 'STD-2026-042', 'Grade 11', 'A', 'Eleanor Montgomery', '+1-555-0999', 1);

INSERT INTO teacher_profiles (user_id, employee_code, department, designation, qualification) VALUES
(2, 'TCH-8821', 'Physics & STEM', 'Senior Lecturer', 'M.Sc. Applied Physics');

-- 3. Transport Routes
INSERT INTO transport_routes (id, route_number, route_name, bus_number, driver_id, capacity, status) VALUES
(1, 'R-14', 'North Metro - Campus Express', 'BUS-304', 5, 45, 'on_route'),
(2, 'R-08', 'South Valley Transit', 'BUS-112', NULL, 36, 'idle');

INSERT INTO route_stops (route_id, stop_name, stop_order, estimated_pickup_time, estimated_drop_time) VALUES
(1, 'Pine Hill Station', 1, '07:15:00', '15:45:00'),
(1, 'Oakridge Crossing', 2, '07:30:00', '15:30:00'),
(1, 'Westfield Square', 3, '07:45:00', '15:15:00'),
(1, 'Campus Main Terminal', 4, '08:05:00', '15:00:00');

-- 4. Fees
INSERT INTO fees (student_id, invoice_no, title, total_amount, paid_amount, due_date, status, payment_method) VALUES
(3, 'INV-2026-001', 'Term 1 Tuition & Lab Fee', 1250.00, 1250.00, '2026-08-30', 'paid', 'Credit Card'),
(3, 'INV-2026-002', 'Term 2 Tuition & STEM Lab', 1350.00, 0.00, '2026-10-15', 'pending', NULL),
(3, 'INV-2026-003', 'Annual Bus Transport Pass', 450.00, 450.00, '2026-09-01', 'paid', 'Bank Transfer');

-- 5. Cross-Role Tickets
INSERT INTO tickets (ticket_number, sender_id, sender_role, target_role, category, subject, description, priority, status) VALUES
('TCK-8012', 3, 'student', 'accountant', 'fee', 'Term 2 STEM Lab Fee Discount Waiver', 'I was awarded a 15% academic STEM scholarship which should be deducted from invoice INV-2026-002.', 'medium', 'open'),
('TCK-8013', 3, 'teacher', 'attendance', 'Marked absent on Sept 18th mistakenly', 'I was participating in the Inter-school Science Olympiad and received an absence mark.', 'low', 'in_progress'),
('TCK-8014', 2, 'teacher', 'admin', 'leave', 'Medical Leave Application (Oct 4 - Oct 6)', 'Submitting leave application for medical procedure with doctor memo attached.', 'high', 'open'),
('TCK-8015', 5, 'driver', 'admin', 'transport', 'Bus-304 Hydraulic Brake Pressure Inspection', 'Brake pedal has slight sponge resistance. Recommending mechanical inspection today.', 'urgent', 'open'),
('TCK-8016', 6, 'gate', 'admin', 'security', 'Unregistered delivery vehicle at East Gate', 'Contractor vehicle attempted access without prior authorization pass.', 'high', 'resolved'),
('TCK-8017', 4, 'accountant', 'admin', 'financial_approval', 'Q3 Lab Equipment Procurement Approval', 'Requisition for 24 digital oscilloscopes totaling $7,800 awaiting executive approval.', 'medium', 'open');

-- 6. Visitor Passes
INSERT INTO visitor_passes (pass_number, visitor_name, visitor_phone, purpose, host_name, vehicle_number, check_in, status, issued_by) VALUES
('VP-4091', 'Jonathan Reed', '+1-555-8833', 'Parent-Teacher Academic Review', 'Prof. Marcus Vance', 'NY-992-K', NOW() - INTERVAL 45 MINUTE, 'active', 6),
('VP-4092', 'Dr. Claire Laurent', '+1-555-7711', 'Guest Lecturer in Robotics', 'Dr. Sarah Jenkins', 'MA-410-X', NOW() - INTERVAL 120 MINUTE, 'approved', 6);

-- 7. Notifications
INSERT INTO notifications (user_id, target_role, title, message, type) VALUES
(1, 'admin', 'New Capital Expense Requisition', 'Accountant Rachel Sterling submitted $7,800 Q3 Lab Procurement for approval.', 'info'),
(1, 'admin', 'Urgent Fleet Alert: Bus-304', 'Driver Robert reported brake pressure issue on Route 14.', 'urgent'),
(2, 'teacher', 'Student Attendance Dispute', 'Aiden Montgomery submitted proof of participation in Olympiad on Sept 18.', 'info'),
(3, 'student', 'Bus R-14 Live Status', 'Bus-304 has departed Westfield Square and is 15 mins away from Campus.', 'info'),
(4, 'accountant', 'New Fee Adjustment Ticket', 'Student Aiden requested scholarship deduction on invoice INV-2026-002.', 'warning'),
(6, 'gate', 'Visitor Arrival Scheduled', 'Dr. Claire Laurent registered for Guest Lecture with Principal at 11:30 AM.', 'info');
