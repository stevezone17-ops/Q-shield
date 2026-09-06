"""
Quantum Bit Error Rate (QBER) Calculation Module.

QBER = Mismatched Retained Bits / Total Retained Bits
"""

from typing import List, Tuple


def calculate_qber(alice_sifted_key: List[int], bob_sifted_key: List[int]) -> Tuple[float, int, int]:
    """
    Calculate genuine QBER from sifted keys.
    Returns:
      - qber (float 0.0 to 1.0)
      - error_count (int)
      - total_retained (int)
    """
    if len(alice_sifted_key) != len(bob_sifted_key):
        raise ValueError("Alice and Bob sifted key lengths must be equal.")

    total_retained = len(alice_sifted_key)
    if total_retained == 0:
        return 0.0, 0, 0

    error_count = sum(a != b for a, b in zip(alice_sifted_key, bob_sifted_key))
    qber = float(error_count) / float(total_retained)

    return qber, error_count, total_retained
