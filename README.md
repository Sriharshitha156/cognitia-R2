# Cognitia AI — Full-Stack Conversational AI

A full-stack web application that accepts a user question, sends it to an AI model via the Groq API, displays the response in a clean UI, and stores each Q&A pair in MongoDB Atlas.

---

## Project Overview

| Layer | Tech |
|---|---|
| Frontend | React 18 + Vite |
| Backend | Node.js + Express |
| AI Model | `llama-3.1-8b-instant` via Groq API |
| Database | MongoDB Atlas (Mongoose ODM) |
| Deployment | Vercel (frontend + backend as separate projects) |

### How It Works

1. User types a question in the frontend and submits it.
2. Frontend sends a `POST /api/ask` request to the backend.
3. Backend validates the input, calls the Groq API with the question.
4. The AI response is stored in MongoDB Atlas (question + answer + metadata).
5. The response is returned to the frontend and displayed to the user.

---

## Project Structure

```
cognitia-ai/
├── frontend/           # React + Vite client
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.module.css
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── .env.example
│
├── backend/            # Express API server
│   ├── index.js
│   ├── package.json
│   ├── vercel.json
│   └── .env.example
│
├── .gitignore
├── vibecoded.md
└── README.md
```

---

## Tech Stack Explanation

### Frontend — React + Vite
- **React 18** for building the UI with hooks (`useState`, `useRef`, `useEffect`).
- **Vite** for fast local development and optimized production builds.
- **CSS Modules** for scoped, conflict-free styling.
- `VITE_API_URL` environment variable points to the deployed backend.

### Backend — Node.js + Express
- **Express** for routing and middleware.
- **CORS** configured to only accept requests from the frontend domain.
- **dotenv** for environment variable management.
- **Groq SDK** for calling the `llama-3.1-8b-instant` model.
- **Mongoose** for MongoDB Atlas connection and schema definition.

### Database — MongoDB Atlas
Stores every Q&A interaction with the following schema:

```js
{
  question: String,       // User's question
  answer: String,         // AI-generated answer
  model: String,          // "llama-3.1-8b-instant"
  responseTimeMs: Number, // How long Groq took to respond
  createdAt: Date,        // Auto-generated timestamp
  updatedAt: Date
}
```

---

## Local Setup Instructions

### Prerequisites
- Node.js 18+ (or Bun)
- A [Groq API key](https://console.groq.com) (free)
- A [MongoDB Atlas](https://www.mongodb.com/atlas) cluster (free tier works)

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/cognitia-ai.git
cd cognitia-ai
```

### 2. Set up the backend

```bash
cd backend
cp .env.example .env
# Fill in your values in .env
npm install
npm run dev
```

Backend runs at `http://localhost:5000`.

### 3. Set up the frontend

```bash
cd ../frontend
cp .env.example .env
# Set VITE_API_URL=http://localhost:5000
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.

---

## API Usage

### POST `/api/ask`

Accepts a question and returns the AI response.

**Request**
```json
{
  "question": "What is the capital of France?"
}
```

**Response (200)**
```json
{
  "id": "665f...",
  "question": "What is the capital of France?",
  "answer": "The capital of France is Paris.",
  "responseTimeMs": 842
}
```

**Error responses**

| Status | Meaning |
|---|---|
| 400 | Missing or empty question |
| 429 | Groq rate limit hit |
| 500 | Server error / bad API key |

---

### GET `/api/history`

Returns the last 20 stored Q&A pairs.

**Response (200)**
```json
[
  {
    "_id": "665f...",
    "question": "...",
    "answer": "...",
    "responseTimeMs": 842,
    "createdAt": "2024-06-04T10:00:00.000Z"
  }
]
```

---

## Deployment Steps

Both the frontend and backend are deployed as **separate projects on Vercel**, both linked to the **same GitHub repository**.

### Backend on Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your GitHub repo and set the **Root Directory** to `backend`
3. Add environment variables:
   - `GROQ_API_KEY` — your Groq API key
   - `MONGODB_URI` — your MongoDB Atlas connection string
   - `FRONTEND_URL` — your Vercel frontend URL (set after deploying frontend)
4. Deploy. Note the backend URL (e.g. `https://cognitia-backend.vercel.app`).

### Frontend on Vercel

1. Go to Vercel → **Add New Project** → same GitHub repo
2. Set **Root Directory** to `frontend`
3. Add environment variable:
   - `VITE_API_URL` — your backend Vercel URL from above
4. Deploy.

### After Both Are Deployed

Update the backend's `FRONTEND_URL` environment variable on Vercel to the deployed frontend URL to ensure CORS works correctly. Trigger a redeployment.

---

## Security Practices

- API keys are stored in `.env` files and never committed to version control.
- `.env` is listed in `.gitignore`.
- CORS is restricted to the specific frontend origin (not `*`) in production.
- Input is validated and length-limited (2000 chars max) before hitting the AI API.
- No sensitive information is returned in error responses.
- MongoDB connection string includes auth credentials managed via environment variables only.

---

## Git Commit Conventions

Commits in this project follow a clear, descriptive pattern:

```
feat: add POST /api/ask endpoint with Groq integration
feat: connect Mongoose schema for Q&A storage
feat: build React question input and answer display UI
fix: add input validation and error handling to API
docs: write README with setup and deployment steps
chore: add .env.example and .gitignore
```

---

## License

MIT
