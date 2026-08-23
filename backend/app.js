const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

// Import the auth routes
const loginRoute = require("./routers/auth/login");
const signupRoute = require("./routers/auth/signup");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Attach the routes
app.use("/api/auth", loginRoute);
app.use("/api/auth", signupRoute);
app.use("/auth", loginRoute); // Also mount at /auth for flexibility
app.use("/auth", signupRoute);

// Default Route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to EquipShare Backend API" });
});

// Configure MongoDB connection URL with a local fallback if needed
let mongoURI = process.env.MONGODB_URL;

if (!mongoURI || mongoURI.includes("YOUR_PASSWORD")) {
  console.warn("⚠️  Warning: MONGODB_URL is missing or contains placeholder credentials 'YOUR_PASSWORD'.");
  console.warn("👉 Fallback: Connecting to local MongoDB at mongodb://127.0.0.1:27017/equipshare");
  mongoURI = "mongodb://127.0.0.1:27017/equipshare";
}

// Connect to MongoDB
mongoose
  .connect(mongoURI)
  .then(() => {
    console.log("✅ MongoDB Connected Successfully");
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Failed:");
    console.error(err.message);
    console.log("\n💡 Troubleshooting Tips:");
    console.log("1. Make sure your local MongoDB instance is running (e.g. run 'mongod' or start MongoDB Service).");
    console.log("2. Update MONGODB_URL in backend/.env with your valid credentials.");
  });

// Start listening for requests
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});