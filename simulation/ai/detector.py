"""
Stage 3 AI/ML Anomaly Detector Implementation for Q-SHIELD.

Implements the `IAIDetector` interface using an unsupervised Isolation Forest model.
Analyzes physical channel telemetry, identifies statistical anomalies, maps dominant signals,
and exposes normalized anomaly scores with explainability.
"""

import os
import pickle
from typing import List, Dict, Any, Optional
import numpy as np

from simulation.interfaces import IAIDetector
from simulation.types import TransmissionRound, RoundTelemetry
from simulation.ai.types import AIDetectionResult, DetectionStatus
from simulation.ai.features import extract_windowed_features, FEATURE_NAMES
from simulation.ai.training import DEFAULT_MODEL_PATH, train_and_save_model


class QShieldAIDetector(IAIDetector):
    """
    Unsupervised Isolation Forest Anomaly Detector for BB84 Quantum Communication Telemetry.
    """

    def __init__(self, model_path: str = DEFAULT_MODEL_PATH):
        self.model_path = model_path
        self._load_or_train_model()

    def _load_or_train_model(self):
        if not os.path.exists(self.model_path):
            artifact = train_and_save_model(self.model_path)
        else:
            with open(self.model_path, "rb") as f:
                artifact = pickle.load(f)

        self.model = artifact["model"]
        self.scaler = artifact["scaler"]
        self.feature_names = artifact["feature_names"]
        self.normal_means = artifact["normal_means"]
        self.normal_stds = artifact["normal_stds"]
        self.raw_min = artifact.get("raw_min", -0.7)
        self.raw_max = artifact.get("raw_max", -0.35)

    def analyze_rounds(
        self,
        rounds: List[TransmissionRound],
        qber: float
    ) -> Dict[str, Any]:
        """
        IAIDetector interface compatibility wrapper.
        """
        # Build synthetic RoundTelemetry list from rounds if raw telemetry not passed
        telemetry = []
        for r in rounds:
            t = RoundTelemetry(
                round_index=r.index,
                qber_signal=qber,
                click_rate=1.0,
                timing_jitter=r.timing_jitter_ps if r.timing_jitter_ps > 0 else 15.0,
                detection_frequency=1.0,
                photon_count_statistics=1.0,
                burst_rate=0.0,
                error_rate=qber,
                detector_response_variance=0.01,
                probe_reflection_intensity=0.0,
                attack_intensity=0.0,
                attack_type="none"
            )
            telemetry.append(t)

        res = self.detect(telemetry, qber)
        return res.__dict__

    def detect(
        self,
        telemetry: List[RoundTelemetry],
        qber: float
    ) -> AIDetectionResult:
        """
        Analyze physical channel telemetry stream and classify session anomaly state.

        :param telemetry: Stream of RoundTelemetry objects
        :param qber: Session-wide Quantum Bit Error Rate
        :return: AIDetectionResult
        """
        if not telemetry:
            return AIDetectionResult(
                enabled=True,
                status=DetectionStatus.NORMAL.value,
                anomaly_score=0.0,
                confidence=0.95,
                qber_observed=round(qber, 4),
                explanation="Insufficient telemetry data available for AI analysis."
            )

        # 1. Feature Extraction (No attack labels used!)
        X_raw, _ = extract_windowed_features(telemetry, window_size=50)

        # 2. Scale features
        X_scaled = self.scaler.transform(X_raw)

        # 3. Predict IsolationForest raw decision function scores
        # decision_function outputs negative scores for anomalies (e.g. -0.2 to -0.6)
        raw_scores = self.model.decision_function(X_scaled)
        avg_raw_score = float(np.mean(raw_scores))

        # 4. Map raw score to normalized [0.00, 1.00] anomaly score
        # Normal baseline decision function score is around +0.05 to +0.25
        # Lower decision scores indicate higher anomaly
        if avg_raw_score >= 0.10:
            anomaly_score = float(np.clip(0.05 + (0.25 - avg_raw_score) * 0.5, 0.0, 0.25))
        elif avg_raw_score >= 0.0:
            anomaly_score = float(np.clip(0.25 + (0.10 - avg_raw_score) * 2.0, 0.25, 0.45))
        elif avg_raw_score >= -0.15:
            anomaly_score = float(np.clip(0.45 + (-avg_raw_score) * 2.0, 0.45, 0.75))
        else:
            anomaly_score = float(np.clip(0.75 + (-0.15 - avg_raw_score) * 1.5, 0.75, 1.00))

        # Additional anomaly boost if physical telemetry features exhibit extreme z-scores / shifts
        mean_jitter = float(np.mean([t.timing_jitter for t in telemetry]))
        mean_var = float(np.mean([t.detector_response_variance for t in telemetry]))
        max_probe = float(np.max([t.probe_reflection_intensity for t in telemetry]))
        mean_photons = float(np.mean([t.photon_count_statistics for t in telemetry]))
        mean_burst = float(np.mean([t.burst_rate for t in telemetry]))

        if mean_jitter > 60.0 or mean_var > 0.12 or max_probe > 0.35 or qber > 0.15:
            anomaly_score = max(anomaly_score, 0.82)
        elif mean_photons > 1.20 or mean_jitter > 28.0 or mean_burst > 0.04 or qber > 0.10:
            anomaly_score = max(anomaly_score, 0.68)
        elif mean_photons > 1.10 or mean_jitter > 22.0 or mean_burst > 0.01:
            anomaly_score = max(anomaly_score, 0.48)

        anomaly_score = round(anomaly_score, 3)

        # 5. Determine Classification Status
        if anomaly_score < 0.40:
            status = DetectionStatus.NORMAL.value
        elif anomaly_score < 0.70:
            status = DetectionStatus.SUSPICIOUS.value
        else:
            status = DetectionStatus.ATTACK_DETECTED.value

        # 6. Dominant Signals & Z-Score Feature Indicators
        dominant_signals = []
        feature_indicators = {}

        # Calculate z-scores against learned baseline normal distribution
        mean_features = np.mean(X_raw, axis=0)
        feature_zscores = {}
        for idx, feat_name in enumerate(self.feature_names):
            mean_val = mean_features[idx]
            norm_m = self.normal_means.get(feat_name, 0.0)
            norm_s = self.normal_stds.get(feat_name, 1.0)
            z = (mean_val - norm_m) / norm_s
            feature_zscores[feat_name] = float(z)

            # Assign qualitative tag
            if abs(z) > 3.0:
                feature_indicators[feat_name] = "HIGH"
            elif abs(z) > 1.8:
                feature_indicators[feat_name] = "ELEVATED"
            elif abs(z) > 1.0:
                feature_indicators[feat_name] = "MODERATE"
            else:
                feature_indicators[feat_name] = "NORMAL"

        # Identify dominant signals (highest z-scores)
        sorted_feats = sorted(feature_zscores.items(), key=lambda item: abs(item[1]), reverse=True)
        for feat_name, z_val in sorted_feats[:4]:
            if abs(z_val) > 1.5:
                # Human readable signal name
                clean_name = feat_name.replace("mean_", "").replace("_", " ").title()
                dominant_signals.append(clean_name)

        # 7. Check for Stealth Attack (Low QBER + High Anomaly Score -> Detector Blinding)
        qber_suspicious = qber > 0.11
        stealth_attack = (qber <= 0.11) and (status == DetectionStatus.ATTACK_DETECTED)

        # 8. Generate Academically Sound Explanation
        if status == DetectionStatus.ATTACK_DETECTED:
            if stealth_attack:
                explanation = (
                    f"Statistical physical anomaly detected in channel telemetry. "
                    f"Dominant anomalous signals: {', '.join(dominant_signals[:3]) if dominant_signals else 'Detector Telemetry Shift'}. "
                    f"CRITICAL OBSERVATION: Quantum Bit Error Rate remains relatively low (QBER = {(qber*100):.2f}%, below standard 11% security threshold), "
                    f"indicating a stealth detector-blinding attack that evades conventional QBER threshold monitoring."
                )
            else:
                explanation = (
                    f"Quantum channel telemetry exhibits severe statistical deviation from the learned normal BB84 profile. "
                    f"Dominant anomalous signals: {', '.join(dominant_signals[:3]) if dominant_signals else 'Telemetry Shift'}. "
                    f"Observed QBER: {(qber*100):.2f}%."
                )
        elif status == DetectionStatus.SUSPICIOUS:
            explanation = (
                f"Moderate statistical telemetry fluctuation observed. "
                f"Dominant signals: {', '.join(dominant_signals[:2]) if dominant_signals else 'Minor Variance'}. "
                f"Observed QBER: {(qber*100):.2f}%."
            )
        else:
            explanation = (
                f"Quantum channel telemetry is consistent with the learned normal BB84 profile. "
                f"No statistically significant physical anomalies detected. Observed QBER: {(qber*100):.2f}%."
            )

        # Confidence calculation based on telemetry sample size and score extremity
        confidence = round(float(min(0.98, 0.85 + (len(telemetry) / 5000.0) + (abs(anomaly_score - 0.5) * 0.2))), 2)

        return AIDetectionResult(
            enabled=True,
            status=status,
            anomaly_score=anomaly_score,
            confidence=confidence,
            qber_observed=round(qber, 4),
            qber_evaluated_as_suspicious=qber_suspicious,
            stealth_attack_detected=stealth_attack,
            dominant_signals=dominant_signals,
            feature_indicators=feature_indicators,
            explanation=explanation,
            model_algorithm="IsolationForest",
            windows_analyzed=len(X_raw)
        )
