# Q-SHIELD — Empirically Verified Audit Numbers

All numbers in this table originate strictly from fresh empirical benchmark runs and fixed-seed simulation evaluations executed on the current Q-SHIELD backend (`D:\quantum_cia3`).

| Metric | Verified Value | Units | Sample Count / Repetitions | Seed(s) | Source / Test File | Date / Timestamp |
|---|---|---|---|---|---|---|
| **Clean Baseline QBER** | `1.69%` | Percentage (%) | 500 Qubits (1 run) | 42 | `run_6_reproducible_tests.py` | 2026-09-06 |
| **Clean Baseline QBER Mean** | `2.01% ± 0.15%` | Percentage (%) | 50 Runs | 100-149 | `audit_experiment_data.json` | 2026-09-06 |
| **Clean Baseline False Positive Rate** | `0.00%` | Percentage (%) | 50 Runs | 100-149 | `audit_experiment_data.json` | 2026-09-06 |
| **Clean Baseline Key Approval Rate** | `100.00%` | Percentage (%) | 50 Runs | 100-149 | `audit_experiment_data.json` | 2026-09-06 |
| **Clean Baseline Sifted Key Length** | `236` | Bits | 500 Qubits | 42 | `TEST_1_CLEAN` | 2026-09-06 |
| **Clean Baseline Derived Key Length** | `118` | Bits | 500 Qubits | 42 | `TEST_1_CLEAN` | 2026-09-06 |
| **Clean Baseline AI Anomaly Score** | `0.103` | Index (0.0 to 1.0) | 500 Telemetry Windows | 42 | `TEST_1_CLEAN` | 2026-09-06 |
| **Clean Baseline Hybrid Security Score**| `96.90` | Points (0 to 100) | 1 Evaluation | 42 | `TEST_1_CLEAN` | 2026-09-06 |
| **PNS Attack (40%) AI Anomaly Score** | `0.480` | Index (0.0 to 1.0) | 500 Telemetry Windows | 42 | `TEST_2_PNS` | 2026-09-06 |
| **Trojan-Horse Attack (50%) AI Score** | `0.820` | Index (0.0 to 1.0) | 500 Telemetry Windows | 42 | `TEST_3_TROJAN` | 2026-09-06 |
| **Detector Blinding Attack (70%) QBER** | `6.02%` | Percentage (%) | 500 Qubits | 42 | `TEST_4_BLIND` | 2026-09-06 |
| **MITM Attack (80%) QBER** | `30.36%` | Percentage (%) | 500 Qubits | 42 | `TEST_5_MITM` / `TEST_6_MITM` | 2026-09-06 |
| **MITM Block Rate with PQC** | `100.00%` | Percentage (%) | 10 Runs | 200-209 | `audit_experiment_data.json` | 2026-09-06 |
| **PQC ML-DSA-65 Keygen Time (Mean)** | `8.30 ms` | Milliseconds (ms) | 20 Trials | Dynamic | `scratch/benchmark_pqc.py` | 2026-09-06 |
| **PQC ML-DSA-65 Signing Time (Mean)** | `41.79 ms` | Milliseconds (ms) | 20 Trials | Dynamic | `scratch/benchmark_pqc.py` | 2026-09-06 |
| **PQC ML-DSA-65 Verification Time (Mean)**| `9.69 ms` | Milliseconds (ms) | 20 Trials | Dynamic | `scratch/benchmark_pqc.py` | 2026-09-06 |
| **PQC ML-DSA-65 Total Session Overhead** | `59.86 ms` | Milliseconds (ms) | 20 Trials | Dynamic | `scratch/benchmark_pqc.py` | 2026-09-06 |
| **AI Single Window Inference Latency** | `2.41 ms` | Milliseconds (ms) | 1,000 Windows | Dynamic | `scratch/run_all_evaluations.py`| 2026-09-06 |
| **Backend Test Suite Pass Rate** | `80 / 80 (100%)` | Unit Tests | Complete Suite | N/A | `python -m pytest` | 2026-09-06 |
| **Frontend TypeScript Build Status** | `0 Errors` | Compilation | Complete Build | N/A | `npm run build` | 2026-09-06 |
