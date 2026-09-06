"""
Stage 3 AI/ML Anomaly Detection Package for Q-SHIELD.
"""

from simulation.ai.types import AIDetectionResult, DetectionStatus
from simulation.ai.features import extract_windowed_features, FEATURE_NAMES
from simulation.ai.detector import QShieldAIDetector
from simulation.ai.training import train_and_save_model

__all__ = [
    "AIDetectionResult",
    "DetectionStatus",
    "extract_windowed_features",
    "FEATURE_NAMES",
    "QShieldAIDetector",
    "train_and_save_model",
]
