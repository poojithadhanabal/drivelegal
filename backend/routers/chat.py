from fastapi import APIRouter
from pydantic import BaseModel
from langchain_community.chat_models import ChatOllama
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate
from ai.knowledge_base import load_knowledge_base

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    location: str = "India"

PROMPT = """You are DriveLegal, an AI assistant for traffic laws worldwide.
Always include: exact law section number, fine amount in local currency,
difference between first and repeat offence. Be clear and concise.
If unsure, say: please verify with official state transport website.

Legal context:
{context}

Question: {question}
Answer:"""

prompt = PromptTemplate(
    template=PROMPT, input_variables=["context", "question"]
)

@router.post("/chat")
async def chat(req: ChatRequest):
    try:
        db  = load_knowledge_base()
        llm = ChatOllama(
            model="llama3",
            temperature=0.1)
        qa  = RetrievalQA.from_chain_type(
            llm=llm,
            chain_type="stuff",
            retriever=db.as_retriever(search_kwargs={"k": 3}),
            chain_type_kwargs={"prompt": prompt}
        )
        result = qa.invoke({"query": req.message})
        return {"answer": result["result"], "location": req.location, "status": "ok"}
    except Exception as e:
        return {"answer": f"Error: {str(e)}", "status": "error"}