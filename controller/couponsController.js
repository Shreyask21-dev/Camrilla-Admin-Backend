const db = require('../config/db');

// Fetch all coupons
exports.getAllCoupons = (req, res) => {
  db.query('SELECT * FROM discount_coupon', (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
};

// Create a new coupon
exports.createCoupon = (req, res) => {
  const data = req.body;
  const sql = `INSERT INTO discount_coupon (
    discount_coupon_code, description, country, start_date, end_date,
    discount_coupon_type, discount_value, created_date_time, created_by,
    max_usage, active, access, marketer, allowed_users
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  const values = [
    data.discount_coupon_code, data.description, data.country,
    data.start_date, data.end_date, data.discount_coupon_type,
    data.discount_value, Date.now(), data.created_by,
    data.max_usage, data.active, data.access,
    data.marketer, data.allowed_users
  ];

  db.query(sql, values, (err, result) => {
    if (err) return res.status(500).send(err);
    res.json({ message: 'Coupon created', id: result.insertId });
  });
};

// Update a coupon
exports.updateCoupon = (req, res) => {
  const id = req.params.id;
  const data = req.body;

  const sql = `UPDATE discount_coupon SET
    discount_coupon_code = ?, description = ?, country = ?, start_date = ?, end_date = ?,
    discount_coupon_type = ?, discount_value = ?, updated_date_time = ?, updated_by = ?,
    max_usage = ?, active = ?, access = ?, marketer = ?, allowed_users = ?
    WHERE id = ?`;

  const values = [
    data.discount_coupon_code, data.description, data.country,
    data.start_date, data.end_date, data.discount_coupon_type,
    data.discount_value, Date.now(), data.updated_by,
    data.max_usage, data.active, data.access,
    data.marketer, data.allowed_users, id
  ];

  db.query(sql, values, (err) => {
    if (err) return res.status(500).send(err);
    res.json({ message: 'Coupon updated' });
  });
};

// Delete a coupon by ID
exports.deleteCoupon = (req, res) => {
  const id = req.params.id;

  const sql = `DELETE FROM discount_coupon WHERE id = ?`;

  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).send(err);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Coupon not found' });
    }
    res.json({ message: 'Coupon deleted successfully' });
  });
};
exports.getCouponStats = (req, res) => {
  const sql = `
    SELECT
      (SELECT COUNT(*) FROM discount_coupon) AS total_coupons,
      (SELECT COUNT(DISTINCT discount_coupon_id) FROM user_payment WHERE discount_coupon_id IS NOT NULL) AS used_coupons,
      (SELECT IFNULL(SUM(dc.discount_value), 0)
         FROM discount_coupon dc
         JOIN user_payment up ON up.discount_coupon_id = dc.id
         WHERE up.discount_coupon_id IS NOT NULL) AS total_discount_benefits
  `;

  db.query(sql, (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result[0]);
  });
};
