"""
Unit tests for privacy amplification module.
"""

from simulation.privacy_amplification import amplify_privacy


def test_privacy_amplification_derives_key():
    reconciled_key = [1, 0, 1, 1, 0, 1, 0, 0, 1, 1, 0, 1, 1, 0, 0, 1]
    final_hex, final_bits, stats = amplify_privacy(reconciled_key, qber=0.05)

    assert len(final_hex) > 0
    assert len(final_bits) > 0
    assert stats.final_key_length == len(final_bits)
    assert all(b in (0, 1) for b in final_bits)


def test_privacy_amplification_deterministic():
    key = [1, 0, 0, 1, 1, 1, 0, 1]
    hex1, bits1, _ = amplify_privacy(key, 0.0)
    hex2, bits2, _ = amplify_privacy(key, 0.0)

    assert hex1 == hex2
    assert bits1 == bits2
