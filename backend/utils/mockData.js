const bcrypt = require('bcryptjs');

// Standard hash for 'password123'
const DEFAULT_PASSWORD_HASH = bcrypt.hashSync('password123', 10);

const mockDatabase = {
  users: [
    {
      id: 1,
      name: 'Dr. Sarah Jenkins',
      email: 'admin@campus360.edu',
      password_hash: DEFAULT_PASSWORD_HASH,
      role: 'admin',
      phone: '+1-555-0101',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
      title: 'Principal & Executive Director',
      status: 'active'
    },
    {
      id: 2,
      name: 'Prof. Marcus Vance',
      email: 'teacher@campus360.edu',
      password_hash: DEFAULT_PASSWORD_HASH,
      role: 'teacher',
      phone: '+1-555-0102',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      department: 'Physics & STEM',
      employeeCode: 'TCH-8821',
      status: 'active'
    },
    {
      id: 3,
      name: 'Aiden Montgomery',
      email: 'student@campus360.edu',
      password_hash: DEFAULT_PASSWORD_HASH,
      role: 'student',
      phone: '+1-555-0103',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      rollNumber: 'STD-2026-042',
      grade: 'Grade 11-A',
      parentName: 'Eleanor Montgomery',
      busRoute: 'R-14 North Metro',
      status: 'active'
    },
    {
      id: 4,
      name: 'Rachel Sterling, CPA',
      email: 'accountant@campus360.edu',
      password_hash: DEFAULT_PASSWORD_HASH,
      role: 'accountant',
      phone: '+1-555-0104',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
      title: 'Chief Financial Bursar',
      status: 'active'
    },
    {
      id: 5,
      name: 'Robert Henderson',
      email: 'driver@campus360.edu',
      password_hash: DEFAULT_PASSWORD_HASH,
      role: 'driver',
      phone: '+1-555-0105',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      vehicleNo: 'BUS-304',
      routeNo: 'R-14',
      status: 'active'
    },
    {
      id: 6,
      name: 'Officer Vikram Singh',
      email: 'gate@campus360.edu',
      password_hash: DEFAULT_PASSWORD_HASH,
      role: 'gate',
      phone: '+1-555-0106',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
      gatePost: 'Main West Gate',
      status: 'active'
    }
  ],

  studentsList: [
    { id: 101, name: 'Aiden Montgomery', roll: 'STD-042', grade: '11-A', attendance: '94%', feeStatus: 'Pending', status: 'present' },
    { id: 102, name: 'Sophia Chen', roll: 'STD-043', grade: '11-A', attendance: '98%', feeStatus: 'Paid', status: 'present' },
    { id: 103, name: 'Liam Davies', roll: 'STD-044', grade: '11-A', attendance: '88%', feeStatus: 'Paid', status: 'absent' },
    { id: 104, name: 'Emma Watson', roll: 'STD-045', grade: '11-A', attendance: '92%', feeStatus: 'Paid', status: 'present' },
    { id: 105, name: 'Noah Patel', roll: 'STD-046', grade: '11-A', attendance: '85%', feeStatus: 'Overdue', status: 'late' },
    { id: 106, name: 'Olivia Kim', roll: 'STD-047', grade: '11-A', attendance: '96%', feeStatus: 'Paid', status: 'present' }
  ],

  tickets: [
    {
      id: 1,
      ticket_number: 'TCK-8012',
      sender_id: 3,
      sender_name: 'Aiden Montgomery',
      sender_role: 'student',
      target_role: 'accountant',
      category: 'fee',
      subject: 'Term 2 STEM Lab Fee Scholarship Waiver',
      description: 'I was awarded a 15% academic STEM merit scholarship for Q3. Kindly adjust this on invoice INV-2026-002.',
      priority: 'medium',
      status: 'open',
      created_at: new Date(Date.now() - 3600000 * 4).toISOString()
    },
    {
      id: 2,
      ticket_number: 'TCK-8013',
      sender_id: 3,
      sender_name: 'Aiden Montgomery',
      sender_role: 'student',
      target_role: 'teacher',
      category: 'attendance',
      subject: 'Correction: Marked absent on Sept 18th',
      description: 'I was representing the school in the Inter-school Science Olympiad on that date. Attendance slip is attached with office.',
      priority: 'low',
      status: 'in_progress',
      created_at: new Date(Date.now() - 3600000 * 24).toISOString()
    },
    {
      id: 3,
      ticket_number: 'TCK-8014',
      sender_id: 2,
      sender_name: 'Prof. Marcus Vance',
      sender_role: 'teacher',
      target_role: 'admin',
      category: 'leave',
      subject: 'Faculty Medical Leave (Oct 4 - Oct 6)',
      description: 'Applying for 3-day personal medical leave for dental surgery. Substitute arrangements made with Dr. Adams.',
      priority: 'high',
      status: 'open',
      created_at: new Date(Date.now() - 3600000 * 8).toISOString()
    },
    {
      id: 4,
      ticket_number: 'TCK-8015',
      sender_id: 5,
      sender_name: 'Robert Henderson',
      sender_role: 'driver',
      target_role: 'admin',
      category: 'transport',
      subject: 'Bus-304 Hydraulic Brake Sponge Feedback',
      description: 'Routine safety check noticed soft brake engagement. Recommending technical maintenance before afternoon run.',
      priority: 'urgent',
      status: 'open',
      created_at: new Date(Date.now() - 3600000 * 2).toISOString()
    },
    {
      id: 5,
      ticket_number: 'TCK-8016',
      sender_id: 6,
      sender_name: 'Officer Vikram Singh',
      sender_role: 'gate',
      target_role: 'admin',
      category: 'security',
      subject: 'Unregistered Vendor Vehicle at Gate 2',
      description: 'Commercial delivery van without visitor appointment attempted perimeter entry. Logged and turned away.',
      priority: 'high',
      status: 'resolved',
      created_at: new Date(Date.now() - 3600000 * 12).toISOString()
    },
    {
      id: 6,
      ticket_number: 'TCK-8017',
      sender_id: 4,
      sender_name: 'Rachel Sterling, CPA',
      sender_role: 'accountant',
      target_role: 'admin',
      category: 'financial_approval',
      subject: 'Q3 STEM Lab Equipment Purchase Requisition',
      description: 'Requisition totaling $7,800 for 24 digital oscilloscopes and sensor kits. Approved by Dept Head, awaiting bursary sign-off.',
      priority: 'medium',
      status: 'open',
      created_at: new Date(Date.now() - 3600000 * 6).toISOString()
    }
  ],

  fees: [
    {
      id: 1,
      student_id: 3,
      student_name: 'Aiden Montgomery',
      invoice_no: 'INV-2026-001',
      title: 'Term 1 Tuition & STEM Lab Fee',
      total_amount: 1250.00,
      paid_amount: 1250.00,
      due_date: '2026-08-30',
      status: 'paid',
      payment_method: 'Credit Card (Stripe)',
      payment_date: '2026-08-25'
    },
    {
      id: 2,
      student_id: 3,
      student_name: 'Aiden Montgomery',
      invoice_no: 'INV-2026-002',
      title: 'Term 2 Tuition & STEM Lab Fee',
      total_amount: 1350.00,
      paid_amount: 0.00,
      due_date: '2026-10-15',
      status: 'pending',
      payment_method: null,
      payment_date: null
    },
    {
      id: 3,
      student_id: 3,
      student_name: 'Aiden Montgomery',
      invoice_no: 'INV-2026-003',
      title: 'Annual Express Bus Pass (Route 14)',
      total_amount: 450.00,
      paid_amount: 450.00,
      due_date: '2026-09-01',
      status: 'paid',
      payment_method: 'Bank Transfer',
      payment_date: '2026-08-28'
    },
    {
      id: 4,
      student_id: 105,
      student_name: 'Noah Patel',
      invoice_no: 'INV-2026-004',
      title: 'Term 1 Tuition Balance',
      total_amount: 1250.00,
      paid_amount: 500.00,
      due_date: '2026-09-10',
      status: 'overdue',
      payment_method: 'Cash at Counter',
      payment_date: '2026-09-05'
    }
  ],

  busRoute: {
    routeNumber: 'R-14',
    routeName: 'North Metro - Campus Express',
    busNumber: 'BUS-304',
    capacity: 45,
    onboardCount: 38,
    status: 'on_route',
    currentLocation: 'Westfield Square (Approaching Main Terminal)',
    driverName: 'Robert Henderson',
    driverPhone: '+1-555-0105',
    stops: [
      { id: 1, name: 'Pine Hill Station', order: 1, time: '07:15 AM', status: 'completed' },
      { id: 2, name: 'Oakridge Crossing', order: 2, time: '07:30 AM', status: 'completed' },
      { id: 3, name: 'Westfield Square', order: 3, time: '07:45 AM', status: 'current' },
      { id: 4, name: 'Campus Main Terminal', order: 4, time: '08:05 AM', status: 'upcoming' }
    ]
  },

  visitorPasses: [
    {
      id: 1,
      pass_number: 'VP-4091',
      visitor_name: 'Jonathan Reed',
      visitor_phone: '+1-555-8833',
      purpose: 'Parent-Teacher Academic Review',
      host_name: 'Prof. Marcus Vance',
      vehicle_number: 'NY-992-K',
      check_in: '09:15 AM',
      status: 'active'
    },
    {
      id: 2,
      pass_number: 'VP-4092',
      visitor_name: 'Dr. Claire Laurent',
      visitor_phone: '+1-555-7711',
      purpose: 'Guest Lecturer in Robotics',
      host_name: 'Dr. Sarah Jenkins',
      vehicle_number: 'MA-410-X',
      check_in: '10:00 AM',
      status: 'approved'
    },
    {
      id: 3,
      pass_number: 'VP-4089',
      visitor_name: 'David Miller',
      visitor_phone: '+1-555-4422',
      purpose: 'HVAC Equipment Maintenance',
      host_name: 'Campus Facilities',
      vehicle_number: 'PA-338-L',
      check_in: '08:00 AM',
      status: 'checked_out'
    }
  ],

  notifications: [
    {
      id: 1,
      target_role: 'admin',
      title: 'New Capital Expense Requisition',
      message: 'Accountant Rachel Sterling submitted $7,800 Q3 Lab Procurement for review.',
      type: 'info',
      time: '10m ago',
      is_read: false
    },
    {
      id: 2,
      target_role: 'admin',
      title: 'Fleet Maintenance Alert',
      message: 'Bus-304 brake inspection ticket submitted by driver Robert.',
      type: 'urgent',
      time: '25m ago',
      is_read: false
    },
    {
      id: 3,
      target_role: 'teacher',
      title: 'Student Attendance Appeal',
      message: 'Aiden Montgomery submitted proof of Olympiad attendance on Sept 18th.',
      type: 'info',
      time: '1h ago',
      is_read: false
    },
    {
      id: 4,
      target_role: 'student',
      title: 'Bus Route 14 Update',
      message: 'Bus-304 is running on time. Expected campus arrival: 08:05 AM.',
      type: 'success',
      time: '15m ago',
      is_read: false
    },
    {
      id: 5,
      target_role: 'accountant',
      title: 'Fee Adjustment Ticket Received',
      message: 'Student Aiden requested merit scholarship deduction for Term 2.',
      type: 'warning',
      time: '3h ago',
      is_read: false
    },
    {
      id: 6,
      target_role: 'gate',
      title: 'VIP Visitor Incoming',
      message: 'Guest Lecturer Dr. Claire Laurent scheduled for 10:00 AM entry.',
      type: 'info',
      time: '30m ago',
      is_read: false
    }
  ],

  qrPasses: [
    {
      id: 'QR-ST-042',
      token: 'OUTPASS-STD042-9981',
      type: 'student_outpass',
      title: 'Student Half-Day Outpass',
      holder_name: 'Aiden Montgomery',
      holder_id: 'STD-2026-042',
      role: 'student',
      reason: 'Specialist Medical / Dental Appointment',
      approved_by: 'Prof. Marcus Vance (Class Teacher)',
      valid_until: 'Today, 03:00 PM',
      departure_time: '12:30 PM',
      parent_contact: '+1-555-0999',
      transport_mode: 'Parent Vehicle Pickup',
      status: 'approved',
      created_at: new Date().toISOString()
    },
    {
      id: 'QR-VEH-304',
      token: 'VEH-BUS304-2026',
      type: 'vehicle',
      title: 'School Transit Fleet Permit',
      holder_name: 'Robert Henderson',
      vehicle_no: 'BUS-304',
      vehicle_type: 'Volvo B7R Low-Floor Transit Bus',
      purpose: 'Authorized Daily Student Transit (Route 14)',
      valid_until: '31 Dec 2026',
      status: 'active',
      created_at: new Date().toISOString()
    },
    {
      id: 'QR-TCH-8821',
      token: 'FACULTY-TCH8821',
      type: 'teacher',
      title: 'Senior Faculty Fast-Track Gate Pass',
      holder_name: 'Prof. Marcus Vance',
      holder_id: 'TCH-8821',
      department: 'Department of Physics & Applied Sciences',
      valid_until: '31 Dec 2026',
      status: 'active',
      created_at: new Date().toISOString()
    }
  ],

  qrScanLogs: [
    {
      id: 1,
      token: 'VEH-BUS304-2026',
      holder_name: 'Robert Henderson (BUS-304)',
      type: 'Vehicle Fleet Entry',
      scanned_at: '07:10 AM',
      action: 'ENTRY_VERIFIED',
      officer: 'Officer Vikram Singh',
      gate: 'Main West Gate'
    }
  ],

  halfDayLeaves: [
    {
      id: 1,
      student_id: 3,
      student_name: 'Aiden Montgomery',
      roll: 'STD-2026-042',
      grade: 'Grade 11-A',
      teacher_id: 2,
      teacher_name: 'Prof. Marcus Vance',
      reason: 'Specialist Medical / Dental Appointment with Dr. Hayes',
      departure_time: '12:30 PM',
      parent_confirmation: 'Eleanor Montgomery (+1-555-0999)',
      transport_mode: 'Parent Pickup',
      status: 'approved',
      qr_token: 'OUTPASS-STD042-9981',
      created_at: new Date(Date.now() - 3600000).toISOString()
    }
  ],

  liveBusTelemetry: {
    routeNumber: 'R-14',
    routeName: 'North Metro - Campus Express',
    busNumber: 'BUS-304',
    driverName: 'Robert Henderson',
    driverPhone: '+1-555-0105',
    currentSpeed: '36 km/h',
    currentLocation: 'Approaching Westfield Square Station',
    nextStop: 'Westfield Square (Stop 3)',
    etaNextStop: '4 mins',
    etaCampus: '16 mins',
    trafficStatus: 'Clear Route (Smooth Flow)',
    fuelLevel: '78%',
    stops: [
      { id: 1, name: 'Pine Hill Station', time: '07:15 AM', status: 'completed' },
      { id: 2, name: 'Oakridge Crossing', time: '07:30 AM', status: 'completed' },
      { id: 3, name: 'Westfield Square', time: '07:45 AM', status: 'approaching' },
      { id: 4, name: 'Campus Main Terminal', time: '08:05 AM', status: 'upcoming' }
    ]
  }
};

module.exports = mockDatabase;
