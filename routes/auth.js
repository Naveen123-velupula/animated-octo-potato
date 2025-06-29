const express = require('express');
const router = express.Router();
const { getConnection } = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const oracledb = require('oracledb');

router.post('/signup', async (req, res) => {
  try {
    const { name, email, address, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const conn = await getConnection();

    await conn.execute(
      `INSERT INTO users2 (name, email, address, password, role)
       VALUES (:name, :email, :address, :password, :role)`,
      { name, email, address, password: hashedPassword, role: 'user' },
      { autoCommit: true }
    );

    res.send("Signup successful");
  } catch (err) {
    console.error("Signup Error:", err);
    res.status(500).send("Server error during signup");
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const conn = await getConnection();

    const result = await conn.execute(
      `SELECT * FROM users2 WHERE email = :email`,
      { email },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const users = result.rows;
    if (users.length === 0) return res.status(400).send("User not found");

    const user = users[0];
    const isValid = await bcrypt.compare(password, user.PASSWORD);

    if (!isValid) return res.status(400).send("Wrong password");

    const token = jwt.sign(
      { id: user.ID, role: user.ROLE },
      process.env.JWT_SECRET
    );

    res.json({ token });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).send("Server error during login");
  }
});

module.exports = router;
