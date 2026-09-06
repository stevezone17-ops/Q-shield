"""
Unit Tests for Stage 8 — Presentation & Viva Mode.

Verifies:
  - Live demo endpoints and preset configurations
  - Viva voce question bank, cheat sheet, and project pitch retrieval
  - Simulation compatibility for all 5 live demo presets (ensuring no fake data)
  - Demo execution with real simulation results
"""

import pytest
from backend.app.api.presentation import get_live_demo_presets, get_viva_question_bank
from simulation.engine import run_bb84_simulation


def test_presentation_demos_endpoint():
    res = get_live_demo_presets()
    assert "demos" in res
    demos = res["demos"]
    assert len(demos) == 5
    assert demos[0]["id"] == "demo_1"
    assert demos[1]["id"] == "demo_2"
    assert demos[2]["id"] == "demo_3"
    assert demos[3]["id"] == "demo_4"
    assert demos[4]["id"] == "demo_5"


def test_presentation_viva_endpoint():
    res = get_viva_question_bank()
    assert "pitches" in res
    assert "pitch_30s" in res["pitches"]
    assert "pitch_60s" in res["pitches"]
    assert "pitch_2m" in res["pitches"]
    assert "question_categories" in res
    categories = res["question_categories"]
    assert len(categories) >= 6

    # Verify each category has questions with 'q', 'a', and 'key_point'
    total_q = 0
    for cat in categories:
        assert "category" in cat
        assert "questions" in cat
        for q in cat["questions"]:
            total_q += 1
            assert "q" in q
            assert "a" in q
            assert "key_point" in q

    assert total_q >= 15


def test_presentation_demo_configs_validity():
    demos = get_live_demo_presets()["demos"]
    for demo in demos:
        cfg = demo["config"]
        assert cfg["num_qubits"] > 0
        assert 0.0 <= cfg["noise"] <= 1.0
        assert cfg["attack"] in ["none", "pns", "trojan_horse", "detector_blinding", "mitm"]


def test_presentation_demo_execution_real_data():
    """Verify that Demo 1 and Demo 2 run through the core engine producing real data."""
    demos = get_live_demo_presets()["demos"]

    # Demo 1: Clean
    demo1_cfg = demos[0]["config"]
    res1 = run_bb84_simulation(**demo1_cfg)
    assert res1.hybrid_security["security_level"] == "SECURE"
    assert res1.hybrid_security["key_action"] == "ALLOW_KEY"

    # Demo 2: Detector Blinding (Stealth)
    demo2_cfg = demos[1]["config"]
    res2 = run_bb84_simulation(**demo2_cfg)
    assert res2.hybrid_security["security_level"] == "COMPROMISED"
    assert res2.hybrid_security["key_action"] == "REJECT_KEY"
    assert res2.ai_detection["anomaly_score"] > 0.50
