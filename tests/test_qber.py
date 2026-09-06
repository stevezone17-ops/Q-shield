"""
Unit tests for QBER calculation.
"""

import pytest
from simulation.qber import calculate_qber


def test_qber_zero_errors():
    a_key = [1, 0, 1, 1, 0]
    b_key = [1, 0, 1, 1, 0]

    qber, errors, total = calculate_qber(a_key, b_key)
    assert qber == 0.0
    assert errors == 0
    assert total == 5


def test_qber_with_mismatches():
    a_key = [1, 0, 1, 1, 0]
    b_key = [1, 1, 1, 0, 0]  # 2 mismatches out of 5

    qber, errors, total = calculate_qber(a_key, b_key)
    assert qber == 0.4
    assert errors == 2
    assert total == 5


def test_qber_empty():
    qber, errors, total = calculate_qber([], [])
    assert qber == 0.0
    assert errors == 0
    assert total == 0
