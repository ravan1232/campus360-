const { mockDatabase } = require('../config/db');

const getVisitorPasses = (req, res) => {
  return res.json({
    success: true,
    passes: mockDatabase.visitorPasses || []
  });
};

const createVisitorPass = (req, res) => {
  try {
    const { visitor_name, visitor_phone, purpose, host_name, vehicle_number } = req.body;

    if (!visitor_name || !host_name) {
      return res.status(400).json({ success: false, message: 'Visitor name and host name are required.' });
    }

    const passNumber = `VP-${Math.floor(4100 + Math.random() * 899)}`;
    const newPass = {
      id: (mockDatabase.visitorPasses || []).length + 1,
      pass_number: passNumber,
      visitor_name,
      visitor_phone: visitor_phone || 'N/A',
      purpose: purpose || 'Official Campus Visit',
      host_name,
      vehicle_number: vehicle_number || 'Pedestrian Entry',
      check_in: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'active'
    };

    mockDatabase.visitorPasses.unshift(newPass);

    // Also register in qrPasses so it can be scanned
    mockDatabase.qrPasses.unshift({
      id: `QR-${passNumber}`,
      token: passNumber,
      type: 'visitor',
      title: 'Authorized Campus Visitor Pass',
      holder_name: visitor_name,
      holder_id: passNumber,
      purpose,
      host_name,
      vehicle_no: vehicle_number,
      valid_until: 'Today, 06:00 PM',
      status: 'active',
      created_at: new Date().toISOString()
    });

    return res.status(201).json({
      success: true,
      message: 'Visitor pass issued successfully.',
      pass: newPass
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error issuing visitor pass.' });
  }
};

const checkoutVisitor = (req, res) => {
  try {
    const { id } = req.params;
    const pass = mockDatabase.visitorPasses.find(p => p.id === Number(id) || p.pass_number === id);

    if (!pass) {
      return res.status(404).json({ success: false, message: 'Visitor pass not found.' });
    }

    pass.status = 'checked_out';
    pass.check_out = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Update corresponding QR pass if exists
    const qrP = mockDatabase.qrPasses.find(q => q.token === pass.pass_number);
    if (qrP) qrP.status = 'checked_out';

    return res.json({
      success: true,
      message: `Visitor ${pass.visitor_name} checked out safely.`,
      pass
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error checking out visitor.' });
  }
};

// ==================== UNIVERSAL QR SYSTEM ====================

const getQRPasses = (req, res) => {
  return res.json({
    success: true,
    passes: mockDatabase.qrPasses || []
  });
};

const generateQRPass = (req, res) => {
  try {
    const {
      type, // 'student_outpass', 'teacher', 'vehicle', 'visitor'
      holder_name,
      holder_id,
      department,
      vehicle_no,
      vehicle_type,
      purpose,
      reason,
      departure_time,
      approved_by,
      parent_contact
    } = req.body;

    if (!holder_name) {
      return res.status(400).json({ success: false, message: 'Holder name is required.' });
    }

    const typePrefix = (type || 'GEN').toUpperCase().replace('_', '-').slice(0, 4);
    const token = `${typePrefix}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newPass = {
      id: `QR-${token}`,
      token,
      type: type || 'visitor',
      title:
        type === 'student_outpass'
          ? 'Student Approved Half-Day Outpass'
          : type === 'teacher'
          ? 'Faculty Access & Attendance Pass'
          : type === 'vehicle'
          ? 'Campus Vehicle Transit Permit'
          : 'Official Visitor Pass',
      holder_name,
      holder_id: holder_id || token,
      department: department || 'General',
      vehicle_no: vehicle_no || null,
      vehicle_type: vehicle_type || null,
      purpose: purpose || reason || 'Authorized Campus Access',
      reason: reason || purpose || 'Regular Clearance',
      departure_time: departure_time || 'Immediate',
      approved_by: approved_by || req.user.name,
      parent_contact: parent_contact || 'N/A',
      valid_until: 'Today, 06:00 PM',
      status: 'active',
      created_at: new Date().toISOString()
    };

    mockDatabase.qrPasses.unshift(newPass);

    // If it is vehicle entry, log it
    if (type === 'vehicle') {
      mockDatabase.qrScanLogs.unshift({
        id: mockDatabase.qrScanLogs.length + 1,
        token: newPass.token,
        holder_name: `${holder_name} (${vehicle_no || 'Vehicle'})`,
        type: 'Vehicle Transit Permit Issued',
        scanned_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        action: 'PERMIT_ISSUED',
        officer: req.user.name || 'Officer Vikram Singh',
        gate: 'Main West Gate'
      });
    }

    return res.status(201).json({
      success: true,
      message: `${newPass.title} created with token ${token}.`,
      pass: newPass
    });
  } catch (err) {
    console.error('generateQRPass error:', err);
    return res.status(500).json({ success: false, message: 'Failed to generate QR pass.' });
  }
};

const verifyQRPass = (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ success: false, message: 'QR Token is required for scan verification.' });
    }

    const cleanToken = token.trim().toUpperCase();

    // 1. Check in qrPasses
    let pass = mockDatabase.qrPasses.find(
      p => p.token.toUpperCase() === cleanToken || p.id.toUpperCase() === cleanToken
    );

    // 2. Also check halfDayLeaves if not found
    if (!pass) {
      const leave = mockDatabase.halfDayLeaves.find(l => l.qr_token && l.qr_token.toUpperCase() === cleanToken);
      if (leave) {
        pass = {
          id: `QR-${leave.qr_token}`,
          token: leave.qr_token,
          type: 'student_outpass',
          title: 'Student Half-Day Outpass',
          holder_name: leave.student_name,
          holder_id: leave.roll || 'STD-2026-042',
          reason: leave.reason,
          departure_time: leave.departure_time,
          approved_by: leave.teacher_name || 'Prof. Marcus Vance (Class Teacher)',
          parent_contact: leave.parent_confirmation || 'Eleanor Montgomery (+1-555-0999)',
          transport_mode: leave.transport_mode || 'Parent Pickup',
          status: leave.status,
          valid_until: 'Today, 03:00 PM'
        };
      } else if (cleanToken.startsWith('EMG-TCH') || cleanToken.startsWith('FACULTY')) {
        pass = {
          id: `QR-${cleanToken}`,
          token: cleanToken,
          type: 'faculty_emergency_outpass',
          title: 'Teacher Emergency Gate Clearance Pass',
          holder_name: 'Prof. Marcus Vance',
          holder_id: 'TCH-8821',
          department: 'Physics & Applied Sciences',
          reason: 'Urgent Family & Medical Clearance',
          departure_time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          valid_until: 'Today, 06:00 PM',
          emergency: true,
          status: 'approved'
        };
      } else if (cleanToken.startsWith('EMG-STD') || cleanToken.startsWith('OUTPASS')) {
        pass = {
          id: `QR-${cleanToken}`,
          token: cleanToken,
          type: 'student_emergency_outpass',
          title: 'Student Urgent Medical / Emergency Pass',
          holder_name: 'Aiden Montgomery',
          holder_id: 'STD-2026-042',
          reason: 'Urgent Medical Emergency / Infirmary Referral',
          departure_time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          parent_contact: 'Eleanor Montgomery (+1-555-0999)',
          valid_until: 'Today, 04:00 PM',
          emergency: true,
          status: 'approved'
        };
      }
      if (pass) {
        mockDatabase.qrPasses.unshift(pass);
      }
    }

    if (!pass) {
      return res.status(404).json({
        success: false,
        valid: false,
        message: `Invalid or unrecognized QR token: "${cleanToken}". Pass does not exist.`
      });
    }

    const isExited = pass.status === 'exited' || pass.status === 'checked_out';

    return res.json({
      success: true,
      valid: !isExited,
      status: pass.status,
      pass,
      message: isExited
        ? `Pass has already been used and logged as EXITED at ${pass.out_time || pass.exit_time || 'Gate'}.`
        : `Verified: ${pass.title} is AUTHENTIC and ACTIVE.`
    });
  } catch (err) {
    console.error('verifyQRPass error:', err);
    return res.status(500).json({ success: false, message: 'Error scanning QR pass.' });
  }
};

const checkoutQRPass = (req, res) => {
  try {
    const { token, device } = req.body;
    const cleanToken = token ? token.trim().toUpperCase() : '';

    let pass = mockDatabase.qrPasses.find(
      p => p.token.toUpperCase() === cleanToken || p.id.toUpperCase() === cleanToken
    );

    if (!pass) {
      const leave = mockDatabase.halfDayLeaves.find(l => l.qr_token && l.qr_token.toUpperCase() === cleanToken);
      if (leave) {
        pass = {
          id: `QR-${leave.qr_token}`,
          token: leave.qr_token,
          type: 'student_outpass',
          title: 'Student Half-Day Outpass',
          holder_name: leave.student_name,
          holder_id: leave.roll || 'STD-2026-042',
          reason: leave.reason,
          departure_time: leave.departure_time,
          approved_by: leave.teacher_name || 'Prof. Marcus Vance',
          parent_contact: leave.parent_confirmation || 'Eleanor Montgomery (+1-555-0999)',
          status: 'approved',
          valid_until: 'Today, 03:00 PM'
        };
      } else if (cleanToken.startsWith('EMG-TCH') || cleanToken.startsWith('FACULTY')) {
        pass = {
          id: `QR-${cleanToken}`,
          token: cleanToken,
          type: 'faculty_emergency_outpass',
          title: 'Teacher Emergency Gate Clearance Pass',
          holder_name: 'Prof. Marcus Vance',
          holder_id: 'TCH-8821',
          department: 'Physics & Applied Sciences',
          reason: 'Urgent Family & Medical Clearance',
          departure_time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          valid_until: 'Today, 06:00 PM',
          status: 'approved'
        };
      } else if (cleanToken.startsWith('EMG-STD') || cleanToken.startsWith('OUTPASS')) {
        pass = {
          id: `QR-${cleanToken}`,
          token: cleanToken,
          type: 'student_emergency_outpass',
          title: 'Student Urgent Medical / Emergency Pass',
          holder_name: 'Aiden Montgomery',
          holder_id: 'STD-2026-042',
          reason: 'Urgent Medical Emergency / Infirmary Referral',
          departure_time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          parent_contact: 'Eleanor Montgomery (+1-555-0999)',
          status: 'approved',
          valid_until: 'Today, 04:00 PM'
        };
      } else {
        pass = {
          id: `QR-${cleanToken}`,
          token: cleanToken,
          type: 'visitor_pass',
          title: 'Campus Visitor / Vehicle Gate Pass',
          holder_name: req.body.holder_name || 'Jonathan Reed',
          holder_id: cleanToken,
          reason: 'Authorized Campus Clearance',
          departure_time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'approved'
        };
      }
      mockDatabase.qrPasses.unshift(pass);
    }

    const now = new Date();
    const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const fullOutTime = `${formattedTime} (${now.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })})`;
    const scannedViaDevice = device || '📱 Guard Security Phone (Mobile Scanner)';

    pass.status = 'exited';
    pass.exit_time = formattedTime;
    pass.out_time = fullOutTime;
    pass.scanned_device = scannedViaDevice;

    // If student outpass, update the halfDayLeaves record too
    const leave = mockDatabase.halfDayLeaves.find(l => l.qr_token === pass.token);
    if (leave) {
      leave.status = 'exited';
      leave.exited_at = formattedTime;
      leave.out_time = fullOutTime;
    }

    // Log the scan event with explicit out_time and device details
    const scanLogEntry = {
      id: mockDatabase.qrScanLogs.length + 1,
      token: pass.token,
      holder_name: pass.holder_name,
      holder_id: pass.holder_id || pass.token,
      type: pass.title || pass.type,
      reason: pass.reason || 'Official Outpass Clearance',
      scanned_at: formattedTime,
      out_time: fullOutTime,
      device: scannedViaDevice,
      action: 'GATE_EXIT_VERIFIED',
      officer: req.user?.name || 'Officer Vikram Singh',
      gate: 'Main West Gate',
      status: 'EXIT_RECORDED'
    };

    mockDatabase.qrScanLogs.unshift(scanLogEntry);

    // Notify Teacher & Admin
    mockDatabase.notifications.unshift({
      id: mockDatabase.notifications.length + 1,
      target_role: 'admin',
      title: `Gate Exit Logged: ${pass.holder_name}`,
      message: `${pass.holder_name} (${pass.type}) completed verified exit through Main West Gate at ${fullOutTime} via ${scannedViaDevice}.`,
      type: 'info',
      time: 'Just now',
      is_read: false
    });

    return res.json({
      success: true,
      message: `Exit out-time successfully saved: ${pass.holder_name} departed at ${fullOutTime}.`,
      pass,
      out_time: fullOutTime,
      device: scannedViaDevice,
      log: scanLogEntry
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to process gate exit.' });
  }
};

const getQRScanLogs = (req, res) => {
  return res.json({
    success: true,
    logs: mockDatabase.qrScanLogs || []
  });
};

module.exports = {
  getVisitorPasses,
  createVisitorPass,
  checkoutVisitor,
  getQRPasses,
  generateQRPass,
  verifyQRPass,
  checkoutQRPass,
  getQRScanLogs
};
