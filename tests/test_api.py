"""
FastAPI Backend Integration Unit Tests.
"""

import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


def test_api_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "service" in data


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
