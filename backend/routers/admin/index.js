const express = require("express");
const router = express.Router();
const { verifyToken, authorizeRoles } = require("../../middleware/auth");
const User = require("../../models/User");
const Equipment = require("../../models/Equipment");
const Booking = require("../../models/Booking");

// Apply verifyToken and admin-only role check to all admin routes
router.use(verifyToken);
router.use(authorizeRoles("admin"));

/**
 * @route   GET /api/admin/users
 * @desc    Get list of all users
 * @access  Private (Admin)
 */
router.get("/users", async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    console.error("Admin Get Users Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error fetching users.",
      error: error.message
    });
  }
});

/**
 * @route   POST /api/admin/users
 * @desc    Create a user (HOD, Lab Assist, Student, Admin) manually
 * @access  Private (Admin)
 */
router.post("/users", async (req, res) => {
  try {
    const { name, studentId, email, phone, department, semester, password, role } = req.body;

    if (!name || !studentId || !email || !phone || !department || !semester || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all required fields."
      });
    }

    // Check unique email and studentId
    const existing = await User.findOne({
      $or: [
        { studentId: studentId.trim() },
        { email: email.trim().toLowerCase() }
      ]
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "A user with this Student ID/Staff ID or Email already exists."
      });
    }

    const newUser = new User({
      name: name.trim(),
      studentId: studentId.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      department: department.trim(),
      semester: semester.trim(),
      password,
      role,
      verificationStatus: "approved" // admin-created staff/users are approved immediately
    });

    await newUser.save();

    return res.status(201).json({
      success: true,
      message: `${role.toUpperCase()} account created successfully.`,
      user: {
        _id: newUser._id,
        name: newUser.name,
        studentId: newUser.studentId,
        email: newUser.email,
        phone: newUser.phone,
        department: newUser.department,
        semester: newUser.semester,
        role: newUser.role,
        verificationStatus: newUser.verificationStatus
      }
    });

  } catch (error) {
    console.error("Admin Create User Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error creating user.",
      error: error.message
    });
  }
});

/**
 * @route   GET /api/admin/history
 * @desc    Get booking history of all departments
 * @access  Private (Admin)
 */
router.get("/history", async (req, res) => {
  try {
    // Run overdue checker to ensure stats and status are correct
    await Booking.checkOverdue();

    const { department } = req.query;
    let query = {};

    if (department) {
      // Find equipment belonging to that department
      const equipments = await Equipment.find({ department });
      const equipIds = equipments.map(e => e._id);
      query.equipment = { $in: equipIds };
    }

    const bookings = await Booking.find(query)
      .populate("equipment")
      .populate("user", "name email studentId phone department semester")
      .populate("approvedBy", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error) {
    console.error("Admin Get History Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error retrieving history.",
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/admin/users/:id/role
 * @desc    Update user role & verificationStatus
 * @access  Private (Admin)
 */
router.put("/users/:id/role", async (req, res) => {
  try {
    const { role, verificationStatus } = req.body;

    if (role) {
      return res.status(400).json({
        success: false,
        message: "User roles cannot be changed once created."
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found."
      });
    }
    
    if (verificationStatus) {
      if (!["pending", "approved", "rejected"].includes(verificationStatus)) {
        return res.status(400).json({
          success: false,
          message: "Invalid verification status."
        });
      }
      user.verificationStatus = verificationStatus;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "User updated successfully.",
      user
    });
  } catch (error) {
    console.error("Admin Update User Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error updating user role.",
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/admin/users/:id/password
 * @desc    Change user's password directly (Admin)
 * @access  Private (Admin)
 */
router.put("/users/:id/password", async (req, res) => {
  try {
    const { password } = req.body;

    if (!password || password.trim().length < 4) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 4 characters long."
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found."
      });
    }

    user.password = password.trim(); // password is auto-hashed via pre-save hook in User model
    await user.save();

    return res.status(200).json({
      success: true,
      message: `Password for user '${user.name}' updated successfully.`
    });
  } catch (error) {
    console.error("Admin Change Password Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error changing user password.",
      error: error.message
    });
  }
});

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Delete a user
 * @access  Private (Admin)
 */
router.delete("/users/:id", async (req, res) => {
  try {
    // Prevent admin from deleting themselves
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own admin account."
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found."
      });
    }

    // Delete bookings related to the user first
    await Booking.deleteMany({ user: req.params.id });
    await User.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: "User and their related booking requests deleted successfully."
    });
  } catch (error) {
    console.error("Admin Delete User Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error deleting user.",
      error: error.message
    });
  }
});

/**
 * @route   GET /api/admin/stats
 * @desc    Get dashboard statistics
 * @access  Private (Admin)
 */
router.get("/stats", async (req, res) => {
  try {
    // Run overdue checker to ensure stats and status are correct
    await Booking.checkOverdue();

    const totalUsers = await User.countDocuments();
    const totalEquipments = await Equipment.countDocuments();
    const totalBookings = await Booking.countDocuments();
    
    const pendingBookings = await Booking.countDocuments({ status: "pending" });
    const approvedBookings = await Booking.countDocuments({ status: "approved" });
    const borrowedBookings = await Booking.countDocuments({ status: "borrowed" });
    const returnedBookings = await Booking.countDocuments({ status: "returned" });

    const roleDistribution = await User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } }
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalEquipments,
        totalBookings,
        bookingStats: {
          pending: pendingBookings,
          approved: approvedBookings,
          borrowed: borrowedBookings,
          returned: returnedBookings
        },
        roleDistribution
      }
    });
  } catch (error) {
    console.error("Admin Stats Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error fetching stats.",
      error: error.message
    });
  }
});

/**
 * @route   GET /api/admin/history
 * @desc    Get full campus borrowing history across all departments
 * @access  Private (Admin)
 */
router.get("/history", async (req, res) => {
  try {
    await Booking.checkOverdue();
    const { department, status } = req.query;

    let query = {};
    if (status && status !== "all") {
      query.status = status;
    }

    let bookings = await Booking.find(query)
      .populate("equipment")
      .populate("user", "name email studentId phone department semester")
      .populate("approvedBy", "name email")
      .sort({ createdAt: -1 });

    if (department && department !== "all") {
      bookings = bookings.filter(b => 
        (b.equipment && b.equipment.department === department) ||
        (b.user && b.user.department === department)
      );
    }

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error) {
    console.error("Admin Get History Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error fetching campus borrowing history.",
      error: error.message
    });
  }
});

module.exports = router;
