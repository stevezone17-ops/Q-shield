"""
Training Pipeline for Stage 3 Isolation Forest Anomaly Detector.

Generates reproducible normal baseline training dataset by running clean BB84 simulations
(attack='none', attack_intensity=0.0) across multiple seeds and legitimate channel noise levels.

Model: IsolationForest (scikit-learn)
Learns strictly what clean, unattacked quantum channel telemetry looks like.
"""

import os
import pickle
from typing import Dict, Any
from simulation.ai.features import extract_windowed_features, FEATURE_NAMES

DEFAULT_MODEL_PATH = os.path.join("models", "qshield_anomaly_detector.pkl")


def train_and_save_model(model_path: str = DEFAULT_MODEL_PATH) -> Dict[str, Any]:
    """
    Train IsolationForest on clean BB84 baseline data and save to pickle file.
    """
    from simulation.engine import run_bb84_simulation

    print("Generating clean BB84 baseline training dataset...")
    feature_rows = []

    # Run clean simulations across seeds and noise levels
    seeds = range(40)
    noises = [0.0, 0.01, 0.02, 0.03, 0.04, 0.05]
    qubit_counts = [200, 500, 1000]

    for seed in seeds:
        noise = noises[seed % len(noises)]
        num_qubits = qubit_counts[seed % len(qubit_counts)]
        
        sim_res = run_bb84_simulation(
            num_qubits=num_qubits,
            noise=noise,
            seed=seed,
            attack="none",
            attack_intensity=0.0
        )
        
        feats, _ = extract_windowed_features(sim_res.telemetry, window_size=50)
        feature_rows.append(feats)

    X_train_raw = np.vstack(feature_rows)

    print(f"Dataset generated: {X_train_raw.shape[0]} feature windows, {X_train_raw.shape[1]} features each.")

    # Fit StandardScaler
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train_raw)

    # Train IsolationForest
    iso_forest = IsolationForest(
        n_estimators=150,
        contamination=0.01,
        random_state=42
    )
    iso_forest.fit(X_train_scaled)

    # Calculate normal baseline stats for z-score explainability
    normal_means = dict(zip(FEATURE_NAMES, np.mean(X_train_raw, axis=0)))
    normal_stds = dict(zip(FEATURE_NAMES, np.std(X_train_raw, axis=0)))

    # Ensure stds are non-zero to avoid div by zero
    for k in normal_stds:
        if normal_stds[k] < 1e-4:
            normal_stds[k] = 1.0

    # Test baseline raw score range
    raw_scores = iso_forest.score_samples(X_train_scaled)
    min_score = np.min(raw_scores)
    max_score = np.max(raw_scores)

    model_artifact = {
        "model": iso_forest,
        "scaler": scaler,
        "feature_names": FEATURE_NAMES,
        "normal_means": normal_means,
        "normal_stds": normal_stds,
        "raw_min": float(min_score),
        "raw_max": float(max_score),
        "version": "3.0.0"
    }

    # Ensure directory exists
    os.makedirs(os.path.dirname(os.path.abspath(model_path)), exist_ok=True)

    with open(model_path, "wb") as f:
        pickle.dump(model_artifact, f)

    print(f"Successfully saved trained AI Anomaly Detector model artifact to '{model_path}'.")
    return model_artifact


if __name__ == "__main__":
    train_and_save_model()
