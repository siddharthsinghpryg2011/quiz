import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));

const API_KEY = process.env.GEMINI_API_KEY;

// Health check
app.get("/", (req, res) => {
  res.send("🚀 Gemini Server Running");
});

// Generate quiz
app.post("/generate", async (req, res) => {
  try {
    let { text, difficulty, num } = req.body;

    if (!text) {
      text = "Force and motion class 9 science";
    }

    const prompt = `
Generate ${num} ${difficulty} MCQs from this.

Rules:
- Each question must have 4 options (A, B, C, D)
- Mention correct answer clearly
- Keep format clean

Text:
${text}

Format:
Question: ...
A. ...
B. ...
C. ...
D. ...
Answer: ...
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    const data = await response.json();

    const output =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    res.json({ data: output });

  } catch (err) {
    console.error("ERROR:", err.message);
    res.status(500).json({ error: "Gemini failed" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("🚀 Server running"));
