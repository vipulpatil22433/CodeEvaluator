require('dotenv').config();
const axios = require('axios');

(async () => {
  try {
    const res = await axios.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
    console.log("AVAILABLE MODELS:");
    console.log(res.data.models.map(m => m.name).join(', '));
  } catch(e) {
    if (e.response) {
      console.error("Fetch Error:", JSON.stringify(e.response.data, null, 2));
    } else {
      console.error(e.message);
    }
  }
})();
