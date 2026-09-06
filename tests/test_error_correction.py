"""
Unit tests for software-level error correction module.
"""

from simulation.error_correction import reconcile_errors


def test_reconcile_errors_identical_keys():
    a_key = [1, 0, 1, 1, 0, 0, 1, 0]
    b_key = [1, 0, 1, 1, 0, 0, 1, 0]

    rec_key, stats = reconcile_errors(a_key, b_key, qber=0.0)
    assert rec_key == a_key
    assert stats.error_count == 0
    assert stats.sifted_key_length == 8


def test_reconcile_errors_corrects_mismatches():
    a_key = [1, 0, 1, 1, 0, 1, 0, 0, 1, 1]
    b_key = [1, 0, 1, 0, 0, 1, 0, 0, 1, 0]  # Mismatches at idx 3 and idx 9

    rec_key, stats = reconcile_errors(a_key, b_key, qber=0.2)
    assert rec_key == a_key  # Must match Alice's key after reconciliation
    assert stats.error_count == 2
    assert stats.correction_overhead_bits > 0
