const { mockDatabase } = require('../config/db');

const getNotifications = (req, res) => {
  const { role, id } = req.user;

  const relevant = mockDatabase.notifications.filter(
    n => n.target_role === role || n.target_role === 'all' || n.user_id === id
  );

  return res.json({
    success: true,
    notifications: relevant
  });
};

const markAsRead = (req, res) => {
  const { id } = req.params;
  const notif = mockDatabase.notifications.find(n => n.id === Number(id));

  if (notif) {
    notif.is_read = true;
  }

  return res.json({ success: true, message: 'Notification marked as read.' });
};

module.exports = {
  getNotifications,
  markAsRead
};
