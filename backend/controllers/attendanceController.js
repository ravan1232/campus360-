const { mockDatabase } = require('../config/db');

const getAttendanceList = (req, res) => {
  return res.json({
    success: true,
    students: mockDatabase.studentsList
  });
};

const markAttendance = (req, res) => {
  try {
    const { studentId, status } = req.body;
    const student = mockDatabase.studentsList.find(s => s.id === Number(studentId));

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    student.status = status;

    return res.json({
      success: true,
      message: `Updated attendance for ${student.name} to ${status}.`,
      student
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error marking attendance.' });
  }
};

module.exports = {
  getAttendanceList,
  markAttendance
};
