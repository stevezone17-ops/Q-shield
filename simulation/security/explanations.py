"""
Explanation and Recommendation Generator for Stage 5 Hybrid Security Decision Engine.
"""

from typing import List, Dict, Any, Optional, Tuple
from simulation.security.types import SecurityLevel, SecurityDecision, KeyAction


def generate_explanation_and_recommendation(
    score: float,
    level: SecurityLevel,
    decision: SecurityDecision,
    key_action: KeyAction,
    qber: float,
    qber_desc: str,
    ai_desc: str,
    pqc_desc: str,
    telemetry_desc: str,
    critical_events: List[str],
    dominant_risks: List[str]
) -> Tuple[str, str]:
    """
    Produce a clear, scientifically accurate explanation and policy recommendation.

    :return: (explanation_text, recommendation_text)
    """
    explanations = []

    if decision == SecurityDecision.ATTACK_BLOCKED:
        explanations.append(
            f"An active classical Man-in-the-Middle (MITM) attack was intercepted. "
            f"Eve altered Alice's basis reconciliation payload, but ML-DSA-65 post-quantum signature verification "
            f"FAILED on the tampered message. Bob REJECTED the message, successfully blocking the attack."
        )
    elif decision == SecurityDecision.ATTACK_SUCCESSFUL:
        explanations.append(
            f"An active classical Man-in-the-Middle (MITM) attack succeeded because post-quantum classical authentication "
            f"was DISABLED. Eve altered the reconciliation message in transit without detection."
        )
    elif "STEALTH_PHYSICAL_ANOMALY_DETECTED" in " ".join(critical_events):
        explanations.append(
            f"Although QBER remains below the conventional 11.0% theoretical threshold ({qber * 100.0:.2f}%), "
            f"detector telemetry exhibits statistically anomalous behavior identified by the Stage 3 AI Anomaly Detector. "
            f"This indicates a stealth physical attack (e.g., detector blinding or Trojan-horse probing)."
        )
    elif qber > 0.11:
        explanations.append(
            f"The Quantum Bit Error Rate (QBER: {qber * 100.0:.2f}%) exceeds the 11.0% maximum theoretical security "
            f"threshold for BB84 key distillation under error correction and privacy amplification."
        )
    elif level == SecurityLevel.SECURE:
        explanations.append(
            f"The quantum communication session is fully authenticated and healthy. QBER ({qber * 100.0:.2f}%) is within "
            f"acceptable noise limits, AI physical telemetry anomaly score is normal, and classical channel "
            f"integrity is verified with post-quantum ML-DSA-65 signatures under the configured classical channel policy."
        )
    else:
        explanations.append(
            f"Security signals evaluated across QBER ({qber * 100.0:.2f}%), Stage 3 AI Telemetry, and Stage 4 PQC "
            f"Classical Authentication indicate a {level.value} session (Security Score: {score:.1f}/100)."
        )

    if dominant_risks:
        explanations.append(f"Primary Security Concerns: {'; '.join(dominant_risks)}.")

    explanation_str = " ".join(explanations)

    # Policy Recommendation
    if key_action == KeyAction.REJECT_KEY:
        rec_str = (
            f"REJECT_KEY: Do NOT distill or deploy the derived key. "
            f"Terminate the current QKD session, inspect physical detector telemetry, and re-authenticate classical channels."
        )
    elif key_action == KeyAction.WARN:
        rec_str = (
            f"WARN: Proceed with caution. Key distillation permitted with reduced block size. "
            f"Increase monitoring of QBER and timing jitter on subsequent quantum rounds."
        )
    else:
        rec_str = (
            f"ALLOW_KEY: The generated key is approved for use under the configured Q-SHIELD security policy."
        )

    return explanation_str, rec_str
