from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import translate

app = FastAPI()

# Configure CORS to allow requests from the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Default Vite port
        "http://localhost:5174",  # Alternative Vite port
        "http://localhost:5175",  # Your current Vite port
    ],
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)

app.include_router(translate.router, prefix= "/api/translate", tags=["translate"])

@app.get("/health")
def health_check():
    return{"status": "ok"}