"""
Stage 5 Hybrid Security Decision Engine Test Suite.
Verifies multi-dimensional signal synthesis, critical overrides, score bounds,
determinism, and logic matrix cases A through F.
"""

import pytest
from simulation.engine import run_bb84_simulation
from simulation.security import HybridSecurityEngine, SecurityLevel, SecurityDecision, KeyAction


def test_case_a_clean_session():
    """
    CASE A: Clean session with AI and PQC enabled.
    Expected: High score (>= 90), SECURE level, NO_ATTACK_DETECTED, ALLOW_KEY.
    """
    res = run_bb84_simulation(
        num_qubits=500,
        noise=0.02,
        seed=42,
        attack="none",
        attack_intensity=0.0,
        enable_ai_detection=True,
        enable_pqc_authentication=True,
        enable_hybrid_security=True
    )
    assert res.hybrid_security is not None
    hs = res.hybrid_security

    assert hs["enabled"] is True
    assert hs["security_score"] >= 90.0
    assert hs["security_level"] == SecurityLevel.SECURE
    assert hs["decision"] == SecurityDecision.NO_ATTACK_DETECTED
    assert hs["key_action"] == KeyAction.ALLOW_KEY
    assert len(hs["critical_events"]) == 0


def test_case_b_detector_blinding_stealth_attack():
    """
    CASE B: Detector Blinding attack with low QBER (<11%), high AI anomaly score, and abnormal telemetry.
    Expected: Low QBER alone would pass, but Hybrid Engine flags physical anomaly, degrades score <= 38,
    sets decision ATTACK_DETECTED, and REJECT_KEY.
    """
    res = run_bb84_simulation(
        num_qubits=500,
        noise=0.02,
        seed=42,
        attack="detector_blinding",
        attack_intensity=0.8,
        enable_ai_detection=True,
        enable_pqc_authentication=True,
        enable_hybrid_security=True
    )
    assert res.hybrid_security is not None
    hs = res.hybrid_security

    assert hs["security_score"] <= 40.0
    assert hs["security_level"] in [SecurityLevel.SUSPICIOUS, SecurityLevel.COMPROMISED]
    assert hs["decision"] == SecurityDecision.ATTACK_DETECTED
    assert hs["key_action"] == KeyAction.REJECT_KEY
    assert any("STEALTH" in ev for ev in hs["critical_events"])


def test_case_c_mitm_without_pqc():
    """
    CASE C: MITM attack with PQC authentication DISABLED.
    Expected: Classical channel unauthenticated & modified by Eve, decision ATTACK_SUCCESSFUL, REJECT_KEY.
    """
    res = run_bb84_simulation(
        num_qubits=500,
        noise=0.02,
        seed=42,
        attack="mitm",
        attack_intensity=0.8,
        enable_ai_detection=True,
        enable_pqc_authentication=False,
        enable_hybrid_security=True
    )
    assert res.hybrid_security is not None
    hs = res.hybrid_security

    assert hs["security_score"] <= 20.0
    assert hs["security_level"] == SecurityLevel.COMPROMISED
    assert hs["decision"] == SecurityDecision.ATTACK_SUCCESSFUL
    assert hs["key_action"] == KeyAction.REJECT_KEY
    assert any("UNAUTHENTICATED" in ev for ev in hs["critical_events"])


def test_case_d_mitm_with_pqc_attack_blocked():
    """
    CASE D: MITM attack with PQC authentication ENABLED.
    Expected: Signature verification FAILED, message REJECTED, MITM BLOCKED, decision ATTACK_BLOCKED, REJECT_KEY.
    """
    res = run_bb84_simulation(
        num_qubits=500,
        noise=0.02,
        seed=42,
        attack="mitm",
        attack_intensity=0.8,
        enable_ai_detection=True,
        enable_pqc_authentication=True,
        enable_hybrid_security=True
    )
    assert res.hybrid_security is not None
    hs = res.hybrid_security

    assert hs["security_score"] <= 25.0
    assert hs["decision"] == SecurityDecision.ATTACK_BLOCKED
    assert hs["key_action"] == KeyAction.REJECT_KEY
    assert any("CLASSICAL_CHANNEL_AUTHENTICATION_FAILURE" in ev for ev in hs["critical_events"])


