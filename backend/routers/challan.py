from fastapi import APIRouter
from pydantic import BaseModel
import json
import os
import re
import httpx
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")

BASE_DIR = os.path.dirname(os.path.dirname(__file__))

# ================================
# DATABASE SELECTOR
# ================================

def get_database(state: str) -> str:
    state_lower = state.lower()
    mapping = {
        "tamil nadu":     "tamilnadu_rules.json",
        "delhi":          "delhi_rules.json",
        "karnataka":      "karnataka_rules.json",
        "maharashtra":    "maharashtra_rules.json",
        "uk":             "uk_rules.json",
        "united kingdom": "uk_rules.json",
    }
    filename = mapping.get(state_lower, "central_laws.json")
    return os.path.join(BASE_DIR, "data/legal_database", filename)


def load_rules(state: str) -> list:
    path = get_database(state)
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        try:
            fallback = os.path.join(BASE_DIR, "data/legal_database/central_laws.json")
            with open(fallback, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return []

# ================================
# REQUEST MODEL
# ================================

class ChallanRequest(BaseModel):
    violation: str
    vehicle_type: str = "Any Vehicle"
    state: str = "Tamil Nadu"
    is_repeat: bool = False
    explain: bool = True   # whether to request AI explanation

# ================================
# FINE EXTRACTION HELPERS
# ================================

def extract_numeric_fine(fine_val) -> int:
    """Extract the first numeric value from a fine string/int."""
    if isinstance(fine_val, int):
        return fine_val
    if isinstance(fine_val, str):
        cleaned = fine_val.replace("₹", "").replace("£", "").replace(",", "")
        nums = re.findall(r"\d+", cleaned)
        return int(nums[0]) if nums else 0
    return 0


def resolve_fine(offence: dict, is_repeat: bool):
    """Return (fine_display_str, fine_numeric, fine_note)."""
    fine = offence.get("fine", {})

    if isinstance(fine, dict):
        if is_repeat:
            raw = fine.get("repeat_offence", fine.get("first_offence", "Not specified"))
            note = "Repeat offence fine applied"
        else:
            raw = fine.get("first_offence", "Not specified")
            note = "First offence fine applied"
    else:
        raw = fine
        note = ""

    numeric = extract_numeric_fine(raw)

    # AUTO MULTIPLIER IF
    # REPEAT VALUE NOT PROVIDED

    if (
        is_repeat
        and isinstance(fine, dict)
        and "repeat_offence" not in fine
    ):

        numeric = int(numeric * 2)

        raw = str(numeric)

        note = (
            "Repeat offence multiplier applied"
        )
    return str(raw), numeric, note

# ================================
# RISK CLASSIFICATION
# ================================

RISK_MAP = {
    "low":      ("Low Risk",      "#4CAF50"),
    "medium":   ("Medium Risk",   "#FF9800"),
    "high":     ("High Risk",     "#F44336"),
    "critical": ("Critical Risk", "#9C27B0"),
}

def classify_risk(severity: str, fine_numeric: int) -> str:
    s = severity.lower()
    if s in RISK_MAP:
        return RISK_MAP[s][0]
    if fine_numeric >= 10000:
        return "Critical Risk"
    if fine_numeric >= 5000:
        return "High Risk"
    if fine_numeric >= 1000:
        return "Medium Risk"
    return "Low Risk"

# ================================
# FUZZY MATCH (same logic as chat)
# ================================

def find_offence(violation_input: str, rules: list) -> dict | None:
    msg = violation_input.lower().strip()
    best = None
    best_score = 0
    for rule in rules:
        score = 0
        name = rule.get("offence", "").lower()
        keywords = [k.lower() for k in rule.get("keywords", [])]

        if msg == name:
            score += 20
        elif name in msg or msg in name:
            score += 10

        for kw in keywords:
            if kw == msg:
                score += 15
            elif kw in msg or msg in kw:
                score += 5

        for word in name.split():
            if len(word) > 3 and word in msg:
                score += 2

        if score > best_score:
            best_score = score
            best = rule

    return best if best_score > 0 else None

# ================================
# AI EXPLANATION (optional)
# ================================

async def get_ai_explanation(
    offence_name: str,
    section: str,
    fine_display: str,
    is_repeat: bool,
    state: str,
    vehicle_type: str,
) -> str | None:
    if not ANTHROPIC_API_KEY:
        return None
    try:
        prompt = (
            f"A driver in {state} has been issued a challan for: {offence_name}.\n"
            f"Vehicle type: {vehicle_type}\n"
            f"Law section: {section}\n"
            f"Fine: {fine_display}\n"
            f"Repeat offence: {'Yes' if is_repeat else 'No'}\n\n"
            "In 3-4 sentences: explain why this is a violation, what the legal consequences are, "
            "and one practical tip to avoid it in future. Keep it simple for a citizen to understand."
        )
        async with httpx.AsyncClient(timeout=20.0) as client:
            response = await client.post(
                "https://api.anthropic.com/v1/messages",
                headers={
                    "x-api-key": ANTHROPIC_API_KEY,
                    "anthropic-version": "2023-06-01",
                    "content-type": "application/json",
                },
                json={
                    "model": "claude-sonnet-4-20250514",
                    "max_tokens": 300,
                    "system": (
                        "You are a friendly traffic law expert. "
                        "Explain traffic violations clearly for ordinary citizens. "
                        "Be concise, accurate, and constructive."
                    ),
                    "messages": [{"role": "user", "content": prompt}],
                },
            )
            response.raise_for_status()
            return response.json()["content"][0]["text"]
    except Exception:
        return None

# ================================
# CHALLAN ENDPOINT
# ================================

@router.post("/challan")
async def calculate_challan(req: ChallanRequest):

    try:
        rules = load_rules(req.state)

        offence = find_offence(req.violation, rules)

        if not offence:
            return {
                "error": (
                    f"Violation '{req.violation}' not found in the {req.state} legal database. "
                    "Try terms like: 'helmet', 'drunk driving', 'no insurance', 'mobile while driving'."
                ),
                "offline_fallback": False,
                "status": "not_found",
            }

        # Fine resolution
        fine_display, fine_numeric, fine_note = resolve_fine(offence, req.is_repeat)

        # Fees
        court_fee = int(fine_numeric * 0.10)
        processing_fee = int(fine_numeric * 0.02)
        total = fine_numeric + court_fee + processing_fee

        # Risk
        severity = offence.get("severity", "medium")
        risk_score = classify_risk(severity, fine_numeric)

        # AI explanation (non-blocking — returns None if unavailable)
        ai_explanation = None
        if req.explain:
            ai_explanation = await get_ai_explanation(
                offence_name=offence.get("offence", req.violation),
                section=offence.get("section", "N/A"),
                fine_display=fine_display,
                is_repeat=req.is_repeat,
                state=req.state,
                vehicle_type=req.vehicle_type,
            )

        return {
            "violation":        offence.get("offence"),
            "vehicle_type":     offence.get("vehicleType", req.vehicle_type),
            "state":            req.state,
            "section":          offence.get("section", "Not specified"),
            "severity":         severity,
            "risk_score":       risk_score,
            "is_repeat":        req.is_repeat,
            "fine_note":        fine_note,
            "base_fine":        fine_numeric,
            "court_fee":        court_fee,
            "processing_fee":   processing_fee,
            "total":            total,
            "fine_display":     fine_display,
            "source":           offence.get("source", "Motor Vehicles Act"),
            "description":      offence.get("description", ""),
            "ai_explanation":   ai_explanation,   # None if AI unavailable
            "ai_powered":       ai_explanation is not None,
            "status":           "ok",
        }

    except Exception as e:
        return {
            "error": (
                "⚠ DriveLegal Challan Calculator is temporarily unavailable. "
                "Please try again shortly."
            ),
            "details":      str(e),
            "offline_mode": True,
            "status":       "fallback",
        }