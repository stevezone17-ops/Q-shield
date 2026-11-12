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

# Register API routes with /api prefix as primary contract
app.include_router(simulation_router, prefix="/api")
app.include_router(experiments_router, prefix="/api")
app.include_router(presentation_router, prefix="/api")

# Fallback route registrations without /api prefix to prevent 404 on direct root hits
app.include_router(simulation_router, include_in_schema=False)
app.include_router(experiments_router, include_in_schema=False)
app.include_router(presentation_router, include_in_schema=False)


@app.get("/", tags=["System"])
def root_endpoint():
    """
    Root discovery endpoint providing service metadata and API documentation links.
    """
    return {
        "title": "Q-SHIELD — Quantum Communication Security Operations & Presentation API",
        "status": "operational",
        "version": "8.0.0",
        "docs_url": "/docs",
        "health_url": "/api/health",
        "endpoints": {
            "health": "/api/health",
            "simulate": "/api/simulate/bb84",
            "experiments_run": "/api/experiments/run",
            "experiments_templates": "/api/experiments/templates",
            "presentation_demos": "/api/presentation/demos",
            "presentation_viva": "/api/presentation/viva"
        }
    }


@app.get("/api", tags=["System"])
def api_gateway_endpoint():
    """
    API prefix gateway discovery endpoint.
    """
    return {
        "service": "Q-SHIELD API Gateway",
        "status": "operational",
        "version": "8.0.0",
        "docs_url": "/docs",
        "health_url": "/api/health"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="127.0.0.1", port=8002, reload=True)
