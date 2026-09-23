const bcrypt = require('bcryptjs');
const { mockDatabase } = require('../config/db');

const getUsers = (req, res) => {
  const sanitizedUsers = (mockDatabase.users || []).map(({ password_hash, ...u }) => u);
  return res.json({
    success: true,
    users: sanitizedUsers
  });
};

const createUser = (req, res) => {
  try {
    const {
      name,
      email,
      role,
      phone,
      password,
      avatar,
      // Teacher fields
      department,
      employeeCode,
      // Student fields
      rollNumber,
      grade,
      parentName,
      parentPhone,
      busRoute,
      // Driver fields
      vehicleNo,
      routeNo,
      licenseNo,
      // Gate fields
      gatePost,
      shift,
      // Accountant fields
      title
    } = req.body;

    if (!name || !email || !role) {
      return res.status(400).json({ success: false, message: 'Name, email, and role are required.' });
    }

    // Check duplicate email
    const exists = mockDatabase.users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
    if (exists) {
      return res.status(400).json({ success: false, message: 'A user with this email address already exists.' });
    }

    const newId = mockDatabase.users.length + 1;
    const defaultAvatar = avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`;
    
    // Auto-generate Login ID based on role
    let autoLoginId = '';
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    switch (role.toLowerCase()) {
      case 'teacher': autoLoginId = employeeCode || `TCH-2026-${randomSuffix}`; break;
      case 'student': autoLoginId = rollNumber || `STD-2026-${randomSuffix}`; break;
      case 'driver': autoLoginId = `DRV-2026-${randomSuffix}`; break;
      case 'gate': autoLoginId = `SEC-2026-${randomSuffix}`; break;
      case 'accountant': autoLoginId = `ACC-2026-${randomSuffix}`; break;
      default: autoLoginId = `USR-2026-${randomSuffix}`; break;
    }

    const rawPassword = password && password.trim() ? password.trim() : `Campus#${randomSuffix}`;
    const passwordHash = bcrypt.hashSync(rawPassword, 10);

    const newUser = {
      id: newId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      loginId: autoLoginId,
      password_hash: passwordHash,
      role: role.toLowerCase(),
      phone: phone || '+1-555-0199',
      avatar: defaultAvatar,
      status: 'active',
      created_at: new Date().toISOString()
    };

    // Attach role-specific metadata
    switch (role.toLowerCase()) {
      case 'teacher':
        newUser.department = department || 'General Academics';
        newUser.employeeCode = autoLoginId;
        newUser.title = `Instructor (${newUser.department})`;
        break;
      case 'student':
        newUser.rollNumber = autoLoginId;
        newUser.grade = grade || 'Grade 10-A';
        newUser.parentName = parentName || 'Guardian';
        newUser.parentPhone = parentPhone || phone || '+1-555-0999';
        newUser.busRoute = busRoute || 'Route 14';
        // Also push to students list
        mockDatabase.studentsList.push({
          id: 100 + newId,
          name: newUser.name,
          roll: newUser.rollNumber,
          grade: newUser.grade,
          attendance: '100%',
          feeStatus: 'Paid',
          status: 'present'
        });
        break;
      case 'driver':
        newUser.vehicleNo = vehicleNo || 'BUS-304';
        newUser.routeNo = routeNo || 'R-14';
        newUser.licenseNo = licenseNo || `CDL-${Math.floor(10000 + Math.random() * 90000)}`;
        newUser.title = `Fleet Driver (${newUser.vehicleNo})`;
        break;
      case 'gate':
        newUser.gatePost = gatePost || 'Main West Gate';
        newUser.shift = shift || 'Day Shift';
        newUser.title = `Security Officer (${newUser.gatePost})`;
        break;
      case 'accountant':
        newUser.title = title || 'Bursar & Accounts Officer';
        break;
      default:
        newUser.title = 'Staff Member';
        break;
    }

    mockDatabase.users.push(newUser);

    // Create notification
    mockDatabase.notifications.unshift({
      id: mockDatabase.notifications.length + 1,
      target_role: 'admin',
      title: `New User Provisioned: ${newUser.name}`,
      message: `Account created for ${newUser.name} as ${newUser.role.toUpperCase()} (ID: ${newUser.loginId}).`,
      type: 'success',
      time: 'Just now',
      is_read: false
    });

    const { password_hash, ...sanitized } = newUser;

    return res.status(201).json({
      success: true,
      message: `User ${newUser.name} created successfully as ${newUser.role}.`,
      user: sanitized,
      loginCredentials: {
        loginId: newUser.loginId,
        email: newUser.email,
        password: rawPassword,
        role: newUser.role,
        name: newUser.name
      }
    });
  } catch (err) {
    console.error('createUser error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create new user.' });
  }
};

const updateUserStatus = (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const user = mockDatabase.users.find(u => u.id === Number(id));

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    user.status = status || (user.status === 'active' ? 'inactive' : 'active');

    return res.json({
      success: true,
      message: `User status changed to ${user.status}.`,
      status: user.status
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update user status.' });
  }
};

const deleteUser = (req, res) => {
  try {
    const { id } = req.params;
    const index = mockDatabase.users.findIndex(u => u.id === Number(id));

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const removed = mockDatabase.users.splice(index, 1)[0];

    return res.json({
      success: true,
      message: `User ${removed.name} deleted successfully.`
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to delete user.' });
  }
};

module.exports = {
  getUsers,
  createUser,
  updateUserStatus,
  deleteUser
};
