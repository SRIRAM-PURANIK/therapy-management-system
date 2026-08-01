const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const MODEL = "openai/gpt-oss-120b";

const generateStructured = async (systemPrompt, userPrompt) => {
  const completion = await groq.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.3,
    response_format: { type: "json_object" },
  });

  const raw = completion.choices[0].message.content;

  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new Error("AI returned invalid JSON");
  }
};

module.exports = { generateStructured };