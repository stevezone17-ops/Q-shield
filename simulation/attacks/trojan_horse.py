"""
Trojan-Horse Attack Model.

Model:
  Eve sends bright optical probe pulses into Alice's/Bob's internal optics.
  Eve analyzes back-reflected signals to extract state/basis settings.
  - Produces high probe reflection intensity anomalies.
  - Induces minor timing anomalies.
  - Leaves target quantum state largely unmodified (low QBER impact).
"""

from typing import Any
import numpy as np
from simulation.types import QuantumState, Basis, AttackSummary
from simulation.attacks.base import BaseAttackLayer, AttackPerRoundResult


class TrojanHorseAttack(BaseAttackLayer):
    def __init__(self, intensity: float, rng: np.random.Generator):
        super().__init__(attack_type="trojan_horse", intensity=intensity, rng=rng)

    def intercept_qubit(
        self,
        round_index: int,
        prepared_state: QuantumState,
        alice_basis: Basis
    ) -> AttackPerRoundResult:
        p_probe = self.intensity * 0.65

        if self.rng.random() < p_probe:
            # Eve probes internal state, generating back-reflection anomaly
            reflection_intensity = round(float(0.4 + self.intensity * 0.55 + self.rng.normal(0, 0.05)), 3)
            timing_jitter = round(float(25.0 + self.intensity * 35.0 + self.rng.normal(0, 5.0)), 2)
            eve_info = round(float(0.6 + self.intensity * 0.35), 2)

            return AttackPerRoundResult(
                modified_state=prepared_state,  # State remains largely untouched
                attack_affected=True,
                eve_gained_info=eve_info,
                detector_event="probe_reflected",
                timing_jitter_ps=timing_jitter,
                click_rate=1.02,
                detection_frequency=1.1,
                photon_count_stat=1.2,
                burst_rate=0.01,
                detector_variance=0.03,
                probe_reflection_intensity=reflection_intensity,
                metadata={"probe_wavelength_nm": 1550, "backscatter_db": -22.5}
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
            description="Trojan-Horse Attack: Eve injects optical probes into internal modulators, producing back-reflection anomalies with low QBER impact."
        )
