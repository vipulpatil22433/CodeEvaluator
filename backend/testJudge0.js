const axios = require('axios');
require('dotenv').config();

const test = async () => {
    console.log("URL:", process.env.JUDGE0_API_URL);
    console.log("Key:", process.env.JUDGE0_API_KEY ? "EXISTS" : "MISSING");
    
    try {
        const response = await axios.post(
            `${process.env.JUDGE0_API_URL}/submissions?base64_encoded=true&wait=true`,
            {
                source_code: Buffer.from('print("hello")').toString('base64'),
                language_id: 71, // Python
                stdin: ""
            },
            {
                headers: {
                    "x-rapidapi-key": process.env.JUDGE0_API_KEY,
                    "x-rapidapi-host": process.env.RAPIDAPI_HOST,
                    "Content-Type": "application/json"
                }
            }
        );
        console.log("Success! Output:", Buffer.from(response.data.stdout || "", 'base64').toString());
    } catch (e) {
        console.log("FAILED!");
        console.log("Status:", e.response?.status);
        console.log("Data:", e.response?.data);
        console.log("Msg:", e.message);
    }
};

test();
