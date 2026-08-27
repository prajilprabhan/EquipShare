const mongoose = require("mongoose");
require("dotenv").config({ path: "../.env" }); // load from parent folder if run from scratch/
require("dotenv").config(); // load from current folder

const User = require("../models/User");

// Configure MongoDB connection
let mongoURI = process.env.MONGODB_URL;
if (!mongoURI || mongoURI.includes("YOUR_PASSWORD")) {
  mongoURI = "mongodb://127.0.0.1:27017/equipshare";
}

async function seedAdmin() {
  try {
    console.log("📡 Connecting to MongoDB...");
    await mongoose.connect(mongoURI, { serverSelectionTimeoutMS: 3000 });
    console.log("✅ MongoDB Connected.");

    const adminExists = await User.findOne({
      $or: [
        { studentId: "admin" },
        { email: "admin@gmail.com" }
      ]
    });
    if (adminExists) {
      console.log("👤 Default admin account already exists.");
      adminExists.email = "admin@gmail.com";
      adminExists.password = "admin";
      await adminExists.save();
      console.log("✅ Admin password and email updated to: admin@gmail.com / admin");
    } else {
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
      console.log("👤 Default Admin account created successfully:");
      console.log("👉 Username (Student ID): admin");
      console.log("👉 Email: admin@gmail.com");
      console.log("👉 Password: admin");
    }
  } catch (error) {
    console.error("❌ Seeding failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB.");
    process.exit(0);
  }
}

seedAdmin();
