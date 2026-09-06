"""
BB84 Quantum State Preparation and Mathematics.

State Mappings:
  Rectilinear basis (+):
    bit 0 -> |0> = [1, 0]^T
    bit 1 -> |1> = [0, 1]^T

  Diagonal basis (×):
    bit 0 -> |+> = 1/√2 (|0> + |1>) = [1/√2, 1/√2]^T
    bit 1 -> |-> = 1/√2 (|0> - |1>) = [1/√2, -1/√2]^T
"""

import numpy as np
from simulation.types import Basis, QuantumState

SQRT2_INV = 1.0 / np.sqrt(2.0)

# Quantum state vector representations (2D complex arrays)
STATE_VECTORS = {
    QuantumState.ZERO: np.array([1.0, 0.0], dtype=complex),
    QuantumState.ONE: np.array([0.0, 1.0], dtype=complex),
    QuantumState.PLUS: np.array([SQRT2_INV, SQRT2_INV], dtype=complex),
    QuantumState.MINUS: np.array([SQRT2_INV, -SQRT2_INV], dtype=complex),
}


def prepare_state(bit: int, basis: Basis) -> QuantumState:
    """
    Prepare quantum state according to BB84 protocol rules.
    """
    if basis == Basis.RECTILINEAR:
        return QuantumState.ZERO if bit == 0 else QuantumState.ONE
    else:
        return QuantumState.PLUS if bit == 0 else QuantumState.MINUS


def get_state_vector(state: QuantumState) -> np.ndarray:
    """
    Get 2D complex state vector for quantum simulation calculations.
    """
    return STATE_VECTORS[state]
