"""
FastAPI Presentation & Viva Controller Endpoints (Stage 8 Presentation & Viva Mode).

Provides predefined live demo configurations and the complete viva voce question bank,
cheat sheet, and 30-second project pitch for academic evaluators.
"""

from typing import Dict, Any, List
from fastapi import APIRouter

router = APIRouter()


@router.get("/presentation/demos")
def get_live_demo_presets() -> Dict[str, Any]:
    """
    Returns predefined live demonstration presets for Presentation Mode.
    Each preset links to real simulation parameters.
    """
    return {
        "demos": [
            {
                "id": "demo_1",
                "title": "DEMO 1: Clean Baseline Session",
                "subtitle": "Uncompromised Quantum Channel",
                "desc": "Demonstrates baseline BB84 transmission with zero eavesdropping. All security metrics indicate normal operational state.",
                "config": {
                    "num_qubits": 500,
                    "noise": 0.02,
                    "seed": 42,
                    "attack": "none",
                    "attack_intensity": 0.0,
                    "enable_ai_detection": True,
                    "enable_pqc_authentication": True,
                    "enable_hybrid_security": True
                },
                "expected_outcomes": {
                    "qber": "Low (< 3%)",
                    "ai_status": "NORMAL",
                    "pqc_status": "VALID",
                    "security_level": "SECURE",
                    "key_action": "ALLOW_KEY"
                }
            },
            {
                "id": "demo_2",
                "title": "DEMO 2: Detector Blinding Stealth Attack",
                "subtitle": "Flagship Physical Telemetry Anomaly",
                "desc": "Demonstrates Eve blinding Bob's APDs with strong laser pulses. QBER remains low (< 11%), but physical telemetry AI anomaly reaches > 80%, triggering key rejection.",
                "config": {
                    "num_qubits": 500,
                    "noise": 0.02,
                    "seed": 42,
                    "attack": "detector_blinding",
                    "attack_intensity": 0.7,
                    "enable_ai_detection": True,
                    "enable_pqc_authentication": True,
                    "enable_hybrid_security": True
                },
                "expected_outcomes": {
                    "qber": "Low (~ 6%)",
                    "ai_status": "ATTACK_DETECTED",
                    "pqc_status": "VALID",
                    "security_level": "COMPROMISED",
                    "key_action": "REJECT_KEY"
                }
            },
            {
                "id": "demo_3",
                "title": "DEMO 3: Classical MITM Without PQC Authentication",
                "subtitle": "Unprotected Classical Channel",
                "desc": "Eve intercepts and tampers with Alice's basis reconciliation message. Because PQC Authentication is DISABLED, Bob accepts the tampered message.",
                "config": {
                    "num_qubits": 500,
                    "noise": 0.02,
                    "seed": 42,
                    "attack": "mitm",
                    "attack_intensity": 0.8,
                    "enable_ai_detection": True,
                    "enable_pqc_authentication": False,
                    "enable_hybrid_security": True
                },
                "expected_outcomes": {
                    "qber": "High (~ 25%)",
                    "ai_status": "NORMAL/SUSPICIOUS",
                    "pqc_status": "DISABLED",
                    "security_level": "COMPROMISED",
                    "key_action": "REJECT_KEY"
                }
            },
            {
                "id": "demo_4",
                "title": "DEMO 4: Classical MITM With PQC Authentication",
                "subtitle": "NIST FIPS 204 ML-DSA-65 Classical Protection",
                "desc": "Eve tampers with classical basis message. Bob verifies ML-DSA-65 digital signature; verification fails and modified message is REJECTED, blocking MITM.",
                "config": {
                    "num_qubits": 500,
                    "noise": 0.02,
                    "seed": 42,
                    "attack": "mitm",
                    "attack_intensity": 0.8,
                    "enable_ai_detection": True,
                    "enable_pqc_authentication": True,
                    "enable_hybrid_security": True
                },
                "expected_outcomes": {
                    "qber": "N/A (Message Rejected)",
                    "ai_status": "NORMAL",
                    "pqc_status": "INVALID / MITM BLOCKED",
                    "security_level": "COMPROMISED",
                    "key_action": "REJECT_KEY"
                }
            },
            {
                "id": "demo_5",
                "title": "DEMO 5: Full Q-SHIELD Hybrid Defense Pipeline",
                "subtitle": "5-Layer Synthesis (QBER + AI + PQC + Telemetry)",
                "desc": "Demonstrates complete sequential defense synthesis across all five architectural layers under active multi-vector threats.",
                "config": {
                    "num_qubits": 500,
                    "noise": 0.02,
                    "seed": 42,
                    "attack": "trojan_horse",
                    "attack_intensity": 0.75,
                    "enable_ai_detection": True,
                    "enable_pqc_authentication": True,
                    "enable_hybrid_security": True
                },
                "expected_outcomes": {
                    "qber": "Elevated",
                    "ai_status": "ATTACK_DETECTED",
                    "pqc_status": "VALID",
                    "security_level": "COMPROMISED",
                    "key_action": "REJECT_KEY"
                }
            }
        ]
    }


