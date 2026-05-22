from fastapi import APIRouter
from pydantic import BaseModel
from langchain_ollama import OllamaLLM
from ai.knowledge_base import load_knowledge_base

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    location: str = "India"

@router.post("/chat")
async def chat(req: ChatRequest):
    try:
        db = load_knowledge_base()

        docs = db.similarity_search(req.message, k=3)

        context = "\n".join([doc.page_content for doc in docs])

        prompt = f"""
You are DriveLegal, an AI assistant for traffic laws worldwide.

Always include:
- exact law section
- fine amount
- repeat offence details

If unsure, say verify with official transport authority.

Context:
{context}

Question:
{req.message}
"""

        llm = OllamaLLM(
            model="llama3"
        )

        response = llm.invoke(prompt)

        return {
            "answer": response,
            "location": req.location,
            "status": "ok"
        }

    except Exception as e:
        return {
            "answer": f"Error: {str(e)}",
            "status": "error"
        }