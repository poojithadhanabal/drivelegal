from fastapi import APIRouter
from pydantic import BaseModel
from langchain_ollama import OllamaLLM
from ai.knowledge_base import load_knowledge_base

router = APIRouter()


class ChatRequest(BaseModel):
    message: str
    location: str = "India"


# Load DB once
db = load_knowledge_base()

# Retriever
retriever = db.as_retriever(
    search_kwargs={"k": 2}
)

# Better model
llm = OllamaLLM(
    model="phi3",
    temperature=0,
    num_predict=120
)


@router.post("/chat")
async def chat(req: ChatRequest):
    try:

        docs = retriever.invoke(req.message)

        context = "\n".join([
            doc.page_content for doc in docs
        ])

        prompt = f"""
You are DriveLegal, an AI traffic law assistant.

Give SHORT and DIRECT answers.

STRICT RULES:
- Do NOT explain the question.
- Do NOT repeat context.
- Keep answer under 4 lines.
- ALWAYS mention:
  • exact law section
  • fine amount
  • repeat offence details

Location: {req.location}

Legal Context:
{context}

User Question:
{req.message}
"""

        response = llm.invoke(prompt)

        return {
            "answer": response.strip(),
            "location": req.location,
            "status": "ok"
        }

    except Exception as e:
        return {
            "answer": f"Error: {str(e)}",
            "status": "error"
        }