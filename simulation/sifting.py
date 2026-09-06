"""
Basis Reconciliation and Sifting module for BB84 QKD Simulation.

Classical Public Channel Basis Comparison:
Alice and Bob publish their preparation and measurement bases.
Rounds with matching bases are retained into the sifted key.
Rounds with mismatched bases are discarded.
"""

from typing import List, Tuple, Dict, Any
from simulation.types import Basis, TransmissionRound, QuantumState


def reconcile_bases_and_sift(
    alice_bits: List[int],
    alice_bases: List[Basis],
    prepared_states: List[QuantumState],
    bob_bases: List[Basis],
    bob_bits: List[int]
) -> Tuple[List[TransmissionRound], List[int], List[int]]:
    """
    Perform basis reconciliation over classical channel.
    Returns:
      - List of structured TransmissionRound instances
      - Alice's sifted key
      - Bob's sifted key
    """
    rounds: List[TransmissionRound] = []
    alice_sifted_key: List[int] = []
    bob_sifted_key: List[int] = []

    for idx, (a_bit, a_basis, state, b_basis, b_bit) in enumerate(
        zip(alice_bits, alice_bases, prepared_states, bob_bases, bob_bits)
    ):
        basis_match = (a_basis == b_basis)
        retained = basis_match
        is_error = retained and (a_bit != b_bit)

        if retained:
            alice_sifted_key.append(a_bit)
            bob_sifted_key.append(b_bit)

        t_round = TransmissionRound(
            index=idx,
            alice_bit=a_bit,
            alice_basis=a_basis.to_str(),
            state=state.value,
            bob_basis=b_basis.to_str(),
            bob_measured_bit=b_bit,
            basis_match=basis_match,
            retained=retained,
            error=is_error
        )
        rounds.append(t_round)

    return rounds, alice_sifted_key, bob_sifted_key
