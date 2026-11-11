"""
FastAPI Experiment Controller Endpoints (Stage 7 Experiment & Evaluation Mode).
"""

from fastapi import APIRouter, HTTPException, status
from backend.app.schemas import ExperimentRequest
from simulation.experiment_engine import QShieldExperimentEngine

router = APIRouter()
engine = QShieldExperimentEngine()


@router.post("/experiments/run")
@router.post("/experiments/run/", include_in_schema=False)
def run_experiment_endpoint(req: ExperimentRequest):
    """
    Run a batch experiment across multiple simulation trials and return structured statistical analysis,
    confusion matrix, performance benchmarks, and empirical observations.
    """
    try:
        results = engine.run_experiment(
            experiment_type=req.experiment_type,
            attack=req.attack,
            intensity_start=req.intensity_start,
            intensity_end=req.intensity_end,
            intensity_step=req.intensity_step,
            trials_per_point=req.trials_per_point,
            num_qubits=req.num_qubits,
            noise_probability=req.noise_probability,
            seed=req.seed,
            enable_ai_detection=req.enable_ai_detection,
            enable_pqc_authentication=req.enable_pqc_authentication,
            enable_hybrid_security=req.enable_hybrid_security,
        )
        return results
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve)
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Experiment execution failed: {str(exc)}"
        )


@router.get("/experiments/templates")
@router.get("/experiments/templates/", include_in_schema=False)
def get_experiment_templates():
    """
    Get available experiment templates and recommended parameters.
    """
    return {
        "templates": [
            {
                "id": "attack_intensity_sweep",
                "name": "Attack Intensity Sweep",
                "desc": "Vary attack intensity from 0% to 100% to evaluate QBER vs. AI anomaly and security degradation.",
                "recommended_trials": 10,
                "recommended_qubits": 500,
            },
            {
                "id": "attack_comparison",
                "name": "Attack Comparison Benchmark",
                "desc": "Run controlled comparative analysis across None, PNS, Trojan-Horse, Detector Blinding, and MITM.",
                "recommended_trials": 10,
                "recommended_qubits": 500,
            },
            {
                "id": "ai_detection_evaluation",
                "name": "AI Detection Performance (Confusion Matrix)",
                "desc": "Evaluate Stage 3 Isolation Forest with Normal vs Attack samples to calculate Precision, Recall, F1, and FPR.",
                "recommended_trials": 15,
                "recommended_qubits": 500,
            },
            {
                "id": "false_positive_evaluation",
                "name": "False Positive Rate Benchmark",
                "desc": "Run clean simulations with varying legitimate channel noise to measure false alarm rate (Target <= 5%).",
                "recommended_trials": 20,
                "recommended_qubits": 500,
            },
            {
                "id": "pqc_evaluation",
                "name": "PQC Authentication Overhead & MITM",
                "desc": "Measure ML-DSA-65 keygen, signing, verification latency, signature size, and MITM block rate.",
                "recommended_trials": 10,
                "recommended_qubits": 500,
            },
            {
                "id": "hybrid_evaluation",
                "name": "Hybrid Layer Security Evaluation",
                "desc": "Evaluate incremental layer defense (BB84 -> AI -> PQC -> Hybrid Engine).",
                "recommended_trials": 10,
                "recommended_qubits": 500,
            },
        ]
    }
