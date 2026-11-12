"""
FastAPI Backend Integration and 404 Regression Tests.
"""

import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


def test_api_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "operational"
    assert data["app_id"] == "q-shield"
    assert data["port"] == 8002
    assert "Q-SHIELD" in data["service"]


def test_api_health_root_fallback():
    # Regression: ensure /health without /api prefix does not return 404
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "operational"
    assert data["app_id"] == "q-shield"
    assert data["port"] == 8002
    assert "Q-SHIELD" in data["service"]


def test_api_health_trailing_slash():
    # Regression: ensure trailing slash on health check does not 404
    response = client.get("/api/health/")
    assert response.status_code == 200
    response_root = client.get("/health/")
    assert response_root.status_code == 200


def test_api_root_gateway():
    # Regression: ensure / and /api return metadata rather than 404
    res_root = client.get("/")
    assert res_root.status_code == 200
    assert res_root.json()["status"] == "operational"

    res_api = client.get("/api")
    assert res_api.status_code == 200
    assert res_api.json()["status"] == "operational"


def test_api_simulate_bb84_valid_request():
    payload = {
        "num_qubits": 500,
        "noise": 0.02,
        "seed": 42
    }
    response = client.post("/api/simulate/bb84", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["config"]["num_qubits"] == 500
    assert data["config"]["noise"] == 0.02
    assert "statistics" in data
    assert "rounds" in data
    assert len(data["rounds"]) == 500
    assert "final_secret_key_hex" in data


def test_api_simulate_bb84_trailing_slash_regression():
    # Regression: ensure POST with trailing slash works and does not 404
    payload = {
        "num_qubits": 100,
        "noise": 0.02,
        "seed": 42
    }
    response = client.post("/api/simulate/bb84/", json=payload)
    assert response.status_code == 200


def test_api_simulate_bb84_root_fallback_regression():
    # Regression: ensure POST without /api prefix does not 404
    payload = {
        "num_qubits": 100,
        "noise": 0.02,
        "seed": 42
    }
    response = client.post("/simulate/bb84", json=payload)
    assert response.status_code == 200


@pytest.mark.parametrize("attack_type", ["none", "pns", "trojan_horse", "detector_blinding", "mitm"])
def test_api_simulate_all_attack_modes(attack_type):
    payload = {
        "num_qubits": 100,
        "noise": 0.02,
        "seed": 42,
        "attack": attack_type,
        "attack_intensity": 0.5,
        "enable_ai_detection": True,
        "enable_pqc_authentication": True,
        "enable_hybrid_security": True
    }
    response = client.post("/api/simulate/bb84", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["attack"]["type"] == attack_type
    assert "ai_detection" in data
    assert "pqc_authentication" in data
    assert "hybrid_security" in data


def test_api_experiments_and_presentation_routes_registered():
    # Regression: verify all required endpoints are reachable and not 404
    templates_res = client.get("/api/experiments/templates")
    assert templates_res.status_code == 200
    assert "templates" in templates_res.json()

    demos_res = client.get("/api/presentation/demos")
    assert demos_res.status_code == 200
    assert "demos" in demos_res.json()

    viva_res = client.get("/api/presentation/viva")
    assert viva_res.status_code == 200
    assert "pitches" in viva_res.json()


def test_api_simulate_bb84_invalid_num_qubits():
    payload = {
        "num_qubits": -5,
        "noise": 0.02
    }
    response = client.post("/api/simulate/bb84", json=payload)
    assert response.status_code == 422  # Pydantic validation error


def test_api_simulate_bb84_invalid_noise():
    payload = {
        "num_qubits": 100,
        "noise": 2.5
    }
    response = client.post("/api/simulate/bb84", json=payload)
    assert response.status_code == 422  # Pydantic validation error
