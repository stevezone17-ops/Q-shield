"""
Simulated Quantum Channel with Configurable Channel Noise.

Noise Architecture:
  Noise represents fiber loss, thermal noise, dark counts, and depolarizing channel effects.
  With probability `noise`, the qubit undergoes a depolarizing transformation (or bit-flip),
  which directly alters Bob's measurement probabilities.

Future Extension Point:
  The channel supports optional insertion of an `attack_layer` (Eve) between Alice and Bob.
"""

from typing import Optional, Tuple, Dict, Any
import numpy as np
from simulation.types import QuantumState, Basis
from simulation.states import STATE_VECTORS, get_state_vector
from simulation.interfaces import IAttackLayer


class QuantumChannel:
    def __init__(self, noise: float, rng: np.random.Generator, attack_layer: Optional[IAttackLayer] = None):
        """
        :param noise: Depolarizing noise probability (0.0 to 1.0)
        :param rng: NumPy random generator
        :param attack_layer: Optional Stage 2 Eve extension point
        """
        if not (0.0 <= noise <= 1.0):
            raise ValueError(f"Channel noise must be in range [0.0, 1.0], got {noise}")
        self.noise = noise
        self.rng = rng
        self.attack_layer = attack_layer

    def transmit(
        self,
        round_index: int,
        prepared_state: QuantumState,
        alice_basis: Basis
    ) -> Tuple[QuantumState, Dict[str, Any]]:
        """
        Transmit a quantum state through the channel.
        Applies optional attack layer, then channel depolarizing noise.
        Returns the transmitted state and diagnostic telemetry.
        """
        current_state = prepared_state
        telemetry: Dict[str, Any] = {"noise_applied": False, "attack_telemetry": None}

        # Stage 2 Extension: Intercept-and-Resend / Attack layer
        if self.attack_layer is not None:
            current_state, attack_meta = self.attack_layer.intercept_and_resend(
                round_index, current_state, alice_basis
            )
            telemetry["attack_telemetry"] = attack_meta

        # Channel Noise: Depolarizing / Bit-Flip effect
        if self.noise > 0.0:
            if self.rng.random() < self.noise:
                telemetry["noise_applied"] = True
                # Bit flip effect: |0> <-> |1>, |+> <-> |->
                if current_state == QuantumState.ZERO:
                    current_state = QuantumState.ONE
                elif current_state == QuantumState.ONE:
                    current_state = QuantumState.ZERO
                elif current_state == QuantumState.PLUS:
                    current_state = QuantumState.MINUS
                elif current_state == QuantumState.MINUS:
                    current_state = QuantumState.PLUS

        return current_state, telemetry
