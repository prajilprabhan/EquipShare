const express = require("express");
const router = express.Router();

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (client should discard the JWT token)
 * @access  Public
 */
router.post("/logout", (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: "Logout successful."
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error during logout.",
      error: error.message
    });
  }
});

module.exports = router;
