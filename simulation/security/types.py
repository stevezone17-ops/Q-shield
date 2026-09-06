"""
Types and Data Structures for Stage 5 Hybrid Security Decision Engine.
"""

from enum import Enum
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class SecurityLevel(str, Enum):
    SECURE = "SECURE"            # 90 - 100
    GUARDED = "GUARDED"          # 70 - 89
    SUSPICIOUS = "SUSPICIOUS"    # 40 - 69
    COMPROMISED = "COMPROMISED"  # 0 - 39


class SecurityDecision(str, Enum):
    NO_ATTACK_DETECTED = "NO_ATTACK_DETECTED"
    ATTACK_SUSPECTED = "ATTACK_SUSPECTED"
    ATTACK_DETECTED = "ATTACK_DETECTED"
    ATTACK_BLOCKED = "ATTACK_BLOCKED"
    ATTACK_SUCCESSFUL = "ATTACK_SUCCESSFUL"


class KeyAction(str, Enum):
    ALLOW_KEY = "ALLOW_KEY"
    WARN = "WARN"
    REJECT_KEY = "REJECT_KEY"


class ComponentScores(BaseModel):
    qber_score: float = Field(..., ge=0.0, le=100.0, description="Quantum Bit Error Rate score (100 = low error, 0 = high error)")
    ai_anomaly_score: float = Field(..., ge=0.0, le=100.0, description="AI Anomaly Health score (100 = normal, 0 = severe anomaly)")
    pqc_auth_score: float = Field(..., ge=0.0, le=100.0, description="PQC Classical Authentication score (100 = valid, 0 = invalid/tampered)")
    telemetry_health_score: float = Field(..., ge=0.0, le=100.0, description="Physical telemetry health score (100 = normal jitter/variance, 0 = highly abnormal)")


class SecurityWeights(BaseModel):
    w_qber: float = 0.25
    w_ai: float = 0.30
    w_pqc: float = 0.30
    w_telemetry: float = 0.15


class HybridSecurityAssessment(BaseModel):
    enabled: bool = True
    security_score: float = Field(..., ge=0.0, le=100.0)
    security_level: SecurityLevel
    decision: SecurityDecision
    key_action: KeyAction
    component_scores: Dict[str, float]
    weights_used: Dict[str, float]
    qber_assessment: str
    ai_assessment: str
    pqc_assessment: str
    telemetry_assessment: str
    critical_events: List[str]
    dominant_risks: List[str]
    explanation: str
    recommendation: str
    evaluation_time_ms: float
