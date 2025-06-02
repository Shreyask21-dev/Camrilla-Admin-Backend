const db = require('../config/db');

exports.getMonthlyPlanRevenue = (req, res) => {
  const query = `
    SELECT 
      pm.plan_name,
      DATE_FORMAT(FROM_UNIXTIME(up.payment_date / 1000), '%Y-%m') AS month,
      SUM(up.amount) AS total_revenue
    FROM user_payment up
    JOIN user_plan upl ON up.user_id = upl.user_id
    JOIN plan_master pm ON upl.plan_id = pm.id
    WHERE up.payment_status = 'Success'
    GROUP BY pm.plan_name, month
    ORDER BY month DESC, pm.plan_name;
  `;

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: 'Error fetching monthly revenue' });
    res.json(results);
  });
};
exports.getProfessionalPlanRevenueByMonthYear = (req, res) => {
  const query = `
    SELECT 
      YEAR(FROM_UNIXTIME(up.payment_date / 1000)) AS year,
      MONTH(FROM_UNIXTIME(up.payment_date / 1000)) AS month,
      DATE_FORMAT(FROM_UNIXTIME(up.payment_date / 1000), '%Y-%m') AS month_year,
      SUM(up.amount) AS total_revenue
    FROM user_payment up
    JOIN user_plan upl ON up.user_id = upl.user_id
    JOIN plan_master pm ON upl.plan_id = pm.id
    WHERE up.payment_status = 'Success'
      AND pm.plan_name = 'Professional'
    GROUP BY year, month
    ORDER BY year DESC, month DESC;
  `;

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: 'Error fetching Professional plan revenue' });
    res.json(results);
  });
};

exports.getYearlyPlanRevenue = (req, res) => {
  const query = `
    SELECT 
      pm.plan_name,
      YEAR(FROM_UNIXTIME(up.payment_date / 1000)) AS year,
      SUM(up.amount) AS total_revenue
    FROM user_payment up
    JOIN user_plan upl ON up.user_id = upl.user_id
    JOIN plan_master pm ON upl.plan_id = pm.id
    WHERE up.payment_status = 'Success'
    GROUP BY pm.plan_name, year
    ORDER BY year DESC, pm.plan_name;
  `;

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: 'Error fetching yearly revenue' });
    res.json(results);
  });
};

exports.getRevenueByCountry = (req, res) => {
  const query = `
    SELECT 
      u.country,
      SUM(up.amount) AS total_revenue
    FROM user_payment up
    JOIN user u ON up.user_id = u.id
    WHERE up.payment_status = 'Success'
    GROUP BY u.country
    ORDER BY total_revenue DESC;
  `;

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: 'Error fetching revenue by country' });
    res.json(results);
  });
};

exports.getRevenueByPlan = (req, res) => {
  const query = `
    SELECT 
      pm.plan_name,
      SUM(up.amount) AS total_revenue
    FROM user_payment up
    JOIN user_plan upl ON up.user_id = upl.user_id
    JOIN plan_master pm ON upl.plan_id = pm.id
    WHERE up.payment_status = 'Success'
    GROUP BY pm.plan_name
    ORDER BY total_revenue DESC;
  `;

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: 'Error fetching revenue by plan' });
    res.json(results);
  });
};



exports.getRevenueByPlatform = (req, res) => {
  const query = `
    SELECT 
      platform,
      SUM(amount) AS total_revenue
    FROM user_payment
    WHERE payment_status = 'Success'
    GROUP BY platform;
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching revenue by platform:', err);
      return res.status(500).json({ error: 'Database query error' });
    }

    // Normalize platform names to ensure consistent keys
    const formatted = {
      Web: 0,
      iOS: 0,
      Android: 0
    };

    results.forEach(row => {
      const platform = row.platform?.toLowerCase();
      if (platform === 'web') formatted.Web += row.total_revenue;
      else if (platform === 'ios') formatted.iOS += row.total_revenue;
      else if (platform === 'android') formatted.Android += row.total_revenue;
    });

    res.json(formatted);
  });
};