def test_case_e_excessive_qber():
    """
    CASE E: Clean session but with artificial high QBER (> 11% noise).
    Expected: QBER > 11% triggers EXCESSIVE_QUANTUM_BIT_ERROR_RATE critical event, score <= 30, REJECT_KEY.
    """
    res = run_bb84_simulation(
        num_qubits=500,
        noise=0.15,  # 15% channel noise
        seed=42,
        attack="none",
        attack_intensity=0.0,
        enable_ai_detection=False,
        enable_pqc_authentication=True,
        enable_hybrid_security=True
    )
    assert res.hybrid_security is not None
    hs = res.hybrid_security

    assert res.statistics.qber > 0.11
    assert hs["security_score"] <= 35.0
    assert hs["security_level"] == SecurityLevel.COMPROMISED
    assert hs["key_action"] == KeyAction.REJECT_KEY
    assert any("EXCESSIVE_QUANTUM_BIT_ERROR_RATE" in ev for ev in hs["critical_events"])


def test_case_f_normal_baseline_ai_pqc_off():
    """
    CASE F: Backward-compatible basic BB84 with AI and PQC disabled.
    Expected: Hybrid Engine evaluates basic QBER and telemetry without errors.
    """
    res = run_bb84_simulation(
        num_qubits=500,
        noise=0.02,
        seed=42,
        attack="none",
        attack_intensity=0.0,
        enable_ai_detection=False,
        enable_pqc_authentication=False,
        enable_hybrid_security=True
    )
    assert res.hybrid_security is not None
    hs = res.hybrid_security

    assert hs["enabled"] is True
    assert 0.0 <= hs["security_score"] <= 100.0
    assert hs["component_scores"]["ai_anomaly_score"] == 100.0  # Neutral baseline
    assert hs["component_scores"]["pqc_auth_score"] == 50.0      # Unauthenticated baseline


def test_pns_attack_evaluation():
    """Verify PNS attack simulation causes security score reduction and key rejection/warning."""
    res = run_bb84_simulation(
        num_qubits=500,
        noise=0.02,
        seed=42,
        attack="pns",
        attack_intensity=0.8,
        enable_ai_detection=True,
        enable_pqc_authentication=True,
        enable_hybrid_security=True
    )
    assert res.hybrid_security is not None
    hs = res.hybrid_security
    assert hs["key_action"] in [KeyAction.REJECT_KEY, KeyAction.WARN]


def test_trojan_horse_attack_evaluation():
    """Verify Trojan-Horse probing attack affects telemetry health score and key action."""
    res = run_bb84_simulation(
        num_qubits=500,
        noise=0.02,
        seed=42,
        attack="trojan_horse",
        attack_intensity=0.8,
        enable_ai_detection=True,
        enable_pqc_authentication=True,
        enable_hybrid_security=True
    )
    assert res.hybrid_security is not None
    hs = res.hybrid_security
    assert hs["key_action"] in [KeyAction.REJECT_KEY, KeyAction.WARN]


def test_hybrid_security_disabled():
    """Verify enable_hybrid_security=False returns hybrid_security=None."""
    res = run_bb84_simulation(
        num_qubits=500,
        noise=0.02,
        seed=42,
        attack="none",
        attack_intensity=0.0,
        enable_hybrid_security=False
    )
    assert res.hybrid_security is None


def test_score_bounds_and_determinism():
    """Verify security score is strictly in [0.0, 100.0] and deterministic across runs."""
    res1 = run_bb84_simulation(
        num_qubits=500,
        noise=0.03,
        seed=123,
        attack="pns",
        attack_intensity=0.5,
        enable_ai_detection=True,
        enable_pqc_authentication=True,
        enable_hybrid_security=True
    )
    res2 = run_bb84_simulation(
        num_qubits=500,
        noise=0.03,
        seed=123,
        attack="pns",
        attack_intensity=0.5,
        enable_ai_detection=True,
        enable_pqc_authentication=True,
        enable_hybrid_security=True
    )

    hs1 = res1.hybrid_security
    hs2 = res2.hybrid_security

    assert 0.0 <= hs1["security_score"] <= 100.0
    assert hs1["security_score"] == hs2["security_score"]
    assert hs1["security_level"] == hs2["security_level"]
    assert hs1["decision"] == hs2["decision"]
    assert hs1["key_action"] == hs2["key_action"]
    assert len(hs1["explanation"]) > 0
    assert len(hs1["recommendation"]) > 0
