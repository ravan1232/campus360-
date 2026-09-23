const { mockDatabase } = require('../config/db');

const getDashboardStats = async (req, res) => {
  try {
    const role = req.user.role;
    const userId = req.user.id;

    let responseData = {};

    switch (role) {
      case 'admin': {
        const totalStudents = 1248;
        const totalFaculty = 86;
        const feeCollectionRate = '92.4%';
        const activeBuses = '14 / 15';
        const openTickets = mockDatabase.tickets.filter(t => t.status === 'open').length;

        responseData = {
          kpis: [
            { label: 'Total Enrolled Students', value: totalStudents, change: '+4.2% from last term', trend: 'up' },
            { label: 'Academic & Admin Staff', value: totalFaculty, change: '100% active roster', trend: 'neutral' },
            { label: 'Tuition Collection Rate', value: feeCollectionRate, change: '$1.48M Collected', trend: 'up' },
            { label: 'Active Transport Fleet', value: activeBuses, change: '1 scheduled maintenance', trend: 'neutral' },
            { label: 'Open Institutional Tickets', value: openTickets, change: 'Requires departmental attention', trend: 'down' }
          ],
          revenueAnalytics: [
            { month: 'May', tuition: 145000, expenses: 98000 },
            { month: 'Jun', tuition: 162000, expenses: 104000 },
            { month: 'Jul', tuition: 138000, expenses: 95000 },
            { month: 'Aug', tuition: 240000, expenses: 115000 },
            { month: 'Sep', tuition: 285000, expenses: 122000 },
            { month: 'Oct', tuition: 210000, expenses: 105000 }
          ],
          attendanceTrends: [
            { day: 'Mon', rate: 96 },
            { day: 'Tue', rate: 95 },
            { day: 'Wed', rate: 94 },
            { day: 'Thu', rate: 97 },
            { day: 'Fri', rate: 93 }
          ],
          recentTickets: mockDatabase.tickets.slice(0, 5),
          fleetStatus: mockDatabase.busRoute
        };
        break;
      }

      case 'teacher': {
        responseData = {
          teacherProfile: {
            name: req.user.name,
            department: 'Department of Physics & Applied Sciences',
            classesAssigned: ['Grade 11-A Physics', 'Grade 12-B AP Mechanics', 'Grade 10 STEM Lab'],
            leaveBalance: '8 Days Available'
          },
          schedule: [
            { period: 'Period 1 (08:30 - 09:20)', subject: 'Grade 11-A Physics', room: 'Lab 204', topic: 'Electromagnetic Induction' },
            { period: 'Period 3 (10:30 - 11:20)', subject: 'Grade 12-B AP Mechanics', room: 'Hall 3', topic: 'Rotational Dynamics' },
            { period: 'Period 5 (13:15 - 14:05)', subject: 'Grade 10 STEM Workshop', room: 'Maker Space', topic: 'Robotics Microcontrollers' }
          ],
          students: mockDatabase.studentsList,
          attendanceRate: '94.2%',
          assignedTickets: mockDatabase.tickets.filter(t => t.target_role === 'teacher' || t.sender_id === userId)
        };
        break;
      }

      case 'student': {
        const studentFees = mockDatabase.fees.filter(f => f.student_id === userId || f.student_id === 3);
        const myTickets = mockDatabase.tickets.filter(t => t.sender_id === userId || t.sender_id === 3);

        responseData = {
          studentProfile: {
            name: req.user.name,
            roll: 'STD-2026-042',
            grade: 'Grade 11 - Section A',
            overallAttendance: '94.5%',
            gpa: '3.88 / 4.00'
          },
          subjects: [
            { name: 'Physics (AP)', instructor: 'Prof. Marcus Vance', attendance: '96%', score: '92/100' },
            { name: 'Chemistry & Polymers', instructor: 'Dr. Rebecca Stone', attendance: '93%', score: '88/100' },
            { name: 'Advanced Calculus', instructor: 'Dr. Arthur Hall', attendance: '95%', score: '95/100' },
            { name: 'Computer Science', instructor: 'Ms. Emily Blunt', attendance: '98%', score: '97/100' }
          ],
          fees: studentFees,
          transport: mockDatabase.busRoute,
          tickets: myTickets
        };
        break;
      }

      case 'accountant': {
        const totalInvoiced = mockDatabase.fees.reduce((acc, f) => acc + Number(f.total_amount), 0) + 142000;
        const totalCollected = mockDatabase.fees.reduce((acc, f) => acc + Number(f.paid_amount), 0) + 128500;
        const pendingAmount = totalInvoiced - totalCollected;

        responseData = {
          financialSummary: {
            totalInvoiced: `$${totalInvoiced.toLocaleString()}`,
            totalCollected: `$${totalCollected.toLocaleString()}`,
            pendingAmount: `$${pendingAmount.toLocaleString()}`,
            collectionRatio: `${Math.round((totalCollected / totalInvoiced) * 100)}%`
          },
          feeInvoices: mockDatabase.fees,
          disputeTickets: mockDatabase.tickets.filter(t => t.target_role === 'accountant'),
          cashFlowMonthly: [
            { month: 'Jul', collections: 120000, payroll: 65000 },
            { month: 'Aug', collections: 240000, payroll: 68000 },
            { month: 'Sep', collections: 285000, payroll: 69000 },
            { month: 'Oct (Est)', collections: 195000, payroll: 70000 }
          ]
        };
        break;
      }

      case 'driver': {
        responseData = {
          vehicleInfo: {
            busNumber: 'BUS-304',
            model: 'Volvo B7R Low-Floor Transit',
            route: 'R-14 (North Metro - Campus Express)',
            fuelLevel: '78%',
            serviceStatus: 'Good Condition (Next check: 1,200 km)',
            capacity: 45,
            passengersBoarded: 38
          },
          routeStops: mockDatabase.busRoute.stops,
          roster: [
            { roll: 'STD-042', name: 'Aiden Montgomery', stop: 'Westfield Square', boarded: true },
            { roll: 'STD-043', name: 'Sophia Chen', stop: 'Pine Hill Station', boarded: true },
            { roll: 'STD-044', name: 'Liam Davies', stop: 'Oakridge Crossing', boarded: true },
            { roll: 'STD-045', name: 'Emma Watson', stop: 'Westfield Square', boarded: false },
            { roll: 'STD-046', name: 'Noah Patel', stop: 'Pine Hill Station', boarded: true }
          ],
          maintenanceTickets: mockDatabase.tickets.filter(t => t.sender_role === 'driver')
        };
        break;
      }

      case 'gate': {
        responseData = {
          gateOverview: {
            activeGate: 'Main Perimeter West Gate',
            officerInCharge: req.user.name,
            totalEntriesToday: 342,
            activeVisitorsOnCampus: mockDatabase.visitorPasses.filter(v => v.status === 'active').length,
            studentOutpassesIssued: 14
          },
          visitorPasses: mockDatabase.visitorPasses,
          securityAlerts: mockDatabase.tickets.filter(t => t.category === 'security' || t.sender_role === 'gate')
        };
        break;
      }

      default:
        break;
    }

    return res.json({
      success: true,
      role,
      data: responseData
    });
  } catch (error) {
    console.error('getDashboardStats error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve dashboard statistics.' });
  }
};

module.exports = {
  getDashboardStats
};
