const db = require('../config/db');

exports.getTransactionHistory = (req, res) => {
  const sql = `
    SELECT
      up.id AS transaction_id,
      CONCAT(u.first_name, ' ', u.last_name) AS user_name,
      u.email,
      up.amount,
      FROM_UNIXTIME(up.payment_date / 1000) AS date,
      up.payment_mode AS payment_method,
      up.payment_status AS status,
      up.payment_gw_ref_number AS reference_id
    FROM user_payment up
    JOIN user u ON up.user_id = u.id
    ORDER BY up.payment_date DESC;
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching transaction history:', err);
      return res.status(500).json({ error: 'Database query error' });
    }
    res.json(results);
  });
};
exports.getUserWithTransactions = (req, res) => {
  const userId = req.params.id;

  // Query 1: Get user details
  const userSql = `SELECT id, first_name, last_name, email, mobile, country FROM user WHERE id = ?`;

  db.query(userSql, [userId], (err, userResult) => {
    if (err) {
      console.error('Error fetching user:', err);
      return res.status(500).json({ error: 'Failed to fetch user' });
    }

    if (userResult.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = userResult[0];

    // Query 2: Get all user transactions
    const txnSql = `
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

    db.query(txnSql, [userId], (err, txnResults) => {
      if (err) {
        console.error('Error fetching transactions:', err);
        return res.status(500).json({ error: 'Failed to fetch transactions' });
      }

      res.json({
        user,
        transactions: txnResults
      });
    });
  });
};


// const db = require('../config/db');

exports.getTransactionsByUserId = (req, res) => {
  const userId = req.params.userId;

  const sql = `
    SELECT
      up.id AS transaction_id,
      FROM_UNIXTIME(up.payment_date / 1000) AS payment_date,
      up.amount,
      up.payment_mode AS payment_method,
      up.payment_status,
      up.payment_gw_ref_number AS reference_id,
      COALESCE(pm.plan_name, 'N/A') AS plan_name,
      CONCAT(u.first_name, ' ', u.last_name) AS user_name,
      u.email
    FROM user_payment up
    LEFT JOIN user u ON up.user_id = u.id
    LEFT JOIN user_plan upl ON upl.user_id = u.id
    LEFT JOIN plan_master pm ON pm.id = upl.plan_id
    WHERE up.user_id = ?
    ORDER BY up.payment_date DESC
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching transactions:', err);
      return res.status(500).json({ error: 'Database query error' });
    }

    res.json(results);
  });
};
