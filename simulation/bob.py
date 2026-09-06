"""
Bob module for BB84 QKD Simulation.
Generates measurement bases and performs quantum state measurements using Born's rule.
"""

from typing import List, Tuple
import numpy as np
from simulation.types import Basis, QuantumState
from simulation.states import get_state_vector, STATE_VECTORS


class Bob:
    def __init__(self, rng: np.random.Generator):
        self.rng = rng

    def generate_bases(self, num_qubits: int) -> List[Basis]:
        """
        Generate `num_qubits` random measurement bases.
        """
        return [Basis(b) for b in self.rng.integers(0, 2, size=num_qubits)]

    def measure(self, incoming_state: QuantumState, bob_basis: Basis) -> int:
        """
        Perform quantum measurement on incoming state using specified Bob basis.
        Calculates measurement probability via inner products (Born's rule):
          P(bit = 0) = |<basis_0|state>|^2
          P(bit = 1) = |<basis_1|state>|^2
        """
        # Determine basis states for Bob's chosen basis
        if bob_basis == Basis.RECTILINEAR:
            basis_state_0 = STATE_VECTORS[QuantumState.ZERO]
            basis_state_1 = STATE_VECTORS[QuantumState.ONE]
        else:
            basis_state_0 = STATE_VECTORS[QuantumState.PLUS]
            basis_state_1 = STATE_VECTORS[QuantumState.MINUS]

        state_vec = get_state_vector(incoming_state)

        # Calculate projection amplitudes
        prob_0 = np.abs(np.vdot(basis_state_0, state_vec)) ** 2
        prob_1 = np.abs(np.vdot(basis_state_1, state_vec)) ** 2

        # Normalize probabilities for numerical stability
        total_prob = prob_0 + prob_1
        prob_0 = prob_0 / total_prob
        prob_1 = 1.0 - prob_0

        # Sample measurement outcome
        measured_bit = 0 if self.rng.random() < prob_0 else 1
        return measured_bit
