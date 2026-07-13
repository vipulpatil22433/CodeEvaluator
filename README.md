# CodeEvaluator AI

A full-stack **MERN (MongoDB, Express.js, React, Node.js)** coding platform inspired by LeetCode. It features AI-generated coding problems, real-time multi-language code execution, secure authentication, and contest management, providing an end-to-end coding practice experience.

## 🌐 Live Demo

https://code-evaluator-chi.vercel.app/

---

## ✨ Why This Project?

Most coding practice platforms rely on a fixed, manually curated problem bank. **CodeEvaluator AI** explores a different approach by leveraging **OpenAI** and **Google Gemini** to dynamically generate coding problems based on user preferences.

Generated problems are evaluated against executable test cases using the **Judge0 API**, ensuring that submissions are verified through real code execution rather than static comparisons.

---

## 🚀 Features

* 🤖 **AI-generated coding problems** using OpenAI and Google Gemini APIs with provider fallback support.
* 💻 **Integrated Monaco Code Editor** for an IDE-like coding experience.
* ⚡ **Real-time code execution** using Judge0 API.
* 🌐 **Multi-language support** (JavaScript, Python, C++).
* 🔐 **Secure JWT authentication** with protected routes and bcrypt password hashing.
* 🏆 **Contest management system** with automatic classification into Upcoming, Running, and Past contests.
* ✅ **Submission evaluation** against predefined test cases, including edge cases.
* 📊 **User dashboard** displaying solved problems, scores, and recent submission history.
* 📈 **Performance tracking** to monitor coding progress over time.

---

## 🏗️ Architecture

```text
                React + Vite Frontend
                         │
                         ▼
               Express.js REST API
                         │
         ┌───────────────┼────────────────┐
         │               │                │
         ▼               ▼                ▼
 JWT Authentication   MongoDB       Judge0 API
     Middleware      (Mongoose)   Code Execution
                         │
                         ▼
            OpenAI API / Google Gemini
             AI Problem Generation
```

### System Design

* **API Layer:** RESTful endpoints for authentication, problems, submissions, contests, and user management.
* **Authentication:** JWT-based authentication with middleware protecting private routes.
* **Database:** MongoDB stores users, coding problems, submissions, contest data, and user progress.
* **Code Execution:** User submissions are securely executed through Judge0 and validated against expected outputs.
* **AI Generation:** Problems are generated dynamically using OpenAI or Google Gemini, with fallback support for improved reliability.

---

## 🛠 Tech Stack

| Layer              | Technologies                      |
| ------------------ | --------------------------------- |
| **Frontend**       | React, Vite, Monaco Editor, Axios |
| **Backend**        | Node.js, Express.js               |
| **Database**       | MongoDB, Mongoose                 |
| **Authentication** | JWT, bcrypt                       |
| **AI Services**    | OpenAI API, Google Gemini API     |
| **Code Execution** | Judge0 API                        |
| **Tools**          | Git, GitHub, Postman              |

---

## 📁 Project Structure

```text
CodeEvaluator-AI/
│
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── server.js
│   └── .env
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── vite.config.js
│   └── .env
│
└── README.md
```

---

## ⚙️ Getting Started

### Prerequisites

* Node.js (v18 or later)
* MongoDB (Local or MongoDB Atlas)
* OpenAI API Key
* Google Gemini API Key
* Judge0 API Key

---

## 📥 Installation

Clone the repository:

```bash
git clone https://github.com/vipulpatil22433/CodeEvaluator-AI.git
cd CodeEvaluator-AI
```

Install backend dependencies:

```bash
cd backend
npm install
```

Install frontend dependencies:

```bash
cd ../frontend
npm install
```

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/codeevaluator
JWT_SECRET=your_jwt_secret

OPENAI_API_KEY=your_openai_api_key
GEMINI_API_KEY=your_gemini_api_key

JUDGE0_API_KEY=your_judge0_api_key
JUDGE0_API_URL=https://judge0-ce.p.rapidapi.com
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:5000/api
```

---

## ▶️ Running the Application

### Start MongoDB

Ensure your MongoDB server is running locally or update `MONGO_URI` with your MongoDB Atlas connection string.

### Start Backend

```bash
cd backend
node server.js
```

### Start Frontend

```bash
cd frontend
npm run dev
```

The application will be available at:

* Frontend: `http://localhost:5173`
* Backend: `http://localhost:5000`

---

## 📡 API Overview

| Method | Endpoint                 | Description                        |
| ------ | ------------------------ | ---------------------------------- |
| POST   | `/api/auth/register`     | Register a new user                |
| POST   | `/api/auth/login`        | Authenticate user and return JWT   |
| GET    | `/api/problems`          | Fetch all coding problems          |
| POST   | `/api/problems/generate` | Generate a coding problem using AI |
| POST   | `/api/submissions`       | Submit code for evaluation         |
| GET    | `/api/contests`          | Retrieve contests by status        |

---

## 🧪 Testing & Edge Cases

The submission engine validates code against multiple test cases, including:

* Empty or null input
* Large input sizes
* Malformed or unexpected input
* Hidden test cases
* Runtime errors
* Compilation errors
* Infinite loop protection using Judge0 execution limits
* Time limit exceeded scenarios

---

## 🚀 Future Improvements

* Redis caching for frequently requested problems
* Rate limiting for AI generation requests
* Real-time leaderboard using WebSockets
* Asynchronous problem generation using job queues
* Email verification and password reset
* Docker support for simplified deployment
* Unit and integration testing



---

## 👨‍💻 Author

**Vipul Patil**

* GitHub: https://github.com/vipulpatil22433
* LinkedIn: https://www.linkedin.com/in/vipul-patil-181987291/

---


