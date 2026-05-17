import os
from dotenv import load_dotenv
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_text_splitters import RecursiveCharacterTextSplitter
load_dotenv()

LEGAL_TEXTS = [
    """Section 183 Motor Vehicles Act - Overspeeding:
    Fine Rs.1000 first offence, Rs.2000 repeat. Applies all India states.""",

    """Section 185 Motor Vehicles Act - Drunk Driving:
    Fine Rs.10000 first, Rs.15000 repeat. Imprisonment up to 6 months.""",

    """Section 194D Motor Vehicles Act - No Helmet:
    Fine Rs.1000. Licence disqualification 3 months. Two-wheelers only.""",

    """Section 194B Motor Vehicles Act - No Seatbelt:
    Fine Rs.1000. All four-wheelers in India.""",

    """Section 184 Motor Vehicles Act - Mobile Phone While Driving:
    Fine Rs.5000 first offence, Rs.10000 repeat. Any handheld device.""",

    """Section 194B Motor Vehicles Act - Jumping Red Light:
    Fine Rs.5000 first, Rs.10000 repeat. Any traffic signal violation.""",

    """Section 181 Motor Vehicles Act - No Licence:
    Fine Rs.5000. Includes expired licence.""",

    """Section 196 Motor Vehicles Act - No Insurance:
    Fine Rs.2000 first, Rs.4000 repeat. Third-party insurance mandatory.""",

    """Tamil Nadu Traffic Fines 2024:
    Overspeeding car: Rs.2000. Two-wheeler: Rs.1000.
    No helmet: Rs.1000 plus 3 month ban.
    Mobile phone: Rs.5000. Drunk driving: Rs.10000.""",

    """Delhi Traffic Police Fines 2024:
    Overspeeding car Rs.2000. No helmet Rs.1000.
    Drunk driving Rs.10000. Red light jump Rs.5000.
    Wrong side driving Rs.5000. Mobile phone Rs.5000.""",

    """Karnataka Traffic Fines 2024:
    Overspeeding Rs.1000 to Rs.2000 by speed.
    No helmet Bengaluru Rs.1000. Drunk driving Rs.10000.
    Triple riding two-wheeler Rs.1000.""",

    """Maharashtra Traffic Fines 2024:
    Overspeeding Mumbai Rs.1000 light vehicles.
    No helmet Rs.500. Drunk driving Rs.10000.
    Mobile phone Rs.5000.""",

    """UK Traffic Fines 2024:
    Speeding: Fixed penalty Rs.100 pounds (min), up to Rs.1000 pounds.
    Using mobile phone: Rs.200 pounds fine, 6 penalty points.
    No seatbelt: Rs.100 pounds fine.
    Drunk driving: Unlimited fine, up to 6 months prison.""",

    """UAE Traffic Fines 2024:
    Speeding: AED 300 to AED 3000 depending on limit exceeded.
    Using mobile while driving: AED 800 fine, 4 black points.
    No seatbelt: AED 400.
    Drunk driving: AED 25000 and vehicle confiscation.""",
]


def create_knowledge_base():
    print("Building knowledge base...")
    splitter = RecursiveCharacterTextSplitter(chunk_size=400, chunk_overlap=50)
    docs = splitter.create_documents(LEGAL_TEXTS)
    embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2")
    db = Chroma.from_documents(
        docs, embeddings, persist_directory="./chroma_db"
    )
    print(f"Done! {len(docs)} chunks stored in ChromaDB.")
    return db


def load_knowledge_base():
    embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2")
    return Chroma(
        persist_directory="./chroma_db",
        embedding_function=embeddings
    )
if __name__ == "__main__":
    create_knowledge_base()