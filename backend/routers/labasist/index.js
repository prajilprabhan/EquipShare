const express = require("express");
const router = express.Router();
const { verifyToken, authorizeRoles } = require("../../middleware/auth");
const Equipment = require("../../models/Equipment");
const Booking = require("../../models/Booking");

// Apply verifyToken and labassistant-only role check to all lab assistant routes
router.use(verifyToken);
router.use(authorizeRoles("labasist"));

/**
 * @route   POST /api/labasist/equipments
 * @desc    Add new equipment
 * @access  Private (Lab Assistant)
 */
router.post("/equipments", async (req, res) => {
  try {
    const { name, description, category, department, modelNumber, serialNumber, totalQuantity, location, imageUrl } = req.body;

    if (!name || !description || !category || !department) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all required fields (name, description, category, department)."
      });
    }

    // If serialNumber is provided, check uniqueness
    if (serialNumber) {
      const existing = await Equipment.findOne({ serialNumber: serialNumber.trim() });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: "Equipment with this serial number already exists."
        });
      }
    }

    const qty = parseInt(totalQuantity) || 1;

    const equipment = new Equipment({
      name: name.trim(),
      description: description.trim(),
      category: category.trim(),
      department: department.trim(),
      modelNumber: modelNumber ? modelNumber.trim() : undefined,
      serialNumber: serialNumber ? serialNumber.trim() : undefined,
      totalQuantity: qty,
      availableQuantity: qty, // initially same as total
      status: "available",
      location: location ? location.trim() : undefined,
      imageUrl: imageUrl ? imageUrl.trim() : undefined,
      addedBy: req.user._id
    });

    await equipment.save();

    return res.status(201).json({
      success: true,
      message: "Equipment added successfully.",
      equipment
    });
  } catch (error) {
    console.error("Add Equipment Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error adding equipment.",
      error: error.message
    });
  }
});

/**
 * @route   GET /api/labasist/equipments
 * @desc    Get all equipments in Lab Assistant's department
 * @access  Private (Lab Assistant)
 */
router.get("/equipments", async (req, res) => {
  try {
    const equipments = await Equipment.find({ department: req.user.department }).sort({ name: 1 });
    return res.status(200).json({
      success: true,
      count: equipments.length,
      equipments
    });
  } catch (error) {
    console.error("Labasist Get Equipments Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error fetching equipments.",
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/labasist/equipments/:id
 * @desc    Update equipment details
 * @access  Private (Lab Assistant)
 */
router.put("/equipments/:id", async (req, res) => {
  try {
    const { name, description, category, department, modelNumber, serialNumber, totalQuantity, availableQuantity, status, location, imageUrl } = req.body;

    const equipment = await Equipment.findById(req.params.id);
    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: "Equipment not found."
      });
    }

    // Check serialNumber unique if modified
    if (serialNumber && serialNumber.trim() !== equipment.serialNumber) {
      const existing = await Equipment.findOne({ serialNumber: serialNumber.trim() });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: "Equipment with this serial number already exists."
        });
      }
    }

    if (name) equipment.name = name.trim();
    if (description) equipment.description = description.trim();
    if (category) equipment.category = category.trim();
    if (department) equipment.department = department.trim();
    if (modelNumber) equipment.modelNumber = modelNumber.trim();
    if (serialNumber) equipment.serialNumber = serialNumber.trim();
    if (location) equipment.location = location.trim();
    if (imageUrl) equipment.imageUrl = imageUrl.trim();
    if (status) equipment.status = status;

    if (totalQuantity !== undefined) {
      const prevTotal = equipment.totalQuantity;
      const newTotal = parseInt(totalQuantity) || 1;
      const diff = newTotal - prevTotal;
      equipment.totalQuantity = newTotal;
      // Adjust available quantity by same difference unless availableQuantity is explicitly provided
      if (availableQuantity === undefined) {
        equipment.availableQuantity = Math.max(0, equipment.availableQuantity + diff);
      }
    }

    if (availableQuantity !== undefined) {
      equipment.availableQuantity = parseInt(availableQuantity) || 0;
    }

    await equipment.save();

    return res.status(200).json({
      success: true,
      message: "Equipment updated successfully.",
      equipment
    });
  } catch (error) {
    console.error("Update Equipment Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error updating equipment.",
      error: error.message
    });
  }
});

/**
 * @route   DELETE /api/labasist/equipments/:id
 * @desc    Delete equipment
 * @access  Private (Lab Assistant)
 */
router.delete("/equipments/:id", async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id);
    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: "Equipment not found."
      });
    }

    // Check if there are active borrowings before deleting
    const activeBookings = await Booking.findOne({
      equipment: req.params.id,
      status: { $in: ["approved", "borrowed"] }
    });

    if (activeBookings) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete equipment with active bookings or borrowed items."
      });
    }

    await Equipment.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Equipment deleted successfully."
    });
  } catch (error) {
    console.error("Delete Equipment Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error deleting equipment.",
      error: error.message
    });
  }
});

