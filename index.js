// BACKEND - index.js

const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize OpenAI (DeepSeek)
const openai = new OpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: "sk-3fa8104325a649f8ab7dc7269ab5ab95",
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
      model: "deepseek-chat",
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
