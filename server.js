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

// Generate Quiz
app.post("/generate", async (req, res) => {
  try {
    let { text, difficulty, num } = req.body;

    if (!text) text = "Class 9 science chapter";
    if (!difficulty) difficulty = "easy";
    if (!num) num = 5;

    const prompt = `
Create ${num} ${difficulty} MCQs from this text.

STRICT FORMAT:
Question: ...
A. ...
B. ...
C. ...
D. ...
Answer: ...

Text:
${text}
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ]
        })
      }
    );

    const data = await response.json();

    console.log("Gemini RAW:", JSON.stringify(data, null, 2));

    let output = "";

    if (data.candidates && data.candidates.length > 0) {
      const parts = data.candidates[0].content.parts;

      if (parts && parts.length > 0) {
        output = parts.map(p => p.text).join("\n");
      }
    }

    res.json({ data: output });

  } catch (err) {
    console.error("ERROR:", err.message);
    res.status(500).json({ error: "Gemini failed" });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🚀 Server running");
});
