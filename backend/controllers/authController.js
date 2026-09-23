const bcrypt = require('bcryptjs');
const { generateToken } = require('../config/jwt');
const { isMySQLConnected, query, mockDatabase } = require('../config/db');

// Standard credentials for quick testing
const DEMO_USERS = [
  { role: 'admin', email: 'admin@campus360.edu', name: 'Dr. Sarah Jenkins', title: 'Principal & Executive Director' },
  { role: 'teacher', email: 'teacher@campus360.edu', name: 'Prof. Marcus Vance', title: 'Senior Physics Faculty' },
  { role: 'student', email: 'student@campus360.edu', name: 'Aiden Montgomery', title: 'Grade 11-A Scholar' },
  { role: 'accountant', email: 'accountant@campus360.edu', name: 'Rachel Sterling, CPA', title: 'Chief Financial Bursar' },
  { role: 'driver', email: 'driver@campus360.edu', name: 'Robert Henderson', title: 'Fleet Lead - Bus 304' },
  { role: 'gate', email: 'gate@campus360.edu', name: 'Officer Vikram Singh', title: 'Campus Security Officer' }
];

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    let user = null;

    const searchTarget = email.toLowerCase().trim();
    if (isMySQLConnected()) {
      const rows = await query('SELECT * FROM users WHERE LOWER(email) = ? OR LOWER(roll_number) = ? OR LOWER(employee_code) = ? LIMIT 1', [searchTarget, searchTarget, searchTarget]);
      if (rows && rows.length > 0) {
        user = rows[0];
      }
    }

    // Fallback if not connected or not found in MySQL
    if (!user) {
      user = mockDatabase.users.find(u =>
        u.email.toLowerCase() === searchTarget ||
        (u.loginId && u.loginId.toLowerCase() === searchTarget) ||
        (u.employeeCode && u.employeeCode.toLowerCase() === searchTarget) ||
        (u.rollNumber && u.rollNumber.toLowerCase() === searchTarget)
      );
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. User does not exist.' });
    }

    // Check password
    let isMatch = false;
    if (user.password_hash) {
      isMatch = await bcrypt.compare(password, user.password_hash);
    }
    // Also accept 'password123' directly in demo mode
    if (!isMatch && password === 'password123') {
      isMatch = true;
    }

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid password. Try "password123".' });
    }

    const token = generateToken(user);

    return res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        title: user.title || user.role.toUpperCase(),
        phone: user.phone
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error during login.' });
  }
};

const quickLogin = async (req, res) => {
  try {
    const { role } = req.body;
    const targetUser = mockDatabase.users.find(u => u.role === role) || mockDatabase.users[0];

    const token = generateToken(targetUser);

    return res.json({
      success: true,
      message: `Quick logged in as ${targetUser.role}.`,
      token,
      user: {
        id: targetUser.id,
        name: targetUser.name,
        email: targetUser.email,
        role: targetUser.role,
        avatar: targetUser.avatar,
        title: targetUser.title || targetUser.role.toUpperCase(),
        phone: targetUser.phone
      }
    });
  } catch (error) {
    console.error('Quick login error:', error);
    return res.status(500).json({ success: false, message: 'Error during quick login.' });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = mockDatabase.users.find(u => u.id === req.user.id) || req.user;
    return res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        title: user.title
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error fetching profile.' });
  }
};

const getDemoAccounts = (req, res) => {
  return res.json({
    success: true,
    accounts: DEMO_USERS
  });
};

module.exports = {
  login,
  quickLogin,
  getProfile,
  getDemoAccounts
};
