from fastapi import APIRouter
from pydantic import BaseModel
import psycopg2
import os

router = APIRouter()

class ChallanRequest(BaseModel):
    violation: str
    vehicle_type: str
    state: str = "National"
    is_repeat: bool = False

def get_db():
    return psycopg2.connect(
        host="localhost", database="drivelegal_db",
        user="postgres", password="database123"
    )

@router.post("/challan")
async def calculate_challan(req: ChallanRequest):
    try:
        conn = get_db()
        cur  = conn.cursor()

        # Try state-specific fine first, fall back to National
        cur.execute("""
            SELECT f.base_fine, f.repeat_fine, f.law_section, f.notes,
                   j.state, v.name, vt.name
            FROM fine_schedules f
            JOIN jurisdictions j  ON f.jurisdiction_id = j.id
            JOIN violations    v  ON f.violation_id    = v.id
            JOIN vehicle_types vt ON f.vehicle_type_id = vt.id
            WHERE (j.state = %s OR j.state = 'National')
              AND v.name  ILIKE %s
              AND (vt.name ILIKE %s OR vt.name = 'Any Vehicle')
            ORDER BY CASE WHEN j.state = %s THEN 0 ELSE 1 END
            LIMIT 1
        """, (req.state, req.violation, req.vehicle_type, req.state))

        row = cur.fetchone()
        cur.close()
        conn.close()

        if not row:
            return {"error": "Fine data not found. Try selecting 'Any Vehicle' or 'National'."}

        base, repeat, section, notes, state, violation, vehicle = row
        fine  = repeat if req.is_repeat else base
        court = round(fine * 0.1)   # 10% court fee estimate
        total = fine + court

        return {
            "violation":    violation,
            "vehicle_type": vehicle,
            "state":        state,
            "base_fine":    fine,
            "court_fee":    court,
            "total":        total,
            "law_section":  section,
            "is_repeat":    req.is_repeat,
            "notes":        notes,
            "status":       "ok"
        }
    except Exception as e:
        return {"error": str(e), "status": "error"}