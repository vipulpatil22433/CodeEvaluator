const { OpenAI } = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const hasOpenAIKey = Boolean(process.env.OPENAI_API_KEY);
const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY);
const openai = hasOpenAIKey ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
const genAI = hasGeminiKey ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

const generateQuestionPrompt = (topic, difficulty) => {
  const timestamp = new Date().toISOString();
  return `Generate a unique and creative coding problem about ${topic} with ${difficulty} difficulty.
Avoid common cliches like "Sum of Two Numbers" or "Count Vowels" unless specifically asked.
Current Context/Seed: ${timestamp}

CRITICAL RULES FOR INPUT FORMATTING:
1. Always follow standard competitive programming input formats.
2. If an input represents an array or a list, you MUST format it exactly as a JSON array with square brackets (e.g., "[1, 2, 3]"). Do not use bare space-separated numbers for arrays. Our backend relies on these brackets to parse the array and prepend its length automatically for the user's 'cin >> n' code.

Return the response strictly in the following JSON format:
{
  "title": "Problem Title",
  "description": "Short markdown description",
  "constraints": ["Constraint 1"],
  "examples": [ { "input": "...", "explanation": "..." } ],
  "testCases": [
    { "input": "...", "isHidden": false },
    { "input": "...", "isHidden": true }
  ],
  "referenceSolution": "Python 3 code perfectly solving the problem. CRITICAL: Our execution engine passes inputs as space-separated values via standard input. You MUST wrap your logic inside this EXACT standard input boilerplate or execution will crash:\\n\\nimport sys\\n\\ndef solve():\\n    data = sys.stdin.read().split()\\n    if not data: return\\n    # data[0] is typically the array length if the input was an array\\n    # Extract elements, run your algorithm, and print to stdout...\\n    # print(answer)\\n\\nif __name__ == '__main__':\\n    solve()"
}`;
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const retryAsync = async (fn, retries = 2, delay = 500) => {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const status = error?.status || error?.statusCode;
      const canRetry = status === 429 || status === 503;
      if (attempt === retries || !canRetry) throw error;
      await sleep(delay * (attempt + 1));
    }
  }
  throw lastError;
};

const generateQuestionAI = async (topic, difficulty, provider = 'gemini') => {
  const prompt = generateQuestionPrompt(topic, difficulty);

  const callOpenAI = async () => {
    if (!hasOpenAIKey) {
      throw new Error('OpenAI API key is not configured. Set OPENAI_API_KEY to use OpenAI.');
    }
    const completion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'gpt-3.5-turbo',
    });
    return completion.choices[0].message.content;
  };

  const callGemini = async () => {
    if (!hasGeminiKey) {
      throw new Error('Gemini API key is not configured. Set GEMINI_API_KEY to use Gemini.');
    }
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-flash-latest',
      generationConfig: { responseMimeType: 'application/json' }
    });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  };

  try {
    let resultJsonString = '';

    if (provider === 'openai') {
      resultJsonString = await retryAsync(callOpenAI);
    } else {
      if (!hasGeminiKey) {
        if (!hasOpenAIKey) {
          throw new Error('Neither GEMINI_API_KEY nor OPENAI_API_KEY are configured. Please set at least one.');
        }
        console.warn('Gemini key missing, using OpenAI fallback instead.');
        resultJsonString = await retryAsync(callOpenAI);
      } else {
        try {
          resultJsonString = await retryAsync(callGemini);
        } catch (geminiError) {
          throw new Error(`Gemini AI Error: ${geminiError?.message || geminiError}`);
        }
      }
    }

    resultJsonString = resultJsonString.replace(/```json/g, '').replace(/```/g, '').trim();
    try {
      return JSON.parse(resultJsonString);
    } catch (parseError) {
      throw new Error(`AI responded with invalid JSON: ${parseError.message}. Response: ${resultJsonString}`);
    }
  } catch (error) {
    console.error('AI Generation Error:', error);

    const message = error?.message || 'Unknown AI error';
    if (message.includes('Incorrect API key provided') || message.includes('Missing credentials')) {
      throw new Error('OpenAI authentication failed. Check your OPENAI_API_KEY and try again.');
    }
    if (message.includes('Gemini API key is not configured')) {
      throw new Error('Gemini is not configured. Set GEMINI_API_KEY or select OpenAI provider.');
    }
    if (message.includes('Neither GEMINI_API_KEY nor OPENAI_API_KEY are configured')) {
      throw new Error('No AI provider is configured. Set GEMINI_API_KEY or OPENAI_API_KEY.');
    }
    if (message.includes('Gemini failed and OpenAI key is not configured')) {
      throw new Error('Gemini failed and OpenAI is not configured. Set OPENAI_API_KEY or use a valid Gemini key.');
    }

    throw new Error(`Failed to generate question from AI: ${message}`);
  }
};

module.exports = { generateQuestionAI };
