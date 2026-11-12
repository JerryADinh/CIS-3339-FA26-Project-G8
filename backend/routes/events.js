const express = require("express");
const router = express.Router();

// Middleware for authorization (Task S1)
const { requireAuth, requireRole, withOrg } = require("../auth/authMiddleWare");

// importing data model schemas
const { events, clients } = require("../models/models");

// GET all events for org
router.get("/", requireAuth, async (req, res, next) => {
  try {
    const filter = withOrg({}, req, 'events');
    const data = await events.find(filter).sort({ date: -1 });
    res.json(data);
  } catch (error) {
    next(error);
  }
});

// GET single event by ID
router.get("/id/:id", requireAuth, async (req, res, next) => {
  try {
    const filter = withOrg({ _id: req.params.id }, req, 'events');
    const data = await events.findOne(filter);
    if (!data) return res.status(404).json({ error: "Event not found" });
    res.json(data);
  } catch (error) {
    next(error);
  }
});

// GET events based on search query
router.get("/search/", requireAuth, async (req, res, next) => {
  try {
    let query = {};
    switch (req.query.searchBy) {
      case "name":
        query.name = { $regex: req.query.name, $options: "i" };
        break;
      case "date":
        query.date = req.query.eventDate;
        break;
      default:
        return res.status(400).json({ error: "invalid searchBy" });
    }
    const filter = withOrg(query, req, 'events');
    const data = await events.find(filter);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

// GET events for which a client is signed up
router.get("/client/:id", requireAuth, async (req, res, next) => {
  try {
    const filter = withOrg({ attendees: req.params.id }, req, 'events');
    const data = await events.find(filter);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

// GET events for which a client is not signed up
router.get("/client/:id/not-registered", requireAuth, async (req, res, next) => {
  try {
    const filter = withOrg({ attendees: { $nin: [req.params.id] } }, req, 'events');
    const eventsNotRegistered = await events.find(filter);
    res.json(eventsNotRegistered);
  } catch (error) {
    next(error);
  }
});

// GET attendee details for an event
router.get("/attendees/:id", requireAuth, async (req, res, next) => {
  try {
    const filter = withOrg({ _id: req.params.id }, req, 'events');
    const event = await events.findOne(filter);
    
    if (!event) return res.status(404).json({ error: "Event not found" });
    
    const attendeeIds = event.attendees.map(a => a.toString());
    const clientFilter = withOrg({ _id: { $in: attendeeIds } }, req, 'clients');
    const attendees = await clients.find(clientFilter);
    
    res.json(attendees);
  } catch (error) {
    next(error);
  }
});

// GET all events for a given service
router.get("/service/:id", requireAuth, async (req, res, next) => {
  try {
    const filter = withOrg({ services: { $in: [req.params.id] } }, req, 'events');
    const eventsWithService = await events.find(filter)
      .select({ _id: 1, name: 1, date: 1, address: { line1: 1 } })
      .lean();
    res.json(eventsWithService);
  } catch (error) {
    next(error);
  }
});

// GET event attendance for dashboard
router.get("/attendance", requireAuth, async (req, res, next) => {
  try {
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
    
    const filter = withOrg({ date: { $gte: twoMonthsAgo } }, req, 'events');
    const data = await events.find(filter).sort({ date: 1 });
    res.json(data);
  } catch (error) {
    next(error);
  }
});

// POST new event (Requires Editor Role)
router.post("/", requireAuth, requireRole('editor'), async (req, res, next) => {
  try {
    const newEvent = req.body;
    newEvent.org = req.user.orgId;
    await events.create(newEvent);
    res.status(200).send("New event created successfully");
  } catch (error) {
    next(error);
  }
});

// PUT update event (Requires Editor Role)
router.put("/update/:id", requireAuth, requireRole('editor'), async (req, res, next) => {
  try {
    const filter = withOrg({ _id: req.params.id }, req, 'events');
    const data = await events.findOneAndUpdate(filter, req.body);
    if (!data) return res.status(404).json({ error: "Event not found" });
    res.status(200).send("Event updated successfully");
  } catch (error) {
    next(error);
  }
});

// PUT register attendee (Requires Editor Role - Task B1)
router.put("/register", requireAuth, requireRole('editor'), async (req, res, next) => {
  try {
    const eventId = req.query.event;
    const clientId = req.query.client;

    // B1 Rule 1: Validate both exist in the org
    const event = await events.findOne(withOrg({ _id: eventId }, req, 'events'));
    const client = await clients.findOne(withOrg({ _id: clientId }, req, 'clients'));
    
    if (!event || !client) {
      return res.status(404).json({ error: "Client or Event not found in your organization" });
    }

    // B1 Rule 2: Idempotent Registration
    if (event.attendees.includes(clientId)) {
      return res.status(200).json({ message: "Already registered" });
    }

    await events.findByIdAndUpdate(eventId, { $push: { attendees: clientId } });
    res.status(200).json({ message: "Client added to event" });
  } catch (error) {
    next(error);
  }
});

// PUT deregister attendee (Requires Editor Role - Task B1)
router.put("/deregister", requireAuth, requireRole('editor'), async (req, res, next) => {
  try {
    const eventId = req.query.event;
    const clientId = req.query.client;

    const event = await events.findOne(withOrg({ _id: eventId }, req, 'events'));
    
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    // B1 Rule 3: Idempotent Deregistration
    if (!event.attendees.includes(clientId)) {
      return res.status(200).json({ message: "Not registered" });
    }

    await events.findByIdAndUpdate(eventId, { $pull: { attendees: clientId } });
    // Removed the buggy 'clients.findByIdAndUpdate' pull call identified in Gap Analysis
    res.status(200).json({ message: "Client deregistered from event" });
  } catch (error) {
    next(error);
  }
});

// DELETE event (Requires Editor Role)
router.delete("/:id", requireAuth, requireRole('editor'), async (req, res, next) => {
  try {
    const filter = withOrg({ _id: req.params.id }, req, 'events');
    const data = await events.findOne(filter);
    
    if (!data) return res.status(404).json({ error: "Event not found" });
    if (data.attendees.length > 0) return res.status(400).json({ error: "Event has attendees and can't be deleted." });

    await events.findOneAndDelete(filter);
    res.status(200).send("Event deleted successfully");
  } catch (error) {
    next(error);
  }
});

module.exports = router;