const express = require("express");
const router = express.Router();
const { verifyToken } = require("../../middleware/auth");
const User = require("../../models/User");

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get("/profile", verifyToken, async (req, res) => {
  try {
    // req.user is set by verifyToken middleware and excludes password
    return res.status(200).json({
      success: true,
      user: req.user
    });
  } catch (error) {
    console.error("Get Profile Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error fetching profile.",
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put("/profile", verifyToken, async (req, res) => {
  try {
    const { name, phone, department, semester } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found."
      });
    }

    // Update allowed fields
    if (name) user.name = name.trim();
    if (phone) user.phone = phone.trim();
    if (department) user.department = department.trim();
    if (semester) user.semester = semester.trim();

    await user.save();

    // Create response copy excluding password
    const updatedUser = {
      _id: user._id,
      name: user.name,
      studentId: user.studentId,
      email: user.email,
      phone: user.phone,
      department: user.department,
      semester: user.semester,
      role: user.role,
      verificationStatus: user.verificationStatus,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      user: updatedUser
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error updating profile.",
      error: error.message
    });
  }
});

module.exports = router;
