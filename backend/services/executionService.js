const axios = require("axios");

/**
 * Standardizes input into a whitespace-separated stream.
 * 1. Expands arrays into "length elements..." format.
 * 2. Collects expanded arrays and standalone scalars.
 * 3. Always outputs arrays FIRST followed by scalars to ensure 'cin >> n' works
 *    regardless of property order in the test case.
 */
const formatInput = (input) => {
  if (input === null || input === undefined) return "";
  let inputStr = String(input).trim();
  if (inputStr === "") return "";
  
  const expandedArrays = [];
  
  // 1. Detect and extract arrays [1, 2, 3] -> "3 1 2 3"
  // It handles nested or comma-separated numbers inside brackets
  const arrayRegex = /\[(.*?)\]/g;
  inputStr = inputStr.replace(arrayRegex, (match, content) => {
    const elements = content.match(/-?\d+(\.\d+)?(e[+-]?\d+)?/gi) || [];
    expandedArrays.push(`${elements.length} ${elements.join(' ')}`);
    return " "; // Leave space to keep tokens separate
  });

  // 2. Extract remaining tokens (words or numbers)
  // We split by whitespace and filter out empty strings and labels (ending with :)
  // We also strip trailing commas which are common in JSON-like AI inputs
  const tokens = inputStr.split(/\s+/)
    .map(t => t.replace(/[,]$|[:]$/g, '').trim()) // Strip trailing commas or colons
    .filter(t => t.length > 0 && !t.includes(':')); // Filter out anything that still looks like a label
  
  // 3. Return: [Arrays] + [Remaining Tokens]
  return [...expandedArrays, ...tokens].join(' ');
};

const executeCode = async (code, language_id, input = "") => {
  try {
    const formattedStdin = formatInput(input);
    const isRapidAPI = Boolean(process.env.JUDGE0_API_KEY && process.env.JUDGE0_API_URL);
    const apiUrl = isRapidAPI ? process.env.JUDGE0_API_URL : "https://ce.judge0.com";
    
    const requestOptions = {
      params: { base64_encoded: true, wait: true }
    };

    if (isRapidAPI) {
      requestOptions.headers = {
        "x-rapidapi-key": process.env.JUDGE0_API_KEY,
        "x-rapidapi-host": process.env.RAPIDAPI_HOST || "judge0-ce.p.rapidapi.com",
        "Content-Type": "application/json"
      };
    }

    const response = await axios.post(
      `${apiUrl}/submissions`,
      {
        source_code: Buffer.from(code || "").toString('base64'),
        language_id: language_id,
        stdin: Buffer.from(formattedStdin || "").toString('base64')
      },
      requestOptions
    );

    const data = response.data;
    if (data.stdout) data.stdout = Buffer.from(data.stdout, 'base64').toString('utf8');
    if (data.stderr) data.stderr = Buffer.from(data.stderr, 'base64').toString('utf8');
    if (data.compile_output) data.compile_output = Buffer.from(data.compile_output, 'base64').toString('utf8');

    return data;
  } catch (error) {
    const errorDetails = error.response?.data ? JSON.stringify(error.response.data) : error.message;
    console.error("Judge0 Error:", errorDetails);
    throw new Error(`Execution error: ${errorDetails}`);
  }
};

module.exports = { executeCode };