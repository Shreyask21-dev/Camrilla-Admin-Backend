const db = require("../config/db");

exports.getAllFeedback = (req, res) => {
  const sql = `
    SELECT 
      uf.id,
      uf.user_id,
      uf.feedback,
      FROM_UNIXTIME(uf.date / 1000) AS feedback_date,
      CONCAT(u.first_name, ' ', u.last_name) AS user_name,
      u.email,
      u.mobile
    FROM user_feedback uf
    JOIN user u ON uf.user_id = u.id
    ORDER BY uf.date DESC
  `;

  db.query(sql.trim(), (err, results) => {
    if (err) {
      console.error('Error fetching feedback:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
};

exports.getFeedbackByUserId = (req, res) => {
  const userId = req.params.userId;

  const sql = `
    SELECT 
      uf.id,
      uf.feedback,
      FROM_UNIXTIME(uf.date / 1000) AS feedback_date,
      CONCAT(u.first_name, ' ', u.last_name) AS user_name,
      u.email,
      u.mobile
    FROM user_feedback uf
    JOIN user u ON uf.user_id = u.id
    WHERE uf.user_id = ?
    ORDER BY uf.date DESC
  `; // <-- No semicolon here

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching feedback by user ID:', err);
      return res.status(500).json({ error: 'Database query error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'No feedback found for this user' });
    }

    res.json(results);
  });
};

