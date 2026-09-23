const { mockDatabase } = require('../config/db');

// Role routing helper
const CATEGORY_ROLE_MAP = {
  // Student mappings
  attendance: 'teacher',
  fee: 'accountant',
  transport: 'admin',
  technical: 'admin',
  half_day_leave: 'teacher', // Student contacts class teacher for half-day leave
  // Teacher mappings
  student_issue: 'admin',
  salary: 'accountant',
  leave: 'admin',
  // Driver mappings
  vehicle: 'admin',
  route: 'admin',
  // Gate mappings
  security: 'admin',
  visitor: 'teacher',
  // Accountant mappings
  financial_approval: 'admin'
};

const getTickets = async (req, res) => {
  try {
    const { role, id } = req.user;
    const { status, filter } = req.query;

    let tickets = [...mockDatabase.tickets];

    // Admin sees all tickets
    if (role !== 'admin') {
      tickets = tickets.filter(t => t.target_role === role || t.sender_id === id);
    }

    if (status && status !== 'all') {
      tickets = tickets.filter(t => t.status === status);
    }

    tickets.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return res.json({
      success: true,
      count: tickets.length,
      tickets
    });
  } catch (error) {
    console.error('getTickets error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve tickets.' });
  }
};

const createTicket = async (req, res) => {
  try {
    const { target_role, category, subject, description, priority, departure_time, parent_confirmation, transport_mode } = req.body;
    const user = req.user;

    if (!subject || !description) {
      return res.status(400).json({ success: false, message: 'Subject and description are required.' });
    }

    const resolvedTargetRole = target_role || CATEGORY_ROLE_MAP[category] || 'admin';

    const newTicket = {
      id: mockDatabase.tickets.length + 1,
      ticket_number: `TCK-${Math.floor(1000 + Math.random() * 9000)}`,
      sender_id: user.id,
      sender_name: user.name,
      sender_role: user.role,
      target_role: resolvedTargetRole,
      category: category || 'general',
      subject,
      description,
      priority: priority || (category === 'half_day_leave' ? 'high' : 'medium'),
      status: 'open',
      departure_time,
      parent_confirmation,
      transport_mode,
      created_at: new Date().toISOString()
    };

    mockDatabase.tickets.unshift(newTicket);

    // If this is a student half-day leave, also sync with halfDayLeaves store
    if (category === 'half_day_leave') {
      mockDatabase.halfDayLeaves.unshift({
        id: mockDatabase.halfDayLeaves.length + 1,
        ticket_id: newTicket.id,
        ticket_number: newTicket.ticket_number,
        student_id: user.id,
        student_name: user.name,
        roll: user.rollNumber || 'STD-2026-042',
        grade: user.grade || 'Grade 11-A',
        teacher_id: 2,
        teacher_name: 'Prof. Marcus Vance',
        reason: description,
        departure_time: departure_time || '12:30 PM',
        parent_confirmation: parent_confirmation || 'Parent Confirmed',
        transport_mode: transport_mode || 'Parent Pickup',
        status: 'pending_teacher',
        qr_token: null,
        created_at: new Date().toISOString()
      });
    }

    // Create notification for target role
    mockDatabase.notifications.unshift({
      id: mockDatabase.notifications.length + 1,
      target_role: resolvedTargetRole,
      title: category === 'half_day_leave'
        ? `Half-Day Leave Request: ${user.name}`
        : `New ${newTicket.priority.toUpperCase()} Ticket: ${subject.substring(0, 30)}...`,
      message: category === 'half_day_leave'
        ? `${user.name} applied for half-day exit at ${departure_time || 'noon'}. Review and issue QR pass.`
        : `${user.name} (${user.role}) submitted: ${description.substring(0, 80)}...`,
      type: category === 'half_day_leave' ? 'urgent' : (newTicket.priority === 'urgent' ? 'urgent' : 'info'),
      time: 'Just now',
      is_read: false
    });

    return res.status(201).json({
      success: true,
      message: 'Workflow ticket routed and logged successfully.',
      ticket: newTicket
    });
  } catch (error) {
    console.error('createTicket error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create ticket.' });
  }
};

const updateTicketStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, resolution_notes } = req.body;

    const ticket = mockDatabase.tickets.find(t => t.id === Number(id) || t.ticket_number === id);

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found.' });
    }

    if (status) ticket.status = status;
    if (resolution_notes) ticket.resolution_notes = resolution_notes;
    ticket.updated_at = new Date().toISOString();
    ticket.resolved_by = req.user.name;

    // Check if this was a half-day leave being approved
    let generatedQrPass = null;
    if (ticket.category === 'half_day_leave' && (status === 'resolved' || status === 'approved')) {
      const token = `OUTPASS-STD042-${Math.floor(1000 + Math.random() * 9000)}`;
      
      const leave = mockDatabase.halfDayLeaves.find(l => l.ticket_id === ticket.id || l.student_id === ticket.sender_id);
      if (leave) {
        leave.status = 'approved';
        leave.qr_token = token;
      }

      generatedQrPass = {
        id: `QR-${token}`,
        token,
        type: 'student_outpass',
        title: 'Student Half-Day Digital Outpass',
        holder_name: ticket.sender_name,
        holder_id: 'STD-2026-042',
        role: 'student',
        reason: ticket.description || 'Half-Day Leave Granted',
        departure_time: ticket.departure_time || '12:30 PM',
        approved_by: req.user.name,
        parent_contact: ticket.parent_confirmation || '+1-555-0999',
        transport_mode: ticket.transport_mode || 'Parent Pickup',
        valid_until: 'Today, 03:00 PM',
        status: 'approved',
        created_at: new Date().toISOString()
      };

      mockDatabase.qrPasses.unshift(generatedQrPass);
      ticket.qr_token = token;

      // Special notification for student
      mockDatabase.notifications.unshift({
        id: mockDatabase.notifications.length + 1,
        user_id: ticket.sender_id,
        target_role: 'student',
        title: 'Half-Day Outpass APPROVED!',
        message: `Your class teacher approved your half-day leave. Token ${token} is active for gate scanning.`,
        type: 'success',
        time: 'Just now',
        is_read: false
      });
    }

    return res.json({
      success: true,
      message: `Ticket status updated to ${status}.`,
      ticket,
      qrPass: generatedQrPass
    });
  } catch (error) {
    console.error('updateTicketStatus error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update ticket.' });
  }
};

// ==================== HALF-DAY LEAVE ENDPOINTS ====================

const getHalfDayLeaves = (req, res) => {
  const { role, id } = req.user;
  let leaves = [...(mockDatabase.halfDayLeaves || [])];

  if (role === 'student') {
    leaves = leaves.filter(l => l.student_id === id || l.student_id === 3);
  }

  return res.json({
    success: true,
    leaves
  });
};

const approveHalfDayLeave = (req, res) => {
  try {
    const { id } = req.params;
    const leave = mockDatabase.halfDayLeaves.find(l => l.id === Number(id));

    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found.' });
    }

    const token = `OUTPASS-STD042-${Math.floor(1000 + Math.random() * 9000)}`;
    leave.status = 'approved';
    leave.qr_token = token;
    leave.teacher_name = req.user.name;

    const qrPass = {
      id: `QR-${token}`,
      token,
      type: 'student_outpass',
      title: 'Student Half-Day Digital Outpass',
      holder_name: leave.student_name,
      holder_id: leave.roll,
      role: 'student',
      reason: leave.reason,
      departure_time: leave.departure_time,
      approved_by: req.user.name,
      parent_contact: leave.parent_confirmation,
      transport_mode: leave.transport_mode,
      valid_until: 'Today, 03:00 PM',
      status: 'approved',
      created_at: new Date().toISOString()
    };

    mockDatabase.qrPasses.unshift(qrPass);

    // Also update ticket if linked
    if (leave.ticket_id) {
      const ticket = mockDatabase.tickets.find(t => t.id === leave.ticket_id);
      if (ticket) {
        ticket.status = 'resolved';
        ticket.qr_token = token;
      }
    }

    // Notification to student
    mockDatabase.notifications.unshift({
      id: mockDatabase.notifications.length + 1,
      user_id: leave.student_id,
      target_role: 'student',
      title: 'Half-Day Outpass APPROVED!',
      message: `Teacher ${req.user.name} approved your outpass. Your QR Code is ready to present at the gate.`,
      type: 'success',
      time: 'Just now',
      is_read: false
    });

    return res.json({
      success: true,
      message: 'Half-day outpass approved and QR token generated.',
      leave,
      qrPass
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to approve leave.' });
  }
};

module.exports = {
  getTickets,
  createTicket,
  updateTicketStatus,
  getHalfDayLeaves,
  approveHalfDayLeave
};
