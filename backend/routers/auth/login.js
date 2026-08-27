const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../../models/User");

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and get token
 * @access  Public
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please enter both email and password."
      });
    }

    // 2. Find User by email
    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password."
      });
    }

    // 3. Verify Password using schema method
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password."
      });
    }

    // 4. Verification Check for Students
    if (user.role === "student" && user.verificationStatus !== "approved") {
      if (user.verificationStatus === "pending") {
        return res.status(403).json({
          success: false,
          message: "Your registration is pending HOD approval. Please wait for authorization."
        });
      } else if (user.verificationStatus === "rejected") {
        return res.status(403).json({
          success: false,
          message: "Your registration has been rejected by the HOD. Please contact your department admin."
        });
      }
    }

    // 5. Generate User ID Token (No JWT)
    const token = user._id.toString();

    // 6. Format response (exclude password)
    const userResponse = {
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
      message: "Login successful.",
      token,
      user: userResponse
    });

  } catch (error) {
    console.error("Login Route Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during login. Please try again later.",
      error: error.message
    });
  }
});

module.exports = router;
