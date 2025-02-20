const express = require("express");
const router = express.Router();
const db = require("../config/db");
router.post("/login", async (req, res) => {
  const { email, password } = req.body; // Get email and password from the request body

  // Check if both email and password are provided
  if (!email || !password) {
    return res
      .status(400)
      .json({ status: "failed", message: "Email and password are required" });
  }

  try {
    // Query to find user by email
    const query = "SELECT * FROM admin WHERE email = ? and password = ?";
    const [rows] = await db.query(query, [email, password]);

    // Check if user exists
    if (rows.length === 0) {
      return res
        .status(401)
        .json({ status: "failed", message: "Invalid email or password" });
    } else {
      return res
        .status(200)
        .json({ status: "success", message: "Login successful" });
    }
  } catch (err) {
    // Handle errors
    console.error(err); // Log the error for debugging
    res.status(500).json({ status: "failed", message: "Server error" });
  }
});

module.exports = router;
