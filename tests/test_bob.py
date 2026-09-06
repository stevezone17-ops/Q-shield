"""
Unit tests for Bob basis selection and Born-rule state measurement.
"""

import pytest
import numpy as np
from simulation.bob import Bob
from simulation.types import Basis, QuantumState


def test_bob_deterministic_same_basis_measurement():
    rng = np.random.default_rng(42)
    bob = Bob(rng)

    # Rectilinear |0> with rectilinear basis -> bit 0
    assert bob.measure(QuantumState.ZERO, Basis.RECTILINEAR) == 0
    # Rectilinear |1> with rectilinear basis -> bit 1
    assert bob.measure(QuantumState.ONE, Basis.RECTILINEAR) == 1
    # Diagonal |+> with diagonal basis -> bit 0
    assert bob.measure(QuantumState.PLUS, Basis.DIAGONAL) == 0
    # Diagonal |-> with diagonal basis -> bit 1
    assert bob.measure(QuantumState.MINUS, Basis.DIAGONAL) == 1


def test_bob_mismatched_basis_probabilistic():
    rng = np.random.default_rng(100)
    bob = Bob(rng)

    measurements = [bob.measure(QuantumState.ZERO, Basis.DIAGONAL) for _ in range(1000)]
    zeros = measurements.count(0)
    ones = measurements.count(1)

    # Born's rule predict ~500 zeros and ~500 ones
    assert 400 <= zeros <= 600
    assert 400 <= ones <= 600
