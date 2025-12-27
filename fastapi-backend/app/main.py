"""
Movie Recommendation Agent - FastAPI Backend
Run with: uvicorn main:app --reload
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, TypedDict, Annotated
from langgraph.graph import StateGraph, START, END
from langchain_core.messages import HumanMessage, AIMessage
from langchain_core.prompts import ChatPromptTemplate
from langchain_groq import ChatGroq
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="Movie Recommendation API",
    description="AI-powered movie recommendation engine",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for request/response
class RecommendationRequest(BaseModel):
    mood: str
    genres: List[str]
    language: str
    platform: str

class RecommendationResponse(BaseModel):
    recommendations: str
    preferences: dict

# State structure for LangGraph
class MovieState(TypedDict):
    messages: Annotated[list[HumanMessage | AIMessage], "the messages in the conversation"]
    Mood: str
    Genre: List[str]
    Language: str
    Platform: str

# Initialize LLM
def get_llm():
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY not found in environment variables")
    
    return ChatGroq(
        temperature=0,
        groq_api_key=api_key,
        model_name="llama-3.3-70b-versatile",
        verbose=False
    )

llm = get_llm()

# Node functions
def mood_node(state: MovieState):
    state["messages"] = state["messages"] + [
        HumanMessage(content=f"Your mood is {state['Mood']}")
    ]
    return state

def genre_node(state: MovieState):
    state["messages"] = state["messages"] + [
        HumanMessage(content=f"Your favourite genres are: {', '.join(state['Genre'])}")
    ]
    return state

def language_node(state: MovieState):
    state["messages"] = state["messages"] + [
        HumanMessage(content=f"Your preferred language is: {state['Language']}")
    ]
    return state

def platform_node(state: MovieState):
    state["messages"] = state["messages"] + [
        HumanMessage(content=f"Your preferred platform is: {state['Platform']}")
    ]
    return state

def suggestion_node(state: MovieState):
    # Create the prompt with actual state values
    movie_recommendation_prompt = ChatPromptTemplate.from_messages([
        ("system",
         f"You are an intelligent movie recommendation agent. "
         f"Based on the user's mood: {state['Mood']}, preferred genres: {', '.join(state['Genre'])}, "
         f"language: {state['Language']}, and available streaming platform: {state['Platform']}, "
         f"recommend suitable movies available on that platform. "
         f"Provide 3-5 specific movie recommendations with:\n"
         f"1. Movie title and year\n"
         f"2. Brief description (2-3 sentences)\n"
         f"3. Why it matches their preferences\n"
         f"Format each recommendation clearly with bullet points."),
        ("human", "Suggest movies for me to watch.")
    ])
    
    # Format the template into messages before invoking
    messages = movie_recommendation_prompt.format_messages()
    response = llm.invoke(messages)
    
    state["messages"] = state["messages"] + [AIMessage(content=response.content)]
    return state

# Build the workflow graph
def build_workflow():
    workflow = StateGraph(MovieState)
    
    # Add nodes
    workflow.add_node("input_mood", mood_node)
    workflow.add_node("input_genre", genre_node)
    workflow.add_node("input_language", language_node)
    workflow.add_node("input_platform", platform_node)
    workflow.add_node("suggestion", suggestion_node)
    
    # Add edges to define flow
    workflow.add_edge(START, "input_mood")
    workflow.add_edge("input_mood", "input_genre")
    workflow.add_edge("input_genre", "input_language")
    workflow.add_edge("input_language", "input_platform")
    workflow.add_edge("input_platform", "suggestion")
    workflow.add_edge("suggestion", END)
    
    return workflow.compile()

# Initialize workflow
agent = build_workflow()

# API Endpoints
@app.get("/")
async def root():
    return {
        "message": "Movie Recommendation API",
        "version": "1.0.0",
        "endpoints": {
            "recommend": "/api/recommend (POST)",
            "health": "/health (GET)"
        }
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "llm_initialized": llm is not None}

@app.post("/api/recommend", response_model=RecommendationResponse)
async def get_recommendations(request: RecommendationRequest):
    """
    Get movie recommendations based on user preferences
    """
    try:
        # Validate input
        if not request.genres:
            raise HTTPException(status_code=400, detail="At least one genre must be selected")
        
        # Prepare state
        state = {
            "messages": [HumanMessage(content="I want to watch a movie")],
            "Mood": request.mood,
            "Genre": request.genres,
            "Language": request.language,
            "Platform": request.platform,
        }
        
        # Run the agent
        result = None
        for output in agent.stream(state):
            result = output
        
        # Extract the final state
        if not result:
            raise HTTPException(status_code=500, detail="Failed to generate recommendations")
        
        final_state = list(result.values())[0]
        
        # Get the last message (AI response)
        recommendations = final_state["messages"][-1].content
        
        return RecommendationResponse(
            recommendations=recommendations,
            preferences={
                "mood": request.mood,
                "genres": request.genres,
                "language": request.language,
                "platform": request.platform
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

# Run with: uvicorn main:app --reload
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)