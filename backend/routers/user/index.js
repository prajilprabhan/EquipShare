const express = require("express");
const router = express.Router();
const { verifyToken, authorizeRoles } = require("../../middleware/auth");
const Equipment = require("../../models/Equipment");
const Booking = require("../../models/Booking");

// Apply verifyToken and student-only role check to all user routes
router.use(verifyToken);
router.use(authorizeRoles("student"));

/**
 * @route   GET /api/user/equipments
 * @desc    Browse all equipments (optionally filter by department/category)
 * @access  Private (Student)
 */
router.get("/equipments", async (req, res) => {
  try {
    const { department, category, search } = req.query;
    let query = { status: { $ne: "unavailable" } }; // don't show completely unavailable equipment

    if (department) {
      query.department = department;
    }
    if (category) {
      query.category = category;
    }
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    const equipments = await Equipment.find(query).populate("addedBy", "name email");
    return res.status(200).json({
      success: true,
      count: equipments.length,
      equipments
    });
  } catch (error) {
    console.error("Browse Equipments Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error retrieving equipments.",
      error: error.message
    });
  }
});

/**
 * @route   POST /api/user/bookings
 * @desc    Create a booking request for an equipment
 * @access  Private (Student)
 */
router.post("/bookings", async (req, res) => {
  try {
    const { equipmentId, quantity, purpose, startDate, endDate } = req.body;

    if (!equipmentId || !purpose || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required booking details."
      });
    }

    // Find equipment
    const equipment = await Equipment.findById(equipmentId);
    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: "Equipment not found."
      });
    }

    // Verify status
    if (equipment.status !== "available") {
      return res.status(400).json({
        success: false,
        message: "Equipment is currently not available for booking."
      });
    }

    const requestedQty = parseInt(quantity) || 1;

    // Verify quantity
    if (equipment.availableQuantity < requestedQty) {
      return res.status(400).json({
        success: false,
        message: `Insufficient quantity available. Currently only ${equipment.availableQuantity} item(s) are available.`
      });
    }

    // Create booking
    const booking = new Booking({
      equipment: equipmentId,
      user: req.user._id,
      quantity: requestedQty,
      purpose,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      status: "pending"
    });

    await booking.save();

    return res.status(201).json({
      success: true,
      message: "Booking request submitted successfully and is pending approval.",
      booking
    });
  } catch (error) {
    console.error("Create Booking Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error creating booking request.",
      error: error.message
    });
  }
});

/**
 * @route   GET /api/user/bookings
 * @desc    Get all booking requests made by this student
 * @access  Private (Student)
 */
router.get("/bookings", async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate("equipment")
      .populate("approvedBy", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error) {
    console.error("Get Student Bookings Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error fetching your bookings.",
      error: error.message
    });
  }
});

/**
 * @route   GET /api/user/bookings/:id
 * @desc    Get details of a specific booking request
 * @access  Private (Student)
 */
router.get("/bookings/:id", async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, user: req.user._id })
      .populate("equipment")
      .populate("approvedBy", "name email");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking request not found."
      });
    }

    return res.status(200).json({
      success: true,
      booking
    });
  } catch (error) {
    console.error("Get Specific Booking Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error fetching booking details.",
      error: error.message
    });
  }
});

module.exports = router;
