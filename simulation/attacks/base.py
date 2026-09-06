"""
Base class and data containers for modular Q-SHIELD attack implementations.
"""

from abc import ABC, abstractmethod
from typing import Tuple, Dict, Any, List, Optional
from dataclasses import dataclass, field
import numpy as np

from simulation.types import QuantumState, Basis, AttackSummary, RoundTelemetry
from simulation.interfaces import IAttackLayer


@dataclass
class AttackPerRoundResult:
    modified_state: QuantumState
    attack_affected: bool
    eve_gained_info: float = 0.0
    detector_event: str = "normal"
    timing_jitter_ps: float = 0.0
    click_rate: float = 1.0
    detection_frequency: float = 1.0
    photon_count_stat: float = 1.0
    burst_rate: float = 0.0
    detector_variance: float = 0.01
    probe_reflection_intensity: float = 0.0
    metadata: Dict[str, Any] = field(default_factory=dict)


class BaseAttackLayer(IAttackLayer, ABC):
    def __init__(self, attack_type: str, intensity: float, rng: np.random.Generator):
        if not (0.0 <= intensity <= 1.0):
            raise ValueError(f"Attack intensity must be in [0.0, 1.0], got {intensity}")
        self.attack_type = attack_type
        self.intensity = intensity
        self.rng = rng
        self.affected_rounds_count = 0
        self.total_rounds_count = 0
        self.accumulated_eve_info = 0.0

    @abstractmethod
    def intercept_qubit(
        self,
        round_index: int,
        prepared_state: QuantumState,
        alice_basis: Basis
    ) -> AttackPerRoundResult:
        """
        Subclasses implement specific quantum state attack logic per qubit round.
        """
        pass

    def intercept_and_resend(
        self,
        round_index: int,
        prepared_state: QuantumState,
        alice_basis: Basis
    ) -> Tuple[QuantumState, Dict[str, Any]]:
        """
        IAttackLayer interface compliance method called by QuantumChannel.
        """
        self.total_rounds_count += 1
        res = self.intercept_qubit(round_index, prepared_state, alice_basis)
        if res.attack_affected:
            self.affected_rounds_count += 1
            self.accumulated_eve_info += res.eve_gained_info

        meta = {
            "attack_affected": res.attack_affected,
            "eve_gained_info": res.eve_gained_info,
            "detector_event": res.detector_event,
            "timing_jitter_ps": res.timing_jitter_ps,
            "click_rate": res.click_rate,
            "detection_frequency": res.detection_frequency,
            "photon_count_stat": res.photon_count_stat,
            "burst_rate": res.burst_rate,
            "detector_variance": res.detector_variance,
            "probe_reflection_intensity": res.probe_reflection_intensity,
            "extra": res.metadata
        }
        return res.modified_state, meta

    def get_summary(self, description: str = "") -> AttackSummary:
        frac = (self.affected_rounds_count / self.total_rounds_count) if self.total_rounds_count > 0 else 0.0
        avg_eve_info = (self.accumulated_eve_info / self.total_rounds_count) if self.total_rounds_count > 0 else 0.0
        return AttackSummary(
            type=self.attack_type,
            enabled=(self.attack_type != "none" and self.intensity > 0.0),
            intensity=round(self.intensity, 3),
            affected_rounds=self.affected_rounds_count,
            affected_fraction=round(frac, 3),
            estimated_eve_information=round(min(1.0, avg_eve_info), 3),
            description=description
        )
