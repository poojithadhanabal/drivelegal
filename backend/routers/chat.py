from fastapi import APIRouter
from pydantic import BaseModel
import os
import json
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

# =========================
# LOAD LEGAL DATABASE
# =========================

BASE_DIR = os.path.dirname(os.path.dirname(__file__))

DATABASES = {
    "Tamil Nadu": "tamilnadu_rules.json",
    "Delhi": "delhi_rules.json",
    "India": "central_laws.json"
}

def load_legal_database(location):

    filename = DATABASES.get(location, "central_laws.json")

    filepath = os.path.join(
        BASE_DIR,
        "data/legal_database",
        filename
    )

    with open(filepath, "r", encoding="utf-8") as f:
        return json.load(f)
# =========================
# REQUEST MODEL
# =========================

class ChatRequest(BaseModel):
    message: str
    location: str = "India"


# =========================
# FIND OFFENCE
# =========================

def find_offence(user_message, legal_data):

    msg = user_message.lower()

    for offence in legal_data:

        for keyword in offence.get("keywords", []):

            if keyword.lower() in msg:
                return offence

    return None


# =========================
# FORMAT RESPONSE
# =========================

def format_response(data):

    if not data:
        return (
            "❌ Sorry, no verified legal information found for this query."
        )

    imprisonment = data.get("imprisonment", "Not specified")

    if isinstance(imprisonment, dict):

        imprisonment_text = (
            f"• First Offence: "
            f"{imprisonment.get('first_offence', 'N/A')}\n"

            f"• Repeat Offence: "
            f"{imprisonment.get('repeat_offence', 'N/A')}"
        )

    else:
        imprisonment_text = imprisonment

    response = f"""
🚦 Offence: {data['offence']}

📘 Section:
{data['section']}

💰 Fine:
• First Offence: {data['fine']['first_offence']}
• Repeat Offence: {data['fine']['repeat_offence']}

⚖️ Imprisonment:
{imprisonment_text}

🚘 Vehicle Type:
{data['vehicle_type']}

📝 Description:
{data['description']}

⚠️ Severity:
{data['severity'].upper()}

✅ Verified Source:
{data['source']['name']}
"""

    return response.strip()


# =========================
# CHAT API
# =========================

@router.post("/chat")
async def chat(req: ChatRequest):

    try:

        legal_data = load_legal_database(req.location)

        offence = find_offence(
            req.message,
            legal_data
        )

        answer = format_response(offence)

        return {
            "answer": answer,
            "location": req.location,
            "status": "ok"
        }

    except Exception as e:

        return {
            "answer": f"Error: {str(e)}",
            "status": "error"
        }