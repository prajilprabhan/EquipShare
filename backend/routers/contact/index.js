const express = require("express");
const router = express.Router();
const Contact = require("../../models/Contact");

/**
 * @route   POST /api/contact
 * @desc    Submit a contact / departmental inquiry message
 * @access  Public
 */
router.post("/", async (req, res) => {
  try {
    const { name, email, department, subject, message } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please provide your name.",
      });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please provide your email address.",
      });
    }

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please provide your message or inquiry details.",
      });
    }

    const newContact = await Contact.create({
      name: name.trim(),
      email: email.trim(),
      department: department || "general",
      subject: subject ? subject.trim() : "Campus Equipment & Lab Inquiry",
      message: message.trim(),
    });

    return res.status(201).json({
      success: true,
      message: "Thank you! Your inquiry has been submitted to the campus lab coordination committee.",
      contactId: newContact._id,
    });
  } catch (error) {
    console.error("Contact Form Submission Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to submit message. Please try again later.",
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/contact
 * @desc    Get all submitted contact inquiries (for Admin/Auditing)
 * @access  Public / Admin
 */
router.get("/", async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      contacts,
    });
  } catch (error) {
    console.error("Fetch Contacts Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve messages.",
      error: error.message,
    });
  }
});

module.exports = router;
