const db = require("../config/db");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const SECRET = "itsveryverystrongpassword@2019";

exports.loginAdmin = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const sql = `
    SELECT id, email, password, user_role
    FROM user
    WHERE email = ? AND LOWER(user_role) = 'admin'
  `;

  db.query(sql, [email], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: "Invalid admin email or not an admin" });
    }

    const user = results[0];

    // ✅ Trim the password before hashing to remove whitespace/newlines
    const hashedInputPassword = crypto.createHash("md5").update(password.trim()).digest("hex");

    console.log("Entered password:", password);
    console.log("Trimmed:", password.trim());
    console.log("Hashed input:", hashedInputPassword);
    console.log("Stored hash:", user.password);

    if (hashedInputPassword !== user.password) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.user_role },
      SECRET,
      { expiresIn: "2h" }
    );

    return res.status(200).json({
      message: "Admin login successful",
      token,
    });
  });
};
