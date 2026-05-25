from fastapi import APIRouter
from pydantic import BaseModel
import json
import hashlib

router = APIRouter()

# Cache
_cache = {}

# Load JSON database
with open("data/legal_database/central_laws.json", "r", encoding="utf-8") as f:
    LEGAL_DATA = json.load(f)

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


def find_matching_law(message: str):

    msg = message.lower()

    for law in LEGAL_DATA:

        for keyword in law["keywords"]:

            if keyword.lower() in msg:
                return law

    return None


def format_response(law):

    return f"""
🚦 {law['offence']}

📘 Section: {law['section']}

💰 Fine:
• First Offence: {law['fine']['first_offence']}
• Repeat Offence: {law['fine']['repeat_offence']}

📝 Description:
{law['description']}

⚖️ Act:
{law['act']}

✅ Verified Source:
{law['source']['name']} ({law['source']['year']})
"""


@router.post("/chat")
async def chat(req: ChatRequest):

    try:

        # Unsupported regions
        if any(region.lower() in req.message.lower() for region in unsupported_regions):

            return {
                "answer": "⚠️ No verified legal data available for this region yet.",
                "location": req.location,
                "status": "ok"
            }

        # Cache key
        cache_key = hashlib.md5(
            f"{req.message.lower().strip()}-{req.location}".encode()
        ).hexdigest()

        # Cached response
        if cache_key in _cache:

            return {
                **_cache[cache_key],
                "cached": True
            }

        # Find law
        matched_law = find_matching_law(req.message)

        if matched_law:
            answer = format_response(matched_law)

        else:
            answer = (
                "❌ Sorry, no verified legal information found for this query."
            )

        final_response = {
            "answer": answer,
            "location": req.location,
            "status": "ok"
        }

        # Save cache
        _cache[cache_key] = final_response

        return final_response

    except Exception as e:

        return {
            "answer": f"Error: {str(e)}",
            "status": "error"
        }