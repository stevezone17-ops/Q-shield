"""
FastAPI Application Entry Point for Q-SHIELD Backend.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.api.simulation import router as simulation_router
from backend.app.api.experiments import router as experiments_router
from backend.app.api.presentation import router as presentation_router

app = FastAPI(
    title="Q-SHIELD — Quantum Communication Security Operations & Presentation API",
    description="Backend API for running academic BB84 quantum protocol simulations, Stage 7 Experiments, and Stage 8 Presentation/Viva Mode",
    version="8.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routes
app.include_router(simulation_router, prefix="/api")
app.include_router(experiments_router, prefix="/api")
app.include_router(presentation_router, prefix="/api")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="127.0.0.1", port=8000, reload=True)
