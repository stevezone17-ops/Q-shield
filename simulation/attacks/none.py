"""
No-Attack Baseline Implementation for BB84 Simulation.
Leaves quantum state unmodified and maintains Stage 1 channel statistics.
"""

from typing import Any
import numpy as np
from simulation.types import QuantumState, Basis, AttackSummary
from simulation.attacks.base import BaseAttackLayer, AttackPerRoundResult


class NoAttack(BaseAttackLayer):
    def __init__(self, intensity: float, rng: np.random.Generator):
        super().__init__(attack_type="none", intensity=0.0, rng=rng)

    def intercept_qubit(
        self,
        round_index: int,
        prepared_state: QuantumState,
        alice_basis: Basis
    ) -> AttackPerRoundResult:
        return AttackPerRoundResult(
            modified_state=prepared_state,
            attack_affected=False,
            eve_gained_info=0.0,
            detector_event="normal",
            timing_jitter_ps=round(float(self.rng.normal(15.0, 2.0)), 2),
            click_rate=1.0,
            detection_frequency=1.0,
            photon_count_stat=1.0,
            burst_rate=0.0,
            detector_variance=0.01,
            probe_reflection_intensity=0.0
        )

    def get_summary(self, description: str = "") -> Any:
        return super().get_summary(description="No attack active. Baseline Quantum Channel transmission.")
