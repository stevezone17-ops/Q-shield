"""
Abstract extension points for future Q-SHIELD stages (Eve/Attacks, AI/ML Anomaly Detection, PQC Authentication, Hybrid Security Engine).
These interfaces allow clean decoupled extension without modifying the Stage 1 core protocol flow.
"""

from abc import ABC, abstractmethod
from typing import List, Dict, Any, Tuple
from simulation.types import TransmissionRound, SimulationConfig, Basis, QuantumState


class IAttackLayer(ABC):
    """
    Extension point for Stage 2 (Eavesdropping & Attacks: Eve Intercept-Resend, PNS, Trojan-Horse, Blinding, MITM).
    """
    @abstractmethod
    def intercept_and_resend(
        self,
        round_index: int,
        prepared_state: QuantumState,
        alice_basis: Basis
    ) -> Tuple[QuantumState, Dict[str, Any]]:
        """
        Intercept Alice's qubit, perform simulated measurement/attack, and pass a state to Bob.
        Returns modified/unmodified state and telemetry metadata.
        """
        pass


class IAIDetector(ABC):
    """
    Extension point for Stage 3 (AI/ML Anomaly Detection).
    """
    @abstractmethod
    def analyze_rounds(
        self,
        rounds: List[TransmissionRound],
        qber: float
    ) -> Dict[str, Any]:
        """
        Analyze simulation telemetry and return anomaly score, attack classification, confidence.
        """
        pass


class IPQCAuthenticator(ABC):
    """
    Extension point for Stage 4 (Post-Quantum Classical Channel Authentication).
    """
    @abstractmethod
    def authenticate_channel(
        self,
        classical_message: bytes,
        signature: bytes
    ) -> bool:
        """
        Verify classical basis reconciliation messages using PQC algorithm (e.g. Dilithium / Falcon).
        """
        pass


class IHybridSecurityEngine(ABC):
    """
    Extension point for Stage 5 (Hybrid Security Decision Engine).
    """
    @abstractmethod
    def evaluate(
        self,
        qber: float,
        telemetry: List[Any],
        ai_dict: Dict[str, Any],
        pqc_dict: Dict[str, Any],
        mitm_dict: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Synthesize independent outputs from QBER, telemetry, AI, and PQC into a unified decision.
        """
        pass
