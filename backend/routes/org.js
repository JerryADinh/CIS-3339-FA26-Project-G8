// This file contains API endpoints for interacting with "org" collection in MongoDB database
const express = require('express');
const router = express.Router();
require('dotenv').config();

const { orgs } = require('../models/models');

// API endpoint to get org - will use the environment variable as a "configuration" for the organization of the backend instance
router.get('/', async (req, res, next) => {
  try {
    const data = await orgs.findOne({ _id: process.env.ORG_ID });
    if (!data) return res.status(404).json({ error: 'Organization not found' });
    
    res.json(data.name);
  } catch (error) {
    next(error);
  }
});

module.exports = router;