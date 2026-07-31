import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize GoogleGenAI server-side
const getAIClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// API: Comprehensive Sleep Analysis & Health Advice
app.post("/api/sleep-advice", async (req, res) => {
  try {
    const ai = getAIClient();
    if (!ai) {
      return res.status(503).json({
        error: "Gemini API Key is missing. Please ensure GEMINI_API_KEY is configured in Secrets.",
      });
    }

    const { logs, stats, userGoals } = req.body;

    const prompt = `You are an expert sleep scientist and medical health advisor specializing in circadian rhythms, sleep hygiene, and holistic wellness.

Analyze the user's recent sleep data:
- Target Sleep Hours: ${userGoals?.targetHours || 8} hours
- Average Duration (Last 7-14 days): ${stats?.avgDuration || "N/A"} hours
- Average Sleep Quality: ${stats?.avgQuality || "N/A"} out of 5
- Sleep Debt: ${stats?.sleepDebt || 0} hours accumulated
- Consistency Score: ${stats?.consistencyScore || "N/A"}%
- Common Waking Moods: ${stats?.frequentMoods?.join(", ") || "Mixed"}
- Top Lifestyle Factors: ${stats?.topFactors?.join(", ") || "None recorded"}

Recent 5 Sleep Logs detail:
${JSON.stringify(logs?.slice(0, 5) || [], null, 2)}

Provide a structured JSON response with the following format (ONLY valid raw JSON, no markdown backticks):
{
  "overallAssessment": "A 2-3 sentence overview of their current sleep health and circadian alignment.",
  "sleepScoreRating": "Excellent | Good | Fair | Needs Attention",
  "keyObservations": [
    "Observation 1 (e.g., late screen time or caffeine correlating with lower quality)",
    "Observation 2 (e.g., sleep debt accumulation on weekdays)",
    "Observation 3"
  ],
  "actionableAdvice": [
    {
      "title": "Action Title",
      "category": "Circadian | Environment | Routine | Nutrition & Physiology",
      "impact": "High | Medium",
      "description": "Specific, actionable, science-based health recommendation."
    },
    {
      "title": "Action Title 2",
      "category": "Circadian | Environment | Routine | Nutrition & Physiology",
      "impact": "High | Medium",
      "description": "Specific, actionable recommendation."
    }
  ],
  "optimalSchedule": {
    "recommendedBedtime": "10:30 PM",
    "recommendedWakeTime": "06:30 AM",
    "caffeineCutoffTime": "02:00 PM",
    "windDownStartTime": "09:30 PM"
  },
  "healthAlert": "Optional medical or lifestyle note (e.g. if sleep debt is over 5h, warn about cognitive fatigue and immunity)."
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.7,
      },
    });

    const responseText = response.text || "{}";
    let parsedData;
    try {
      parsedData = JSON.parse(responseText);
    } catch {
      // Clean JSON string if enclosed in markdown tags
      const cleaned = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
      parsedData = JSON.parse(cleaned);
    }

    return res.json({ success: true, advice: parsedData });
  } catch (err: any) {
    console.error("Error generating sleep advice:", err);
    return res.status(500).json({ error: err.message || "Failed to generate AI sleep advice." });
  }
});

// API: AI Sleep Coach Chat
app.post("/api/chat-advice", async (req, res) => {
  try {
    const ai = getAIClient();
    if (!ai) {
      return res.status(503).json({
        error: "Gemini API Key is missing. Please configure GEMINI_API_KEY in Secrets.",
      });
    }

    const { message, history, statsContext } = req.body;

    const systemInstruction = `You are 'Somna', an empathetic, scientifically grounded AI Sleep & Health Coach.
User's Sleep Snapshot:
- Avg Sleep Duration: ${statsContext?.avgDuration || "7.5"} hrs
- Avg Sleep Quality: ${statsContext?.avgQuality || "3.8"}/5
- Target Sleep: ${statsContext?.targetHours || "8"} hrs
- Accumulated Sleep Debt: ${statsContext?.sleepDebt || "0"} hrs

Answer the user's health and sleep question with practical, evidence-based wellness tips (e.g., light exposure, temperature, adenosine buildup, magnesium/melatonin facts, stress reduction).
Be warm, encouraging, concise, and structured with clear bullet points. Include a subtle disclaimer for medical sleep disorders when appropriate.`;

    const chatContents = [
      ...(history || []).map((msg: { role: string; text: string }) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.text }],
      })),
      { role: "user", parts: [{ text: message }] },
    ];

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: chatContents as any,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    return res.json({ success: true, reply: response.text });
  } catch (err: any) {
    console.error("Error in AI chat handler:", err);
    return res.status(500).json({ error: err.message || "Failed to process chat message." });
  }
});

async function startServer() {
  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Sleep Tracker & Health Advisor running on http://localhost:${PORT}`);
  });
}

startServer();
