"""
Pydantic API Request/Response Schemas for FastAPI Backend (Stage 1 to Stage 7).
"""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class SimulationRequest(BaseModel):
    num_qubits: int = Field(
        500,
        gt=0,
        le=10000,
        description="Number of qubits to transmit (1 to 10,000)",
        examples=[500]
    )
    noise: float = Field(
        0.02,
        ge=0.0,
        le=1.0,
        description="Depolarizing noise probability (0.0 to 1.0)",
        examples=[0.02]
    )
    seed: Optional[int] = Field(
        None,
        description="Optional seed for simulation reproducibility",
        examples=[42]
    )
    attack: str = Field(
        "none",
        description="Attacker model: none, pns, trojan_horse, detector_blinding, mitm",
        examples=["detector_blinding"]
    )
    attack_intensity: float = Field(
        0.0,
        ge=0.0,
        le=1.0,
        description="Attack intensity scale (0.0 to 1.0)",
        examples=[0.7]
    )
    enable_ai_detection: bool = Field(
        False,
        description="Enable Stage 3 AI Anomaly Detector",
        examples=[True]
    )
    enable_pqc_authentication: bool = Field(
        False,
        description="Enable Stage 4 PQC Classical Channel Authenticator (ML-DSA-65)",
        examples=[True]
    )
    enable_hybrid_security: bool = Field(
        False,
        description="Enable Stage 5 Hybrid Security Decision Engine",
        examples=[True]
    )


class ExperimentRequest(BaseModel):
    experiment_type: str = Field(
        "attack_intensity_sweep",
        description="Type of experiment: attack_intensity_sweep, attack_comparison, ai_detection_evaluation, false_positive_evaluation, pqc_evaluation, hybrid_evaluation",
        examples=["attack_intensity_sweep"]
    )
    attack: str = Field(
        "detector_blinding",
        description="Target attack type for sweep or evaluation",
        examples=["detector_blinding"]
    )
    intensity_start: float = Field(
        0.0,
        ge=0.0,
        le=1.0,
        description="Starting intensity for sweep",
        examples=[0.0]
    )
    intensity_end: float = Field(
        1.0,
        ge=0.0,
        le=1.0,
        description="Ending intensity for sweep",
        examples=[1.0]
    )
    intensity_step: float = Field(
        0.1,
        gt=0.0,
        le=0.5,
        description="Step increment for intensity sweep",
        examples=[0.1]
    )
    trials_per_point: int = Field(
        10,
        gt=0,
        le=100,
        description="Number of simulation trials per experimental point",
        examples=[10]
    )
    num_qubits: int = Field(
        500,
        gt=0,
        le=5000,
        description="Qubits per simulation trial",
        examples=[500]
    )
    noise_probability: float = Field(
        0.02,
        ge=0.0,
        le=0.5,
        description="Channel depolarizing noise probability",
        examples=[0.02]
    )
    seed: Optional[int] = Field(
        42,
        description="Base seed for reproducibility",
        examples=[42]
    )
    enable_ai_detection: bool = Field(
        True,
        description="Enable Stage 3 AI Anomaly Detector",
        examples=[True]
    )
    enable_pqc_authentication: bool = Field(
        True,
        description="Enable Stage 4 PQC Authentication",
        examples=[True]
    )
    enable_hybrid_security: bool = Field(
        True,
        description="Enable Stage 5 Hybrid Security Engine",
        examples=[True]
    )


class HealthResponse(BaseModel):
    status: str = "ok"
    service: str = "Q-SHIELD BB84 Simulator API"
    stage: str = "Stage 7 — Experiment & Evaluation Mode"
    version: str = "7.0.0"
