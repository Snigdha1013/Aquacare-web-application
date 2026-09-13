require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const express = require("express");
const cors = require("cors");
const path = require("path");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

// ── Gemini client ──────────────────────────────────────────────────────────────
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const MODEL = "gemini-3.6-flash";

const SYSTEM_PROMPT = `You are AquaCare Assistant, an educational chatbot for the AquaCare Smart Water & Sanitation Awareness System, a student sustainability project aligned with UN SDG 6 (Clean Water and Sanitation).

Your role:
- Provide ONLY general awareness and educational information about water conservation, hygiene, sanitation, and related environmental topics.
- Give practical, actionable advice for households, schools, and communities.
- Explain water purification methods (SODIS, boiling, filtration, chlorination) in simple language.
- Support rainwater harvesting, greywater reuse, and water-saving habits.

Strict rules:
1. You MUST NOT diagnose waterborne diseases or give medical advice.
2. You MUST NOT make specific claims about water quality at any particular location.
3. Whenever your answer touches on water safety, health risks, or water quality, you MUST append this disclaimer verbatim at the end of your response:
   "⚠️ Disclaimer: AquaCare is an educational and awareness tool. It does not replace professional lab water testing or municipal water safety reports. Always consult local authorities for water quality emergencies."
4. Keep answers concise (under 300 words unless asked for detail), friendly, and accessible to students and community members.
5. If a user asks something completely unrelated to water, sanitation, or environment, politely redirect them to water-related topics.`;

// ── POST /api/chat ──────────────────────────────────────────────────────────────
app.post("/api/chat", async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return res.status(400).json({ error: "Message is required." });
    }
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "Gemini API key not configured on server." });
    }

    const model = genAI.getGenerativeModel({
      model: MODEL,
      systemInstruction: SYSTEM_PROMPT,
    });

    // Build chat history (convert from our format to Gemini format)
    const chatHistory = Array.isArray(history)
      ? history.map((h) => ({ role: h.role, parts: [{ text: h.text }] }))
      : [];

    const chat = model.startChat({ history: chatHistory });
    const result = await chat.sendMessage(message.trim());
    const text = result.response.text();

    res.json({ reply: text });
  } catch (err) {
    console.error("Chat error:", err.message);
    const status = err.status || 500;
    res.status(status).json({ error: err.message || "AI service error." });
  }
});

// ── POST /api/daily-tip ─────────────────────────────────────────────────────────
app.post("/api/daily-tip", async (req, res) => {
  try {
    const { usageSummary } = req.body;
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "Gemini API key not configured on server." });
    }

    const model = genAI.getGenerativeModel({ model: MODEL });

    const prompt = usageSummary
      ? `You are AquaCare, a water conservation assistant for a student sustainability project (SDG 6).
Based on the user's recent water usage data below, generate ONE personalized, practical, encouraging water-saving tip in 1-2 sentences. 
Be specific and actionable. End with a brief motivational note.
Do NOT use bullet points or headers. Reply in plain prose only.

User's recent usage data:
${usageSummary}

Generate the tip now:`
      : `You are AquaCare, a water conservation assistant for a student sustainability project (SDG 6).
Generate ONE practical, encouraging water-saving tip for households in 1-2 sentences. 
Be specific and actionable. End with a brief motivational note.
Do NOT use bullet points or headers. Reply in plain prose only.`;

    const result = await model.generateContent(prompt);
    const tip = result.response.text();
    res.json({ tip });
  } catch (err) {
    console.error("Daily tip error:", err.message);
    res.status(500).json({ error: err.message || "AI service error." });
  }
});

// ── Catch-all → SPA ─────────────────────────────────────────────────────────────
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.listen(PORT, () => {
  console.log(`\n🌊 AquaCare server running at http://localhost:${PORT}`);
  console.log(`   Gemini model: ${MODEL}`);
  console.log(`   API key configured: ${process.env.GEMINI_API_KEY ? "✅ Yes" : "❌ No — add GEMINI_API_KEY to .env"}\n`);
});
