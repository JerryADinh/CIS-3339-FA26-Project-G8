// This file contains all API endpoints for interacting with the "users" collection in the MongoDB database
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { users } = require('../models/models');
const org = process.env.ORG_ID;

// API endpoint to handle login
router.post('/login', async (req, res, next) => {
  const { username, password } = req.body;

  try {
    const user = await users.findOne({ username: username, org: org });
    
    // Task S1: Generic error message to prevent username enumeration
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Task S1: JWT Contract - required for tenant isolation
    const payload = {
      userId: user._id,
      name: user.username,
      role: user.role,
      orgId: user.org
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.json({ token });
  } catch (err) {
    next(err);
  }
});

module.exports = router;