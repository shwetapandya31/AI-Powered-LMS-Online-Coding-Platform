const { GoogleGenerativeAI } = require("@google/generative-ai");

const apiKey = process.env.GEMINI_API_KEY;

const PRIMARY_MODEL = "gemini-2.5-flash";
const FALLBACK_MODEL = "gemini-1.5-flash";

// Auto-retries with gemini-1.5-flash if gemini-2.5-flash is overloaded (503)
const generateWithFallback = async (prompt) => {
  const genAI = new GoogleGenerativeAI(apiKey);
  try {
    const model = genAI.getGenerativeModel({ model: PRIMARY_MODEL });
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (err) {
    if (err.status === 503 || err.status === 429 || (err.message && err.message.includes('503'))) {
      console.log(`[AI] ${PRIMARY_MODEL} unavailable (${err.status}), falling back to ${FALLBACK_MODEL}`);
      const genAI2 = new GoogleGenerativeAI(apiKey);
      const fallbackModel = genAI2.getGenerativeModel({ model: FALLBACK_MODEL });
      const result = await fallbackModel.generateContent(prompt);
      return result.response.text();
    }
    throw err;
  }
};

// @desc    Get AI Doubt Assistant Answer
// @route   POST /api/ai/doubt
// @access  Private
const getDoubtAnswer = async (req, res) => {
  try {
    const { question, context } = req.body;
    if (!apiKey) return res.json({ answer: `(Mock AI — no GEMINI_API_KEY): ${question}` });

    const prompt = `You are an expert AI Coding Instructor Assistant. 
A student is asking a doubt about their current course context: "${context}". 
Student's question: "${question}"

Your primary responsibilities are to:
1. Answer coding doubts clearly and concisely.
2. Explain errors in their code if they provide any.
3. Give coding hints to guide them to the solution (do not just give the full answer immediately unless asked).
4. Suggest helpful learning resources or documentation links if relevant.

Please provide a helpful, encouraging, and structured answer.`;

    const text = await generateWithFallback(prompt);
    res.json({ answer: text });
  } catch (error) {
    console.error("AI Doubt Error:", error);
    res.status(500).json({ message: error.status === 503 ? "AI is temporarily overloaded. Please try again in a moment." : "Error generating AI response" });
  }
};

// @desc    AI Code Review
// @route   POST /api/ai/review-code
// @access  Private
const reviewCode = async (req, res) => {
  try {
    const { code, language } = req.body;
    if (!code) return res.status(400).json({ message: "Code is required" });

    if (!apiKey) {
      return res.json({
        review: `(Mock AI): Here is a simulated review of your ${language} code.\n\n**Bugs:** None detected in mock mode.\n**Improvements:** Add error handling and comments.\n**Rating:** 7/10`
      });
    }

    const prompt = `You are a senior software engineer performing a thorough code review.

Language: ${language}
Code to review:
\`\`\`${language}
${code}
\`\`\`

Please provide a structured code review with the following sections:
1. **Overall Rating** (X/10) with a one-line summary
2. **Bugs & Errors** — list any bugs, logic errors, or edge cases missed
3. **Code Quality** — readability, naming conventions, code structure
4. **Performance** — any inefficiencies or optimizations
5. **Security** — potential security issues if applicable
6. **Improvements** — specific, actionable suggestions with example rewrites where helpful

Be constructive, educational, and encouraging.`;

    const text = await generateWithFallback(prompt);
    res.json({ review: text });
  } catch (error) {
    console.error("AI Code Review Error:", error);
    res.status(500).json({ message: error.status === 503 ? "AI is temporarily overloaded. Please try again in a moment." : "Error generating code review" });
  }
};

// @desc    AI Interview Preparation
// @route   POST /api/ai/interview-prep
// @access  Private
const interviewPrep = async (req, res) => {
  try {
    const { topic, mode, question, userAnswer, difficulty } = req.body;

    if (!apiKey) {
      if (mode === 'question') return res.json({ question: `(Mock AI): Explain the concept of closures in ${topic}.` });
      return res.json({ feedback: `(Mock AI): Your answer shows understanding. Consider expanding on edge cases. Score: 7/10` });
    }

    let prompt;
    if (mode === 'question') {
      prompt = `You are an expert technical interviewer at a top tech company.
Generate ONE ${difficulty || 'medium'} difficulty interview question about: "${topic}".

Rules:
- Ask only ONE question
- It can be conceptual, coding, system design, or behavioral depending on the topic
- Make it realistic and commonly asked at tech interviews
- Do NOT provide the answer
- Format: Just output the question text directly, no preamble`;
    } else {
      prompt = `You are an expert technical interviewer evaluating a candidate's answer.

Topic: ${topic}
Interview Question: "${question}"
Candidate's Answer: "${userAnswer}"

Please evaluate the answer with:
1. **Score** (X/10)
2. **Strengths** — what they got right
3. **Gaps** — what was missing or incorrect
4. **Model Answer** — a brief ideal answer
5. **Follow-up Question** — one follow-up to test deeper understanding

Be honest but encouraging.`;
    }

    const text = await generateWithFallback(prompt);
    if (mode === 'question') {
      res.json({ question: text });
    } else {
      res.json({ feedback: text });
    }
  } catch (error) {
    console.error("AI Interview Error:", error);
    res.status(500).json({ message: error.status === 503 ? "AI is temporarily overloaded. Please try again in a moment." : "Error generating interview content" });
  }
};

// @desc    AI Study Planner
// @route   POST /api/ai/study-planner
// @access  Private
const studyPlanner = async (req, res) => {
  try {
    const { topic, durationWeeks, hoursPerDay, currentLevel } = req.body;
    if (!topic) return res.status(400).json({ message: "Topic is required" });

    if (!apiKey) {
      return res.json({
        plan: `(Mock AI): Here is a ${durationWeeks}-week study plan for "${topic}".\n\nWeek 1: Fundamentals\nWeek 2: Core Concepts\nWeek 3: Practice Projects\nWeek 4: Advanced Topics & Review`
      });
    }

    const prompt = `You are an expert educational coach and curriculum designer.

Create a detailed, personalized study plan for:
- **Topic/Skill**: ${topic}
- **Duration**: ${durationWeeks || 4} weeks
- **Daily Study Time**: ${hoursPerDay || 2} hours/day
- **Current Level**: ${currentLevel || 'beginner'}

Format the plan as:
## 📅 ${durationWeeks || 4}-Week Study Plan: ${topic}

For each week provide:
### Week N: [Theme]
**Goal**: [what they'll achieve this week]
**Daily Topics** (list each day Mon-Fri):
- Day 1: ...
- Day 2: ...
**Resources**: [2-3 specific free resources — YouTube channels, docs, or platforms]
**Weekend Project**: [a small hands-on project to reinforce learning]

End with:
## 🎯 Milestones & Success Metrics
[How to know they've mastered each phase]

Make it practical, specific, and motivating.`;

    const text = await generateWithFallback(prompt);
    res.json({ plan: text });
  } catch (error) {
    console.error("AI Study Planner Error:", error);
    res.status(500).json({ message: error.status === 503 ? "AI is temporarily overloaded. Please try again in a moment." : "Error generating study plan" });
  }
};

// @desc    AI Quiz Generator (for instructors)
// @route   POST /api/ai/generate-quiz
// @access  Private/Instructor
const generateQuiz = async (req, res) => {
  try {
    const { topic, numQuestions, difficulty } = req.body;
    if (!topic) return res.status(400).json({ message: "Topic is required" });

    if (!apiKey) {
      const mockQs = Array.from({ length: numQuestions || 3 }, (_, i) => ({
        question: `(Mock) Question ${i + 1} about ${topic}?`,
        options: ["Option A", "Option B", "Option C", "Option D"],
        correctAnswerIndex: 0
      }));
      return res.json({ questions: mockQs });
    }

    const prompt = `You are an expert educator creating a quiz.

Generate exactly ${numQuestions || 5} multiple-choice quiz questions about: "${topic}"
Difficulty: ${difficulty || 'Medium'}

IMPORTANT: Respond with ONLY a valid JSON array. No markdown, no explanation, no code fences.

Format:
[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswerIndex": 0
  }
]

Rules:
- Each question must have exactly 4 options
- correctAnswerIndex is 0-3 (index of the correct option in the options array)
- Questions should be clear, unambiguous, and educational
- Vary question types (conceptual, application, analysis)`;

    let text = await generateWithFallback(prompt);
    text = text.trim();

    // Strip markdown code fences if present
    text = text.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/\s*```$/, '');
    // Find the first [ and last ] to extract JSON array
    const startIdx = text.indexOf('[');
    const endIdx = text.lastIndexOf(']');
    if (startIdx !== -1 && endIdx !== -1) {
      text = text.slice(startIdx, endIdx + 1);
    }

    const questions = JSON.parse(text);
    res.json({ questions });
  } catch (error) {
    console.error("AI Quiz Generation Error:", error);
    if (error.status === 503) {
      return res.status(503).json({ message: "AI is temporarily overloaded. Please try again in a moment." });
    }
    res.status(500).json({ message: "Error generating quiz. Please try again." });
  }
};

module.exports = {
  getDoubtAnswer,
  reviewCode,
  interviewPrep,
  studyPlanner,
  generateQuiz,
};
