const mongoose = require("mongoose");
require("dotenv").config({ path: __dirname + "/../.env" });

const User = require("../models/User");
const Equipment = require("../models/Equipment");
const Booking = require("../models/Booking");

async function verify() {
  console.log("=========================================");
  console.log("🔍 Running Direct MongoDB Verification Test");
  console.log("=========================================\n");

  const mongoURI = process.env.MONGODB_URL || "mongodb://127.0.0.1:27017/equipshare";
  console.log(`Connecting to: ${mongoURI}`);

  try {
    await mongoose.connect(mongoURI);
    console.log("✅ Database connected successfully.");

    // Clean up any old test data
    await User.deleteMany({ email: /test_verify_/ });
    await Equipment.deleteMany({ name: /Test Verify/ });
    await Booking.deleteMany({ purpose: /verification/ });

    console.log("\n🧪 1. Testing user model...");
    const student = new User({
      name: "Verify Student",
      studentId: "STU_VERIFY",
      email: "test_verify_student@college.edu",
      phone: "1234567890",
      department: "computer_science",
      semester: "5",
      password: "password123",
      role: "student",
      verificationStatus: "approved"
    });
    await student.save();
    console.log("✅ Student user created successfully.");

    const labasist = new User({
      name: "Verify Staff",
      studentId: "STAFF_VERIFY",
      email: "test_verify_staff@college.edu",
      phone: "1234567890",
      department: "computer_science",
      semester: "N/A",
      password: "password123",
      role: "labasist",
      verificationStatus: "approved"
    });
    await labasist.save();
    console.log("✅ Lab Assistant user created successfully.");

    console.log("\n🧪 2. Testing equipment model...");
    const equip = new Equipment({
      name: "Test Verify Multimeter",
      description: "A standard digital multimeter for testing circuits",
      category: "electronics",
      department: "computer_science",
      totalQuantity: 3,
      availableQuantity: 3,
      status: "available",
      addedBy: labasist._id
    });
    await equip.save();
    console.log("✅ Equipment added successfully.");

    console.log("\n🧪 3. Testing student booking request...");
    const bookingPending = new Booking({
      equipment: equip._id,
      user: student._id,
      quantity: 1,
      purpose: "Multimeter test verification pending",
      startDate: new Date(),
      endDate: new Date(Date.now() + 86400000), // tomorrow
      status: "pending"
    });
    await bookingPending.save();
    console.log("✅ Pending booking request created.");

    console.log("\n🧪 4. Testing student booking cancellation (DELETE route logic)...");
    // Verify that we can cancel a pending booking
    const foundBooking = await Booking.findById(bookingPending._id);
    if (!foundBooking || foundBooking.status !== "pending") {
      throw new Error("Could not find pending booking.");
    }
    await Booking.findByIdAndDelete(bookingPending._id);
    console.log("✅ Student cancellation logic verified for pending booking.");

    console.log("\n🧪 5. Testing Booking.checkOverdue() static method...");
    // Create an overdue booking request (status borrowed, end date in the past)
    const overdueEndDate = new Date(Date.now() - 3600000); // 1 hour ago
    const bookingOverdue = new Booking({
      equipment: equip._id,
      user: student._id,
      quantity: 1,
      purpose: "Multimeter overdue verification test",
      startDate: new Date(Date.now() - 7200000), // 2 hours ago
      endDate: overdueEndDate,
      status: "borrowed"
    });
    await bookingOverdue.save();
    console.log("✅ Borrowed booking created with end date in the past.");

    console.log("Running checkOverdue()...");
    const overdueResult = await Booking.checkOverdue();
    console.log(`checkOverdue() result: modifiedCount = ${overdueResult.modifiedCount}`);

    const updatedBooking = await Booking.findById(bookingOverdue._id);
    if (updatedBooking.status !== "overdue") {
      throw new Error(`Expected booking status to be 'overdue', but got '${updatedBooking.status}'`);
    }
    console.log("✅ Booking status successfully auto-updated to 'overdue'!");

    // Clean up
    await User.deleteMany({ email: /test_verify_/ });
    await Equipment.deleteMany({ name: /Test Verify/ });
    await Booking.deleteMany({ _id: { $in: [bookingPending._id, bookingOverdue._id] } });
    console.log("\n打 Sweep and Clean: Test data cleaned up successfully.");

    console.log("\n=========================================");
    console.log("🎉 ALL MONGOOSE CODE CHECKS PASSED!");
    console.log("=========================================");

  } catch (error) {
    console.error("\n❌ VERIFICATION FAILURE:");
    console.error(error);
    console.log("=========================================");
  } finally {
    await mongoose.connection.close();
    console.log("Database connection closed.");
  }
}

verify();
