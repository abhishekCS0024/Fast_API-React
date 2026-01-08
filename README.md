# 🎬 AI Movie Recommendation System

An AI-powered movie recommendation web application that suggests personalized movies based on user **mood, genres, language, and streaming platform**.  
Built using **FastAPI, LangGraph, Groq LLM, and React**.

---

## 🚀 Features

- 🎭 Mood-based movie recommendations  
- 🎞️ Multi-genre selection  
- 🌍 Language-aware suggestions  
- 📺 Platform-specific recommendations  
- 🤖 AI reasoning using LangGraph + Groq LLM  
- 📥 Download recommendations as a text file  
- ⚡ FastAPI backend  
- 🎨 Modern React UI  

---

## 🧠 Architecture Overview

React Frontend
|
| POST /api/recommend
|
FastAPI Backend
|
|-- LangGraph Workflow
├── Mood Node
├── Genre Node
├── Language Node
├── Platform Node
└── AI Recommendation Node
|
Groq LLM (LLaMA 3.3 70B)


---

## 🛠 Tech Stack

### Backend
- FastAPI
- LangGraph
- LangChain
- Groq LLM (LLaMA-3.3-70B)
- Pydantic
- Python 3.10+

### Frontend
- React
- Tailwind CSS
- Lucide Icons
- Fetch API

---

## 📂 Project Structure



movie-recommendation-agent/
│
├── backend/
│ ├── main.py
│ ├── .env
│ ├── requirements.txt
│
├── frontend/
│ ├── src/
│ │ ├── MovieRecommendationApp.jsx
│ │ └── index.js
│ └── package.json
│
└── README.md


---

## 🔑 Environment Variables

Create a `.env` file inside the `backend` directory:

```env
GROQ_API_KEY=your_groq_api_key_here

⚙️ Backend Setup (FastAPI)
1️⃣ Create Virtual Environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

2️⃣ Install Dependencies
pip install -r requirements.txt

3️⃣ Run Backend Server
uvicorn main:app --reload


Backend runs at:

http://localhost:8000

🌐 API Endpoints
Health Check
GET /health

Get Movie Recommendations
POST /api/recommend

Request Body
{
  "mood": "Feel-good",
  "genres": ["Drama", "Comedy"],
  "language": "English",
  "platform": "Netflix"
}

Response
{
  "recommendations": "AI generated movie suggestions...",
  "preferences": {
    "mood": "Feel-good",
    "genres": ["Drama", "Comedy"],
    "language": "English",
    "platform": "Netflix"
  }
}

🎨 Frontend Setup (React)
1️⃣ Install Dependencies
npm install

2️⃣ Start Frontend
npm run dev


Frontend runs at:

http://localhost:5173
