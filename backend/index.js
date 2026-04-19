import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import Groq from "groq-sdk";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
    methods: ["GET", "POST"],
  })
);
app.use(express.json());

// ─── MongoDB Connection ───────────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ─── Mongoose Schema ──────────────────────────────────────────────────────────
const querySchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
    },
    answer: {
      type: String,
      required: true,
    },
    model: {
      type: String,
      default: "llama-3.1-8b-instant",
    },
    responseTimeMs: {
      type: Number,
    },
  },
  { timestamps: true }
);

const Query = mongoose.model("Query", querySchema);

// ─── Groq Client ─────────────────────────────────────────────────────────────
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ─── Routes ───────────────────────────────────────────────────────────────────

// Health check
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Cognitia AI Backend is running 🚀" });
});

// POST /api/ask — Accept a question, get AI answer, store in DB
app.post("/api/ask", async (req, res) => {
  const { question } = req.body;

  // Input validation
  if (!question || typeof question !== "string" || question.trim() === "") {
    return res.status(400).json({ error: "A non-empty question is required." });
  }

  if (question.trim().length > 2000) {
    return res
      .status(400)
      .json({ error: "Question must be under 2000 characters." });
  }

  const start = Date.now();

  try {
    // Call Groq API
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful, concise, and knowledgeable AI assistant. Answer questions clearly and accurately.",
        },
        {
          role: "user",
          content: question.trim(),
        },
      ],
      max_tokens: 1024,
      temperature: 0.7,
    });

    const answer = completion.choices[0]?.message?.content;

    if (!answer) {
      return res
        .status(500)
        .json({ error: "No response received from the AI model." });
    }

    const responseTimeMs = Date.now() - start;

    // Store in MongoDB
    const record = await Query.create({
      question: question.trim(),
      answer,
      model: "llama-3.1-8b-instant",
      responseTimeMs,
    });

    return res.status(200).json({
      id: record._id,
      question: record.question,
      answer: record.answer,
      responseTimeMs,
    });
  } catch (err) {
    console.error("Error calling Groq API:", err?.message || err);

    if (err?.status === 401) {
      return res.status(500).json({ error: "Invalid Groq API key." });
    }
    if (err?.status === 429) {
      return res
        .status(429)
        .json({ error: "Rate limit reached. Please try again later." });
    }

    return res
      .status(500)
      .json({ error: "An error occurred while processing your request." });
  }
});

// GET /api/history — Retrieve last 20 stored queries
app.get("/api/history", async (req, res) => {
  try {
    const records = await Query.find()
      .sort({ createdAt: -1 })
      .limit(20)
      .select("question answer createdAt responseTimeMs");
    return res.status(200).json(records);
  } catch (err) {
    console.error("Error fetching history:", err);
    return res.status(500).json({ error: "Failed to fetch history." });
  }
});

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
