"""
Stage 3 AI/ML Anomaly Detection Test Suite.
"""

import pytest
import numpy as np
from simulation.engine import run_bb84_simulation
from simulation.ai import QShieldAIDetector, extract_windowed_features, FEATURE_NAMES
from simulation.ai.types import DetectionStatus


def test_feature_extraction_integrity():
    """Verify feature extraction matrix shape, sanitation (no NaN/Inf), and feature list."""
    res = run_bb84_simulation(num_qubits=500, noise=0.02, seed=42, attack="none")
    feats, names = extract_windowed_features(res.telemetry, window_size=50)

    assert len(names) == 14
    assert feats.ndim == 2
    assert feats.shape[1] == 14
    assert not np.isnan(feats).any()
    assert not np.isinf(feats).any()

    # CRITICAL: Verify attack type/name is NOT included in feature names
    for name in names:
        assert "attack" not in name
        assert "label" not in name


def test_clean_simulation_normal_classification():
    """Verify clean unattacked BB84 yields NORMAL status and low anomaly score."""
    res = run_bb84_simulation(
        num_qubits=500,
        noise=0.02,
        seed=42,
        attack="none",
        attack_intensity=0.0,
        enable_ai_detection=True
    )
    assert res.ai_detection is not None
    ai = res.ai_detection
    assert ai["enabled"] is True
    assert ai["status"] == DetectionStatus.NORMAL.value
    assert ai["anomaly_score"] < 0.40
    assert ai["stealth_attack_detected"] is False


def test_detector_blinding_stealth_detection():
    """
    CRITICAL DEMONSTRATION: Detector Blinding maintains low QBER (< 11%)
    while AI Detector correctly flags ATTACK_DETECTED based on abnormal telemetry.
    """
    res = run_bb84_simulation(
        num_qubits=500,
        noise=0.02,
        seed=42,
        attack="detector_blinding",
        attack_intensity=0.7,
        enable_ai_detection=True
    )
    assert res.ai_detection is not None
    ai = res.ai_detection

    # 1. QBER remains low (< 11%)
    assert res.statistics.qber < 0.11

    # 2. AI Detector flags ATTACK_DETECTED and high anomaly score
    assert ai["status"] == DetectionStatus.ATTACK_DETECTED.value
    assert ai["anomaly_score"] >= 0.70
    assert ai["stealth_attack_detected"] is True

    # 3. Dominant signals identify telemetry anomalies
    assert len(ai["dominant_signals"]) > 0
    assert "Timing Jitter" in ai["dominant_signals"] or "Detector Response Variance" in ai["dominant_signals"] or "Burst Rate" in ai["dominant_signals"]


def test_pns_attack_ai_detection():
    """Verify PNS attack telemetry is analyzed by AI Detector."""
    res = run_bb84_simulation(
        num_qubits=500,
        noise=0.02,
        seed=42,
        attack="pns",
        attack_intensity=0.8,
        enable_ai_detection=True
    )
    assert res.ai_detection is not None
    ai = res.ai_detection
    assert ai["anomaly_score"] > 0.40
    assert ai["status"] in [DetectionStatus.SUSPICIOUS.value, DetectionStatus.ATTACK_DETECTED.value]


def test_trojan_horse_ai_detection():
    """Verify Trojan Horse probing anomalies generate elevated AI anomaly scores."""
    res = run_bb84_simulation(
        num_qubits=500,
        noise=0.02,
        seed=42,
        attack="trojan_horse",
        attack_intensity=0.7,
        enable_ai_detection=True
    )
    assert res.ai_detection is not None
    ai = res.ai_detection
    assert ai["anomaly_score"] >= 0.70
    assert ai["status"] == DetectionStatus.ATTACK_DETECTED.value


def test_mitm_attack_ai_detection():
    """Verify MITM attack telemetry is processed cleanly by AI Detector."""
    res = run_bb84_simulation(
        num_qubits=500,
        noise=0.02,
        seed=42,
        attack="mitm",
        attack_intensity=0.8,
        enable_ai_detection=True
    )
    assert res.ai_detection is not None
    ai = res.ai_detection
    assert ai["status"] == DetectionStatus.ATTACK_DETECTED.value


def test_ai_disabled_backward_compatibility():
    """Verify backward compatibility when enable_ai_detection=False."""
    res = run_bb84_simulation(
        num_qubits=500,
        noise=0.02,
        seed=42,
        attack="detector_blinding",
        attack_intensity=0.7,
        enable_ai_detection=False
    )
    assert res.ai_detection is None


def test_false_positive_and_detection_rate_evaluation():
    """
    Evaluates False Positive Rate across 20 clean sessions and
    Detection Rate across 20 detector blinding sessions.
    """
    clean_false_positives = 0
    total_clean = 20

    for seed in range(total_clean):
        res = run_bb84_simulation(
            num_qubits=500,
            noise=0.02,
            seed=100 + seed,
            attack="none",
            attack_intensity=0.0,
            enable_ai_detection=True
        )
        if res.ai_detection["status"] == DetectionStatus.ATTACK_DETECTED.value:
            clean_false_positives += 1

    false_positive_rate = clean_false_positives / total_clean
    assert false_positive_rate <= 0.05  # False positive rate must be <= 5%

    blinding_detected = 0
    total_blinding = 20

    for seed in range(total_blinding):
        res = run_bb84_simulation(
            num_qubits=500,
            noise=0.02,
            seed=200 + seed,
            attack="detector_blinding",
            attack_intensity=0.7,
            enable_ai_detection=True
        )
        if res.ai_detection["status"] == DetectionStatus.ATTACK_DETECTED.value:
            blinding_detected += 1

    detection_rate = blinding_detected / total_blinding
    assert detection_rate >= 0.90  # Detection rate for blinding must be >= 90%
