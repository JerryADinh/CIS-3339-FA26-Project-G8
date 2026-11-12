// This file stores all the API endpoints for making calls to the "clients" collection in the MongoDB database
const express = require('express');
const router = express.Router();

// Middleware for authorization (Task S1)
const { requireAuth, requireRole, withOrg } = require('../auth/authMiddleWare');

// importing data model schemas
const { clients, events } = require('../models/models');

// API Endpoint to Get all clients
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const filter = withOrg({}, req, 'clients');
    const cli = await clients.find(filter);
    res.json(cli);
  } catch (err) {
    next(err);
  }
});

// API endpoint to GET single client by ID
router.get('/id/:id', requireAuth, async (req, res, next) => {
  try {
    const filter = withOrg({ _id: req.params.id }, req, 'clients');
    const data = await clients.findOne(filter);
    if (!data) return res.status(404).json({ error: 'Client not found' });
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// API endpoint to GET entries based on search query
router.get('/search', requireAuth, async (req, res, next) => {
  try {
    let queryArray = [];
    let regexOptions = 'i';

    switch (req.query.searchBy) {
      case "name":
        if (req.query.firstName) {
          queryArray.push({ firstName: { $regex: new RegExp(`.*${req.query.firstName}.*`, regexOptions) } });
        }
        if (req.query.lastName) {
          queryArray.push({ lastName: { $regex: new RegExp(`.*${req.query.lastName}.*`, regexOptions) } });
        }
        break;
      case "number":
        if (req.query.phoneNumber) {
          queryArray.push({ "phoneNumber.primary": { $regex: new RegExp(`.*${req.query.phoneNumber}.*`, regexOptions) } });
        }
        break;
      default:
        return res.status(400).json({ error: "invalid searchBy" });
    }

    if (queryArray.length === 0) return res.json([]);
    
    const dbQuery = withOrg({ $and: queryArray }, req, 'clients');
    const data = await clients.find(dbQuery);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

// GET clients by zip code for dashboard (Requires Auth)
router.get('/byzip', requireAuth, async (req, res, next) => {
  try {
    const data = await clients.aggregate([
      { $match: { orgs: req.user.orgId, "address.zip": { $exists: true,$ne: "" } } },
      { $group: { _id: "$address.zip", count: { $sum: 1 } } }
    ]);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

// POST create new client (Requires Editor Role - Task S1)
router.post('/', requireAuth, requireRole('editor'), async (req, res, next) => {
  try {
    const newClient = req.body;
    newClient.orgs = [req.user.orgId]; // Assign to current user's org
    await clients.create(newClient);
    res.status(200).send("New client created successfully");
  } catch (error) {
    next(error);
  }
});

// API endpoint to PUT update client (Requires Editor Role - Task S1)
router.put("/update/:id", requireAuth, requireRole('editor'), async (req, res, next) => {
  try {
    const filter = withOrg({ _id: req.params.id }, req, 'clients');
    const data = await clients.findOneAndUpdate(filter, req.body, { new: true });
    if (!data) return res.status(404).json({ error: "Client not found." });
    res.status(201).send("Client updated successfully");
  } catch (error) {
    next(error);
  }
});

// API endpoint to hard delete client by ID (Requires Editor Role - Task S1)
router.delete("/:id", requireAuth, requireRole('editor'), async (req, res, next) => {
  try {
    const filter = withOrg({ _id: req.params.id }, req, 'clients');
    const clientData = await clients.findOne(filter);
    if (!clientData) return res.status(404).json({ error: "Client not found" });

    // Check if client is registered for any events in the org
    const eventFilter = withOrg({ attendees: req.params.id }, req, 'events');
    const eventData = await events.find(eventFilter);
    
    if (eventData.length > 0) {
      return res.status(400).json({ error: "Client is signed up for events and can't be deleted." });
    }

    await clients.findByIdAndDelete(req.params.id);
    res.status(200).send("Client deleted successfully");
  } catch (error) {
    next(error);
  }
});

module.exports = router;