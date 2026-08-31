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
    // Run overdue checker to ensure stats and status are correct
    await Booking.checkOverdue();

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
    // Run overdue checker to ensure status is fresh
    await Booking.checkOverdue();

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

/**
 * @route   DELETE /api/user/bookings/:id
 * @desc    Cancel/delete a pending booking request
 * @access  Private (Student)
 */
router.delete("/bookings/:id", async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, user: req.user._id });
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking request not found."
      });
    }

    // A student can only cancel a pending booking request.
    // If it is already approved, borrowed, etc., the HOD or Lab Assistant must handle it.
    if (booking.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel a booking request that is already ${booking.status}.`
      });
    }

    await Booking.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Booking request cancelled successfully."
    });
  } catch (error) {
    console.error("Cancel Booking Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error cancelling booking request.",
      error: error.message
    });
  }
});

// Helper to communicate with Gemini API for recommendations
const https = require("https");
const getRecommendationsFromGemini = (projectDescription, equipments) => {
  return new Promise((resolve, reject) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return reject(new Error("Gemini API key is not configured in backend .env"));
    }

    const equipmentsListText = equipments
      .map((e) => `- Name: "${e.name}", ID: "${e._id}", Category: "${e.category}", Department: "${e.department.replace("_", " ")}", Description: "${e.description}"`)
      .join("\n");

    const prompt = `You are an AI Equipment Advisor for a university lab sharing platform named EquipShare.
A student is describing their project: "${projectDescription}".

Based on this, review the list of available equipment in our catalog below:
${equipmentsListText}

Recommend the most relevant equipment from our catalog. If multiple items are useful, recommend them.
For each recommended equipment, state its exact Name (exactly as listed) and write a short, friendly explanation of why it is helpful for their project.
Keep the overall response concise, structured, and easy to read. Do not use markdown headers (like # or ##), but you can use standard bullet points.
If no equipment is relevant, explain that kindly and suggest what they should look for.`;

    const data = JSON.stringify({
      contents: [{
        parts: [{
          text: prompt
        }]
      }]
    });

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`;

    if (typeof fetch === "function") {
      fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: data
      })
      .then(response => {
        if (!response.ok) {
          return response.text().then(txt => {
            throw new Error(`Gemini API returned status ${response.status}: ${txt}`);
          });
        }
        return response.json();
      })
      .then(jsonData => {
        try {
          if (jsonData.candidates && jsonData.candidates[0] && jsonData.candidates[0].content && jsonData.candidates[0].content.parts && jsonData.candidates[0].content.parts[0]) {
            const text = jsonData.candidates[0].content.parts[0].text.trim();
            resolve(text);
          } else {
            throw new Error("Missing content in candidates");
          }
        } catch (e) {
          reject(new Error("Invalid response format from Gemini API: " + JSON.stringify(jsonData)));
        }
      })
      .catch(err => reject(err));
      return;
    }

    // Fallback to native https module
    const parsedUrl = new URL(url);
    const options = {
      hostname: parsedUrl.hostname,
      path: parsedUrl.pathname + parsedUrl.search,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(data)
      }
    };

    const req = https.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => body += chunk);
      res.on("end", () => {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          return reject(new Error(`Gemini API returned status ${res.statusCode}: ${body}`));
        }
        try {
          const jsonData = JSON.parse(body);
          if (jsonData.candidates && jsonData.candidates[0] && jsonData.candidates[0].content && jsonData.candidates[0].content.parts && jsonData.candidates[0].content.parts[0]) {
            const text = jsonData.candidates[0].content.parts[0].text.trim();
            resolve(text);
          } else {
            throw new Error("Missing content in candidates");
          }
        } catch (e) {
          reject(new Error("Invalid response format from Gemini API: " + body));
        }
      });
    });

    req.on("error", (err) => reject(err));
    req.write(data);
    req.end();
  });
};

/**
 * @route   POST /api/user/recommend-equipment
 * @desc    Get AI equipment recommendations based on project description
 * @access  Private (Student)
 */
router.post("/recommend-equipment", async (req, res) => {
  try {
    const { projectDescription } = req.body;
    if (!projectDescription || !projectDescription.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please describe your project to receive recommendations."
      });
    }

    // Fetch all available equipments in catalog
    const equipments = await Equipment.find({ status: "available", availableQuantity: { $gt: 0 } });

    if (equipments.length === 0) {
      return res.status(200).json({
        success: true,
        recommendation: "There is currently no available equipment in the catalog."
      });
    }

    const recommendation = await getRecommendationsFromGemini(projectDescription.trim(), equipments);
    return res.status(200).json({
      success: true,
      recommendation
    });
  } catch (error) {
    console.error("AI Recommendation Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to generate AI recommendations."
    });
  }
});

module.exports = router;

