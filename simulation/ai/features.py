"""
Feature Extraction Layer for Stage 3 AI/ML Anomaly Detection.

Extracts statistical windowed features from physical channel and detector telemetry.

CRITICAL RULE:
  No attack labels, names, or intensity settings are used as features.
  The feature array is strictly derived from physical channel measurement telemetry.
"""

from typing import List, Tuple
import numpy as np
from simulation.types import RoundTelemetry


FEATURE_NAMES = [
    "mean_qber",
    "std_qber",
    "mean_click_rate",
    "std_click_rate",
    "mean_timing_jitter",
    "std_timing_jitter",
    "mean_detection_frequency",
    "mean_photon_count_stat",
    "mean_burst_rate",
    "mean_detector_variance",
    "std_detector_variance",
    "mean_probe_reflection",
    "max_probe_reflection",
    "jitter_to_qber_ratio",
]


def extract_windowed_features(
    telemetry: List[RoundTelemetry],
    window_size: int = 50
) -> Tuple[np.ndarray, List[str]]:
    """
    Extract sliding/windowed statistical feature vectors from session telemetry.

    :param telemetry: Stream of RoundTelemetry objects from Stage 2
    :param window_size: Size of telemetry window (default 50 rounds)
    :return: Tuple of (feature_matrix of shape [num_windows, 14], FEATURE_NAMES)
    """
    if not telemetry:
        # Return single zero row if empty
        return np.zeros((1, len(FEATURE_NAMES)), dtype=np.float64), FEATURE_NAMES

    n_rounds = len(telemetry)
    step = max(1, window_size // 2)
    windows = []

    for start_idx in range(0, n_rounds, step):
        end_idx = min(start_idx + window_size, n_rounds)
        chunk = telemetry[start_idx:end_idx]
        if not chunk:
            continue

        qbers = [t.qber_signal for t in chunk]
        clicks = [t.click_rate for t in chunk]
        jitters = [t.timing_jitter for t in chunk]
        freqs = [t.detection_frequency for t in chunk]
        photons = [t.photon_count_statistics for t in chunk]
        bursts = [t.burst_rate for t in chunk]
        variances = [t.detector_response_variance for t in chunk]
        probes = [t.probe_reflection_intensity for t in chunk]

        m_qber = float(np.mean(qbers))
        s_qber = float(np.std(qbers))
        m_click = float(np.mean(clicks))
        s_click = float(np.std(clicks))
        m_jitter = float(np.mean(jitters))
        s_jitter = float(np.std(jitters))
        m_freq = float(np.mean(freqs))
        m_photons = float(np.mean(photons))
        m_burst = float(np.mean(bursts))
        m_var = float(np.mean(variances))
        s_var = float(np.std(variances))
        m_probe = float(np.mean(probes))
        max_probe = float(np.max(probes))
        jitter_qber_ratio = float(m_jitter / (m_qber + 1e-4))

        row = [
            m_qber,
            s_qber,
            m_click,
            s_click,
            m_jitter,
            s_jitter,
            m_freq,
            m_photons,
            m_burst,
            m_var,
            s_var,
            m_probe,
            max_probe,
            jitter_qber_ratio,
        ]
        windows.append(row)

    feature_matrix = np.array(windows, dtype=np.float64)

    # Sanitize NaN or Inf values
    feature_matrix = np.nan_to_num(feature_matrix, nan=0.0, posinf=1000.0, neginf=-1000.0)

    return feature_matrix, FEATURE_NAMES
