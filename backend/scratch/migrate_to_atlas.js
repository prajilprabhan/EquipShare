const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

// Load .env
dotenv.config({ path: path.join(__dirname, "../.env") });

// Legacy conversion helper (same as app.js)
const convertToSrv = (uri) => {
  if (uri && uri.startsWith("mongodb://") && uri.includes("-shard-")) {
    try {
      const cleanUri = uri.replace("mongodb://", "");
      const [credentials, hostsAndQuery] = cleanUri.split("@");
      if (credentials && hostsAndQuery) {
        const [hostsPart, dbAndQuery] = hostsAndQuery.split("/");
        const hosts = hostsPart.split(",");
        const oneHost = hosts[0].split(":")[0];
        const srvHost = oneHost.replace(/-shard-\d+-\d+/, "");
        const dbName = dbAndQuery ? dbAndQuery.split("?")[0] : "Equipshare";
        return `mongodb+srv://${credentials}@${srvHost}/${dbName}?retryWrites=true&w=majority`;
      }
    } catch (e) {
      console.warn("Conversion failed:", e.message);
    }
  }
  return null;
};

const localURI = "mongodb://127.0.0.1:27017/equipshare";
let atlasURI = process.env.MONGODB_URL;

if (!atlasURI) {
  console.error("❌ MONGODB_URL is missing in .env file.");
  process.exit(1);
}

// Convert legacy replicaSet URI to SRV to bypass potential firewall blocks on port 27017
const srvURI = convertToSrv(atlasURI) || atlasURI;

async function migrate() {
  console.log("Connecting to Local MongoDB...");
  const localConnection = await mongoose.createConnection(localURI).asPromise();
  console.log("✅ Connected to Local MongoDB");

  console.log("Connecting to MongoDB Atlas...");
  let atlasConnection;
  try {
    atlasConnection = await mongoose.createConnection(srvURI, { serverSelectionTimeoutMS: 5000 }).asPromise();
    console.log("✅ Connected to MongoDB Atlas");
  } catch (err) {
    console.error("❌ Failed to connect to MongoDB Atlas cluster.");
    console.error(err.message);
    console.log("\n💡 Make sure you have whitelisted your IP address in MongoDB Atlas Network Access!");
    localConnection.close();
    process.exit(1);
  }

  try {
    // Define schemas dynamically for the migration
    const userSchema = new mongoose.Schema({}, { strict: false });
    const equipmentSchema = new mongoose.Schema({}, { strict: false });
    const bookingSchema = new mongoose.Schema({}, { strict: false });

    const LocalUser = localConnection.model("User", userSchema, "users");
    const LocalEquipment = localConnection.model("Equipment", equipmentSchema, "equipments");
    const LocalBooking = localConnection.model("Booking", bookingSchema, "bookings");

    const AtlasUser = atlasConnection.model("User", userSchema, "users");
    const AtlasEquipment = atlasConnection.model("Equipment", equipmentSchema, "equipments");
    const AtlasBooking = atlasConnection.model("Booking", bookingSchema, "bookings");

    // 1. Fetch from local
    console.log("\n📥 Fetching local data...");
    const localUsers = await LocalUser.find({});
    const localEquipments = await LocalEquipment.find({});
    const localBookings = await LocalBooking.find({});

    console.log(`- Found ${localUsers.length} users`);
    console.log(`- Found ${localEquipments.length} equipments`);
    console.log(`- Found ${localBookings.length} bookings`);

    // 2. Clear target collections in Atlas to avoid duplicates
    console.log("\n🧹 Cleaning MongoDB Atlas collections...");
    await AtlasUser.deleteMany({});
    await AtlasEquipment.deleteMany({});
    await AtlasBooking.deleteMany({});
    console.log("✅ MongoDB Atlas target collections cleaned");

    // 3. Write to Atlas
    console.log("\n📤 Migrating users to Atlas...");
    if (localUsers.length > 0) {
      await AtlasUser.insertMany(localUsers);
    }
    console.log("✅ Users migrated");

    console.log("📤 Migrating equipments to Atlas...");
    if (localEquipments.length > 0) {
      await AtlasEquipment.insertMany(localEquipments);
    }
    console.log("✅ Equipments migrated");

    console.log("📤 Migrating bookings to Atlas...");
    if (localBookings.length > 0) {
      await AtlasBooking.insertMany(localBookings);
    }
    console.log("✅ Bookings migrated");

    console.log("\n🎉 DATA MIGRATION COMPLETED SUCCESSFULLY! 🎉\n");

  } catch (error) {
    console.error("❌ Migration error:", error.message);
  } finally {
    localConnection.close();
    atlasConnection.close();
  }
}

migrate();
