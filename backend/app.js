const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

// Import the auth routes
const loginRoute = require("./routers/auth/login");
const signupRoute = require("./routers/auth/signup");
const logoutRoute = require("./routers/auth/logout");
const profileRoute = require("./routers/auth/profile");
const checkRoute = require("./routers/auth/check");

// Import the business/role routes
const userRoute = require("./routers/user/index");
const adminRoute = require("./routers/admin/index");
const hodRoute = require("./routers/hod/index");
const labasistRoute = require("./routers/labasist/index");
const contactRoute = require("./routers/contact/index");
const equipmentsRoute = require("./routers/equipments/index");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

// Attach the authentication routes
app.use("/api/auth", loginRoute);
app.use("/api/auth", signupRoute);
app.use("/api/auth", logoutRoute);
app.use("/api/auth", profileRoute);
app.use("/api/auth", checkRoute);

app.use("/auth", loginRoute); // Also mount at /auth for flexibility
app.use("/auth", signupRoute);
app.use("/auth", logoutRoute);
app.use("/auth", profileRoute);
app.use("/auth", checkRoute);

// Attach the business routes
app.use("/api/user", userRoute);
app.use("/api/admin", adminRoute);
app.use("/api/hod", hodRoute);
app.use("/api/labasist", labasistRoute);
app.use("/api/contact", contactRoute);
app.use("/contact", contactRoute);
app.use("/api/equipments", equipmentsRoute);
app.use("/equipments", equipmentsRoute);

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

// Helper to convert legacy MongoDB Atlas URI to modern SRV format (port 27017 bypass)
const convertToSrv = (uri) => {
  if (uri && uri.startsWith("mongodb://") && uri.includes("-shard-")) {
    try {
      const cleanUri = uri.replace("mongodb://", "");
      const [credentials, hostsAndQuery] = cleanUri.split("@");
      if (credentials && hostsAndQuery) {
        const [hostsPart, dbAndQuery] = hostsAndQuery.split("/");
        const hosts = hostsPart.split(",");
        const oneHost = hosts[0].split(":")[0];
        // Convert ac-nrpeabx-shard-00-00.ebkcmjd.mongodb.net to ac-nrpeabx.ebkcmjd.mongodb.net
        const srvHost = oneHost.replace(/-shard-\d+-\d+/, "");
        const dbName = dbAndQuery ? dbAndQuery.split("?")[0] : "Equipshare";
        return `mongodb+srv://${credentials}@${srvHost}/${dbName}?retryWrites=true&w=majority`;
      }
    } catch (e) {
      console.warn("⚠️ Legacy URI to SRV conversion failed:", e.message);
    }
  }
  return null;
};

// Connect to MongoDB with automatic fallback
const connectDB = (uri) => {
  mongoose
    .connect(uri, { serverSelectionTimeoutMS: 3000 })
    .then(async () => {
      console.log(`✅ MongoDB Connected Successfully to ${uri.includes("mongodb.net") ? "MongoDB Atlas" : "Local MongoDB"}`);
      // Seed default admin user if not exists
      try {
        const User = require("./models/User");
        const adminExists = await User.findOne({
          $or: [
            { studentId: "admin" },
            { email: "admin@gmail.com" }
          ]
        });
        if (!adminExists) {
          const adminUser = new User({
            name: "System Administrator",
            studentId: "admin",
            email: "admin@gmail.com",
            phone: "0000000000",
            department: "admin",
            semester: "N/A",
            password: "admin",
            role: "admin",
            verificationStatus: "approved"
          });
          await adminUser.save();
          console.log("👤 Default Admin account created: Email: admin@gmail.com, Password: admin");
        } else {
          // If admin exists, let's update password and email to match requested details
          adminExists.email = "admin@gmail.com";
          adminExists.password = "admin";
          await adminExists.save();
          console.log("👤 Default Admin account verified and updated (Email: admin@gmail.com, Password: admin).");
        }
      } catch (err) {
        console.error("❌ Failed to seed default admin user:", err.message);
      }
    })
    .catch((err) => {
      console.error(`❌ MongoDB Connection Failed for ${uri.includes("mongodb.net") ? "MongoDB Atlas" : "Local MongoDB"}:`);
      console.error(err.message);
      
      const srvUri = convertToSrv(uri);
      const localURI = "mongodb://127.0.0.1:27017/equipshare";
      
      if (srvUri && uri !== srvUri) {
        console.log(`👉 Attempting modern SRV Atlas connection fallback...`);
        connectDB(srvUri);
      } else if (uri !== localURI) {
        console.log(`👉 Attempting fallback to local MongoDB at ${localURI}...`);
        connectDB(localURI);
      } else {
        console.log("\n💡 Troubleshooting Tips:");
        console.log("1. Make sure your local MongoDB instance is running (e.g. run 'mongod' or start MongoDB Service).");
      }
    });
};

connectDB(mongoURI);

// Start listening for requests
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});

module.exports = app;