"""
Core Simulation Engine for BB84 Quantum Key Distribution (Stage 1 + Stage 2 + Stage 3 + Stage 4 + Stage 5).

Orchestrates protocol steps:
  1. Alice Bit & Basis Generation
  2. Quantum State Preparation (|0>, |1>, |+>, |->)
  3. Quantum Channel Transmission & Attack Layer Interception (Eve)
  4. Bob Basis Selection & Born-Rule State Measurement
  5. Basis Reconciliation & Key Sifting (with optional MITM classical tampering)
  6. Genuine QBER Calculation
  7. Software Error Reconciliation & Overhead Calculation
  8. Privacy Amplification & Final Secret Key Derivation
  9. Channel Telemetry & Attack Metadata Compilation
  10. Optional Stage 3 AI Anomaly Detection Analysis
  11. Optional Stage 4 Post-Quantum Classical Channel Authentication Analysis (ML-DSA-65)
  12. Optional Stage 5 Hybrid Security Decision Engine Synthesis
"""

import time
import uuid
from typing import Optional, List
import numpy as np

from simulation.types import (
    SimulationConfig,
    SimulationResult,
    StatisticsSummary,
    AttackSummary,
    RoundTelemetry,
    MITMMetadata,
    Basis,
    QuantumState,
    TransmissionRound,
)
from simulation.alice import Alice
from simulation.states import prepare_state
from simulation.channel import QuantumChannel
from simulation.bob import Bob
from simulation.sifting import reconcile_bases_and_sift
from simulation.qber import calculate_qber
from simulation.error_correction import reconcile_errors
from simulation.privacy_amplification import amplify_privacy
from simulation.interfaces import IAttackLayer
from simulation.attacks import create_attack, MITMAttack
from simulation.ai import QShieldAIDetector
from simulation.pqc import MLDSAAuthenticator
from simulation.security import HybridSecurityEngine


