from fastapi import APIRouter
from pydantic import BaseModel
from dotenv import load_dotenv

import os
import json
import hashlib
import requests

load_dotenv()

router = APIRouter()

# =========================================
# BASE DIRECTORY
# =========================================

BASE_DIR = os.path.dirname(
    os.path.dirname(__file__)
)

# =========================================
# AI CONFIG
# =========================================

GROQ_API_KEY = os.getenv(
    "GROQ_API_KEY"
)

GROQ_URL = (
    "https://api.groq.com/openai/v1/chat/completions"
)

MODEL_NAME = "llama-3.1-8b-instant"

# =========================================
# CACHE
# =========================================

_cache = {}

# =========================================
# REQUEST MODEL
# =========================================

class ChatRequest(BaseModel):

    message: str
    location: str = "Tamil Nadu"

# =========================================
# LOAD DATABASE
# =========================================

def load_database(location):

    location = location.lower()

    if location == "tamil nadu":

        filename = "tamilnadu_rules.json"

    elif location == "delhi":

        filename = "delhi_rules.json"

    elif location == "karnataka":

        filename = "karnataka_rules.json"

    elif location == "maharashtra":

        filename = "maharashtra_rules.json"

    elif location in [

        "uk",
        "united kingdom"

    ]:

        filename = "uk_rules.json"

    else:

        filename = "central_laws.json"

    path = os.path.join(

        BASE_DIR,

        "data/legal_database",

        filename
    )

    with open(

        path,

        "r",

        encoding="utf-8"

    ) as f:

        return json.load(f)

# =========================================
# DETECT LOCATION FROM MESSAGE
# =========================================

def detect_location_from_message(message):

    message = message.lower()

    locations = [

        "tamil nadu",
        "delhi",
        "karnataka",
        "maharashtra",
        "uk",
        "india"
    ]

    for loc in locations:

        if loc in message:

            return loc.title()

    return None

# =========================================
# KEYWORD MATCH ENGINE
# =========================================

def keyword_fallback(

    user_message,

    legal_data

):

    msg = user_message.lower()

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

        # KEYWORD MATCH

        for keyword in offence.get(

            "keywords",

            []

        ):

            keyword = keyword.lower()

            if keyword in msg:

                score += 5

        # DESCRIPTION MATCH

        description = offence.get(

            "description",

            ""

        ).lower()

        for word in description.split():

            if len(word) > 4 and word in msg:

                score += 1

        # BEST MATCH

        if score > best_score:

            best_score = score
            best_match = offence

    return best_match

# =========================================
# BUILD AI CONTEXT
# =========================================

def build_legal_context(

    match,

    location

):

    if not match:

        return None

    fine = match.get("fine")

    if isinstance(fine, dict):

        fine_text = (

            f"First offence: "

            f"{fine.get('first_offence')}, "

            f"Repeat offence: "

            f"{fine.get('repeat_offence')}"
        )

    else:

        fine_text = str(fine)

    return f"""
Traffic Law Information

Location:
{location}

Offence:
{match.get('offence')}

Section:
{match.get('section')}

Fine:
{fine_text}

Severity:
{match.get('severity')}

Risk Score:
{match.get('risk_score')}

Vehicle Type:
{match.get('vehicleType')}

Description:
{match.get('description')}

Source:
{match.get('source')}
"""

# =========================================
# AI RESPONSE
# =========================================

def ask_ai(

    user_question,

    legal_context

):

    if not GROQ_API_KEY:

        return (
            "DriveLegal AI is currently unavailable."
        )

    headers = {

        "Authorization":
            f"Bearer {GROQ_API_KEY}",

        "Content-Type":
            "application/json"
    }

    prompt = f"""
You are DriveLegal AI.

Explain naturally using ONLY
the provided legal database.

Do NOT invent laws.

Keep response short,
professional,
and user-friendly.

LEGAL DATA:
{legal_context}

USER QUESTION:
{user_question}
"""

    payload = {

        "model": MODEL_NAME,

        "messages": [

            {

                "role": "system",

                "content":
                    "You are an AI traffic law assistant."

            },

            {

                "role": "user",

                "content": prompt
            }
        ],

        "temperature": 0.3
    }

    try:

        response = requests.post(

            GROQ_URL,

            headers=headers,

            json=payload,

            timeout=30
        )

        response.raise_for_status()

        data = response.json()

        ai_text = (

            data.get(
                "choices",
                [{}]
            )[0]

            .get(
                "message",
                {}
            )

            .get(
                "content"
            )
        )

        if not ai_text:

            return (
                "AI explanation unavailable."
            )

        return ai_text

    except Exception as e:

        print("AI ERROR:", str(e))

        return (
            "DriveLegal AI is temporarily unavailable."
        )

