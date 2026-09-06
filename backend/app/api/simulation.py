"""
FastAPI Simulation Controller Endpoints (Stage 1 + Stage 2 + Stage 3 + Stage 4 + Stage 5).
"""

from fastapi import APIRouter, HTTPException, status
from backend.app.schemas import SimulationRequest, HealthResponse
from simulation.engine import run_bb84_simulation
from simulation.types import SimulationResult

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
def get_health():
    """
    Health check endpoint.
    """
    return HealthResponse()


@router.post("/simulate/bb84", response_model=SimulationResult)
def simulate_bb84(req: SimulationRequest):
    """
    Run BB84 Quantum Key Distribution Simulation with optional Attacker Model,
    AI Anomaly Detection, Post-Quantum Classical Channel Authentication, and Hybrid Security Decision Engine.
    """
    try:
        result = run_bb84_simulation(
            num_qubits=req.num_qubits,
            noise=req.noise,
            seed=req.seed,
            attack=req.attack,
            attack_intensity=req.attack_intensity,
            enable_ai_detection=req.enable_ai_detection,
            enable_pqc_authentication=req.enable_pqc_authentication,
            enable_hybrid_security=req.enable_hybrid_security
        )
        return result
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve)
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Simulation execution failed: {str(exc)}"
        )
