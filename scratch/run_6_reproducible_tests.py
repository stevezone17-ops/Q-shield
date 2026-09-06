import sys
sys.path.insert(0, ".")
import json
import numpy as np
from simulation.engine import run_bb84_simulation

scenarios = [
    {
        "id": "TEST_1_CLEAN",
        "name": "Clean Baseline",
        "params": {
            "num_qubits": 500,
            "noise": 0.02,
            "seed": 42,
            "attack": "none",
            "attack_intensity": 0.0,
            "enable_ai_detection": True,
            "enable_pqc_authentication": True,
            "enable_hybrid_security": True
        }
    },
    {
        "id": "TEST_2_PNS",
        "name": "PNS Attack (40%)",
        "params": {
            "num_qubits": 500,
            "noise": 0.02,
            "seed": 42,
            "attack": "pns",
            "attack_intensity": 0.40,
            "enable_ai_detection": True,
            "enable_pqc_authentication": True,
            "enable_hybrid_security": True
        }
    },
    {
        "id": "TEST_3_TROJAN_HORSE",
        "name": "Trojan-Horse Attack (50%)",
        "params": {
            "num_qubits": 500,
            "noise": 0.02,
            "seed": 42,
            "attack": "trojan_horse",
            "attack_intensity": 0.50,
            "enable_ai_detection": True,
            "enable_pqc_authentication": True,
            "enable_hybrid_security": True
        }
    },
    {
        "id": "TEST_4_DETECTOR_BLINDING",
        "name": "Detector Blinding Attack (70%)",
        "params": {
            "num_qubits": 500,
            "noise": 0.02,
            "seed": 42,
            "attack": "detector_blinding",
            "attack_intensity": 0.70,
            "enable_ai_detection": True,
            "enable_pqc_authentication": True,
            "enable_hybrid_security": True
        }
    },
    {
        "id": "TEST_5_MITM_NO_PQC",
        "name": "MITM Attack without PQC (80%)",
        "params": {
            "num_qubits": 500,
            "noise": 0.02,
            "seed": 42,
            "attack": "mitm",
            "attack_intensity": 0.80,
            "enable_ai_detection": True,
            "enable_pqc_authentication": False,
            "enable_hybrid_security": True
        }
    },
    {
        "id": "TEST_6_MITM_WITH_PQC",
        "name": "MITM Attack with PQC (80%)",
        "params": {
            "num_qubits": 500,
            "noise": 0.02,
            "seed": 42,
            "attack": "mitm",
            "attack_intensity": 0.80,
            "enable_ai_detection": True,
            "enable_pqc_authentication": True,
            "enable_hybrid_security": True
        }
    }
]

results = {}

for sc in scenarios:
    res = run_bb84_simulation(**sc["params"])
    
    stats = res.statistics
    ec_stats = res.error_correction
    pa_stats = res.privacy_amplification
    ai_res = res.ai_detection
    pqc_res = res.pqc_authentication
    hybrid_res = res.hybrid_security
    
    results[sc["id"]] = {
        "name": sc["name"],
        "num_qubits": stats.transmitted,
        "sifted_key_length": stats.sifted_key_length,
        "qber_pct": round(stats.qber_percent, 4),
        "error_correction_efficiency": ec_stats.reconciliation_efficiency,
        "derived_key_length": pa_stats.final_key_length,
        "telemetry_rounds_count": len(res.telemetry),
        "ai_anomaly_score": round(ai_res["anomaly_score"], 4) if ai_res else None,
        "ai_status": ai_res["status"] if ai_res else None,
        "pqc_valid": pqc_res["signature_valid"] if pqc_res else None,
        "pqc_message_modified": pqc_res["message_modified"] if pqc_res else None,
        "pqc_mitm_blocked": pqc_res["mitm_blocked"] if pqc_res else None,
        "hybrid_security_score": round(hybrid_res["security_score"], 2) if hybrid_res else None,
        "hybrid_security_level": hybrid_res["security_level"] if hybrid_res else None,
        "hybrid_security_decision": hybrid_res["decision"] if hybrid_res else None,
        "hybrid_key_action": hybrid_res["key_action"] if hybrid_res else None,
        "hybrid_component_scores": hybrid_res["component_scores"] if hybrid_res else None
    }

print(json.dumps(results, indent=2))

with open("D:/quantum_cia3/FINAL_SIMULATION_RESULTS.json", "w") as f:
    json.dump(results, f, indent=2)
