require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { orgs, users, clients, events, services } = require('./models/models');

async function initializeDatabase() {
  console.log("Starting database initialization...");

  // 1. Verify required environment variables
  const requiredEnvVars = [
    'MONGO_URL', 'ORG_ID', 
    'SEED_VIEWER_USERNAME', 'SEED_VIEWER_PASSWORD',
    'SEED_EDITOR_USERNAME', 'SEED_EDITOR_PASSWORD'
  ];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      console.error(`ERROR: Missing required environment variable: ${envVar}`);
      process.exit(1);
    }
  }

  try {
    // 2. Connect to MongoDB
    mongoose.set('strictQuery', false);
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected to MongoDB.");

    const orgId = process.env.ORG_ID;

    // 3. Seed Organization (Idempotent)
    let org = await orgs.findById(orgId);
    if (!org) {
      org = await orgs.create({ _id: orgId, name: "Community Health Hub" });
      console.log(`Created Organization: ${org.name}`);
    } else {
      console.log(`Organization already exists: ${org.name}`);
    }

    // 4. Seed Users (Idempotent, passwords hashed with bcrypt)
    const seedUsers = [
      {
        username: process.env.SEED_VIEWER_USERNAME,
        password: process.env.SEED_VIEWER_PASSWORD,
        role: 'viewer'
      },
      {
        username: process.env.SEED_EDITOR_USERNAME,
        password: process.env.SEED_EDITOR_PASSWORD,
        role: 'editor'
      }
    ];

    for (const u of seedUsers) {
      const existingUser = await users.findOne({ username: u.username, org: orgId });
      if (!existingUser) {
        const hashedPassword = await bcrypt.hash(u.password, 10);
        await users.create({
          _id: new mongoose.Types.ObjectId(),
          username: u.username,
          password: hashedPassword,
          role: u.role,
          org: orgId
        });
        console.log(`Created ${u.role} user: ${u.username}`);
      } else {
        console.log(`User already exists: ${u.username}`);
      }
    }

    // 5. Seed Services
    let service = await services.findOne({ name: "General Consultation", org: orgId });
    if (!service) {
      service = await services.create({
        name: "General Consultation",
        description: "Initial health intake and assessment.",
        status: "Active",
        org: orgId
      });
      console.log("Created Service: General Consultation");
    }

    // 6. Seed Clients
    let client = await clients.findOne({ email: "johndoe@example.com", orgs: orgId });
    if (!client) {
      client = await clients.create({
        firstName: "John",
        lastName: "Doe",
        email: "johndoe@example.com",
        phoneNumber: { primary: "5551234567" },
        address: { city: "Houston", zip: "77001" },
        orgs: [orgId]
      });
      console.log("Created Client: John Doe");
    }

    // 7. Seed Events & Registration
    let event = await events.findOne({ name: "Community Health Fair 2026", org: orgId });
    if (!event) {
      event = await events.create({
        name: "Community Health Fair 2026",
        date: new Date(new Date().setMonth(new Date().getMonth() + 1)), // 1 month from now
        services: [service._id],
        attendees: [client._id], // B1: At least one registration
        org: orgId
      });
      console.log("Created Event: Community Health Fair 2026 (with John Doe registered)");
    } else {
      console.log("Event already exists.");
    }

    console.log("\nDatabase initialization complete! You can now log in with the seeded accounts.");
    process.exit(0);

  } catch (error) {
    console.error("\nDatabase initialization failed:", error);
    process.exit(1);
  }
}

initializeDatabase();