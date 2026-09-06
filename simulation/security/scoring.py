"""
Scoring Engine for Stage 5 Hybrid Security Assessment.

Calculates weighted scores, component breakdowns, and critical overrides
strictly from empirical measurements (QBER, AI anomaly score, PQC signature validity, and physical channel telemetry).
"""

from typing import List, Dict, Any, Tuple, Optional
from simulation.security.types import (
    ComponentScores,
    SecurityWeights,
    SecurityLevel,
    SecurityDecision,
    KeyAction
)
from simulation.types import RoundTelemetry


def compute_qber_component_score(qber: float) -> Tuple[float, str]:
    """
    Calculate QBER security score [0.0 to 100.0] based on standard BB84 error thresholds.
    """
    if qber <= 0.05:
        score = 100.0
        status = f"Normal QBER ({qber * 100.0:.2f}% <= 5.0% noise baseline)"
    elif qber <= 0.11:
        # Linear drop from 100.0 to 60.0
        score = 100.0 - ((qber - 0.05) / (0.11 - 0.05)) * 40.0
        status = f"Elevated QBER ({qber * 100.0:.2f}% approaching 11.0% security limit)"
    elif qber <= 0.25:
        # Linear drop from 60.0 to 0.0
        score = 60.0 - ((qber - 0.11) / (0.25 - 0.11)) * 60.0
        status = f"CRITICAL QBER ({qber * 100.0:.2f}% > 11.0% security threshold)"
    else:
        score = 0.0
        status = f"SEVERE QBER BREACH ({qber * 100.0:.2f}%)"

    return round(max(0.0, min(100.0, score)), 2), status


def compute_ai_component_score(ai_dict: Optional[Dict[str, Any]]) -> Tuple[float, str]:
    """
    Calculate AI component health score [0.0 to 100.0] from Stage 3 Isolation Forest inference.
    """
    if not ai_dict or not ai_dict.get("enabled", False):
        return 100.0, "AI Anomaly Detector not active (neutral baseline)"

    anomaly_score = float(ai_dict.get("anomaly_score", 0.0))
    status_str = ai_dict.get("status", "NORMAL")

    score = max(0.0, (1.0 - anomaly_score) * 100.0)

    if status_str == "ATTACK_DETECTED":
        desc = f"AI Anomaly Detector flagged severe physical anomaly (Score: {anomaly_score * 100.0:.1f}%)"
    elif status_str == "SUSPICIOUS":
        desc = f"AI Anomaly Detector flagged moderate anomaly (Score: {anomaly_score * 100.0:.1f}%)"
    else:
        desc = f"AI Anomaly Detector confirms normal telemetry (Score: {anomaly_score * 100.0:.1f}%)"

    return round(score, 2), desc


def compute_pqc_component_score(pqc_dict: Optional[Dict[str, Any]]) -> Tuple[float, str]:
    """
    Calculate PQC authentication component score [0.0 to 100.0] from Stage 4 ML-DSA-65 digital signatures.
    """
    if not pqc_dict or not pqc_dict.get("enabled", False):
        return 50.0, "PQC Classical Authentication disabled (Unauthenticated classical channel baseline)"

    sig_valid = pqc_dict.get("signature_valid", False)
    msg_modified = pqc_dict.get("message_modified", False)
    alg = pqc_dict.get("algorithm", "ML-DSA-65")

    if sig_valid and not msg_modified:
        return 100.0, f"Classical channel verified with {alg} digital signature"
    elif not sig_valid and msg_modified:
        return 0.0, f"CRITICAL: {alg} signature verification FAILED due to classical message tampering"
    elif not sig_valid:
        return 0.0, f"CRITICAL: Invalid {alg} digital signature on classical message"
    else:
        return 100.0, f"Classical message signed and verified with {alg}"


def compute_telemetry_health_score(telemetry: List[RoundTelemetry]) -> Tuple[float, str]:
    """
    Calculate physical telemetry health score [0.0 to 100.0] directly from physical channel signals.
    """
    if not telemetry:
        return 100.0, "No per-round telemetry available"

    jitters = [t.timing_jitter for t in telemetry]
    variances = [t.detector_response_variance for t in telemetry]
    probes = [t.probe_reflection_intensity for t in telemetry]

    avg_jitter = float(sum(jitters) / len(jitters))
    avg_var = float(sum(variances) / len(variances))
    max_probe = float(max(probes)) if probes else 0.0

    score = 100.0

    # Jitter penalty (baseline ~15 ps)
    if avg_jitter > 30.0:
        penalty = min(50.0, (avg_jitter - 15.0) * 0.5)
        score -= penalty

    # Variance penalty (baseline ~0.01)
    if avg_var > 0.05:
        penalty = min(40.0, (avg_var - 0.01) * 200.0)
        score -= penalty

    # Probe penalty (baseline 0.0)
    if max_probe > 0.1:
        penalty = min(40.0, max_probe * 50.0)
        score -= penalty

    score = max(0.0, min(100.0, score))

    desc = (
        f"Avg Jitter: {avg_jitter:.1f}ps, Avg Variance: {avg_var:.3f}, Max Probe: {max_probe:.2f}"
    )

    return round(score, 2), desc
