from fastapi import APIRouter
from pydantic import BaseModel
import json
import os

router = APIRouter()

BASE_DIR = os.path.dirname(os.path.dirname(__file__))

# LOAD TAMIL NADU RULES
with open(
    os.path.join(
        BASE_DIR,
        "data/legal_database/tamilnadu_rules.json"
    ),
    "r",
    encoding="utf-8"
) as f:

    TN_RULES = json.load(f)


class ChallanRequest(BaseModel):

    violation: str
    vehicle_type: str = "Any Vehicle"
    state: str = "Tamil Nadu"
    is_repeat: bool = False


@router.post("/challan")
async def calculate_challan(req: ChallanRequest):

    try:

        violation_input = req.violation.lower()

        for offence in TN_RULES:

            offence_name = offence.get(
                "offence",
                ""
            ).lower()

            keywords = [
                k.lower()
                for k in offence.get("keywords", [])
            ]

            # MATCH OFFENCE
            if (
                violation_input == offence_name
                or violation_input in keywords
            ):

                fine = offence.get("fine", {})

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

                # REMOVE ₹ SYMBOL
                if isinstance(fine_amount, str):

                    fine_numeric = (
                        fine_amount
                        .replace("₹", "")
                        .replace(",", "")
                    )

                    try:
                        fine_numeric = int(fine_numeric)
                    except:
                        fine_numeric = 0

                else:

                    fine_numeric = fine_amount

                court_fee = int(fine_numeric * 0.1)

                total = fine_numeric + court_fee

                return {

                    "violation":
                        offence.get("offence"),

                    "vehicle_type":
                        offence.get(
                            "vehicle_type",
                            req.vehicle_type
                        ),

                    "state":
                        offence.get(
                            "state",
                            "Tamil Nadu"
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

        return {

            "error":
                "Violation not found in Tamil Nadu rules database.",

            "status":
                "error"
        }

    except Exception as e:

        return {
            "error": str(e),
            "status": "error"
        }