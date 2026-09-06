"""
Stage 4 Post-Quantum Classical Channel Authentication Test Suite (ML-DSA-65 / CRYSTALS-Dilithium).
"""

import pytest
from simulation.engine import run_bb84_simulation
from simulation.pqc import MLDSAAuthenticator


def test_key_generation():
    """Verify ML-DSA-65 keypair generation produces correct public & private key sizes."""
    auth = MLDSAAuthenticator()
    pk, sk = auth.generate_keypair()

    assert pk is not None
    assert sk is not None
    assert len(pk) == 1952  # ML-DSA-65 public key size (bytes)
    assert len(sk) == 4032  # ML-DSA-65 private key size (bytes)
    assert auth.keygen_time_ms >= 0.0


def test_signature_generation_and_verification():
    """Verify genuine cryptographic sign and verify workflow for unmodified message."""
    auth = MLDSAAuthenticator()
    pk, sk = auth.generate_keypair()

    payload = {
        "protocol": "BB84",
        "session_id": "sess_test_123",
        "sender": "alice",
        "receiver": "bob",
        "message_type": "basis_reconciliation",
        "bases": "++×+×++×",
        "sequence": 1
    }
    canonical_bytes = auth.canonicalize_message(payload)

    # 1. Sign
    sig, sign_time = auth.sign(sk, canonical_bytes)
    assert sig is not None
    assert len(sig) == 3309  # ML-DSA-65 signature size (bytes)
    assert sign_time >= 0.0

    # 2. Verify Original Message
    is_valid, ver_time = auth.verify(pk, canonical_bytes, sig)
    assert is_valid is True
    assert ver_time >= 0.0


def test_direct_tampering_detection():
    """
    CRITICAL CRYPTOGRAPHIC REQUIREMENT:
    Verify that altering even a single basis character in the message causes signature verification to FAIL.
    """
    auth = MLDSAAuthenticator()
    pk, sk = auth.generate_keypair()

    original_payload = {
        "protocol": "BB84",
        "session_id": "sess_test_123",
        "sender": "alice",
        "receiver": "bob",
        "message_type": "basis_reconciliation",
        "bases": "++++",
        "sequence": 1
    }
    original_bytes = auth.canonicalize_message(original_payload)
    sig, _ = auth.sign(sk, original_bytes)

    # Tamper message
    tampered_payload = dict(original_payload)
    tampered_payload["bases"] = "+++×"  # Single character altered by Eve
    tampered_bytes = auth.canonicalize_message(tampered_payload)

    # Verify tampered message against original signature
    is_valid, _ = auth.verify(pk, tampered_bytes, sig)
    assert is_valid is False  # Must return FALSE


def test_session_replay_and_binding_protection():
    """
    Verify cross-session replay protection: A valid signature from session_A
    fails verification when replayed under session_B context.
    """
    auth = MLDSAAuthenticator()
    pk, sk = auth.generate_keypair()

    sess_a_payload = {
        "protocol": "BB84",
        "session_id": "session_A",
        "sender": "alice",
        "receiver": "bob",
        "message_type": "basis_reconciliation",
        "bases": "++×+",
        "sequence": 1
    }
    bytes_a = auth.canonicalize_message(sess_a_payload)
    sig_a, _ = auth.sign(sk, bytes_a)

    # Attempt replay under Session B
    sess_b_payload = dict(sess_a_payload)
    sess_b_payload["session_id"] = "session_B"
    bytes_b = auth.canonicalize_message(sess_b_payload)

    is_valid_b, _ = auth.verify(pk, bytes_b, sig_a)
    assert is_valid_b is False  # Replay must FAIL


def test_clean_bb84_with_pqc_authentication():
    """Verify clean BB84 session with PQC authentication enabled."""
    res = run_bb84_simulation(
        num_qubits=500,
        noise=0.02,
        seed=42,
        attack="none",
        attack_intensity=0.0,
        enable_pqc_authentication=True
    )
    assert res.pqc_authentication is not None
    pqc = res.pqc_authentication

    assert pqc["enabled"] is True
    assert "ML-DSA-65" in pqc["algorithm"]
    assert pqc["signature_generated"] is True
    assert pqc["signature_valid"] is True
    assert pqc["message_modified"] is False
    assert pqc["message_accepted"] is True
    assert pqc["mitm_blocked"] is False
    assert pqc["public_key_bytes"] == 1952
    assert pqc["signature_bytes"] == 3309


def test_mitm_without_pqc_authentication():
    """Verify Stage 2 baseline MITM attack when PQC authentication is DISABLED."""
    res = run_bb84_simulation(
        num_qubits=500,
        noise=0.02,
        seed=42,
        attack="mitm",
        attack_intensity=0.8,
        enable_pqc_authentication=False
    )
    assert res.mitm.message_intercepted is True
    assert res.mitm.message_modified is True
    assert res.pqc_authentication is None


def test_mitm_with_pqc_authentication_mitm_blocked():
    """
    CRITICAL DEMONSTRATION:
    When Eve tampers with the classical basis reconciliation message under MITM attack,
    PQC Authentication detects invalid signature, rejects message, and sets mitm_blocked=True.
    """
    res = run_bb84_simulation(
        num_qubits=500,
        noise=0.02,
        seed=42,
        attack="mitm",
        attack_intensity=0.8,
        enable_pqc_authentication=True
    )
    assert res.pqc_authentication is not None
    pqc = res.pqc_authentication

    assert pqc["enabled"] is True
    assert pqc["signature_generated"] is True
    assert pqc["message_modified"] is True
    assert pqc["signature_valid"] is False
    assert pqc["message_accepted"] is False
    assert pqc["mitm_blocked"] is True
    assert "REJECTED" in pqc["explanation"]


def test_detector_blinding_plus_ai_plus_pqc_authentication():
    """
    Verify independent co-existence of Stage 3 AI Anomaly Detector
    and Stage 4 PQC Classical Channel Authentication.
    """
    res = run_bb84_simulation(
        num_qubits=500,
        noise=0.02,
        seed=42,
        attack="detector_blinding",
        attack_intensity=0.7,
        enable_ai_detection=True,
        enable_pqc_authentication=True
    )

    # 1. AI Detector flags physical telemetry anomaly
    assert res.ai_detection is not None
    assert res.ai_detection["status"] == "ATTACK_DETECTED"
    assert res.ai_detection["stealth_attack_detected"] is True

    # 2. PQC Authenticator verifies classical channel (no classical tampering in blinding attack)
    assert res.pqc_authentication is not None
    assert res.pqc_authentication["signature_valid"] is True
    assert res.pqc_authentication["message_accepted"] is True
    assert res.pqc_authentication["mitm_blocked"] is False
