# CodeEvaluator AI

A full-stack MERN (MongoDB, Express, React, Node.js) web application inspired by LeetCode. It features an integrated Monaco Code Editor, AI-driven coding problem generation, and live code execution via Judge0 API.

## Features
- **User Authentication**: JWT-based login/signup with bcrypt password hashing.
- **AI Problem Generation**: Hooked up to Google Gemini / OpenAI to dynamically generate coding challenges based on topic and difficulty.
- **Code Execution**: Execute code securely using Judge0 API (supports JavaScript, Python, C++).
- **Dashboard**: Track your total score, problems solved, and recent submission history.

## Environment Setup

### Backend (`/backend/.env`)
Create a `.env` file in the `backend` folder:
```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/codeevaluator
JWT_SECRET=supersecret
OPENAI_API_KEY=your_openai_key
GEMINI_API_KEY=your_gemini_key
JUDGE0_API_KEY=your_rapidapi_judge0_key
JUDGE0_API_URL=https://judge0-ce.p.rapidapi.com
```

### Frontend (`/frontend/.env`)
Create a `.env` file in the `frontend` folder:
```
VITE_API_URL=http://localhost:5000/api
```

## Running Locally

1. **Start MongoDB**: Ensure your local MongoDB server is running (or update the `MONGO_URI` to an Atlas string).
2. **Backend**:
   ```bash
   cd backend
   npm install
   node server.js
   ```
3. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

Navigate to `http://localhost:5173` to view the application!
