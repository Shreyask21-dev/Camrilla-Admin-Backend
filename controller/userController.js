const db = require('../config/db');

exports.getUserDashboardData = (req, res) => {
  const sql = `
    SELECT 
      u.id AS user_id,
      CONCAT(u.first_name, ' ', u.last_name) AS name,
      u.email,
      u.mobile,
      u.country,
      pm.plan_name AS current_plan,
      FROM_UNIXTIME(up.start_date / 1000) AS plan_start_date,
      FROM_UNIXTIME(up.end_date / 1000) AS plan_end_date,
      up.plan_status,
      (SELECT COUNT(*) FROM assignment a WHERE a.user_id = u.id) AS total_assignment_count,
      (SELECT COUNT(*) FROM lead l WHERE l.user_id = u.id) AS total_leads_count,
      (
        SELECT upm.payment_status 
        FROM user_payment upm 
        WHERE upm.user_id = u.id 
        ORDER BY upm.payment_date DESC 
        LIMIT 1
      ) AS payment_status
    FROM user u
    LEFT JOIN (
      SELECT up1.*
      FROM user_plan up1
      INNER JOIN (
        SELECT user_id, MAX(start_date) AS latest_start
        FROM user_plan
        GROUP BY user_id
      ) up2 ON up1.user_id = up2.user_id AND up1.start_date = up2.latest_start
    ) up ON u.id = up.user_id
    LEFT JOIN plan_master pm ON up.plan_id = pm.id;
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching user dashboard data:', err);
      return res.status(500).json({ error: 'Database query error' });
    }
    res.json(results);
  });
};


exports.getUserTransactions = (req, res) => {
  const userId = req.params.userId;
  console.log('Fetching transactions for user_id:', userId); // DEBUG LOG

  const query = `
    SELECT
      up.id AS transaction_id,
      FROM_UNIXTIME(up.payment_date / 1000) AS payment_date,
      up.amount,
      up.payment_mode AS payment_method,
      up.payment_status,
      up.payment_gw_ref_number AS reference_id,
      COALESCE(pm.plan_name, 'N/A') AS plan_name
    FROM user_payment up
    LEFT JOIN user_plan upl ON upl.user_id = up.user_id
    LEFT JOIN plan_master pm ON pm.id = upl.plan_id
    WHERE up.user_id = ?
    ORDER BY up.payment_date DESC
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching user transactions:', err);
      return res.status(500).json({ error: 'Database query error' });
    }
    res.json(results);
  });
};


exports.getUserStats = (req, res) => {
  const sql = `
    SELECT
      (SELECT COUNT(*) FROM user) AS total_users,

      (
        SELECT COUNT(DISTINCT u.id)
        FROM user u
        LEFT JOIN (
          SELECT up1.*
          FROM user_plan up1
          INNER JOIN (
            SELECT user_id, MAX(start_date) AS max_start
            FROM user_plan
            GROUP BY user_id
          ) up2 ON up1.user_id = up2.user_id AND up1.start_date = up2.max_start
        ) up ON u.id = up.user_id
        LEFT JOIN plan_master pm ON up.plan_id = pm.id
        WHERE pm.plan_name = 'Professional'
      ) AS professional_users,

      (
        SELECT COUNT(DISTINCT u.id)
        FROM user u
        LEFT JOIN (
          SELECT up1.*
          FROM user_plan up1
          INNER JOIN (
            SELECT user_id, MAX(start_date) AS max_start
            FROM user_plan
            GROUP BY user_id
          ) up2 ON up1.user_id = up2.user_id AND up1.start_date = up2.max_start
        ) up ON u.id = up.user_id
        LEFT JOIN plan_master pm ON up.plan_id = pm.id
        WHERE pm.plan_name = 'Basic'
      ) AS basic_users,

      (
        SELECT COUNT(DISTINCT user_id)
        FROM user_plan
        WHERE plan_status = 'Active'
      ) AS active_users;
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching user stats:', err);
      return res.status(500).json({ error: 'Database query error' });
    }
    res.json(results[0]); 
  });
};


exports.updateUserFromDashboard = (req, res) => {
  const userId = req.params.id;
  const { first_name, last_name, email, mobile, country } = req.body;

  const sql = `
    UPDATE user
    SET first_name = ?, last_name = ?, email = ?, mobile = ?, country = ?
    WHERE id = ?
  `;

  db.query(sql, [first_name, last_name, email, mobile, country, userId], (err, result) => {
    if (err) {
      console.error('Error updating user from dashboard:', err);
      return res.status(500).json({ error: 'Failed to update user' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User updated successfully' });
  });
};
exports.softDeleteUser = (req, res) => {
  const userId = req.params.id;
  const sql = `UPDATE user SET is_deleted = 1 WHERE id = ?`;

  db.query(sql, [userId], (err, result) => {
    if (err) {
      console.error('Error soft deleting user:', err);
      return res.status(500).json({ error: 'Soft delete failed' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User marked as deleted' });
  });
};

exports.getNewUsersWithDetails = (req, res) => {
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000; // in milliseconds

  const sql = `
    SELECT 
      id,
      first_name,
      last_name,
      email,
      mobile,
      country,
      user_type,
      FROM_UNIXTIME(date / 1000) AS registered_at
    FROM user
    WHERE date >= ?
    ORDER BY date DESC
  `;

  db.query(sql, [sevenDaysAgo], (err, results) => {
    if (err) {
      console.error('Error fetching new users:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    res.json({
      total_new_users: results.length,
      users: results
    });
  });
};
exports.getUsersWithTransactions = (req, res) => {
  const sql = `
    SELECT 
      u.id AS user_id,
      CONCAT(u.first_name, ' ', u.last_name) AS name,
      u.email,
      u.mobile,
      up.plan_status
    FROM user u
    INNER JOIN user_payment p ON u.id = p.user_id
    LEFT JOIN (
      SELECT up1.*
      FROM user_plan up1
      INNER JOIN (
        SELECT user_id, MAX(start_date) AS latest_start
        FROM user_plan
        GROUP BY user_id
      ) up2 ON up1.user_id = up2.user_id AND up1.start_date = up2.latest_start
    ) up ON u.id = up.user_id
    GROUP BY u.id
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching users with transactions:', err);
      return res.status(500).json({ error: 'Database query error' });
    }
    res.json(results);
  });
};
