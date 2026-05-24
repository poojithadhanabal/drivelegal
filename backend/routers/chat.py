from fastapi import APIRouter
from pydantic import BaseModel
from langchain_openai import ChatOpenAI
from ai.knowledge_base import load_knowledge_base
import hashlib

router = APIRouter()

# Load DB only ONCE (important for speed)
db = load_knowledge_base()

# Load model only ONCE (huge speed improvement)
llm = ChatOpenAI(
    model="gpt-4o-mini",
    temperature=0.1
)

# Simple memory cache
_cache = {}

# Unsupported countries
unsupported_regions = [
    "UK",
    "UAE",
    "USA",
    "Canada"
]


class ChatRequest(BaseModel):
    message: str
    location: str = "India"


@router.post("/chat")
async def chat(req: ChatRequest):

    try:

        # Safe handling for unsupported regions
        if any(region.lower() in req.message.lower() for region in unsupported_regions):
            return {
                "answer": "No verified legal data available for this region.",
                "location": req.location,
                "status": "ok"
            }

        # Cache key
        cache_key = hashlib.md5(
            f"{req.message.lower().strip()}-{req.location}".encode()
        ).hexdigest()

        # Return cached answer instantly
        if cache_key in _cache:
            return {
                **_cache[cache_key],
                "cached": True
            }

        # Retrieve only top 1 result for speed
        docs = db.similarity_search(
            req.message,
            k=1
        )

        # Combine context
        context = "\n".join([
            doc.page_content for doc in docs
        ])

        # Optimized short prompt
        prompt = f"""
Answer ONLY using this legal context.

Context:
{context}

Question:
{req.message}

Rules:
- Never invent laws or fines
- Keep answer short
- Mention:
  • section
  • fine amount
  • repeat offence
"""

        # Generate answer
        answer = llm.invoke(prompt)

        response = {
            "answer": answer.strip(),
            "location": req.location,
            "status": "ok"
        }

        # Save response in cache
        _cache[cache_key] = response

        return response

    except Exception as e:
        return {
            "answer": f"Error: {str(e)}",
            "status": "error"
        }