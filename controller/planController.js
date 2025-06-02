const db = require('../config/db');

exports.getAllPlans = (req, res) => {
  const sql = `
    SELECT 
      id AS plan_id,
      country,
      currency,
      plan_name,
      plan_description,
      final_amount,
      monthly_amount,
      feature,
      monthly_disscounted_amount
    FROM plan_master
    ORDER BY id DESC;
  `;

 db.query(sql, (err, results) => {
  if (err) {
    console.error('Error fetching plans:', err);
    return res.status(500).json({ error: 'Database query error' });
  }

  // Parse feature field for each plan
  const plans = results.map(plan => ({
    ...plan,
    feature: plan.feature ? JSON.parse(plan.feature) : [],
  }));

  res.json(plans);
});

};

exports.updatePlan = (req, res) => {
  const planId = req.params.id;
  const {
  country,
  currency,
  plan_name,
  plan_description,
  final_amount,
  monthly_amount,
  monthly_disscounted_amount,
  
  feature
} = req.body;


  const sql = `
    UPDATE plan_master
SET
  country = ?,
  currency = ?,
  plan_name = ?,
  plan_description = ?,
  final_amount = ?,
  monthly_amount = ?,
  monthly_disscounted_amount = ?,
  
  feature = ?
WHERE id = ?

  `;

  const values = [
  country,
  currency,
  plan_name,
  plan_description || '',
  final_amount,
  monthly_amount || 0,
  monthly_disscounted_amount || 0,
  
 feature ? JSON.stringify(feature) : '[]',
  planId
];


  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Error updating plan:', err);
      return res.status(500).json({ error: 'Failed to update plan' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    res.json({ message: 'Plan updated successfully' });
  });
};
exports.deletePlan = (req, res) => {
  const planId = req.params.id;

  // Check if the plan is used
  const checkSql = `SELECT COUNT(*) AS count FROM user_plan WHERE plan_id = ?`;
  db.query(checkSql, [planId], (err, results) => {
    if (err) return res.status(500).json({ error: 'Check failed' });

    if (results[0].count > 0) {
      return res.status(400).json({ message: 'Plan is assigned to users and cannot be deleted.' });
    }

    // Safe to delete
    const deleteSql = `DELETE FROM plan_master WHERE id = ?`;
    db.query(deleteSql, [planId], (err, result) => {
      if (err) {
        console.error('Error deleting plan:', err);
        return res.status(500).json({ error: 'Delete failed' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Plan not found' });
      }

      res.json({ message: 'Plan deleted successfully' });
    });
  });
};

exports.addPlan = (req, res) => {
 const {
  country,
  currency,
  plan_name,
  plan_description,
  final_amount,
  monthly_amount,
  monthly_discounted_amount,
  
  feature
} = req.body;


  // Optional: check for required fields
  if (!country || !currency || !plan_name || !final_amount) {
    return res.status(400).json({ message: 'Required fields missing' });
  }

  const sql = `
   INSERT INTO plan_master (
  country,
  currency,
  plan_name,
  plan_description,
  final_amount,
  monthly_amount,
  monthly_disscounted_amount,
  feature
) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`;


  const values = [
  country,
  currency,
  plan_name,
  plan_description || '',
  final_amount,
  monthly_amount || 0,
  monthly_discounted_amount || 0,
 feature ? JSON.stringify(feature) : '[]'

];


  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Error adding plan:', err);
      return res.status(500).json({ error: 'Failed to add plan' });
    }

    res.json({ message: 'Plan added successfully', plan_id: result.insertId });
  });
};


exports.getAnalytics = (req, res) => {
  const results = {};

  const countryQuery = `SELECT COUNT(DISTINCT country) AS total_country_count FROM user`;
  const plansQuery = `SELECT COUNT(*) AS total_plans FROM plan_master`;
  const mostUsedQuery = `
    SELECT pm.plan_name, COUNT(up.user_id) AS user_count
    FROM user_plan up
    JOIN plan_master pm ON up.plan_id = pm.id
    GROUP BY up.plan_id
    ORDER BY user_count DESC
    LIMIT 1
  `;

  db.query(countryQuery, (err, countryResult) => {
    if (err) return res.status(500).json({ error: 'Error fetching country count' });
    results.total_country_count = countryResult[0].total_country_count;

    db.query(plansQuery, (err, plansResult) => {
      if (err) return res.status(500).json({ error: 'Error fetching total plans' });
      results.total_plans = plansResult[0].total_plans;

      db.query(mostUsedQuery, (err, mostUsedResult) => {
        if (err) return res.status(500).json({ error: 'Error fetching most used plan' });

        if (mostUsedResult.length > 0) {
          results.most_used_plan = {
            plan_name: mostUsedResult[0].plan_name,
            user_count: mostUsedResult[0].user_count,
          };
        } else {
          results.most_used_plan = null;
        }

        res.json(results);
      });
    });
  });
};



// Get total leads count
exports.getTotalLeads = (req, res) => {
  const sql = `SELECT COUNT(*) AS total_leads FROM lead`;

  db.query(sql, (err, result) => {
    if (err) {
      console.error('Error fetching total leads:', err);
      return res.status(500).json({ error: 'Database query error' });
    }

    res.json(result[0]); // { total_leads: 123 }
  });
};
