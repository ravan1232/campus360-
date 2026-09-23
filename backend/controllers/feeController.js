const { mockDatabase } = require('../config/db');

const getFees = (req, res) => {
  const { role, id } = req.user;

  if (role === 'student') {
    const studentFees = mockDatabase.fees.filter(f => f.student_id === id || f.student_id === 3);
    return res.json({ success: true, fees: studentFees });
  }

  // Accountant & Admin see all
  return res.json({ success: true, fees: mockDatabase.fees });
};

const payFee = (req, res) => {
  try {
    const { invoiceId, paymentMethod } = req.body;
    const fee = mockDatabase.fees.find(f => f.id === Number(invoiceId) || f.invoice_no === invoiceId);

    if (!fee) {
      return res.status(404).json({ success: false, message: 'Invoice not found.' });
    }

    fee.paid_amount = fee.total_amount;
    fee.status = 'paid';
    fee.payment_method = paymentMethod || 'Online Card Payment';
    fee.payment_date = new Date().toISOString().split('T')[0];

    // Add notification
    mockDatabase.notifications.unshift({
      id: mockDatabase.notifications.length + 1,
      target_role: 'accountant',
      title: `Payment Received: ${fee.invoice_no}`,
      message: `Full payment of $${fee.total_amount} processed for ${fee.student_name}.`,
      type: 'success',
      time: 'Just now',
      is_read: false
    });

    return res.json({
      success: true,
      message: `Invoice ${fee.invoice_no} marked as paid successfully.`,
      fee
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error processing fee payment.' });
  }
};

module.exports = {
  getFees,
  payFee
};
