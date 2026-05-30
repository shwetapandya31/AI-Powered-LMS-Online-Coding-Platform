const { GoogleGenerativeAI } = require("@google/generative-ai");

const executeCode = async (req, res) => {
  const { language, code, stdin } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ output: "Error: GEMINI_API_KEY is missing in server environment." });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `You are a strict code execution engine for ${language}. 
I will provide you with a code snippet and standard input (stdin). 
You must execute the code and ONLY output the exact stdout as a string. 
Do not explain anything. Do not use markdown blocks like \`\`\`. 
If there is a compilation or runtime error, output the exact error message.

Code:
${code}

Stdin:
${stdin || ''}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    // Clean up any potential markdown formatting the AI might still add
    text = text.replace(/^```[a-z]*\n/gm, '').replace(/```$/gm, '').trim();

    res.json({ output: text });
  } catch (error) {
    console.error("Code execution error:", error);
    res.status(500).json({ output: "Error executing code via AI simulation." });
  }
};

module.exports = { executeCode };
