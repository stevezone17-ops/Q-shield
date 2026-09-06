"""
Alice module for BB84 QKD Simulation.
Generates random binary secret key bits and preparation bases.
"""

from typing import List, Tuple
import numpy as np
from simulation.types import Basis


class Alice:
    def __init__(self, rng: np.random.Generator):
        self.rng = rng

    def generate_bits_and_bases(self, num_qubits: int) -> Tuple[List[int], List[Basis]]:
        """
        Generate `num_qubits` random bits (0 or 1) and random bases (Rectilinear or Diagonal).
        """
        raw_bits = self.rng.integers(0, 2, size=num_qubits).tolist()
        raw_bases = [Basis(b) for b in self.rng.integers(0, 2, size=num_qubits)]
        return raw_bits, raw_bases
