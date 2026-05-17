from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from routers import chat, challan

load_dotenv()

app = FastAPI(title="DriveLegal API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router, prefix="/api")
app.include_router(challan.router, prefix="/api")

@app.get("/")
def home():
    return {
        "message": "DriveLegal API is running!",
        "status": "ok"
    }