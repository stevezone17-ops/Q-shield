"""
Stage 2 Eavesdropping & Attack Simulation Test Suite.
"""

import pytest
from simulation.engine import run_bb84_simulation
from simulation.types import AttackType


def test_no_attack_baseline():
    """Verify that attack='none' preserves Stage 1 baseline behavior."""
    res = run_bb84_simulation(num_qubits=500, noise=0.02, seed=42, attack="none", attack_intensity=0.0)
    assert res.attack.type == "none"
    assert res.attack.enabled is False
    assert res.attack.affected_rounds == 0
    assert res.attack.estimated_eve_information == 0.0
    assert res.mitm.message_modified is False
    assert len(res.telemetry) == 500


def test_pns_attack():
    """Verify Photon-Number-Splitting attack captures Eve information without spiking QBER."""
    res = run_bb84_simulation(num_qubits=500, noise=0.02, seed=42, attack="pns", attack_intensity=0.7)
    assert res.attack.type == "pns"
    assert res.attack.enabled is True
    assert res.attack.affected_rounds > 0
    assert res.attack.estimated_eve_information > 0.0
    # PNS should keep QBER near baseline noise level (~2-5%)
    assert res.statistics.qber <= 0.08


def test_trojan_horse_attack():
    """Verify Trojan-Horse probing attack generates probe reflection anomalies."""
    res = run_bb84_simulation(num_qubits=500, noise=0.02, seed=42, attack="trojan_horse", attack_intensity=0.6)
    assert res.attack.type == "trojan_horse"
    assert res.attack.enabled is True
    assert res.attack.affected_rounds > 0
    assert res.attack.estimated_eve_information > 0.0

    # Verify telemetry records probe reflection intensity spike on affected rounds
    affected_telemetry = [t for t in res.telemetry if t.probe_reflection_intensity > 0.1]
    assert len(affected_telemetry) > 0


def test_detector_blinding_attack():
    """Verify Detector-Blinding attack creates abnormal telemetry while preserving reasonable QBER."""
    res = run_bb84_simulation(num_qubits=500, noise=0.02, seed=42, attack="detector_blinding", attack_intensity=0.7)
    assert res.attack.type == "detector_blinding"
    assert res.attack.enabled is True
    assert res.attack.affected_rounds > 0
    assert res.attack.estimated_eve_information > 0.0

    # Dedicated stealth check: QBER < 11% security threshold
    assert res.statistics.qber < 0.11

    # Verify abnormal detector telemetry signals (timing jitter > 60ps, detector variance > 0.1)
    abnormal_jitter = [t for t in res.telemetry if t.timing_jitter > 60.0]
    assert len(abnormal_jitter) > 0


def test_mitm_classical_attack():
    """Verify Man-in-the-Middle attack intercepts and modifies unauthenticated classical messages."""
    res = run_bb84_simulation(num_qubits=500, noise=0.02, seed=42, attack="mitm", attack_intensity=0.8)
    assert res.attack.type == "mitm"
    assert res.attack.enabled is True
    assert res.mitm.message_intercepted is True
    assert res.mitm.message_modified is True
    assert res.mitm.original_message != res.mitm.modified_message


def test_attack_intensity_scaling():
    """Verify scaling intensity from 0.0 to 1.0 increases affected rounds proportionally."""
    res_0 = run_bb84_simulation(num_qubits=500, noise=0.02, seed=42, attack="pns", attack_intensity=0.0)
    res_50 = run_bb84_simulation(num_qubits=500, noise=0.02, seed=42, attack="pns", attack_intensity=0.5)
    res_100 = run_bb84_simulation(num_qubits=500, noise=0.02, seed=42, attack="pns", attack_intensity=1.0)

    assert res_0.attack.affected_rounds == 0
    assert res_50.attack.affected_rounds < res_100.attack.affected_rounds


def test_seed_reproducibility():
    """Verify deterministic seed reproducibility across attack simulations."""
    res_a = run_bb84_simulation(num_qubits=500, noise=0.02, seed=42, attack="detector_blinding", attack_intensity=0.7)
    res_b = run_bb84_simulation(num_qubits=500, noise=0.02, seed=42, attack="detector_blinding", attack_intensity=0.7)
    res_diff = run_bb84_simulation(num_qubits=500, noise=0.02, seed=99, attack="detector_blinding", attack_intensity=0.7)

    assert res_a.statistics.qber == res_b.statistics.qber
    assert res_a.attack.affected_rounds == res_b.attack.affected_rounds
    assert res_a.final_secret_key_hex == res_b.final_secret_key_hex
    assert res_a.final_secret_key_hex != res_diff.final_secret_key_hex


def test_performance_scaling_with_attacks():
    """Verify simulation execution time remains fast across 100, 500, and 1000 qubits."""
    for n in [100, 500, 1000]:
        for atk in ["none", "pns", "trojan_horse", "detector_blinding", "mitm"]:
            res = run_bb84_simulation(num_qubits=n, noise=0.02, seed=42, attack=atk, attack_intensity=0.5)
            assert res.execution_time_ms < 500.0  # Must be fast
