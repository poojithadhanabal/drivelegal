from fastapi import APIRouter
from pydantic import BaseModel
from langchain_groq import ChatGroq
import os
import hashlib
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

# Load model once
llm = ChatGroq(
    groq_api_key=os.getenv("GROQ_API_KEY"),
    model_name="llama3-8b-8192"
)

# Cache
_cache = {}

# Load legal data once
with open("data/legal_data.txt", "r", encoding="utf-8") as f:
    LEGAL_DATA = f.read()

# Unsupported regions
unsupported_regions = [
    "UK",
    "UAE",
    "USA",
    "Canada"
]


class ChatRequest(BaseModel):
    message: str
    location: str = "India"


def get_relevant_context(message: str):

    msg = message.lower()

    if "helmet" in msg:
        return extract_section("NO_HELMET")

    elif "drunk" in msg or "alcohol" in msg:
        return extract_section("DRUNK_DRIVING")

    elif "mobile" in msg or "phone" in msg:
        return extract_section("MOBILE_PHONE")

    elif "insurance" in msg:
        return extract_section("NO_INSURANCE")

    elif "licence" in msg or "license" in msg:
        return extract_section("NO_LICENSE")

    elif "red light" in msg or "signal" in msg:
        return extract_section("RED_LIGHT")

    elif "seatbelt" in msg or "seat belt" in msg:
        return extract_section("SEATBELT")

    return None


def extract_section(tag):

    start = LEGAL_DATA.find(f"[{tag}]")

    if start == -1:
        return "❌ Legal section not found."

    end = LEGAL_DATA.find("[", start + 1)

    if end == -1:
        section = LEGAL_DATA[start:]
    else:
        section = LEGAL_DATA[start:end]

    lines = section.strip().split("\n")

    title = lines[0] \
        .replace("[", "") \
        .replace("]", "") \
        .replace("_", " ") \
        .title()

    data = {}

    for line in lines[1:]:

        if ":" in line:

            key, value = line.split(":", 1)

            data[key.strip()] = value.strip()

    return f"""
🚦 {title}

📘 Section: {data.get("Section", "N/A")}

💰 Fine: {data.get("Fine", "N/A")}

🔁 Repeat Offence:
{data.get("Repeat", "N/A")}

📝 Description:
{data.get("Description", "N/A")}
"""


@router.post("/chat")
async def chat(req: ChatRequest):

    try:

        # Unsupported regions
        if any(region.lower() in req.message.lower() for region in unsupported_regions):

            return {
                "answer": "⚠️ No verified legal data available for this region.",
                "location": req.location,
                "status": "ok"
            }

        # Cache key
        cache_key = hashlib.md5(
            f"{req.message.lower().strip()}-{req.location}".encode()
        ).hexdigest()

        # Return cached response
        if cache_key in _cache:

            return {
                **_cache[cache_key],
                "cached": True
            }

        # Get legal context
        context = get_relevant_context(req.message)

        # If found locally → return instantly
        if context:

            final_response = {
                "answer": context,
                "location": req.location,
                "status": "ok"
            }

            _cache[cache_key] = final_response

            return final_response

        # Fallback AI response
        prompt = f"""
You are DriveLegal AI.

Answer briefly and clearly about Indian traffic laws.

Question:
{req.message}
"""

        ai_response = llm.invoke(prompt)

        final_response = {
            "answer": ai_response.content,
            "location": req.location,
            "status": "ok"
        }

        # Cache response
        _cache[cache_key] = final_response

        return final_response

    except Exception as e:

        return {
            "answer": f"⚠️ Error: {str(e)}",
            "status": "error"
        }