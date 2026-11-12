// This file contains API endpoints for interacting with the "services" collection of the MongoDB database
const express = require('express');
const router = express.Router();

// Middleware for authorization (Task S1)
const { requireAuth, requireRole, withOrg } = require('../auth/authMiddleWare');

// import services schema
const { services, events } = require('../models/models');

// GET all services for org
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const filter = withOrg({}, req, 'services');
    const data = await services.find(filter).sort({ updatedAt: -1 });
    res.json(data);
  } catch (error) {
    next(error);
  }
});

// GET single service by ID
router.get('/id/:id', requireAuth, async (req, res, next) => {
  try {
    const filter = withOrg({ _id: req.params.id }, req, 'services');
    const data = await services.findOne(filter);
    if (!data) return res.status(404).json({ error: 'Service not found' });
    res.json(data);
  } catch (error) {
    next(error);
  }
});

// GET services based on search query
router.get('/search', requireAuth, async (req, res, next) => {
  try {
    let query = {};
    switch (req.query.searchBy) {
      case 'name':
        query.name = { $regex: req.query.name, $options: "i" };
        break;
      case 'description':
        query.description = { $regex: req.query.description, $options: "i" };
        break;
      default:
        return res.status(400).json({ error: 'invalid searchBy' });
    }
    
    const filter = withOrg(query, req, 'services');
    const data = await services.find(filter);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

// POST new service (Requires Editor Role)
router.post('/', requireAuth, requireRole('editor'), async (req, res, next) => {
  try {
    const newService = req.body;
    newService.org = req.user.orgId;
    await services.create(newService);
    res.status(200).send('New service created successfully');
  } catch (error) {
    next(error);
  }
});

// PUT update service (Requires Editor Role)
router.put('/update/:id', requireAuth, requireRole('editor'), async (req, res, next) => {
  try {
    const filter = withOrg({ _id: req.params.id }, req, 'services');
    const data = await services.findOneAndUpdate(filter, req.body);
    if (!data) return res.status(404).json({ error: "Service not found." });
    res.status(201).send('Service updated successfully');
  } catch (error) {
    next(error);
  }
});

// DELETE service by ID (Requires Editor Role)
router.delete('/:id', requireAuth, requireRole('editor'), async (req, res, next) => {
  try {
    // only delete service if no events are using that service
    const eventFilter = withOrg({ services: req.params.id }, req, 'events');
    const serviceEvents = await events.find(eventFilter);

    if (serviceEvents.length !== 0) {
      return res.status(400).json({ error: 'Service can not be deleted since it is being used by events.' });
    }

    const filter = withOrg({ _id: req.params.id }, req, 'services');
    const data = await services.findOneAndDelete(filter);
    if (!data) return res.status(404).json({ error: 'Service not found' });
    
    res.status(200).send('Service deleted successfully');
  } catch (error) {
    next(error);
  }
});

module.exports = router;