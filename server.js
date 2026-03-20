import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));

// 🔥 Gemini API
const API_KEY = process.env.GEMINI_API_KEY;

app.get("/", (req, res) => {
  res.send("Gemini Server Running 🚀");
});

app.post("/generate", async (req, res) => {
  try {
    const { text, difficulty, num } = req.body;

    const prompt = `
Generate ${num} ${difficulty} MCQs from this text.

Rules:
- 4 options (A, B, C, D)
- Give correct answer
- Short questions

Text:
${text}

Format:
Question:
A.
B.
C.
D.
Answer:
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`,
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

    const output = data.candidates?.[0]?.content?.parts?.[0]?.text;

    res.json({ data: output });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gemini failed" });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🚀 Gemini server running");
});