@router.get("/presentation/viva")
def get_viva_question_bank() -> Dict[str, Any]:
    """
    Returns structured viva voce question bank, project pitches, cheat sheets,
    and key points for oral presentation defence.
    """
    return {
        "pitches": {
            "pitch_30s": "Q-SHIELD is a layered security framework for BB84 quantum communication. It combines quantum error analysis, simulated physical-layer attack telemetry, AI anomaly detection, post-quantum ML-DSA classical authentication, and a hybrid security decision engine. Its flagship demonstration shows that detector-blinding attacks can maintain low QBER while being immediately detected via anomalous physical telemetry.",
            "pitch_60s": "Traditional BB84 QKD relies heavily on QBER monitoring to detect eavesdropping. However, sophisticated physical-layer attacks like detector blinding can keep QBER below the 11% threshold while Eve steals key material. Q-SHIELD solves this by synthesizing four security signals: QBER (25%), Isolation Forest physical telemetry AI anomaly score (30%), NIST FIPS 204 ML-DSA-65 post-quantum signature validity (30%), and channel telemetry health (15%). If any component detects anomalous behavior, the Hybrid Engine immediately overrides and issues a REJECT_KEY decision.",
            "pitch_2m": "Q-SHIELD transforms quantum key distribution simulation into an enterprise-grade evaluation platform. It comprises five connected security layers: 1) BB84 Core Simulation with state vector prep & measurement, 2) Eavesdropping & Attack Simulation covering PNS, Trojan-Horse, Detector Blinding, and MITM, 3) Stage 3 AI Anomaly Detection using unsupervised Isolation Forest over 8 physical telemetry metrics (timing jitter, detector variance, click rate, burst rate), 4) Stage 4 Post-Quantum Authentication implementing ML-DSA-65 lattice signatures for classical basis exchange, and 5) Stage 5 Hybrid Security Engine providing unified security scoring and automated policy enforcement. In empirical evaluations across 500+ trials, Q-SHIELD achieved >95% detection rate for stealth blinding attacks while maintaining false positive rates <= 5%."
        },
        "question_categories": [
            {
                "category": "PROJECT OVERVIEW",
                "questions": [
                    {
                        "q": "1. What is Q-SHIELD?",
                        "a": "Q-SHIELD is a comprehensive, layered quantum communication security operations framework and evaluation platform designed to protect BB84 Quantum Key Distribution against physical-layer eavesdropping and classical MITM attacks.",
                        "key_point": "Layered security combining QBER, AI telemetry, PQC authentication, and hybrid scoring."
                    },
                    {
                        "q": "2. What core problem does Q-SHIELD solve?",
                        "a": "Traditional QKD assumes QBER monitoring alone is sufficient to detect eavesdropping. However, advanced physical attacks (e.g., detector blinding) exploit detector non-linearities to keep QBER low while compromising secrecy. Q-SHIELD uses multi-dimensional AI telemetry and PQC to expose these stealth attacks.",
                        "key_point": "Low QBER does NOT guarantee security under physical-layer attacks."
                    },
                    {
                        "q": "3. Why did you choose the BB84 protocol?",
                        "a": "BB84 is the foundational quantum key distribution protocol based on the Heisenberg Uncertainty Principle and No-Cloning Theorem. It serves as the ideal baseline for evaluating physical and classical security enhancements.",
                        "key_point": "Foundational QKD protocol based on quantum mechanical principles."
                    }
                ]
            },
            {
                "category": "BB84 PROTOCOL CORE",
                "questions": [
                    {
                        "q": "4. What is Quantum Bit Error Rate (QBER)?",
                        "a": "QBER is the ratio of erroneous bits to total retained bits after basis sifting. In ideal conditions QBER is 0%. Environmental noise or eavesdropping increases QBER.",
                        "key_point": "QBER = Error Bits / Retained Sifted Bits."
                    },
                    {
                        "q": "5. Why is 11% QBER a critical threshold in BB84?",
                        "a": "Under standard asymptotic key rate bounds (Shor-Preskill bound), if QBER exceeds ~11%, Eve potentially gains more information than error correction can remove, making secret key extraction impossible.",
                        "key_point": "11% is the theoretical upper limit for secret key extraction in BB84."
                    },
                    {
                        "q": "6. What is Basis Reconciliation and Sifting?",
                        "a": "Alice and Bob publicly compare their chosen measurement bases over the classical channel. They retain bits where bases matched (~50%) and discard the rest. This produces the sifted key.",
                        "key_point": "Sifting retains matching basis rounds, discarding ~50% mismatched rounds."
                    }
                ]
            },
            {
                "category": "ATTACK MODELS",
                "questions": [
                    {
                        "q": "7. What is a Detector Blinding Attack?",
                        "a": "Eve shines strong continuous-wave laser light onto Bob's Single-Photon Avalanche Diodes (SPADs), blinding them into linear Geiger mode. Eve then controls Bob's detector clicks using bright optical pulses, stealing key material while keeping QBER unnaturally low.",
                        "key_point": "SPAD blinding exploits detector non-linearity to trick classical QBER monitoring."
                    },
                    {
                        "q": "8. What is Photon Number Splitting (PNS)?",
                        "a": "In weak coherent pulse BB84, Alice occasionally transmits multi-photon pulses. Eve splits off excess photons, stores them in quantum memory, and measures them after basis reconciliation without introducing errors.",
                        "key_point": "PNS targets multi-photon emissions in weak coherent pulse sources."
                    },
                    {
                        "q": "9. What is a Trojan-Horse Side-Channel Attack?",
                        "a": "Eve fires bright optical probe pulses into Alice's internal state preparation optics and analyzes back-reflected light to read Alice's basis and bit settings prior to transmission.",
                        "key_point": "Optical probe reflection side-channel targeting state preparation optics."
                    }
                ]
            },
            {
                "category": "AI ANOMALY DETECTION",
                "questions": [
                    {
                        "q": "10. Why use an Unsupervised Isolation Forest for AI Detection?",
                        "a": "Isolation Forest isolates anomalies by randomly partitioning feature space. It requires NO attack labels during training, allowing it to detect novel zero-day physical attacks purely by identifying statistical deviations from normal channel telemetry.",
                        "key_point": "Unsupervised model detects zero-day attacks without requiring pre-labeled attack data."
                    },
                    {
                        "q": "11. What physical telemetry features are fed to the AI model?",
                        "a": "The model ingests 8 physical metrics: rolling QBER, timing jitter (ps), detector response variance, click rate, burst rate, detection frequency (MHz), photon count statistics, and probe reflection intensity.",
                        "key_point": "8 physical hardware signals beyond classical QBER."
                    }
                ]
            },
            {
                "category": "POST-QUANTUM AUTHENTICATION",
                "questions": [
                    {
                        "q": "12. Why is Post-Quantum Authentication needed in BB84?",
                        "a": "BB84 requires an authenticated classical channel for basis reconciliation. If an adversary tampers with classical basis messages, they can execute a classical Man-in-the-Middle (MITM) attack. ML-DSA-65 lattice signatures prevent classical message tampering.",
                        "key_point": "BB84 security relies on classical channel authenticity; PQC prevents MITM tampering."
                    },
                    {
                        "q": "13. What algorithm is used for Stage 4 PQC?",
                        "a": "NIST FIPS 204 ML-DSA-65 (Module-Lattice-Based Digital Signature Standard), offering NIST Security Category 3 quantum-resistant authentication.",
                        "key_point": "NIST FIPS 204 ML-DSA-65 lattice digital signature standard."
                    }
                ]
            },
            {
                "category": "HYBRID SECURITY ENGINE",
                "questions": [
                    {
                        "q": "14. How does the Stage 5 Hybrid Security Engine work?",
                        "a": "It synthesizes 4 security components: QBER (25%), Stage 3 AI Anomaly (30%), Stage 4 PQC Validity (30%), and Physical Telemetry Health (15%) into a 0–100 overall security score with automated ALLOW/WARN/REJECT policy enforcement.",
                        "key_point": "Score = 0.25(QBER) + 0.30(AI) + 0.30(PQC) + 0.15(Telemetry)."
                    }
                ]
            },
            {
                "category": "EXPERIMENTS & EVALUATION",
                "questions": [
                    {
                        "q": "15. How did you evaluate Q-SHIELD empirically?",
                        "a": "Stage 7 batch experiment engine ran sweeps across attack intensities, multi-attack comparisons, confusion matrix evaluations, and PQC overhead benchmarks, confirming >95% detection rate for blinding attacks with FPR <= 5%.",
                        "key_point": "Empirical batch evaluations across 500+ trials."
                    }
                ]
            },
            {
                "category": "LIMITATIONS & FUTURE WORK",
                "questions": [
                    {
                        "q": "16. What are the main scientific limitations of Q-SHIELD?",
                        "a": "Evaluations are conducted using software-based quantum state vector & optical detector telemetry simulation models. Future work involves testing on real optical QKD hardware testbeds.",
                        "key_point": "Software simulation platform; validation on physical fiber testbeds is future work."
                    }
                ]
            }
        ]
    }
