const db = require('../config/db');

exports.createAssignment = (req, res) => {
  const {
    assign_to_handle,
    assign_to_name,
    assignment_address,
    assignment_date_time,
    assignment_name,
    assignment_status,
    contact_person1mobile,
    contact_person1name,
    contact_person2mobile,
    contact_person2name,
    customer_address,
    customer_email,
    customer_mobile,
    customer_name,
    reminder_beforedays,
    reminder_date,
    total_amount,
    user_id,
    assignment_note,
    old_assignment
  } = req.body;

  const sql = `
  INSERT INTO assignment (
    assign_to_handle,
    assign_to_name,
    assignment_address,
    assignment_date_time,
    assignment_name,
    assignment_status,
    contact_person1mobile,
    contact_person1name,
    contact_person2mobile,
    contact_person2name,
    customer_address,
    customer_email,
    customer_mobile,
    customer_name,
    reminder_beforedays,
    reminder_date,
    total_amount,
    user_id,
    assignment_note,
    old_assignment
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`;


 const values = [
  assign_to_handle,
  assign_to_name,
  assignment_address,
  assignment_date_time,
  assignment_name,
  assignment_status,
  contact_person1mobile,
  contact_person1name,
  contact_person2mobile,
  contact_person2name,
  customer_address,
  customer_email,
  customer_mobile,
  customer_name,
  reminder_beforedays,
  reminder_date,
  total_amount,
  user_id,
  assignment_note,
  old_assignment
];


  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Error inserting assignment:', err);
      return res.status(500).json({ error: 'Database insert error' });
    }
    res.status(201).json({ message: 'Assignment created successfully', insertId: result.insertId });
  });
};
// POST a new lead
exports.createLead = (req, res) => {
  const {
    customer_name,
    email,
    address,
    customer_mobile,
    assignment_date,
    status,
    cost,
    user_id,
    lead_date,
    assignment_type
  } = req.body;

  const sql = `
    INSERT INTO lead (
      customer_name,
      email,
      address,
      customer_mobile,
      assignment_date,
      status,
      cost,
      user_id,
      lead_date,
      assignment_type
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    customer_name,
    email,
    address,
    customer_mobile,
    assignment_date,
    status,
    cost,
    user_id,
    lead_date,
    assignment_type
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Error inserting lead:', err);
      return res.status(500).json({ error: 'Database insert error' });
    }
    res.status(201).json({ message: 'Lead created successfully', insertId: result.insertId });
  });
};