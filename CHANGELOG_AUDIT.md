# Q-SHIELD Audit Changelog & Scientific Corrections

## Overview
This document records all modifications, scientific terminology corrections, telemetry fixes, UI status clarifications, and test additions made during the **Final Scientific, Mathematical & Reproducibility Audit** of Q-SHIELD.

---

### Audit Issue 1: Clean Baseline "PNS RISK" Telemetry Misclassification
- **Issue**: Running a clean simulation (Attack: NONE) displayed `Photon Statistics: 100.0%` with status `PNS RISK`.
- **Root Cause**: The raw photon count baseline ratio $1.00$ was formatted as $100.0\%$ in UI string conversions and evaluated against a naive ratio check (>1.0) without tolerance.
- **Correction**: Updated photon statistics classification in `simulation/attacks/pns.py` and `simulation/engine.py` to establish a clean baseline range ($\le 1.15$ ratio = `BASELINE` / `NORMAL`).
- **Files Changed**:
  - `simulation/attacks/pns.py`
  - `simulation/engine.py`
  - `backend/app/schemas.py`
  - `frontend/src/components/TelemetryDisplay.tsx`
- **Tests Added/Verified**: Added `test_clean_baseline_photon_statistics` in `tests/test_pns_attack.py`. Passed 80/80 backend unit tests.

---

### Audit Issue 2: Misleading Key Approval Terminology on Compromised Runs
- **Issue**: When an attack resulted in high QBER or security policy rejection (`REJECT_KEY`), the UI summary card displayed `FINAL SECRET KEY` and `SECURE KEY`.
- **Root Cause**: The UI component displayed the key byte length output by the privacy amplification stage without checking the downstream `policy_action` from the Hybrid Security Decision Engine.
- **Correction**:
  1. Renamed card header from `FINAL SECRET KEY` to `DERIVED SECRET KEY`.
  2. Replaced static `SECURE KEY` badge with dynamic policy action badges:
     - `APPROVED BY SECURITY POLICY` (Green)
     - `REJECTED BY SECURITY POLICY` (Red / Caution)
- **Files Changed**:
  - `frontend/src/components/StatisticsSummary.tsx`
  - `frontend/src/components/SimulationExplanationReport.tsx`
  - `frontend/src/utils/reportGenerator.ts`
- **Verification**: Verified via Playwright visual testing for both Clean (APPROVED) and Compromised (REJECTED) sessions.

---

### Audit Issue 3: PQC ML-DSA-65 Latency Claim Inconsistency
- **Issue**: Presentation materials and documentation claimed PQC signing/verification latency was `<1 ms per quantum round`, whereas measured benchmarks showed total session latency was ~59.86 ms.
- **Root Cause**: Confusion between microsecond-level single operations vs end-to-end Python PQC key generation + signing + verification session overhead, and mislabeling session latency as "per quantum round".
- **Correction**: Clarified documentation to state that PQC ML-DSA-65 operates at the **classical session authentication level** with an end-to-end measured overhead of **59.86 ms** (Keygen: 8.30 ms, Sign: 41.79 ms, Verify: 9.69 ms across 20 empirical trials).
- **Files Changed**:
  - `README.md`
  - `DRAFT_REPORT.md`
  - `PRESENTATION_SCRIPT.md`
- **Verification**: Benchmark script `scratch/benchmark_pqc.py` executed and documented in `AUDIT_RESULTS.json`.

---

### Audit Issue 4: Channel Noise Model Terminology Alignment
- **Issue**: Draft text occasionally referred to "quantum depolarizing channel via Kraus operators", while the implementation uses an orthogonal state-flip model ($|0\rangle \leftrightarrow |1\rangle$, $|+\rangle \leftrightarrow |-\rangle$).
- **Root Cause**: Conceptual discrepancy between theoretical quantum information textbook terminology and software bit-flip abstraction.
- **Correction**: Updated documentation in `README.md`, `simulation/channel.py` docstrings, and report generator to describe the channel as a **Simulated Orthogonal State-Flip Noise Model** with independent probability $p = \text{noise\_rate}$.
- **Files Changed**:
  - `simulation/channel.py`
  - `README.md`
- **Verification**: Code review confirms math is fully accurate to the specified bit-flip simulation contract.

---

### Audit Issue 5: Zero-Label Feature Isolation Verification (Stage 3 AI Detector)
- **Issue**: Need to verify whether attack labels, ground truth, or attack intensities leak into AI features.
- **Root Cause Audit**: Audited `simulation/ai/features.py`. Verified that the 14 extracted features rely strictly on physical/statistical observables (QBER, pulse intervals, click rates, voltage variations, photon statistics ratios) over 10-qubit rolling windows.
- **Correction**: No code change required. Confirmed complete compliance with the Stage 3 Zero-Label Rule.
- **Files Checked**: `simulation/ai/features.py`, `simulation/ai/detector.py`, `simulation/ai/training.py`.

---

### Summary of Verification
- **Pytest Suite**: 80 passed, 0 failed (`python -m pytest`)
- **Frontend Build**: TypeScript compiler completed with 0 errors (`npm run build`)
- **Live Smoke Tests**: Verified Clean Baseline, PNS Sweep, Trojan Horse, Detector Blinding, MITM without PQC, and MITM with PQC.
