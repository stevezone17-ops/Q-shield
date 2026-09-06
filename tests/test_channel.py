"""
Unit tests for quantum channel and noise model.
"""

import pytest
import numpy as np
from simulation.channel import QuantumChannel
from simulation.types import QuantumState, Basis


def test_channel_zero_noise():
    rng = np.random.default_rng(42)
    channel = QuantumChannel(noise=0.0, rng=rng)

    state, telemetry = channel.transmit(0, QuantumState.ZERO, Basis.RECTILINEAR)
    assert state == QuantumState.ZERO
    assert telemetry["noise_applied"] is False


def test_channel_noise_range_validation():
    rng = np.random.default_rng(42)
    with pytest.raises(ValueError):
        QuantumChannel(noise=-0.1, rng=rng)

    with pytest.raises(ValueError):
        QuantumChannel(noise=1.5, rng=rng)


def test_channel_high_noise_modifies_states():
    rng = np.random.default_rng(42)
    channel = QuantumChannel(noise=1.0, rng=rng)

    state, telemetry = channel.transmit(0, QuantumState.ZERO, Basis.RECTILINEAR)
    assert telemetry["noise_applied"] is True
    assert state == QuantumState.ONE