def run_bb84_simulation(
    num_qubits: int,
    noise: float,
    seed: Optional[int] = None,
    attack: str = "none",
    attack_intensity: float = 0.0,
    enable_ai_detection: bool = False,
    enable_pqc_authentication: bool = False,
    enable_hybrid_security: bool = False,
    attack_layer: Optional[IAttackLayer] = None
) -> SimulationResult:
    """
    Execute a full BB84 simulation round with optional attacker layer, telemetry generation,
    Stage 3 AI anomaly detection, Stage 4 PQC classical channel authentication, and Stage 5 Hybrid Security Decision Engine.

    :param num_qubits: Number of qubits Alice prepares and transmits (1 to 10,000)
    :param noise: Channel depolarizing noise probability (0.0 to 1.0)
    :param seed: Optional seed for reproducibility
    :param attack: Attacker model name: "none", "pns", "trojan_horse", "detector_blinding", "mitm"
    :param attack_intensity: Attacker intensity scale (0.0 to 1.0)
    :param enable_ai_detection: Enable Stage 3 AI Anomaly Detector
    :param enable_pqc_authentication: Enable Stage 4 PQC Classical Channel Authenticator (ML-DSA-65)
    :param enable_hybrid_security: Enable Stage 5 Hybrid Security Decision Engine
    :param attack_layer: Optional explicit IAttackLayer instance
    :return: Structured SimulationResult
    """
    start_time = time.perf_counter()

    # Validate inputs
    if num_qubits <= 0:
        raise ValueError(f"num_qubits must be > 0, got {num_qubits}")
    if not (0.0 <= noise <= 1.0):
        raise ValueError(f"noise must be in range [0.0, 1.0], got {noise}")
    if not (0.0 <= attack_intensity <= 1.0):
        raise ValueError(f"attack_intensity must be in range [0.0, 1.0], got {attack_intensity}")

    config = SimulationConfig(
        num_qubits=num_qubits,
        noise=noise,
        seed=seed,
        attack=attack,
        attack_intensity=attack_intensity,
        enable_ai_detection=enable_ai_detection,
        enable_pqc_authentication=enable_pqc_authentication,
        enable_hybrid_security=enable_hybrid_security
    )

    # Initialize reproducible or random Generator
    rng = np.random.default_rng(seed)

    # Instantiate or adopt attack layer
    if attack_layer is None:
        active_attack_layer = create_attack(attack, attack_intensity, rng)
    else:
        active_attack_layer = attack_layer

    # 1. Alice Bit and Basis Generation
    alice = Alice(rng)
    alice_bits, alice_bases = alice.generate_bits_and_bases(num_qubits)
    alice_bases_str = "".join([b.to_symbol() for b in alice_bases])

    # 2. BB84 Quantum State Preparation
    prepared_states = [
        prepare_state(bit, basis) for bit, basis in zip(alice_bits, alice_bases)
    ]

    # 3. Quantum Channel Transmission & Eve Attack Interception
    channel = QuantumChannel(noise=noise, rng=rng, attack_layer=active_attack_layer)
    channel_states = []
    attack_telemetry_records = []

    for idx, (p_state, a_basis) in enumerate(zip(prepared_states, alice_bases)):
        tx_state, tx_meta = channel.transmit(idx, p_state, a_basis)
        channel_states.append(tx_state)
        attack_telemetry_records.append(tx_meta.get("attack_telemetry"))

    # 4. Bob Basis Selection and Measurement
    bob = Bob(rng)
    bob_bases = bob.generate_bases(num_qubits)
    bob_measured_bits = [
        bob.measure(state, b_basis)
        for state, b_basis in zip(channel_states, bob_bases)
    ]

    # 5. Basis Reconciliation, Sifting & MITM Classical Tampering
    mitm_meta = MITMMetadata()
    if isinstance(active_attack_layer, MITMAttack):
        mitm_meta = active_attack_layer.execute_classical_mitm(alice_bases_str)

    rounds, alice_sifted, bob_sifted = reconcile_bases_and_sift(
        alice_bits, alice_bases, prepared_states, bob_bases, bob_measured_bits
    )

    # Enrich transmission rounds with Stage 2 attack telemetry fields
    for idx, r in enumerate(rounds):
        atk_rec = attack_telemetry_records[idx] if idx < len(attack_telemetry_records) else None
        if atk_rec:
            r.attack_affected = atk_rec.get("attack_affected", False)
            r.eve_info_estimate = round(atk_rec.get("eve_gained_info", 0.0), 3)
            r.detector_event = atk_rec.get("detector_event", "normal")
            r.timing_jitter_ps = atk_rec.get("timing_jitter_ps", 0.0)

    # 6. Genuine QBER Calculation
    qber, error_count, total_retained = calculate_qber(alice_sifted, bob_sifted)

    # 7. Error Correction
    reconciled_key, ec_stats = reconcile_errors(alice_sifted, bob_sifted, qber)

    # 8. Privacy Amplification
    final_hex, final_bits, pa_stats = amplify_privacy(reconciled_key, qber)

    # 9. Compile Per-Round Telemetry for Stage 3 AI consumption
    telemetry_series: List[RoundTelemetry] = []
    retained_errors_window: List[int] = []

    for idx, r in enumerate(rounds):
        atk_rec = attack_telemetry_records[idx] if idx < len(attack_telemetry_records) else {}
        if not atk_rec:
            atk_rec = {}

        if r.retained:
            retained_errors_window.append(1 if r.error else 0)
            if len(retained_errors_window) > 20:
                retained_errors_window.pop(0)

        rolling_qber = (sum(retained_errors_window) / len(retained_errors_window)) if retained_errors_window else qber

        t = RoundTelemetry(
            round_index=idx,
            qber_signal=round(rolling_qber, 4),
            click_rate=atk_rec.get("click_rate", 1.0),
            timing_jitter=atk_rec.get("timing_jitter_ps", 15.0),
            detection_frequency=atk_rec.get("detection_frequency", 1.0),
            photon_count_statistics=atk_rec.get("photon_count_stat", 1.0),
            burst_rate=atk_rec.get("burst_rate", 0.0),
            error_rate=round(qber, 4),
            detector_response_variance=atk_rec.get("detector_variance", 0.01),
            probe_reflection_intensity=atk_rec.get("probe_reflection_intensity", 0.0),
            attack_intensity=attack_intensity,
            attack_type=attack
        )
        telemetry_series.append(t)

    # 10. Optional Stage 3 AI Anomaly Detection Analysis
    ai_detection_dict = None
    if enable_ai_detection:
        detector = QShieldAIDetector()
        ai_res = detector.detect(telemetry_series, qber)
        ai_detection_dict = ai_res.__dict__

    # 11. Optional Stage 4 Post-Quantum Classical Channel Authentication (ML-DSA-65)
    pqc_authentication_dict = None
    if enable_pqc_authentication:
        authenticator = MLDSAAuthenticator()
        session_id = f"qshield-sess-{(seed if seed is not None else uuid.uuid4().hex[:8])}"
        pqc_authentication_dict = authenticator.process_bb84_classical_exchange(
            session_id=str(session_id),
            alice_bases_str=alice_bases_str,
            mitm_active=mitm_meta.message_modified,
            eve_tampered_bases_str=mitm_meta.modified_message
        )

    # 12. Optional Stage 5 Hybrid Security Decision Engine Synthesis
    hybrid_security_dict = None
    if enable_hybrid_security:
        hybrid_engine = HybridSecurityEngine()
        hybrid_res = hybrid_engine.evaluate(
            qber=qber,
            telemetry=telemetry_series,
            ai_dict=ai_detection_dict,
            pqc_dict=pqc_authentication_dict,
            mitm_dict=mitm_meta.__dict__
        )
        hybrid_security_dict = hybrid_res.model_dump()

    execution_time_ms = round((time.perf_counter() - start_time) * 1000.0, 2)

    # Compile Statistics & Attack Summaries
    mismatched_bases = num_qubits - total_retained
    stats = StatisticsSummary(
        transmitted=num_qubits,
        matching_bases=total_retained,
        mismatched_bases=mismatched_bases,
        discarded=mismatched_bases,
        retained=total_retained,
        sifted_key_length=len(alice_sifted),
        qber=round(qber, 4),
        qber_percent=round(qber * 100.0, 2)
    )

    attack_summary = active_attack_layer.get_summary()

    return SimulationResult(
        config=config,
        statistics=stats,
        attack=attack_summary,
        telemetry=telemetry_series,
        mitm=mitm_meta,
        error_correction=ec_stats,
        privacy_amplification=pa_stats,
        alice_sifted_key=alice_sifted,
        bob_sifted_key=bob_sifted,
        reconciled_key=reconciled_key,
        final_secret_key_hex=final_hex,
        final_secret_key_bits=final_bits,
        rounds=rounds,
        execution_time_ms=execution_time_ms,
        ai_detection=ai_detection_dict,
        pqc_authentication=pqc_authentication_dict,
        hybrid_security=hybrid_security_dict
    )
