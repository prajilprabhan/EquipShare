const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../../models/User");

/**
 * @route   POST /api/auth/signup
 * @desc    Register a new user (default role: student)
 * @access  Public
 */
router.post("/signup", async (req, res) => {
  try {
    const {
      name,
      studentId,
      email,
      phone,
      department,
      semester,
      password,
      role
    } = req.body;

    // 1. Validate required fields
    if (!name || !studentId || !email || !phone || !department || !semester || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all required fields."
      });
    }

    // 2. Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long."
      });
    }

    // 3. Check for existing email (case-insensitive check)
    const normalizedEmail = email.trim().toLowerCase();
    const existingEmail = await User.findOne({ email: normalizedEmail });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: "An account with this email already exists."
      });
    }

    // 4. Check for existing studentId
    const trimmedStudentId = studentId.trim();
    const existingStudent = await User.findOne({ studentId: trimmedStudentId });
    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: "An account with this Student ID / Register Number already exists."
      });
    }

    // 5. Determine registration status and role
    // Default role is 'student' if not specified or invalid
    const targetRole = ["student", "admin", "hod", "labasist"].includes(role) ? role : "student";
    
    // Students require HOD approval (pending); other admin/staff roles might be approved by default
    const verificationStatus = targetRole === "student" ? "pending" : "approved";

    // 6. Create new User instance (password is hashed via pre-save hook in User model)
    const newUser = new User({
      name: name.trim(),
      studentId: trimmedStudentId,
      email: normalizedEmail,
      phone: phone.trim(),
      department: department.trim(),
      semester: semester.trim(),
      password,
      role: targetRole,
      verificationStatus
    });

    // 7. Save to Database
    await newUser.save();

    // 8. Generate User ID Token (No JWT)
    const token = newUser._id.toString();

    // 9. Format response (exclude password)
    const userResponse = {
      _id: newUser._id,
      name: newUser.name,
      studentId: newUser.studentId,
      email: newUser.email,
      phone: newUser.phone,
      department: newUser.department,
      semester: newUser.semester,
      role: newUser.role,
      verificationStatus: newUser.verificationStatus,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt
    };

    return res.status(201).json({
      success: true,
      message: targetRole === "student" 
        ? "Registration successful. Your account is pending HOD verification."
        : "Registration successful.",
      token,
      user: userResponse
    });

  } catch (error) {
    console.error("Signup Route Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during registration. Please try again later.",
      error: error.message
    });
  }
});

/**
 * @route   POST /api/auth/register (Alias for signup)
 * @desc    Register a new user
 * @access  Public
 */
router.post("/register", (req, res) => {
  // Redirect to signup
  res.redirect(307, "signup");
});

module.exports = router;
