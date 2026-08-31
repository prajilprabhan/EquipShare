const express = require("express");
const router = express.Router();
const { verifyToken, authorizeRoles } = require("../../middleware/auth");
const User = require("../../models/User");
const Equipment = require("../../models/Equipment");
const Booking = require("../../models/Booking");

// Apply verifyToken and hod-only role check to all HOD routes
router.use(verifyToken);
router.use(authorizeRoles("hod"));

/**
 * @route   GET /api/hod/pending-students
 * @desc    Get all students in HOD's department pending approval
 * @access  Private (HOD)
 */
router.get("/pending-students", async (req, res) => {
  try {
    // Only return student roles from the same department as HOD, with pending verification
    const students = await User.find({
      role: "student",
      department: req.user.department,
      verificationStatus: "pending"
    }).select("-password");

    return res.status(200).json({
      success: true,
      count: students.length,
      students
    });
  } catch (error) {
    console.error("Get Pending Students Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error retrieving pending students.",
      error: error.message
    });
  }
});

/**
 * @route   GET /api/hod/students
 * @desc    Get all students (approved, pending, rejected) in HOD's department
 * @access  Private (HOD)
 */
router.get("/students", async (req, res) => {
  try {
    const students = await User.find({
      role: "student",
      department: req.user.department
    }).select("-password").sort({ name: 1 });

    return res.status(200).json({
      success: true,
      count: students.length,
      students
    });
  } catch (error) {
    console.error("HOD Get All Students Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error retrieving department students.",
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/hod/students/:id/verify
 * @desc    Approve or reject a student's verification status
 * @access  Private (HOD)
 */
router.put("/students/:id/verify", async (req, res) => {
  try {
    const { status } = req.body; // status must be 'approved' or 'rejected'

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification status. Must be 'approved' or 'rejected'."
      });
    }

    const student = await User.findOne({
      _id: req.params.id,
      role: "student",
      department: req.user.department
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found in your department."
      });
    }

    student.verificationStatus = status;
    await student.save();

    return res.status(200).json({
      success: true,
      message: `Student account status updated to ${status}.`,
      student
    });
  } catch (error) {
    console.error("Verify Student Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error verifying student.",
      error: error.message
    });
  }
});

/**
 * @route   POST /api/hod/labassistants
 * @desc    Create a lab assistant under HOD's department
 * @access  Private (HOD)
 */
router.post("/labassistants", async (req, res) => {
  try {
    const { name, studentId, email, phone, password } = req.body;

    if (!name || !studentId || !email || !phone || !password) {
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

    const newAssistant = new User({
      name: name.trim(),
      studentId: studentId.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      department: req.user.department, // Locked to HOD's department
      semester: "N/A",
      password,
      role: "labasist",
      verificationStatus: "approved"
    });

    await newAssistant.save();

    return res.status(201).json({
      success: true,
      message: "Lab Assistant account created successfully for your department.",
      user: {
        _id: newAssistant._id,
        name: newAssistant.name,
        studentId: newAssistant.studentId,
        email: newAssistant.email,
        phone: newAssistant.phone,
        department: newAssistant.department,
        semester: newAssistant.semester,
        role: newAssistant.role,
        verificationStatus: newAssistant.verificationStatus
      }
    });
  } catch (error) {
    console.error("HOD Create Lab Assistant Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error creating Lab Assistant.",
      error: error.message
    });
  }
});

/**
 * @route   GET /api/hod/history
 * @desc    Get booking history of HOD's department
 * @access  Private (HOD)
 */
router.get("/history", async (req, res) => {
  try {
    // Run overdue checker to ensure stats and status are correct
    await Booking.checkOverdue();

    // 1. Find equipment belonging to HOD's department
    const equipments = await Equipment.find({ department: req.user.department });
    const equipIds = equipments.map(e => e._id);

    // 2. Find students belonging to HOD's department
    const deptStudents = await User.find({ department: req.user.department, role: "student" });
    const studentIds = deptStudents.map(s => s._id);

    // 3. Find all bookings involving department equipment OR department students
    const bookings = await Booking.find({
      $or: [
        { equipment: { $in: equipIds } },
        { user: { $in: studentIds } }
      ]
    })
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
    console.error("HOD Get History Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error retrieving history.",
      error: error.message
    });
  }
});

module.exports = router;
