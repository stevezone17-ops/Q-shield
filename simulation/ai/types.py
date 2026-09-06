"""
Data types and containers for Stage 3 AI/ML Anomaly Detection Layer.
"""

from enum import Enum
from typing import List, Dict, Optional, Any
from dataclasses import dataclass, field


class DetectionStatus(str, Enum):
    NORMAL = "NORMAL"
    SUSPICIOUS = "SUSPICIOUS"
    ATTACK_DETECTED = "ATTACK_DETECTED"


@dataclass
class AIDetectionResult:
    enabled: bool = True
    status: str = DetectionStatus.NORMAL.value
    anomaly_score: float = 0.0
    confidence: float = 0.95
    qber_observed: float = 0.0
    qber_evaluated_as_suspicious: bool = False
    stealth_attack_detected: bool = False
    dominant_signals: List[str] = field(default_factory=list)
    feature_indicators: Dict[str, str] = field(default_factory=dict)
    explanation: str = "Quantum channel telemetry is consistent with the learned normal BB84 profile."
    model_algorithm: str = "IsolationForest"
    windows_analyzed: int = 10
