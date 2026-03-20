import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();

// 🔥 Middleware
app.use(cors());
app.use(express.json({ limit: "1mb" })); // 413 fix

// 🔥 OpenAI setup
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// 🔥 Health check route
app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});

// 🔥 AI Quiz Generator
app.post("/generate", async (req, res) => {
  try {
    const { text, difficulty, num } = req.body;

    if (!text || !difficulty || !num) {
      return res.status(400).json({ error: "Missing fields" });
    }

    // 🔥 Trim text (important)
    const trimmedText = text.slice(0, 2000);

    const prompt = `
Generate ${num} ${difficulty} level MCQs from this text.

Rules:
- Each question must have 4 options (A, B, C, D)
- Clearly mention correct answer
- Keep questions short

Text:
${trimmedText}

Format EXACTLY like this:

Question: ...
A. ...
B. ...
C. ...
D. ...
Answer: ...
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "user", content: prompt }
      ]
    });

    const output = response.choices[0].message.content;

    res.json({ data: output });

  } catch (error) {
    console.error("🔥 ERROR:", error.message);

    res.status(500).json({
      error: "AI generation failed",
      details: error.message
    });
  }
});

// 🔥 Start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
