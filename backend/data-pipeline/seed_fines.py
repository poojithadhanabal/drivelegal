from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.orm import declarative_base, sessionmaker
from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(bind=engine)

Base = declarative_base()

class FineMatrix(Base):
    __tablename__ = "fine_matrix"

    id = Column(Integer, primary_key=True, index=True)

    violation = Column(String)
    vehicle = Column(String)
    fine_amount = Column(String)
    section = Column(String)
    state = Column(String)

Base.metadata.create_all(bind=engine)

db = SessionLocal()

fines = [
    {
        "violation": "No Helmet",
        "vehicle": "Two-Wheeler",
        "fine_amount": "1000",
        "section": "194D",
        "state": "Tamil Nadu"
    },
    {
        "violation": "Drunk Driving",
        "vehicle": "Any",
        "fine_amount": "10000",
        "section": "185",
        "state": "India"
    },
    {
        "violation": "No Seatbelt",
        "vehicle": "Car",
        "fine_amount": "1000",
        "section": "194B",
        "state": "Tamil Nadu"
    }
]

for fine in fines:
    row = FineMatrix(
        violation=fine["violation"],
        vehicle=fine["vehicle"],
        fine_amount=fine["fine_amount"],
        section=fine["section"],
        state=fine["state"]
    )

    db.add(row)

db.commit()

print("✅ Fine matrix seeded successfully")