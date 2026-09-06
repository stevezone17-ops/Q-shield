"""
Unit tests for basis reconciliation and sifting.
"""

from simulation.sifting import reconcile_bases_and_sift
from simulation.types import Basis, QuantumState


def test_sifting_logic():
    alice_bits = [0, 1, 1, 0]
    alice_bases = [Basis.RECTILINEAR, Basis.DIAGONAL, Basis.RECTILINEAR, Basis.DIAGONAL]
    prepared_states = [QuantumState.ZERO, QuantumState.MINUS, QuantumState.ONE, QuantumState.PLUS]
    bob_bases = [Basis.RECTILINEAR, Basis.RECTILINEAR, Basis.RECTILINEAR, Basis.DIAGONAL]
    bob_bits = [0, 1, 1, 0]

    rounds, a_sifted, b_sifted = reconcile_bases_and_sift(
        alice_bits, alice_bases, prepared_states, bob_bases, bob_bits
    )

    # Indices 0, 2, 3 have matching bases
    assert len(rounds) == 4
    assert len(a_sifted) == 3
    assert len(b_sifted) == 3
    assert a_sifted == [0, 1, 0]
    assert b_sifted == [0, 1, 0]

    assert rounds[0].basis_match is True
    assert rounds[1].basis_match is False
