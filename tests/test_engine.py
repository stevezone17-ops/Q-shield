"""
Integration tests for BB84 Simulation Engine verifying required test cases:
  Case 1: Zero Noise
  Case 2: Moderate Noise
  Case 3: High Noise
  Case 4: Reproducibility
  Case 5: Different Seeds
  Performance Tests (100, 500, 1000 qubits)
"""

import pytest
from simulation.engine import run_bb84_simulation


def test_case_1_zero_noise():
    res = run_bb84_simulation(num_qubits=500, noise=0.0, seed=42)
    assert res.config.num_qubits == 500
    assert res.statistics.qber == 0.0
    assert res.error_correction.error_count == 0
    # ~50% retained matching bases probabilistically
    assert 200 <= res.statistics.retained <= 300


def test_case_2_moderate_noise():
    res = run_bb84_simulation(num_qubits=500, noise=0.05, seed=42)
    assert res.statistics.qber > 0.0
    assert res.error_correction.error_count > 0


def test_case_3_high_noise():
    res_mod = run_bb84_simulation(num_qubits=500, noise=0.05, seed=42)
    res_high = run_bb84_simulation(num_qubits=500, noise=0.15, seed=42)

    assert res_high.statistics.qber >= res_mod.statistics.qber


def test_case_4_reproducibility():
    res1 = run_bb84_simulation(num_qubits=500, noise=0.02, seed=42)
    res2 = run_bb84_simulation(num_qubits=500, noise=0.02, seed=42)

    assert res1.statistics.qber == res2.statistics.qber
    assert res1.alice_sifted_key == res2.alice_sifted_key
    assert res1.bob_sifted_key == res2.bob_sifted_key
    assert res1.final_secret_key_hex == res2.final_secret_key_hex


def test_case_5_different_seeds():
    res1 = run_bb84_simulation(num_qubits=500, noise=0.02, seed=42)
    res2 = run_bb84_simulation(num_qubits=500, noise=0.02, seed=100)

    assert res1.alice_sifted_key != res2.alice_sifted_key


@pytest.mark.parametrize("n_qubits", [100, 500, 1000])
def test_performance(n_qubits):
    res = run_bb84_simulation(num_qubits=n_qubits, noise=0.02, seed=42)
    assert res.execution_time_ms < 500.0  # Fast execution (< 500ms)
    assert len(res.rounds) == n_qubits