# =========================================
# CHAT ENDPOINT
# =========================================

@router.post("/chat")

async def chat(req: ChatRequest):

    try:

        # =========================================
        # DETECT LOCATION
        # =========================================

        chat_location = detect_location_from_message(
            req.message
        )

        final_location = (

            chat_location

            if chat_location

            else req.location
        )

        # =========================================
        # CACHE KEY
        # =========================================

        cache_key = hashlib.md5(

            f"{req.message.lower()}-{final_location}"
            .encode()

        ).hexdigest()

        # RETURN CACHE

        if cache_key in _cache:

            return _cache[cache_key]

        # =========================================
        # LOAD DATABASE
        # =========================================

        legal_data = load_database(
            final_location
        )

        # =========================================
        # FIND MATCH
        # =========================================

        match = keyword_fallback(

            req.message,

            legal_data
        )

        fallback_used = False

        # =========================================
        # FALLBACK TO TAMIL NADU
        # =========================================

        if not match:

            try:

                tn_data = load_database(
                    "Tamil Nadu"
                )

                match = keyword_fallback(

                    req.message,

                    tn_data
                )

                if match:

                    fallback_used = True

            except:

                pass

        # =========================================
        # NO MATCH
        # =========================================

        if not match:

            return {

                "answer":

                    (
                        "I couldn't find that "
                        "violation in my database.\n\n"

                        "Try asking about:\n\n"

                        "• Helmet violation\n"
                        "• Drunk driving\n"
                        "• Triple riding\n"
                        "• No insurance\n"
                        "• Mobile while driving\n"
                        "• Seat belt violation"
                    ),

                "data": None,

                "status": "ok"
            }

        # =========================================
        # BUILD CONTEXT
        # =========================================

        legal_context = build_legal_context(

            match,

            final_location
        )

        # =========================================
        # AI RESPONSE
        # =========================================

        ai_response = ask_ai(

            req.message,

            legal_context
        )

        # =========================================
        # FALLBACK MESSAGE
        # =========================================

        if fallback_used:

            ai_response = (

                f"⚠️ {final_location}-specific "
                f"data is currently unavailable.\n\n"

                f"Showing closest available "
                f"Indian legal reference from "
                f"Tamil Nadu database.\n\n"

                + ai_response
            )

        # =========================================
        # FINE
        # =========================================

        fine = match.get("fine")

        if isinstance(fine, dict):

            fine_value = fine.get(
                "first_offence"
            )

        else:

            fine_value = fine

        # =========================================
        # STRUCTURED DATA
        # =========================================

        structured_data = {

            "offence":
                match.get("offence"),

            "section":
                match.get("section"),

            "fine":
                fine_value,

            "severity":
                match.get("severity"),

            "risk_score":
                match.get(
                    "risk_score",
                    "Medium Risk"
                ),

            "vehicleType":
                match.get("vehicleType"),

            "state":
                final_location,

            "source":
                match.get("source"),

            "description":
                match.get("description"),
        }

        # =========================================
        # FINAL RESPONSE
        # =========================================

        response = {

            "answer":
                ai_response,

            "data":
                structured_data,

            "status":
                "ok",

            "location":
                final_location
        }

        # SAVE CACHE

        _cache[cache_key] = response

        return response

    except Exception as e:

        print("CHAT ERROR:", str(e))

        return {

            "answer":
                f"Backend Error: {str(e)}",

            "status":
                "error"
        }