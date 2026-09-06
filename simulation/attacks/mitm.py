"""
Man-in-the-Middle (MITM) Attack Model on Quantum and Classical Channels.

Model:
  Eve intercepts quantum state transmissions (intercept-resend) and tampers with unauthenticated
  classical basis reconciliation communications.
  - Generates classical message tampering telemetry (original vs modified message).
  - Exposes `message_modified = True` for Stage 4 Post-Quantum Authentication validation.
"""

from typing import Any
import numpy as np
from simulation.types import QuantumState, Basis, MITMMetadata, AttackSummary
from simulation.states import prepare_state
from simulation.attacks.base import BaseAttackLayer, AttackPerRoundResult


class MITMAttack(BaseAttackLayer):
    def __init__(self, intensity: float, rng: np.random.Generator):
        super().__init__(attack_type="mitm", intensity=intensity, rng=rng)
        self.mitm_metadata = MITMMetadata(
            message_intercepted=False,
            message_modified=False,
            original_message=None,
            modified_message=None
        )

    def intercept_qubit(
        self,
        round_index: int,
        prepared_state: QuantumState,
        alice_basis: Basis
    ) -> AttackPerRoundResult:
        p_intercept = self.intensity * 0.7

        if self.rng.random() < p_intercept:
            # Eve measures state in random basis
            eve_basis = Basis(self.rng.integers(0, 2))
            eve_measured_bit = self.rng.integers(0, 2)
            res_state = prepare_state(eve_measured_bit, eve_basis)

            timing_jitter = round(float(40.0 + self.intensity * 30.0 + self.rng.normal(0, 4.0)), 2)

            return AttackPerRoundResult(
                modified_state=res_state,
                attack_affected=True,
                eve_gained_info=0.5,
                detector_event="classical_altered",
                timing_jitter_ps=timing_jitter,
                click_rate=0.9,
                detection_frequency=0.95,
                photon_count_stat=1.1,
                burst_rate=0.08,
                detector_variance=0.08,
                probe_reflection_intensity=0.0,
                metadata={"mitm_channel": "classical_unauthenticated"}
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

    def execute_classical_mitm(self, alice_bases_str: str) -> MITMMetadata:
        """
        Intercepts and modifies classical basis string transmitted by Alice over public channel.
        """
        if self.intensity <= 0.0 or not alice_bases_str:
            return MITMMetadata(
                message_intercepted=False,
                message_modified=False,
                original_message=alice_bases_str,
                modified_message=alice_bases_str
            )

        # Alter bases at positions governed by attack intensity
        bases_list = list(alice_bases_str)
        num_alterations = max(1, int(len(bases_list) * self.intensity * 0.2))

        indices = self.rng.choice(len(bases_list), size=num_alterations, replace=False)
        for idx in indices:
            # Flip basis char ('+' <-> 'x')
            bases_list[idx] = 'x' if bases_list[idx] == '+' else '+'

        modified_str = "".join(bases_list)
        self.mitm_metadata = MITMMetadata(
            message_intercepted=True,
            message_modified=True,
            original_message=alice_bases_str[:64] + ("..." if len(alice_bases_str) > 64 else ""),
            modified_message=modified_str[:64] + ("..." if len(modified_str) > 64 else "")
        )
        return self.mitm_metadata

    def get_summary(self, description: str = "") -> Any:
        return super().get_summary(
            description="Man-in-the-Middle Attack: Eve intercepts quantum states and modifies unauthenticated classical basis reconciliation messages."
        )
