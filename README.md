# Q-SHIELD — AI-Assisted BB84 Quantum Key Distribution Security Simulator

> **Academic & Technical Disclaimer:** This project is a software simulation of the BB84 Quantum Key Distribution (QKD) protocol and does not represent physical photonic quantum key distribution hardware. Error correction and privacy amplification components are implemented at the simulation level for educational and research evaluation purposes.

---

## 🛡️ Project Overview

**Q-SHIELD** is a research-grade, software-based simulation suite designed to model, analyze, and visualize the security dynamics of the **BB84 Quantum Key Distribution protocol**.

Stage 1 delivers the complete core simulation engine, FastAPI backend API, and interactive React dashboard for quantum transmission, channel noise, basis reconciliation, genuine QBER calculation, error reconciliation, and SHA-256 privacy amplification.

---

## 📐 BB84 Protocol Flow & Mathematics

1. **Alice Bit & Basis Generation**:
   Alice generates $N$ random bits $x_i \in \{0, 1\}$ and random preparation bases $\theta_A \in \{+, \times\}$.

2. **Quantum State Preparation**:
   Alice prepares state vectors according to BB84 rules:
   - **Rectilinear ($+$)**: Bit $0 \to |0\rangle = \begin{bmatrix}1 \\ 0\end{bmatrix}$, Bit $1 \to |1\rangle = \begin{bmatrix}0 \\ 1\end{bmatrix}$
   - **Diagonal ($\times$)**: Bit $0 \to |+\rangle = \frac{1}{\sqrt{2}}\begin{bmatrix}1 \\ 1\end{bmatrix}$, Bit $1 \to |-\rangle = \frac{1}{\sqrt{2}}\begin{bmatrix}1 \\ -1\end{bmatrix}$

3. **Quantum Channel & Noise Model**:
   States pass through a channel with configurable noise probability $p \in [0.0, 0.15]$. Depolarizing channel noise probabilistically flips state states or causes bit flips prior to measurement.

4. **Bob Measurement (Born's Rule)**:
   Bob independently chooses measurement bases $\theta_B \in \{+, \times\}$ for each qubit. The measurement outcome bit $y_i$ is sampled probabilistically via projection amplitudes:
   $$P(\text{bit}=0) = |\langle \psi_{\text{basis } 0} | \psi_{\text{incoming}} \rangle|^2$$

5. **Basis Reconciliation & Sifting**:
   Alice and Bob publish their bases over an unencrypted classical channel. Rounds with matching bases ($\theta_A = \theta_B$) are retained in the **sifted key**. Mismatched rounds are discarded.

6. **Genuine QBER Calculation**:
   Quantum Bit Error Rate is computed programmatically from the sifted keys:
   $$\text{QBER} = \frac{\text{Number of Mismatched Retained Bits}}{\text{Total Retained Bits}}$$

7. **Software Error Correction**:
   A block-parity bisecting reconciliation scheme identifies and corrects mismatched bits between Alice and Bob's sifted keys over the classical channel while recording communication overhead.

8. **Privacy Amplification**:
   SHA-256 cryptographic hashing compresses the reconciled key into a shorter, highly secure final secret key, stripping information leaked during error correction.

---

## 📁 Repository Structure

```
D:\quantum_cia3
├── simulation/                  # Pure Python BB84 Protocol Engine
│   ├── types.py                 # Enums, Pydantic & dataclass telemetry models
│   ├── alice.py                 # Alice bit & basis generator
│   ├── states.py                # BB84 state vectors & prep logic
│   ├── channel.py               # Simulated noisy quantum channel & attack hook
│   ├── bob.py                   # Bob basis generator & Born-rule state measurement
│   ├── sifting.py               # Basis reconciliation & key sifting
│   ├── qber.py                  # Programmatic QBER calculator
│   ├── error_correction.py      # Parity block software reconciliation
│   ├── privacy_amplification.py # SHA-256 privacy amplification
│   ├── interfaces.py            # Extension interfaces (Attack, AI, PQC)
│   └── engine.py                # Main orchestrator (run_bb84_simulation)
│
├── backend/                     # FastAPI REST API Server
│   ├── app/
│   │   ├── main.py              # FastAPI app & CORS configuration
│   │   ├── schemas.py           # Request/Response schemas
│   │   └── api/simulation.py    # POST /api/simulate/bb84 & GET /api/health
│   └── requirements.txt
│
├── frontend/                    # Vite + React + TypeScript + Tailwind UI
│   ├── src/
│   │   ├── components/          # Controls, Stats, Chart, Inspector Table, Key Display
│   │   ├── services/api.ts      # API fetch client
│   │   ├── types/simulation.ts  # Frontend TypeScript interfaces
│   │   ├── App.tsx              # Main dashboard application
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
├── tests/                       # Complete Pytest Unit & Integration Suite (29 tests)
│   ├── test_alice.py
│   ├── test_states.py
│   ├── test_channel.py
│   ├── test_bob.py
│   ├── test_sifting.py
│   ├── test_qber.py
│   ├── test_error_correction.py
│   ├── test_privacy_amplification.py
│   ├── test_engine.py
│   └── test_api.py
│
├── docs/                        # Architecture Specs
│   └── stage1_architecture.md
└── README.md
```

---

## ⚙️ Installation & Running Locally

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 1. Run Python Unit Tests
```bash
python -m pytest tests/
```

### 2. Start Backend API Server (FastAPI)
```bash
# From repository root
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```
API Documentation will be available at `http://127.0.0.1:8000/docs`.

### 3. Start Frontend UI (Vite)
```bash
# Navigate to frontend directory
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173/` in your browser.

---

## 📡 API Endpoints

### `GET /api/health`
Health check endpoint.
**Response**:
```json
{
  "status": "ok",
  "service": "Q-SHIELD BB84 Simulator API",
  "stage": "Stage 1 — BB84 Core Simulation Engine"
}
```

### `POST /api/simulate/bb84`
Executes BB84 simulation round.

**Request Body**:
```json
{
  "num_qubits": 500,
  "noise": 0.02,
  "seed": 42
}
```

**Response**:
Returns full structured `SimulationResult` object including config, statistics summary, error correction metrics, privacy amplification hash, derived final secret key, execution timing, and bit-by-bit transmission round telemetry.

---

## 🚀 Future Roadmap (Upcoming Stages)

- **Stage 2**: Eavesdropping & Attack Simulation (Eve Intercept-Resend, PNS, Trojan-Horse, Blinding, MITM).
- **Stage 3**: AI/ML Anomaly Detection (Real-time attack classification).
- **Stage 4**: Post-Quantum Classical Authentication (Dilithium / Falcon).
- **Stage 5**: Hybrid Security Decision Engine.
- **Stage 6**: Professional Research Dashboard.
- **Stage 7**: Experiment & Evaluation Mode.
- **Stage 8**: Presentation / Viva Mode.
