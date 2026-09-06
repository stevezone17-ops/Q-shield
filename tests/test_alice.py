"""
Unit tests for Alice module.
"""

import pytest
import numpy as np
from simulation.alice import Alice
from simulation.types import Basis


def test_alice_bit_and_basis_generation():
    rng = np.random.default_rng(42)
    alice = Alice(rng)

    num_qubits = 100
    bits, bases = alice.generate_bits_and_bases(num_qubits)

    assert len(bits) == num_qubits
    assert len(bases) == num_qubits
    assert all(b in (0, 1) for b in bits)
    assert all(isinstance(b, Basis) for b in bases)


def test_alice_reproducibility():
    rng1 = np.random.default_rng(123)
    alice1 = Alice(rng1)
    bits1, bases1 = alice1.generate_bits_and_bases(50)

    rng2 = np.random.default_rng(123)
    alice2 = Alice(rng2)
    bits2, bases2 = alice2.generate_bits_and_bases(50)

    assert bits1 == bits2
    assert bases1 == bases2
