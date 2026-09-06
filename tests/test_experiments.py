"""
Unit Tests for Stage 7 — Experiment & Evaluation Engine.

Verifies:
  - Experiment configuration validation and limits
  - Attack intensity sweeps
  - Multi-attack comparison
  - AI confusion matrix calculations & metrics (TP, TN, FP, FN, Accuracy, Precision, Recall, F1, FPR)
  - Detector blinding stealth evaluations
  - PQC authentication latency and MITM protection benchmarks
  - Layer-by-layer hybrid security evaluations
  - Mathematical correctness & zero-division safety
  - Seed reproducibility
"""

import pytest
from simulation.experiment_engine import (
    QShieldExperimentEngine,
    compute_statistical_summary,
    compute_confusion_matrix,
)


def test_statistical_summary_math():
    vals = [10.0, 20.0, 30.0, 40.0, 50.0]
    res = compute_statistical_summary(vals)
    assert res["mean"] == 30.0
    assert res["median"] == 30.0
    assert res["min"] == 10.0
    assert res["max"] == 50.0
    assert res["std"] > 0.0
    assert res["ci_95"] >= 0.0


def test_statistical_summary_empty():
    res = compute_statistical_summary([])
    assert res["mean"] == 0.0
    assert res["std"] == 0.0


def test_confusion_matrix_math():
    # 4 TP, 4 TN, 1 FP, 1 FN
    actual = [True, True, True, True, False, False, False, False, True, False]
    pred = [True, True, True, True, False, False, False, False, False, True]

    cm = compute_confusion_matrix(actual, pred)
    assert cm["tp"] == 4
    assert cm["tn"] == 4
    assert cm["fp"] == 1
    assert cm["fn"] == 1
    assert cm["accuracy"] == 0.8
    assert cm["precision"] == 0.8
    assert cm["recall"] == 0.8
    assert cm["f1_score"] == 0.8
    assert cm["false_positive_rate"] == 0.2
    assert cm["detection_rate"] == 80.0


def test_confusion_matrix_zero_division():
    # All false
    actual = [False, False]
    pred = [False, False]
    cm = compute_confusion_matrix(actual, pred)
    assert cm["precision"] == 0.0
    assert cm["recall"] == 0.0
    assert cm["f1_score"] == 0.0
    assert cm["false_positive_rate"] == 0.0
    assert cm["detection_rate"] == 0.0


def test_experiment_limits_validation():
    engine = QShieldExperimentEngine()
    with pytest.raises(ValueError, match="exceeds safe limit"):
        engine.run_experiment(
            experiment_type="attack_intensity_sweep",
            intensity_start=0.0,
            intensity_end=1.0,
            intensity_step=0.01,  # 101 points
            trials_per_point=10,  # 1010 total sims > 500
        )


def test_experiment_invalid_trials():
    engine = QShieldExperimentEngine()
    with pytest.raises(ValueError, match="trials_per_point"):
        engine.run_experiment(
            experiment_type="attack_intensity_sweep",
            trials_per_point=0
        )


def test_attack_intensity_sweep_execution():
    engine = QShieldExperimentEngine()
    res = engine.run_experiment(
        experiment_type="attack_intensity_sweep",
        attack="detector_blinding",
        intensity_start=0.0,
        intensity_end=0.4,
        intensity_step=0.2,  # 3 points: 0.0, 0.2, 0.4
        trials_per_point=2,
        num_qubits=200,
        seed=100
    )

    assert res["experiment_type"] == "attack_intensity_sweep"
    assert res["total_simulations"] == 6
    assert len(res["sweep_points"]) == 3
    assert len(res["trials_detail"]) == 6
    assert "mean_qber" in res["summary_metrics"]
    assert len(res["observations"]) > 0


def test_attack_comparison_execution():
    engine = QShieldExperimentEngine()
    res = engine.run_experiment(
        experiment_type="attack_comparison",
        trials_per_point=2,
        num_qubits=200,
        seed=101
    )

    assert res["experiment_type"] == "attack_comparison"
    assert res["total_simulations"] == 10
    assert len(res["comparison_points"]) == 5  # None, PNS, Trojan, Blinding, MITM
    assert len(res["trials_detail"]) == 10


def test_ai_detection_evaluation_execution():
    engine = QShieldExperimentEngine()
    res = engine.run_experiment(
        experiment_type="ai_detection_evaluation",
        attack="detector_blinding",
        trials_per_point=3,
        num_qubits=200,
        seed=102
    )

    assert res["experiment_type"] == "ai_detection_evaluation"
    assert res["total_simulations"] == 6
    assert "confusion_matrix" in res
    cm = res["confusion_matrix"]
    assert cm["total"] == 6
    assert "f1_score" in cm


def test_false_positive_evaluation_execution():
    engine = QShieldExperimentEngine()
    res = engine.run_experiment(
        experiment_type="false_positive_evaluation",
        trials_per_point=4,
        num_qubits=200,
        seed=103
    )

    assert res["experiment_type"] == "false_positive_evaluation"
    assert res["total_simulations"] == 4
    assert "confusion_matrix" in res
    assert res["summary_metrics"]["total_clean_sessions"] == 4


def test_pqc_evaluation_execution():
    engine = QShieldExperimentEngine()
    res = engine.run_experiment(
        experiment_type="pqc_evaluation",
        trials_per_point=2,
        num_qubits=200,
        seed=104
    )

    assert res["experiment_type"] == "pqc_evaluation"
    bench = res["performance_benchmarks"]
    assert bench["mitm_block_rate_pqc_on"] == 100.0
    assert bench["mitm_block_rate_pqc_off"] == 0.0
    assert bench["avg_verify_ms"] >= 0.0


def test_hybrid_evaluation_execution():
    engine = QShieldExperimentEngine()
    res = engine.run_experiment(
        experiment_type="hybrid_evaluation",
        attack="detector_blinding",
        trials_per_point=2,
        num_qubits=200,
        seed=105
    )

    assert res["experiment_type"] == "hybrid_evaluation"
    assert len(res["layer_points"]) == 4


def test_seed_reproducibility():
    engine = QShieldExperimentEngine()
    res1 = engine.run_experiment(
        experiment_type="attack_intensity_sweep",
        attack="detector_blinding",
        intensity_start=0.0,
        intensity_end=0.2,
        intensity_step=0.2,
        trials_per_point=2,
        num_qubits=200,
        seed=42
    )
    res2 = engine.run_experiment(
        experiment_type="attack_intensity_sweep",
        attack="detector_blinding",
        intensity_start=0.0,
        intensity_end=0.2,
        intensity_step=0.2,
        trials_per_point=2,
        num_qubits=200,
        seed=42
    )

    assert res1["summary_metrics"]["mean_qber"] == res2["summary_metrics"]["mean_qber"]
    assert res1["summary_metrics"]["mean_ai_anomaly"] == res2["summary_metrics"]["mean_ai_anomaly"]
    assert res1["summary_metrics"]["mean_security_score"] == res2["summary_metrics"]["mean_security_score"]
