const express = require("express");
const router = express.Router();
const { verifyToken, authorizeRoles } = require("../../middleware/auth");

/**
 * @route   GET /api/auth/check
 * @desc    Validate token and get user info
 * @access  Private
 */
router.get("/check", verifyToken, (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Authenticated",
    user: req.user
  });
});

/**
 * @route   GET /api/auth/check-user
 * @desc    Validate token and verify role is student
 * @access  Private
 */
router.get("/check-user", verifyToken, authorizeRoles("student"), (req, res) => {
  return res.status(200).json({
    success: true,
    message: "User authorized",
    user: req.user
  });
});

/**
 * @route   GET /api/auth/check-admin
 * @desc    Validate token and verify role is admin
 * @access  Private
 */
router.get("/check-admin", verifyToken, authorizeRoles("admin"), (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Admin authorized",
    user: req.user
  });
});

module.exports = router;
