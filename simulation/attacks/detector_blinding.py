"""
Detector-Blinding Attack Model.

Model:
  Eve shines bright continuous-wave/pulsed lasers onto Bob's Single-Photon Avalanche Diodes (SPADs),
  forcing detectors into linear mode and controlling click triggers.
  
Key Demonstration Feature:
  - Keeps QBER below conventional security threshold (< 11%, often ~ 1-3%).
  - Alters detector telemetry: timing jitter spikes (>80 ps), detector response variance increases (>0.25),
    burst rate increases, and click rate shifts.
  - Essential input baseline for Stage 3 AI/ML anomaly detection.
"""

from typing import Any
import numpy as np
from simulation.types import QuantumState, Basis, AttackSummary
from simulation.states import prepare_state
from simulation.attacks.base import BaseAttackLayer, AttackPerRoundResult


class DetectorBlindingAttack(BaseAttackLayer):
    def __init__(self, intensity: float, rng: np.random.Generator):
        super().__init__(attack_type="detector_blinding", intensity=intensity, rng=rng)

    def intercept_qubit(
        self,
        round_index: int,
        prepared_state: QuantumState,
        alice_basis: Basis
    ) -> AttackPerRoundResult:
        p_blind = self.intensity

        if self.rng.random() < p_blind:
            # Eve measures in random basis and sends tailored blinding pulse to Bob
            eve_basis = Basis(self.rng.integers(0, 2))

            # If Eve's basis matches Alice's basis, state sent to Bob matches Alice's state
            # If mismatched, state is tailored pulse that triggers only in matching basis
            if eve_basis == alice_basis:
                res_state = prepared_state
                eve_info = 1.0
            else:
                # Tailored pulse causes minimal bit error when detected
                res_state = prepared_state if self.rng.random() < 0.85 else (
                    QuantumState.ZERO if prepared_state == QuantumState.ONE else QuantumState.ONE
                )
                eve_info = 0.5

            # Abnormal detector telemetry signals
            timing_jitter = round(float(85.0 + self.intensity * 60.0 + self.rng.normal(0, 8.0)), 2)
            detector_var = round(float(0.18 + self.intensity * 0.25 + self.rng.normal(0, 0.02)), 3)
            click_r = round(float(0.55 + self.rng.normal(0, 0.05)), 2)
            burst_r = round(float(0.35 + self.intensity * 0.3 + self.rng.normal(0, 0.04)), 3)

            return AttackPerRoundResult(
                modified_state=res_state,
                attack_affected=True,
                eve_gained_info=eve_info,
                detector_event="blinded_click",
                timing_jitter_ps=timing_jitter,
                click_rate=click_r,
                detection_frequency=0.65,
                photon_count_stat=3.2 + self.intensity * 2.0,
                burst_rate=burst_r,
                detector_variance=detector_var,
                probe_reflection_intensity=0.15,
                metadata={"laser_power_mw": 5.2, "spad_mode": "linear_blinded"}
            )
        else:
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
            description="Detector-Blinding Attack: Eve forces detectors into linear mode with bright laser illumination. Maintains low QBER while generating statistically abnormal detector telemetry."
        )
