const express = require("express");
const router = express.Router();
const https = require("https");
const Equipment = require("../../models/Equipment");

/**
 * @route   GET /api/equipments
 * @desc    Get all available institutional equipments for public browsing
 * @access  Public
 */
router.get("/", async (req, res) => {
  try {
    const { department, category, search } = req.query;
    let query = { status: "available" };

    if (department && department !== "all") {
      query.department = department;
    }

    if (category && category !== "all") {
      query.category = { $regex: category, $options: "i" };
    }

    if (search && search.trim()) {
      query.$or = [
        { name: { $regex: search.trim(), $options: "i" } },
        { description: { $regex: search.trim(), $options: "i" } },
        { modelNumber: { $regex: search.trim(), $options: "i" } },
        { category: { $regex: search.trim(), $options: "i" } },
      ];
    }

    const equipments = await Equipment.find(query).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: equipments.length,
      equipments,
    });
  } catch (error) {
    console.error("Fetch Public Equipments Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch equipment catalog.",
      error: error.message,
    });
  }
});

// Helper for Gemini AI recommendation
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
 * @route   POST /api/equipments/recommend
 * @desc    Get AI equipment recommendation for public/catalog view
 * @access  Public
 */
router.post("/recommend", async (req, res) => {
  try {
    const { projectDescription } = req.body;
    if (!projectDescription || !projectDescription.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please describe your project to receive recommendations."
      });
    }

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
    console.error("Public AI Recommendation Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to generate AI recommendations."
    });
  }
});

module.exports = router;
