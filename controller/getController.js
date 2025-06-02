const db = require('../config/db');

exports.getAllAssignments = (req, res) => {
  const sql = 'SELECT * FROM assignment';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching assignments:', err);
      return res.status(500).json({ error: 'Database query error' });
    }
    res.json(results);
  });
};

exports.getAllplans = (req, res) => {
  const sql = 'SELECT * FROM plan_master';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching plans:', err);
      return res.status(500).json({ error: 'Database query error' });
    }
    res.json(results);
  });
};
exports.getAllLeads = (req, res) => {
  const sql = 'SELECT * FROM lead';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching leads:', err);
      return res.status(500).json({ error: 'Database query error' });
    }
    res.json(results);
  });
};
exports.getAllUserPlan = (req, res) => {
  const sql = 'SELECT * FROM user_plan';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching User plans:', err);
      return res.status(500).json({ error: 'Database query error' });
    }
    res.json(results);
  });
};

exports.getStatsCount = (req, res) => {
  const sql = `
    SELECT 
      (SELECT COUNT(*) FROM assignment) AS assignment_count,
      (SELECT COUNT(*) FROM lead) AS lead_count
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching counts:', err);
      return res.status(500).json({ error: 'Database query error' });
    }
    res.json(results[0]); // results[0] contains the counts
  });
};
