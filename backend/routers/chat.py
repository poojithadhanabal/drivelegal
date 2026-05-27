from fastapi import APIRouter
from pydantic import BaseModel
import os
import json
import hashlib
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

# ================================
# BASE DIRECTORY
# ================================

BASE_DIR = os.path.dirname(os.path.dirname(__file__))

# ================================
# LOAD DATABASES
# ================================

with open(
    os.path.join(BASE_DIR, "data/legal_database/central_laws.json"),
    "r",
    encoding="utf-8"
) as f:
    CENTRAL_RULES = json.load(f)

with open(
    os.path.join(BASE_DIR, "data/legal_database/tamilnadu_rules.json"),
    "r",
    encoding="utf-8"
) as f:
    TN_RULES = json.load(f)

# ================================
# CACHE
# ================================

_cache = {}

# ================================
# REQUEST MODEL
# ================================

class ChatRequest(BaseModel):
    message: str
    location: str = "Tamil Nadu"

# ================================
# GET DATABASE
# ================================

def get_database(location):

        location_lower = location.lower()

        if location_lower == "tamil nadu":

            database_path = os.path.join(
                BASE_DIR,
                "data/legal_database/tamilnadu_rules.json"
            )

        elif location_lower == "delhi":

            database_path = os.path.join(
                BASE_DIR,
                "data/legal_database/delhi_rules.json"
            )

        elif location_lower == "karnataka":

            database_path = os.path.join(
                BASE_DIR,
                "data/legal_database/karnataka_rules.json"
            )

        elif location_lower == "maharashtra":

            database_path = os.path.join(
                BASE_DIR,
                "data/legal_database/maharashtra_rules.json"
            )

        else:

            database_path = os.path.join(
                BASE_DIR,
                "data/legal_database/central_laws.json"
            )

# ================================
# SEARCH ENGINE
# ================================

def find_offence(user_message, location="Tamil Nadu"):

    msg = user_message.lower()

    # LOAD DATABASE
    if location.lower() == "tamil nadu":

        database_path = os.path.join(
            BASE_DIR,
            "data/legal_database/tamilnadu_rules.json"
        )

    else:

        database_path = os.path.join(
            BASE_DIR,
            "data/legal_database/central_laws.json"
        )

    with open(database_path, "r", encoding="utf-8") as f:

        legal_data = json.load(f)

    best_match = None
    best_score = 0

    for offence in legal_data:

        score = 0

        offence_name = offence.get(
            "offence",
            ""
        ).lower()

        # DIRECT MATCH
        if offence_name in msg:
            score += 10

        # KEYWORD MATCHES
        for keyword in offence.get("keywords", []):

            keyword = keyword.lower()

            if keyword in msg:
                score += 5

        # DESCRIPTION WORD MATCHES
        description = offence.get(
            "description",
            ""
        ).lower()

        desc_words = description.split()

        for word in desc_words:

            if len(word) > 4 and word in msg:
                score += 1

        # BEST MATCH
        if score > best_score:

            best_score = score
            best_match = offence

    return best_match

# ================================
# SAFETY TIPS
# ================================

SAFETY_TIPS = {

    "Riding Without Helmet":
        "Always wear a BIS-certified helmet while riding.",

    "Drunk Driving":
        "Never drink and drive. Use a cab or designated driver.",

    "Driving Without Insurance":
        "Keep valid insurance documents updated at all times.",

    "Triple Riding":
        "Two-wheelers are designed for only two persons.",

    "Using Mobile While Driving":
        "Avoid distractions while driving for safer roads.",

    "Dangerous Driving":
        "Drive responsibly and follow traffic speed limits."
}

# ================================
# LEGAL ADVICE
# ================================

LEGAL_ADVICE = {

    "Riding Without Helmet":
        "Repeated violations may attract stricter penalties.",

    "Drunk Driving":
        "Serious drunk-driving offences may lead to imprisonment.",

    "Driving Without Insurance":
        "Driving uninsured vehicles creates legal and financial risks.",

    "Triple Riding":
        "Traffic police may seize vehicles for repeated violations.",

    "Using Mobile While Driving":
        "Mobile usage while driving increases accident risk.",

    "Dangerous Driving":
        "Dangerous driving can lead to licence suspension."
}
risk_scores = {

    "Riding Without Helmet":
        "Medium Risk",

    "Triple Riding":
        "Medium Risk",

    "Driving Without Insurance":
        "High Risk",

    "Drunk Driving":
        "Critical Risk",

    "Using Mobile While Driving":
        "High Risk",

    "Dangerous / Rash Driving":
        "Critical Risk"
}

# ================================
# FORMAT RESPONSE
# ================================

def format_response(data):

    if not data:

        return {

            "type": "text",

            "summary":
                (
                    "❌ Sorry, I could not find verified traffic law "
                    "information for this query.\n\n"

                    "Try asking about:\n"
                    "• Helmet violation\n"
                    "• Drunk driving\n"
                    "• Triple riding\n"
                    "• No insurance\n"
                    "• Mobile while driving\n"
                    "• Seat belt violation"
                ),

            "data": None
        }

    offence_name = data.get("offence")

    response = {
        "offence": offence_name,
        "section": data.get("section"),
        "fine": data.get("fine"),
        "severity": data.get("severity"),
        "vehicleType": data.get("vehicleType"),
        "state": data.get("state"),
        "source": data.get("source"),
        "description": data.get("description"),
        "safety_tip":
            SAFETY_TIPS.get(
                offence_name,
                "Follow traffic rules for safer roads."
            ),
        "legal_advice":
            LEGAL_ADVICE.get(
                offence_name,
                "Always follow Motor Vehicle Act regulations."
            ),
        "risk_score": 
            risk_scores.get(
                offence_name,
                "Unknown Risk"
            )
    }

    return {
        "answer": (
            f"🚦 {response['offence']}\n\n"
            f"📘 Section: {response['section']}\n"
            f"💰 Fine: ₹{response['fine']}\n"
            f"⚠ Severity: {response['severity']}\n"
            f"🚗 Vehicle Type: {response['vehicleType']}\n"
            f"📍 State: {response['state']}\n\n"
            f"📝 Description:\n"
            f"{response['description']}\n\n"
            f"🛡 Safety Tip:\n"
            f"{response['safety_tip']}\n\n"
            f"⚖ Legal Advice:\n"
            f"{response['legal_advice']}"
        ),

        "data": response
    }

# ================================
# CHAT ENDPOINT
# ================================

@router.post("/chat")
async def chat(req: ChatRequest):

    try:

        cache_key = hashlib.md5(
            f"{req.message.lower()}-{req.location}".encode()
        ).hexdigest()

        # Return cached response
        if cache_key in _cache:
            return _cache[cache_key]

        # Find offence
        offence = find_offence(
            req.message,
            req.location
        )

        # Format response
        formatted = format_response(offence)

        response = {

            "answer":
                formatted.get(
                    "summary",
                    "No response available."
                ),

            "data":
                formatted.get(
                    "data",
                    None
                ),

            "location": req.location,

            "status": "ok"
        }

        # Save cache
        _cache[cache_key] = response

        return response

    except Exception as e:

        return {
            "answer": f"❌ Backend Error: {str(e)}",
            "status": "error"
        }