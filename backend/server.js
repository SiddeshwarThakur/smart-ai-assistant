const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");
require("dotenv").config();

const app = express();
// app.use(cors({ origin: "http://localhost:3000" }));
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 👇 Test route to confirm server is running
app.get("/", (req, res) => {
  res.send("🚀 Zephyrus backend is running!");
});

// app.post("/chat", async (req, res) => {
//   const { message } = req.body;

//   try {
//     const response = await openai.chat.completions.create({
//       model: "gpt-3.5-turbo",
//       messages: [
//         { role: "system", content: "You are a helpful AI tutor." },
//         { role: "user", content: message },
//       ],
//     });

//     res.json({ reply: response.choices[0].message.content });
//   } catch (error) {
//     console.error("OpenAI error:", error);
//     res.status(500).json({ reply: "Something went wrong with the AI." });
//   }
// });

app.post("/chat", async (req, res) => {
  const { messages } = req.body; // Expecting full message history from frontend

  try {
    const chatMessages = [
      { role: "system", content: "You are a helpful AI tutor." },
      ...messages.map((msg) => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.text,
      })),
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: chatMessages,
    });

    res.json({ reply: response.choices[0].message.content });
  } catch (error) {
    console.error("OpenAI error:", error);
    res.status(500).json({ reply: "Something went wrong with the AI." });
  }
});


const PORT = 8000;
app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));

