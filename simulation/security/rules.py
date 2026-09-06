"""
Rules and Policy Evaluation Engine for Stage 5 Hybrid Security Assessment.

Evaluates critical override conditions, security level boundaries, decision enums,
and key management recommendations transparently.
"""

from typing import List, Dict, Any, Tuple, Optional
from simulation.security.types import (
    ComponentScores,
    SecurityWeights,
    SecurityLevel,
    SecurityDecision,
    KeyAction
)


def evaluate_rules(
    qber: float,
    component_scores: ComponentScores,
    weights: SecurityWeights,
    ai_dict: Optional[Dict[str, Any]],
    pqc_dict: Optional[Dict[str, Any]],
    mitm_dict: Optional[Dict[str, Any]]
) -> Tuple[float, SecurityLevel, SecurityDecision, KeyAction, List[str], List[str]]:
    """
    Apply transparent weighted scoring and critical override rules.

    :return: (final_score, security_level, decision, key_action, critical_events, dominant_risks)
    """
    # 1. Base Weighted Score
    base_score = (
        (weights.w_qber * component_scores.qber_score) +
        (weights.w_ai * component_scores.ai_anomaly_score) +
        (weights.w_pqc * component_scores.pqc_auth_score) +
        (weights.w_telemetry * component_scores.telemetry_health_score)
    )

    critical_events: List[str] = []
    dominant_risks: List[str] = []
    max_allowed_score = 100.0

    # Extract signals
    ai_active = ai_dict is not None and ai_dict.get("enabled", False)
    ai_score_val = float(ai_dict.get("anomaly_score", 0.0)) if ai_active else 0.0
    ai_status = ai_dict.get("status", "NORMAL") if ai_active else "NORMAL"

    pqc_active = pqc_dict is not None and pqc_dict.get("enabled", False)
    sig_valid = pqc_dict.get("signature_valid", True) if pqc_active else True
    mitm_blocked = pqc_dict.get("mitm_blocked", False) if pqc_active else False
    pqc_msg_modified = pqc_dict.get("message_modified", False) if pqc_active else False

    mitm_unauth_modified = (mitm_dict is not None and mitm_dict.get("message_modified", False) and not pqc_active)

    # 2. Critical Event Overrides
    if pqc_active and not sig_valid:
        critical_events.append("CLASSICAL_CHANNEL_AUTHENTICATION_FAILURE (ML-DSA-65 signature verification failed)")
        dominant_risks.append("PQC Digital Signature Failure / Active Classical Message Modification")
        max_allowed_score = min(max_allowed_score, 20.0)

    if mitm_unauth_modified:
        critical_events.append("UNAUTHENTICATED_CLASSICAL_CHANNEL_TAMPERING (Eve altered basis message without PQC)")
        dominant_risks.append("Unauthenticated Classical Man-in-the-Middle Attack")
        max_allowed_score = min(max_allowed_score, 15.0)

    if qber > 0.11:
        critical_events.append(f"EXCESSIVE_QUANTUM_BIT_ERROR_RATE (QBER {qber * 100.0:.2f}% exceeds 11.0% threshold)")
        dominant_risks.append(f"Severe Quantum Channel Disturbance / Eavesdropping (QBER: {qber * 100.0:.2f}%)")
        max_allowed_score = min(max_allowed_score, 30.0)

    if ai_active and (ai_status == "ATTACK_DETECTED" or ai_score_val >= 0.70):
        if qber <= 0.11:
            critical_events.append("STEALTH_PHYSICAL_ANOMALY_DETECTED (Low QBER accompanied by highly anomalous physical telemetry)")
            dominant_risks.append(f"Stealth Quantum Channel Attack / Detector Blinding (AI Anomaly Score: {ai_score_val * 100.0:.1f}%)")
            max_allowed_score = min(max_allowed_score, 38.0)
        else:
            dominant_risks.append(f"Physical Telemetry Anomaly Detected by AI (Score: {ai_score_val * 100.0:.1f}%)")
            max_allowed_score = min(max_allowed_score, 40.0)

    if qber > 0.05 and qber <= 0.11:
        dominant_risks.append(f"Elevated Quantum Noise / Partial Disturbance (QBER: {qber * 100.0:.2f}%)")

    final_score = round(max(0.0, min(base_score, max_allowed_score)), 1)

    # 3. Derive Security Level
    if final_score >= 90.0:
        security_level = SecurityLevel.SECURE
    elif final_score >= 70.0:
        security_level = SecurityLevel.GUARDED
    elif final_score >= 40.0:
        security_level = SecurityLevel.SUSPICIOUS
    else:
        security_level = SecurityLevel.COMPROMISED

    # 4. Derive Decision & Key Action
    if pqc_active and pqc_msg_modified and not sig_valid and mitm_blocked:
        decision = SecurityDecision.ATTACK_BLOCKED
        key_action = KeyAction.REJECT_KEY
    elif mitm_unauth_modified:
        decision = SecurityDecision.ATTACK_SUCCESSFUL
        key_action = KeyAction.REJECT_KEY
    elif qber > 0.11 or (ai_active and ai_score_val >= 0.70):
        decision = SecurityDecision.ATTACK_DETECTED
        key_action = KeyAction.REJECT_KEY
    elif qber > 0.05 or (ai_active and ai_score_val >= 0.40):
        decision = SecurityDecision.ATTACK_SUSPECTED
        key_action = KeyAction.WARN
    else:
        decision = SecurityDecision.NO_ATTACK_DETECTED
        key_action = KeyAction.ALLOW_KEY

    return final_score, security_level, decision, key_action, critical_events, dominant_risks
