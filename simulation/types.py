"""
Types and data structures for the BB84 Quantum Key Distribution Simulator (Stage 1 + Stage 2 + Stage 3 Extension).
"""

from enum import Enum, IntEnum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class Basis(IntEnum):
    RECTILINEAR = 0  # + basis (0 => |0>, 1 => |1>)
    DIAGONAL = 1     # × basis (0 => |+>, 1 => |->)

    def to_symbol(self) -> str:
        return "+" if self == Basis.RECTILINEAR else "×"

    def to_str(self) -> str:
        return "rectilinear" if self == Basis.RECTILINEAR else "diagonal"

    @classmethod
    def from_str(cls, s: str) -> "Basis":
        return cls.RECTILINEAR if s in ("rectilinear", "+") else cls.DIAGONAL


class QuantumState(str, Enum):
    ZERO = "|0>"
    ONE = "|1>"
    PLUS = "|+>"
    MINUS = "|->"


class AttackType(str, Enum):
    NONE = "none"
    PNS = "pns"
    TROJAN_HORSE = "trojan_horse"
    DETECTOR_BLINDING = "detector_blinding"
    MITM = "mitm"


class TransmissionRound(BaseModel):
    index: int
    alice_bit: int
    alice_basis: str  # "rectilinear" or "diagonal"
    state: str        # "|0>", "|1>", "|+>", "|->"
    bob_basis: str    # "rectilinear" or "diagonal"
    bob_measured_bit: int
    basis_match: bool
    retained: bool
    error: bool  # True if retained and alice_bit != bob_measured_bit
    attack_affected: bool = False
    eve_info_estimate: float = 0.0
    detector_event: str = "normal"  # "normal", "blinded_click", "probe_reflected", "multi_photon_split", "classical_altered"
    timing_jitter_ps: float = 0.0


class RoundTelemetry(BaseModel):
    round_index: int
    qber_signal: float
    click_rate: float
    timing_jitter: float
    detection_frequency: float
    photon_count_statistics: float
    burst_rate: float
    error_rate: float
    detector_response_variance: float
    probe_reflection_intensity: float
    attack_intensity: float
    attack_type: str


class AttackSummary(BaseModel):
    type: str = "none"
    enabled: bool = False
    intensity: float = 0.0
    affected_rounds: int = 0
    affected_fraction: float = 0.0
    estimated_eve_information: float = 0.0  # Simulation estimate [0.0 to 1.0]
    description: str = "No attack active. Baseline Quantum Channel transmission."


class MITMMetadata(BaseModel):
    message_intercepted: bool = False
    message_modified: bool = False
    original_message: Optional[str] = None
    modified_message: Optional[str] = None


class SimulationConfig(BaseModel):
    num_qubits: int = Field(500, gt=0, le=10000, description="Total qubits transmitted")
    noise: float = Field(0.02, ge=0.0, le=1.0, description="Depolarizing/bit-flip noise rate (0.0 to 1.0)")
    seed: Optional[int] = Field(None, description="Optional random seed for reproducibility")
    attack: str = Field("none", description="Attacker model: none, pns, trojan_horse, detector_blinding, mitm")
    attack_intensity: float = Field(0.0, ge=0.0, le=1.0, description="Attack intensity scale (0.0 to 1.0)")
    enable_ai_detection: bool = Field(False, description="Enable Stage 3 AI Anomaly Detector")
    enable_pqc_authentication: bool = Field(False, description="Enable Stage 4 PQC Classical Channel Authentication")
    enable_hybrid_security: bool = Field(False, description="Enable Stage 5 Hybrid Security Decision Engine")


class StatisticsSummary(BaseModel):
    transmitted: int
    matching_bases: int
    mismatched_bases: int
    discarded: int
    retained: int
    sifted_key_length: int
    qber: float  # Quantum Bit Error Rate (0.0 to 1.0)
    qber_percent: float  # 0.0 to 100.0


class ErrorCorrectionStats(BaseModel):
    sifted_key_length: int
    reconciled_key_length: int
    error_count: int
    correction_overhead_bits: int
    reconciliation_efficiency: float
    method: str = "Parity Block Verification & Reconciliation (Simulation Level)"


class PrivacyAmplificationStats(BaseModel):
    reconciled_key_length: int
    final_key_length: int
    compression_ratio: float
    hash_algorithm: str = "SHA-256 (Truncated)"


class SimulationResult(BaseModel):
    config: SimulationConfig
    statistics: StatisticsSummary
    attack: AttackSummary
    telemetry: List[RoundTelemetry]
    mitm: MITMMetadata
    error_correction: ErrorCorrectionStats
    privacy_amplification: PrivacyAmplificationStats
    alice_sifted_key: List[int]
    bob_sifted_key: List[int]
    reconciled_key: List[int]
    final_secret_key_hex: str
    final_secret_key_bits: List[int]
    rounds: List[TransmissionRound]
    execution_time_ms: float
    ai_detection: Optional[Dict[str, Any]] = None
    pqc_authentication: Optional[Dict[str, Any]] = None
    hybrid_security: Optional[Dict[str, Any]] = None
    disclaimer: str = "This software simulation models BB84 QKD protocol logic, noisy channel physics, and attacker models. It does not represent physical photonic hardware."
