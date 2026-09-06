"""
Photon-Number-Splitting (PNS) Attack Model.

Model:
  Simulates multi-photon pulse emission in weak coherent pulse (WCP) sources.
  With probability proportional to `attack_intensity`, multi-photon pulses occur.
  Eve splits off one photon into quantum memory without disturbing the photon forwarded to Bob.
  - Eve gains bit information upon basis announcement.
  - Bob receives state untouched -> QBER does NOT increase significantly!
"""

from typing import Any
import numpy as np
from simulation.types import QuantumState, Basis, AttackSummary
from simulation.attacks.base import BaseAttackLayer, AttackPerRoundResult


class PNSAttack(BaseAttackLayer):
    def __init__(self, intensity: float, rng: np.random.Generator):
        super().__init__(attack_type="pns", intensity=intensity, rng=rng)

    def intercept_qubit(
        self,
        round_index: int,
        prepared_state: QuantumState,
        alice_basis: Basis
    ) -> AttackPerRoundResult:
        # Probability of multi-photon pulse event proportional to intensity (up to 45%)
        p_split = self.intensity * 0.45

        if self.rng.random() < p_split:
            # Eve splits multi-photon pulse, stores extra photon in quantum memory
            # Bob receives original state untouched
            return AttackPerRoundResult(
                modified_state=prepared_state,  # Untouched state to Bob
                attack_affected=True,
                eve_gained_info=1.0,  # Full information gained on multi-photon pulse
                detector_event="multi_photon_split",
                timing_jitter_ps=round(float(self.rng.normal(16.0, 2.5)), 2),
                click_rate=1.0,
                detection_frequency=1.05,
                photon_count_stat=1.8 + self.intensity * 0.5,
                burst_rate=0.02,
                detector_variance=0.02,
                probe_reflection_intensity=0.05 * self.intensity
            )
        else:
            # Single-photon pulse -> Eve passes untouched
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
        return super().get_summary(
            description="Photon-Number-Splitting Attack: Eve splits multi-photon pulses to gain key info without inducing significant QBER."
        )
