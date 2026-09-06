"""
Unit tests for quantum state preparation and state vectors.
"""

import pytest
import numpy as np
from simulation.types import Basis, QuantumState
from simulation.states import prepare_state, get_state_vector


def test_prepare_state_mapping():
    assert prepare_state(0, Basis.RECTILINEAR) == QuantumState.ZERO
    assert prepare_state(1, Basis.RECTILINEAR) == QuantumState.ONE
    assert prepare_state(0, Basis.DIAGONAL) == QuantumState.PLUS
    assert prepare_state(1, Basis.DIAGONAL) == QuantumState.MINUS


def test_state_vector_normalization():
    for state in [QuantumState.ZERO, QuantumState.ONE, QuantumState.PLUS, QuantumState.MINUS]:
        vec = get_state_vector(state)
        norm = np.linalg.norm(vec)
        assert np.isclose(norm, 1.0)
