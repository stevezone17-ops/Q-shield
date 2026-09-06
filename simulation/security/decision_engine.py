"""
Hybrid Security Decision Engine Implementation for Stage 5.

Combines independent outputs from:
1. BB84 / QBER analysis
2. Stage 2 physical attack channel telemetry
3. Stage 3 AI Anomaly Detection
4. Stage 4 Post-Quantum Classical Channel Authentication
"""

import time
from typing import List, Dict, Any, Optional
from simulation.security.types import (
    ComponentScores,
    SecurityWeights,
    HybridSecurityAssessment,
    SecurityLevel,
    SecurityDecision,
    KeyAction
)
from simulation.security.scoring import (
    compute_qber_component_score,
    compute_ai_component_score,
    compute_pqc_component_score,
    compute_telemetry_health_score
)
from simulation.security.rules import evaluate_rules
from simulation.security.explanations import generate_explanation_and_recommendation
from simulation.types import RoundTelemetry


class HybridSecurityEngine:
    """
    Central Q-SHIELD Security Decision Engine.
    Consumes independent security signals and produces unified, explainable security assessments.
    """

    def __init__(self, weights: Optional[SecurityWeights] = None):
        self.weights = weights or SecurityWeights()

    def evaluate(
        self,
        qber: float,
        telemetry: List[RoundTelemetry],
        ai_dict: Optional[Dict[str, Any]] = None,
        pqc_dict: Optional[Dict[str, Any]] = None,
        mitm_dict: Optional[Dict[str, Any]] = None,
        weights_override: Optional[SecurityWeights] = None
    ) -> HybridSecurityAssessment:
        """
        Evaluate all security signals and return a comprehensive HybridSecurityAssessment.
        """
        start_time = time.perf_counter()
        active_weights = weights_override or self.weights

        # 1. Compute Individual Component Scores & Assessments
        qber_score, qber_desc = compute_qber_component_score(qber)
        ai_score, ai_desc = compute_ai_component_score(ai_dict)
        pqc_score, pqc_desc = compute_pqc_component_score(pqc_dict)
        telemetry_score, telemetry_desc = compute_telemetry_health_score(telemetry)

        comp_scores = ComponentScores(
            qber_score=qber_score,
            ai_anomaly_score=ai_score,
            pqc_auth_score=pqc_score,
            telemetry_health_score=telemetry_score
        )

        # 2. Apply Rules & Critical Overrides
        (
            final_score,
            security_level,
            decision,
            key_action,
            critical_events,
            dominant_risks
        ) = evaluate_rules(
            qber=qber,
            component_scores=comp_scores,
            weights=active_weights,
            ai_dict=ai_dict,
            pqc_dict=pqc_dict,
            mitm_dict=mitm_dict
        )

        # 3. Generate Explanation & Policy Recommendation
        explanation, recommendation = generate_explanation_and_recommendation(
            score=final_score,
            level=security_level,
            decision=decision,
            key_action=key_action,
            qber=qber,
            qber_desc=qber_desc,
            ai_desc=ai_desc,
            pqc_desc=pqc_desc,
            telemetry_desc=telemetry_desc,
            critical_events=critical_events,
            dominant_risks=dominant_risks
        )

        eval_time_ms = round((time.perf_counter() - start_time) * 1000.0, 3)

        return HybridSecurityAssessment(
            enabled=True,
            security_score=final_score,
            security_level=security_level,
            decision=decision,
            key_action=key_action,
            component_scores=comp_scores.model_dump(),
            weights_used=active_weights.model_dump(),
            qber_assessment=qber_desc,
            ai_assessment=ai_desc,
            pqc_assessment=pqc_desc,
            telemetry_assessment=telemetry_desc,
            critical_events=critical_events,
            dominant_risks=dominant_risks,
            explanation=explanation,
            recommendation=recommendation,
            evaluation_time_ms=eval_time_ms
        )