router.get("/bookings", async (req, res) => {
  try {
    // Run overdue checker to ensure stats and status are correct
    await Booking.checkOverdue();

    // Find equipment belonging to lab assistant's department
    const equipments = await Equipment.find({ department: req.user.department });
    const equipIds = equipments.map(e => e._id);

    const bookings = await Booking.find({ equipment: { $in: equipIds } })
      .populate("equipment")
      .populate("user", "name email studentId phone department semester")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error) {
    console.error("Labasist Bookings Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error fetching bookings.",
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/labasist/bookings/:id/status
 * @desc    Approve/Reject/Mark Borrowed/Mark Returned a booking request
 * @access  Private (Lab Assistant)
 */
router.put("/bookings/:id/status", async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    const allowedStatuses = ["approved", "rejected", "borrowed", "returned"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${allowedStatuses.join(", ")}`
      });
    }

    const booking = await Booking.findById(req.params.id).populate("equipment");
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking request not found."
      });
    }

    const equipment = booking.equipment;
    const oldStatus = booking.status;

    // Check permissions (must be same department as assistant)
    if (equipment.department !== req.user.department) {
      return res.status(403).json({
        success: false,
        message: "Access denied. This booking belongs to another department's equipment."
      });
    }

    // Handle status transitions
    if (status === "approved" && oldStatus === "pending") {
      // Validate quantity
      if (equipment.availableQuantity < booking.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient equipment available. Only ${equipment.availableQuantity} available, requested ${booking.quantity}.`
        });
      }
      equipment.availableQuantity -= booking.quantity;
      await equipment.save();
    } else if (status === "borrowed" && oldStatus === "pending") {
      // Direct borrow from pending
      if (equipment.availableQuantity < booking.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient equipment available. Only ${equipment.availableQuantity} available, requested ${booking.quantity}.`
        });
      }
      equipment.availableQuantity -= booking.quantity;
      await equipment.save();
    } else if (status === "rejected" && (oldStatus === "approved" || oldStatus === "borrowed")) {
      // Returning items/restoring inventory on rejection after approval
      equipment.availableQuantity += booking.quantity;
      await equipment.save();
    } else if (status === "returned" && (oldStatus === "approved" || oldStatus === "borrowed")) {
      // Returned from approved or borrowed
      equipment.availableQuantity += booking.quantity;
      booking.returnedDate = new Date();
      await equipment.save();
    }

    booking.status = status;
    booking.approvedBy = req.user._id;
    if (status === "rejected" && rejectionReason) {
      booking.rejectionReason = rejectionReason;
    }

    await booking.save();

    return res.status(200).json({
      success: true,
      message: `Booking status successfully updated to ${status}.`,
      booking
    });

  } catch (error) {
    console.error("Update Booking Status Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error updating booking status.",
      error: error.message
    });
  }
});

router.get("/history", async (req, res) => {
  try {
    // Run overdue checker to ensure stats and status are correct
    await Booking.checkOverdue();

    // Find equipment belonging to lab assistant's department
    const equipments = await Equipment.find({ department: req.user.department });
    const equipIds = equipments.map(e => e._id);

    const bookings = await Booking.find({ equipment: { $in: equipIds } })
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
    console.error("Labasist Get History Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error retrieving history.",
      error: error.message
    });
  }
});

// Helper to communicate with Gemini API
const https = require("https");
const generateDescriptionFromGemini = (keywords) => {
  return new Promise((resolve, reject) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return reject(new Error("Gemini API key is not configured in backend .env"));
    }

    const prompt = `Generate a concise, professional, and detailed description for a lab equipment/tool based on these keywords: "${keywords}". The description should be suitable for a student equipment booking system catalog. Return only the description, without any conversational preamble, markdown formatting (like bolding, lists, or headers), or notes.`;

    const data = JSON.stringify({
      contents: [{
        parts: [{
          text: prompt
        }]
      }]
    });

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    // Try using global fetch if available
    if (typeof fetch === "function") {
      fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
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

    // Fallback to native https module if fetch is not available
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

    req.on("error", (err) => {
      reject(err);
    });

    req.write(data);
    req.end();
  });
};

/**
 * @route   POST /api/labasist/equipments/generate-description
 * @desc    Generate AI description of equipment using keywords
 * @access  Private (Lab Assistant)
 */
router.post("/equipments/generate-description", async (req, res) => {
  try {
    const { keywords } = req.body;
    if (!keywords || !keywords.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please provide keywords to generate a description."
      });
    }

    const description = await generateDescriptionFromGemini(keywords.trim());
    return res.status(200).json({
      success: true,
      description
    });
  } catch (error) {
    console.error("AI Description Generation Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to generate AI description."
    });
  }
});

module.exports = router;
