const https = require("https");
require("dotenv").config({ path: __dirname + "/../.env" });

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("❌ Error: GEMINI_API_KEY is not configured in backend/.env");
  process.exit(1);
}

const keywords = "Rigol, digital oscilloscope, 100MHz, 2 channels, USB interface";
const prompt = `Generate a concise, professional, and detailed description for a lab equipment/tool based on these keywords: "${keywords}". The description should be suitable for a student equipment booking system catalog. Return only the description, without any conversational preamble, markdown formatting (like bolding, lists, or headers), or notes.`;

const data = JSON.stringify({
  contents: [{
    parts: [{
      text: prompt
    }]
  }]
});

const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

console.log("Sending request to Gemini API...");
console.log(`URL: https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=***${apiKey.slice(-5)}`);

if (typeof fetch === "function") {
  console.log("Using global fetch...");
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
      const text = jsonData.candidates[0].content.parts[0].text.trim();
      console.log("\n✅ AI Description Generated Successfully (via fetch):\n");
      console.log(text);
      console.log("\n=========================================\n");
    } catch (e) {
      console.error("❌ Invalid response format from Gemini API:", jsonData);
    }
  })
  .catch(err => {
    console.error("❌ Fetch Request Failed:", err.message);
  });
} else {
  console.log("Using fallback HTTPS module...");
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
        console.error(`❌ Gemini API returned status ${res.statusCode}: ${body}`);
        return;
      }
      try {
        const jsonData = JSON.parse(body);
        const text = jsonData.candidates[0].content.parts[0].text.trim();
        console.log("\n✅ AI Description Generated Successfully (via HTTPS fallback):\n");
        console.log(text);
        console.log("\n=========================================\n");
      } catch (e) {
        console.error("❌ Invalid response format from Gemini API:", body);
      }
    });
  });

  req.on("error", (err) => {
    console.error("❌ HTTPS Request Failed:", err.message);
  });

  req.write(data);
  req.end();
}
