# Q-SHIELD — Stage 1 Core Architecture Specification

## Overview
**Q-SHIELD** is an academic software simulation platform for the BB84 Quantum Key Distribution (QKD) protocol. Stage 1 implements the core quantum transmission protocol, simulated noisy physical channel, basis reconciliation, sifted key generation, genuine QBER calculation, software error reconciliation, and SHA-256 privacy amplification.

## System Architecture

```
                  +-----------------------------------+
                  |         Alice (Sender)            |
                  |  - Random Bits (0, 1)             |
                  |  - Random Bases (+, ×)            |
                  |  - State Prep (|0>,|1>,|+>,|->)  |
                  +-----------------+-----------------+
                                    |
                                    v (Simulated Qubits)
                  +-----------------+-----------------+
                  |         Quantum Channel           |
                  |  - Depolarizing/Bit-Flip Noise    |
                  |  - [Stage 2 Attack Hook]          |
                  +-----------------+-----------------+
                                    |
                                    v
                  +-----------------+-----------------+
                  |          Bob (Receiver)           |
                  |  - Random Measurement Bases     |
                  |  - Born-Rule State Measurement    |
                  +-----------------+-----------------+
                                    |
                                    v (Public Classical Channel)
                  +-----------------+-----------------+
                  |      Basis Reconciliation         |
                  |  - Sifting (Retain matching)      |
                  +-----------------+-----------------+
                                    |
                                    v
                  +-----------------+-----------------+
                  |      QBER & Error Correction      |
                  |  - QBER = Mismatches / Retained   |
                  |  - Parity Block Reconciliation    |
                  +-----------------+-----------------+
                                    |
                                    v
                  +-----------------+-----------------+
                  |      Privacy Amplification        |
                  |  - SHA-256 Digest & Truncation    |
                  +-----------------+-----------------+
                                    |
                                    v
                  +-----------------+-----------------+
                  |        Final Secret Key           |
                  +-----------------------------------+
```

## Module Responsibilities
- `simulation/alice.py`: Generates pseudo-random bit strings and preparation bases using NumPy generator.
- `simulation/states.py`: Defines mapping from `(bit, basis)` to state vectors $|0\rangle, |1\rangle, |+\rangle, |-\rangle$.
- `simulation/channel.py`: Simulates physical quantum channel noise and provides `IAttackLayer` hook for Stage 2 eavesdropping models.
- `simulation/bob.py`: Generates random measurement bases and samples state projection measurements using Born's rule ($P = |\langle\psi|\phi\rangle|^2$).
- `simulation/sifting.py`: Performs classical basis comparison and derives Alice's and Bob's sifted key sequences.
- `simulation/qber.py`: Calculates exact ratio of bit errors in retained sifted key.
- `simulation/error_correction.py`: Performs software block parity reconciliation and calculates information exchange overhead.
- `simulation/privacy_amplification.py`: Hashes reconciled key with SHA-256 to derive final shared secret.
- `backend/app/`: FastAPI web server wrapping simulation engine with `/api/simulate/bb84` and `/api/health`.
- `frontend/`: React 18, TypeScript, Tailwind CSS, and Recharts interactive user interface.
