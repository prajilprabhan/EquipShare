const mongoose = require("mongoose");
const fs = require("fs");
require("dotenv").config({ path: "../.env" });
require("dotenv").config();

const User = require("../models/User");

let mongoURI = process.env.MONGODB_URL;
if (!mongoURI || mongoURI.includes("YOUR_PASSWORD")) {
  mongoURI = "mongodb://127.0.0.1:27017/equipshare";
}

async function debugUsers() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(mongoURI);
    console.log("Connected.");

    const users = await User.find({}).select("-password");
    console.log(`Found ${users.length} users.`);

    fs.writeFileSync("users_list.json", JSON.stringify(users, null, 2));
    console.log("Saved users to users_list.json");

  } catch (error) {
    console.error("Error during debug:", error);
    fs.writeFileSync("debug_error.txt", error.stack || error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

debugUsers();
