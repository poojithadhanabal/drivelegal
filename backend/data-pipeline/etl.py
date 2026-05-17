from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.orm import declarative_base, sessionmaker
from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(bind=engine)

Base = declarative_base()

class LegalRule(Base):
    __tablename__ = "legal_rules"

    id = Column(Integer, primary_key=True, index=True)

    violation = Column(String)
    section = Column(String)
    description = Column(String)
    state = Column(String)

Base.metadata.create_all(bind=engine)

db = SessionLocal()

file_path = "data/legal_data.txt"

with open(file_path, "r", encoding="utf-8") as file:
    content = file.read()

entries = content.strip().split("\n\n")

for entry in entries:
    lines = entry.split("\n")

    data = {}

    for line in lines:
        if ":" in line:
            key, value = line.split(":", 1)
            data[key.strip()] = value.strip()

    rule = LegalRule(
        violation=data.get("Violation"),
        section=data.get("Section") or data.get("Rule"),
        description=data.get("Description"),
        state=data.get("State") or data.get("Source")
    )

    db.add(rule)

db.commit()

print("✅ ETL completed successfully")