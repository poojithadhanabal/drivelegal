from fastapi import APIRouter
from pydantic import BaseModel
import json
import os

router = APIRouter()

BASE_DIR = os.path.dirname(
    os.path.dirname(__file__)
)

# ================================
# DATABASE SELECTOR
# ================================

def get_database(state):

    state_lower = state.lower()

    if state_lower == "tamil nadu":

        return os.path.join(
            BASE_DIR,
            "data/legal_database/tamilnadu_rules.json"
        )

    elif state_lower == "delhi":

        return os.path.join(
            BASE_DIR,
            "data/legal_database/delhi_rules.json"
        )

    elif state_lower == "karnataka":

        return os.path.join(
            BASE_DIR,
            "data/legal_database/karnataka_rules.json"
        )

    elif state_lower == "maharashtra":

        return os.path.join(
            BASE_DIR,
            "data/legal_database/maharashtra_rules.json"
        )

    elif state_lower in [
        "uk",
        "united kingdom"
    ]:

        return os.path.join(
            BASE_DIR,
            "data/legal_database/uk_rules.json"
        )

    return os.path.join(
        BASE_DIR,
        "data/legal_database/central_laws.json"
    )

# ================================
# REQUEST MODEL
# ================================

class ChallanRequest(BaseModel):

    violation: str

    vehicle_type: str = "Any Vehicle"

    state: str = "Tamil Nadu"

    is_repeat: bool = False

# ================================
# CHALLAN CALCULATOR
# ================================

@router.post("/challan")

async def calculate_challan(
    req: ChallanRequest
):

    try:

        # LOAD DATABASE

        database_path = get_database(
            req.state
        )

        with open(
            database_path,
            "r",
            encoding="utf-8"
        ) as f:

            RULES = json.load(f)

        violation_input = (
            req.violation.lower()
        )

        # SEARCH OFFENCE

        for offence in RULES:

            offence_name = offence.get(
                "offence",
                ""
            ).lower()

            keywords = [

                k.lower()

                for k in offence.get(
                    "keywords",
                    []
                )

            ]

            # MATCH

            if (

                violation_input
                == offence_name

                or

                violation_input
                in keywords

            ):

                fine = offence.get(
                    "fine",
                    {}
                )

                # ======================
                # FINE HANDLING
                # ======================

                if isinstance(fine, dict):

                    if req.is_repeat:

                        fine_amount = fine.get(

                            "repeat_offence",

                            fine.get(
                                "first_offence",
                                "Not specified"
                            )
                        )

                    else:

                        fine_amount = fine.get(
                            "first_offence",
                            "Not specified"
                        )

                else:

                    fine_amount = fine

                # ======================
                # NUMERIC EXTRACTION
                # ======================

                fine_numeric = 0

                if isinstance(
                    fine_amount,
                    str
                ):

                    cleaned = (

                        fine_amount

                        .replace("₹", "")
                        .replace("£", "")
                        .replace(",", "")

                    )

                    # EXTRACT NUMBERS ONLY

                    numeric = ""

                    for char in cleaned:

                        if char.isdigit():

                            numeric += char

                    try:

                        fine_numeric = int(
                            numeric
                        )

                    except:

                        fine_numeric = 0

                elif isinstance(
                    fine_amount,
                    int
                ):

                    fine_numeric = fine_amount

                # ======================
                # COURT FEE
                # ======================

                court_fee = int(
                    fine_numeric * 0.1
                )

                total = (
                    fine_numeric
                    + court_fee
                )

                # ======================
                # RESPONSE
                # ======================

                return {

                    "violation":
                        offence.get(
                            "offence"
                        ),

                    "vehicle_type":
                        offence.get(
                            "vehicleType",
                            req.vehicle_type
                        ),

                    "state":
                        offence.get(
                            "state",
                            req.state
                        ),

                    "base_fine":
                        fine_numeric,

                    "court_fee":
                        court_fee,

                    "total":
                        total,

                    "law_section":
                        offence.get(
                            "section",
                            "Not specified"
                        ),

                    "severity":
                        offence.get(
                            "severity",
                            "Unknown"
                        ),

                    "risk_score":
                        offence.get(
                            "risk_score",
                            "Unknown Risk"
                        ),

                    "source":
                        offence.get(
                            "source",
                            "Legal Database"
                        ),

                    "is_repeat":
                        req.is_repeat,

                    "notes":
                        offence.get(
                            "description",
                            ""
                        ),

                    "status":
                        "ok"
                }

        # ======================
        # NOT FOUND
        # ======================

        return {

            "error":
                (
                    "Violation not found "
                    "in legal database."
                ),

            "offline_fallback":
                True,

            "status":
                "error"
        }

    except Exception as e:

        # ======================
        # OFFLINE / LOW NETWORK
        # ======================

        return {

            "error":
                (
                    "⚠ DriveLegal is "
                    "currently unavailable "
                    "or experiencing "
                    "low-network conditions."
                ),

            "details":
                str(e),

            "offline_mode":
                True,

            "status":
                "fallback"
        }