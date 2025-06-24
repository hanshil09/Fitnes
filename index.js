// index.js

import express from "express";
import cors from "cors";
import OpenAI from "openai";
import dotenv from "dotenv";

// Load .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize OpenAI
const openai = new OpenAI({
  baseURL: "https://models.github.ai/inference",
  apiKey: process.env.GITHUB_TOKEN,
});

// In-memory conversation history
let conversationHistory = [
  {
    role: "system",
    content: "You are an expert fitness coach. You give friendly, science-based fitness advice, personalized to user's goals.",
  },
];

app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;

  if (!userMessage) {
    return res.status(400).json({ error: "Message is required." });
  }

  conversationHistory.push({ role: "user", content: userMessage });

  try {
    const completion = await openai.chat.completions.create({
      model: "openai/gpt-4o",
      messages: conversationHistory,
    });

    const aiResponse = completion.choices[0].message.content;
    conversationHistory.push({ role: "assistant", content: aiResponse });

    res.json({ reply: aiResponse });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get response from AI." });
  }
});

app.post("/reset", (req, res) => {
  conversationHistory = [
    {
      role: "system",
      content: "You are an expert fitness coach. You give friendly, science-based fitness advice, personalized to user's goals.",
    },
  ];
  res.json({ message: "Conversation reset." });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
