import { SimulationResult } from '../types/simulation';

export interface TelemetrySignalSummary {
  name: string;
  valueStr: string;
  rawVal: number;
  unit: string;
  status: 'NOMINAL' | 'ELEVATED' | 'ANOMALOUS' | 'ABNORMAL' | 'HIGH QBER' | 'PNS RISK' | 'PROBE DETECTED' | 'OPTIMAL' | 'CLEAN' | 'BASELINE';
  statusCategory: 'normal' | 'warning' | 'critical';
  explanation: string;
}

export interface ReportSummaryData {
  execSummaryText: string;
  securityLevel: string;
  securityScoreStr: string;
  decision: string;
  keyAction: string;
  configExplanation: string;
  bb84WhatHappened: string;
  bb84WhyItMatters: string;
  attackTitle: string;
  attackExplanation: string;
  telemetrySignals: TelemetrySignalSummary[];
  abnormalTelemetryObs: string;
  aiExplanation: string;
  pqcExplanation: string;
  hybridWhyExplanation: string;
  decisionSteps: string[];
  keyResultExplanation: string;
  whatToSayText: string;
  technicalInterpretation: { title: string; desc: string }[];
  limitations: string[];
}

export function computeTelemetrySummaries(result: SimulationResult): TelemetrySignalSummary[] {
  const { statistics, telemetry } = result;
  const count = telemetry.length || 1;

  const avgClickRate = telemetry.reduce((a, b) => a + b.click_rate, 0) / count;
  const avgJitter = telemetry.reduce((a, b) => a + b.timing_jitter, 0) / count;
  const avgVariance = telemetry.reduce((a, b) => a + b.detector_response_variance, 0) / count;
  const avgBurstRate = telemetry.reduce((a, b) => a + b.burst_rate, 0) / count;
  const avgFrequency = telemetry.reduce((a, b) => a + b.detection_frequency, 0) / count;
  const avgPhotonStats = telemetry.reduce((a, b) => a + b.photon_count_statistics, 0) / count;
  const avgProbeReflection = telemetry.reduce((a, b) => a + b.probe_reflection_intensity, 0) / count;
  const qberPercent = statistics.qber_percent;

  const qberStatus = qberPercent <= 11.0 ? 'NOMINAL' : 'HIGH QBER';
  const clickStatus = avgClickRate >= 0.8 && avgClickRate <= 1.2 ? 'NOMINAL' : 'ELEVATED';
  const jitterStatus = avgJitter > 30.0 ? 'ABNORMAL' : 'NOMINAL';
  const varianceStatus = avgVariance > 0.05 ? 'ANOMALOUS' : 'NOMINAL';
  const burstStatus = avgBurstRate > 0.1 ? 'ELEVATED' : 'NOMINAL';
  const photonStatus = avgPhotonStats > 1.15 ? 'PNS RISK' : 'BASELINE';
  const probeStatus = avgProbeReflection > 0.05 ? 'PROBE DETECTED' : 'CLEAN';

  return [
    {
      name: 'QBER Signal',
      valueStr: `${qberPercent.toFixed(2)}%`,
      rawVal: qberPercent,
      unit: '% error rate',
      status: qberStatus,
      statusCategory: qberPercent <= 11.0 ? 'normal' : 'critical',
      explanation: qberPercent <= 11.0
        ? 'Quantum bit error rate is within nominal baseline limits (<= 11.0%).'
        : 'Quantum bit error rate exceeds configured high-error threshold (11.0%).',
    },
    {
      name: 'Click Rate',
      valueStr: `${avgClickRate.toFixed(2)}`,
      rawVal: avgClickRate,
      unit: 'clicks / pulse',
      status: clickStatus,
      statusCategory: clickStatus === 'NOMINAL' ? 'normal' : 'warning',
      explanation: clickStatus === 'NOMINAL'
        ? 'Single-photon detector click rate is consistent with expected optical pulse power.'
        : 'Detector click rate deviates from expected baseline, indicating potential flux anomaly.',
    },
    {
      name: 'Timing Jitter',
      valueStr: `${avgJitter.toFixed(1)} ps`,
      rawVal: avgJitter,
      unit: 'picoseconds',
      status: jitterStatus,
      statusCategory: jitterStatus === 'NOMINAL' ? 'normal' : 'critical',
      explanation: jitterStatus === 'NOMINAL'
        ? 'Detection pulse timing jitter is within standard thermal/electronic tolerances.'
        : 'Elevated arrival timing jitter detected, indicating potential detector mode manipulation.',
    },
    {
      name: 'Detector Variance',
      valueStr: avgVariance.toFixed(3),
      rawVal: avgVariance,
      unit: 'variance index',
      status: varianceStatus,
      statusCategory: varianceStatus === 'NOMINAL' ? 'normal' : 'warning',
      explanation: varianceStatus === 'NOMINAL'
        ? 'APD response variance matches normal statistical dark count and breakdown distributions.'
        : 'Anomalous detector response variance observed across sampled transmission windows.',
    },
    {
      name: 'Burst Rate',
      valueStr: `${(avgBurstRate * 100).toFixed(1)}%`,
      rawVal: avgBurstRate,
      unit: 'bursts / second',
      status: burstStatus,
      statusCategory: burstStatus === 'NOMINAL' ? 'normal' : 'warning',
      explanation: burstStatus === 'NOMINAL'
        ? 'Avalanche photo-detector click cluster rate is within normal thermal limits.'
        : 'Elevated cluster rate of closely timed detection events observed.',
    },
    {
      name: 'Detection Frequency',
      valueStr: `${avgFrequency.toFixed(1)} MHz`,
      rawVal: avgFrequency,
      unit: 'clock rate',
      status: 'OPTIMAL',
      statusCategory: 'normal',
      explanation: 'System detection clock frequency operates stably at configured rate.',
    },
    {
      name: 'Photon Statistics',
      valueStr: avgPhotonStats.toFixed(2),
      rawVal: avgPhotonStats,
      unit: 'photon count index',
      status: photonStatus,
      statusCategory: photonStatus === 'BASELINE' ? 'normal' : 'warning',
      explanation: photonStatus === 'BASELINE'
        ? 'Photon count statistics match expected baseline single-photon source distribution.'
        : 'Elevated multi-photon pulse fraction detected, increasing vulnerability to photon number splitting.',
    },
    {
      name: 'Probe Reflection',
      valueStr: `${(avgProbeReflection * 100).toFixed(1)}%`,
      rawVal: avgProbeReflection,
      unit: 'optical return',
      status: probeStatus,
      statusCategory: probeStatus === 'CLEAN' ? 'normal' : 'critical',
      explanation: probeStatus === 'CLEAN'
        ? 'No anomalous optical back-reflection measured at Bob interface.'
        : 'High optical probe back-reflection detected, characteristic of active Trojan-Horse probing.',
    },
  ];
}

export function generateReportData(result: SimulationResult): ReportSummaryData {
  const { config, statistics, attack, mitm, privacy_amplification, ai_detection, pqc_authentication, hybrid_security } = result;

  const n = statistics.transmitted;
  const noisePct = (config.noise * 100).toFixed(1);
  const attackNameStr = config.attack === 'none' ? 'no (clean baseline)' : `${config.attack.replace('_', '-').toUpperCase()} (${(config.attack_intensity * 100).toFixed(0)}% intensity)`;

  const secLevel = hybrid_security?.security_level || (statistics.qber_percent <= 11.0 ? 'SECURE' : 'COMPROMISED');
  const secScore = hybrid_security?.security_score !== undefined ? `${hybrid_security.security_score.toFixed(1)} / 100` : 'N/A';
  const decision = hybrid_security?.decision || (statistics.qber_percent <= 11.0 ? 'NO_ATTACK_DETECTED' : 'ATTACK_DETECTED');
  const keyAction = hybrid_security?.key_action || (statistics.qber_percent <= 11.0 ? 'ALLOW_KEY' : 'REJECT_KEY');

  const execSummaryText = `Q-SHIELD evaluated a BB84 communication session involving ${n} transmitted qubits under ${noisePct}% channel noise with ${attackNameStr} attack conditions. The session was classified as ${secLevel}. The final security decision was ${decision}, resulting in ${keyAction}.`;

  // Section 2: Config explanation
  let configExplanation = '';
  if (config.attack === 'none') {
    configExplanation = `${n} qubits were transmitted through a simulated quantum channel with ${noisePct}% noise. No attacker was configured, so this represents a clean baseline for comparison.`;
  } else if (config.attack === 'detector_blinding') {
    configExplanation = `${n} qubits were transmitted under a simulated Detector Blinding attack at ${(config.attack_intensity * 100).toFixed(0)}% intensity with ${noisePct}% channel noise. Eve attempts to blind Bob's detectors into linear mode while keeping QBER low.`;
  } else if (config.attack === 'mitm') {
    configExplanation = `${n} qubits were transmitted with a Man-in-the-Middle (MITM) classical channel attack model active at ${(config.attack_intensity * 100).toFixed(0)}% intensity. Eve intercepts and modifies classical reconciliation messages between Alice and Bob.`;
  } else if (config.attack === 'pns') {
    configExplanation = `${n} qubits were transmitted under a Photon Number Splitting (PNS) attack model at ${(config.attack_intensity * 100).toFixed(0)}% intensity. Eve exploits multi-photon pulses to siphon off quantum information without introducing direct bit errors.`;
  } else if (config.attack === 'trojan_horse') {
    configExplanation = `${n} qubits were transmitted under a Trojan-Horse attack model at ${(config.attack_intensity * 100).toFixed(0)}% intensity. Eve shines optical probe pulses into Bob's equipment to read detector basis settings via optical reflection.`;
  } else {
    configExplanation = `${n} qubits were transmitted with ${config.attack} attack model at ${(config.attack_intensity * 100).toFixed(0)}% intensity under ${noisePct}% channel noise.`;
  }

  // Section 3: BB84 result
  const sifted = statistics.sifted_key_length;
  const finalKey = privacy_amplification.final_key_length;
  const qberVal = statistics.qber_percent.toFixed(2);
  const keyYieldVal = ((finalKey / n) * 100).toFixed(2);

  const bb84WhatHappened = `After basis reconciliation, ${sifted} bits were retained from ${n} transmitted qubits. Error correction and privacy amplification produced a final secret key of ${finalKey} bits (key yield: ${keyYieldVal}%). The measured QBER was ${qberVal}%.`;

  let bb84WhyItMatters = '';
  if (statistics.qber_percent <= 11.0) {
    if (config.attack === 'detector_blinding' && attack.affected_rounds > 0) {
      bb84WhyItMatters = `The measured QBER of ${qberVal}% is below the 11.0% high-QBER threshold. However, relying solely on QBER is misleading here: Eve's detector-blinding attack deliberately suppresses QBER to evade standard quantum channel error checks.`;
    } else {
      bb84WhyItMatters = `The measured QBER of ${qberVal}% is well below the configured 11.0% high-QBER threshold, indicating acceptable error rates for key generation under the selected conditions.`;
    }
  } else {
    bb84WhyItMatters = `The measured QBER of ${qberVal}% exceeds the 11.0% high-QBER threshold. In standard QKD protocols, a high QBER indicates high channel noise or aggressive eavesdropping, requiring immediate key rejection.`;
  }

  // Section 4: Attack Analysis
  let attackTitle = 'ATTACK ANALYSIS — CLEAN BASELINE';
  let attackExplanation = '';
  if (config.attack === 'none') {
    attackTitle = 'ATTACK ANALYSIS — CLEAN BASELINE';
    attackExplanation = 'No explicit attack model was enabled for this simulation. The system therefore evaluates the session as a baseline for comparison.';
  } else if (config.attack === 'detector_blinding') {
    attackTitle = `ATTACK ANALYSIS — DETECTOR BLINDING (${(config.attack_intensity * 100).toFixed(0)}% INTENSITY)`;
    attackExplanation = `The detector-blinding model introduced abnormal detector behavior across ${attack.affected_rounds} rounds. The simulated QBER remained at ${qberVal}%, while physical telemetry exhibited significant deviations in timing jitter and detector response variance.`;
  } else if (config.attack === 'mitm') {
    attackTitle = `ATTACK ANALYSIS — MAN-IN-THE-MIDDLE (${(config.attack_intensity * 100).toFixed(0)}% INTENSITY)`;
    const modStatus = mitm.message_modified ? 'modified classical sifting messages during reconciliation' : 'attempted classical channel interception';
    attackExplanation = `The MITM model ${modStatus}. PQC authentication was therefore critical to determining whether the classical message could be trusted.`;
  } else if (config.attack === 'pns') {
    attackTitle = `ATTACK ANALYSIS — PHOTON NUMBER SPLITTING (${(config.attack_intensity * 100).toFixed(0)}% INTENSITY)`;
    attackExplanation = `The PNS model simulated exploitation of multi-photon transmission behavior across ${attack.affected_rounds} rounds. Eve siphoned off multi-photon pulses while maintaining a low QBER of ${qberVal}%.`;
  } else if (config.attack === 'trojan_horse') {
    attackTitle = `ATTACK ANALYSIS — TROJAN-HORSE (${(config.attack_intensity * 100).toFixed(0)}% INTENSITY)`;
    attackExplanation = `The Trojan-Horse model simulated probe/reflection behavior in the quantum channel, reflecting optical energy back from Bob's detector interface across ${attack.affected_rounds} rounds.`;
  } else {
    attackTitle = `ATTACK ANALYSIS — ${config.attack.toUpperCase()}`;
    attackExplanation = `The ${config.attack} simulation affected ${attack.affected_rounds} rounds with an estimated Eve information leakage of ${(attack.estimated_eve_information * 100).toFixed(1)}%.`;
  }

  // Section 5: Telemetry
  const telemetrySignals = computeTelemetrySummaries(result);
  const abnormalSignals = telemetrySignals.filter(s => s.statusCategory !== 'normal');
  let abnormalTelemetryObs = '';
  if (abnormalSignals.length > 0) {
    abnormalTelemetryObs = `Telemetry anomaly monitor flagged ${abnormalSignals.length} signal(s): ${abnormalSignals.map(s => `${s.name} (${s.valueStr} - ${s.status})`).join(', ')}.`;
  } else {
    abnormalTelemetryObs = 'All 8 physical telemetry signals remained within expected nominal baseline parameters.';
  }

  // Section 6: AI Anomaly Detection
  let aiExplanation = '';
  if (!ai_detection || !ai_detection.enabled) {
    aiExplanation = 'Stage 3 AI Anomaly Detector is disabled in current simulation parameters.';
  } else {
    const scorePct = (ai_detection.anomaly_score * 100).toFixed(1);
    if (ai_detection.stealth_attack_detected) {
      aiExplanation = `Stage 3 Isolation Forest classified the telemetry as ${ai_detection.status} (anomaly score: ${scorePct}%). Although the QBER remained below the configured high-QBER threshold (${qberVal}%), the AI detector identified abnormal physical telemetry. This demonstrates the purpose of using multiple signals rather than relying only on QBER.`;
    } else if (ai_detection.status !== 'NORMAL') {
      aiExplanation = `Stage 3 classified the telemetry as ${ai_detection.status} (anomaly score: ${scorePct}%) because the observed signal pattern (${ai_detection.dominant_signals.join(', ') || 'telemetry features'}) deviated from the normal simulated baseline.`;
    } else {
      aiExplanation = `Stage 3 classified the telemetry as NORMAL (anomaly score: ${scorePct}%). Telemetry signal patterns matched the normal baseline distribution within expected confidence levels.`;
    }
  }

  // Section 7: PQC Authentication
  let pqcExplanation = '';
  if (!pqc_authentication || !pqc_authentication.enabled) {
    pqcExplanation = 'Stage 4 PQC Authentication is disabled in current simulation parameters.';
  } else if (pqc_authentication.signature_valid) {
    pqcExplanation = 'The ML-DSA-65 signature was successfully verified. This indicates that the simulated classical message passed the configured authentication check.';
  } else {
    pqcExplanation = 'The ML-DSA-65 signature verification failed. The classical message therefore cannot be trusted under the configured authentication policy.';
  }

  // Section 8: Hybrid Security Decision
  let hybridWhyExplanation = '';
  if (!hybrid_security || !hybrid_security.enabled) {
    hybridWhyExplanation = 'Stage 5 Hybrid Security Engine is disabled. Security evaluation falls back to standard QBER threshold enforcement.';
  } else {
    if (hybrid_security.key_action === 'REJECT_KEY') {
      if (config.attack === 'detector_blinding' || (ai_detection && ai_detection.stealth_attack_detected)) {
        hybridWhyExplanation = `The hybrid engine classified the session as ${hybrid_security.security_level} because abnormal AI and telemetry signals outweighed the low QBER value under the configured security policy.`;
      } else if (pqc_authentication && !pqc_authentication.signature_valid) {
        hybridWhyExplanation = `The hybrid engine classified the session as ${hybrid_security.security_level} because classical ML-DSA signature verification failed due to MITM tampering.`;
      } else if (statistics.qber_percent > 11.0) {
        hybridWhyExplanation = `The hybrid engine classified the session as ${hybrid_security.security_level} because high QBER (${qberVal}%) breached quantum error limits.`;
      } else {
        hybridWhyExplanation = `The hybrid engine classified the session as ${hybrid_security.security_level} due to multi-signal threat evaluation (${hybrid_security.explanation}).`;
      }
    } else if (hybrid_security.key_action === 'ALLOW_KEY') {
      hybridWhyExplanation = 'The hybrid engine classified the session as SECURE because QBER, AI anomaly score, PQC authentication, and telemetry were all within the configured normal conditions.';
    } else {
      hybridWhyExplanation = `The hybrid engine classified the session as ${hybrid_security.security_level} (${hybrid_security.decision}), issuing a caution while permitting conditional key handling.`;
    }
  }

  // Section 9: Why the system made this decision (7-step numbered breakdown)
  const decisionSteps: string[] = [
    `1. QBER remained at ${qberVal}%, ${statistics.qber_percent <= 11.0 ? 'below the configured 11.0% threshold.' : 'exceeding the 11.0% high-QBER threshold.'}`,
    `2. Attack condition: ${config.attack === 'none' ? 'No attack model active (clean baseline).' : `${config.attack.replace('_', '-').toUpperCase()} simulation active at ${(config.attack_intensity * 100).toFixed(0)}% intensity affecting ${attack.affected_rounds} rounds.`}`,
    `3. Telemetry condition: ${abnormalSignals.length > 0 ? `Abnormal telemetry identified in ${abnormalSignals.map(s => s.name).join(', ')}.` : 'Physical telemetry remained nominal across all 8 monitored signals.'}`,
    `4. AI result: ${ai_detection?.enabled ? `AI detector returned ${ai_detection.status} with anomaly score ${(ai_detection.anomaly_score * 100).toFixed(1)}%.` : 'AI detection disabled.'}`,
    `5. PQC result: ${pqc_authentication?.enabled ? `ML-DSA-65 classical signature verification ${pqc_authentication.signature_valid ? 'VALID (message authentic).' : 'FAILED (signature mismatch / MITM tampering).'}` : 'PQC authentication disabled.'}`,
    `6. Hybrid decision: The hybrid engine evaluated a synthesis score of ${hybrid_security ? hybrid_security.security_score.toFixed(1) : (statistics.qber_percent <= 11 ? 100 : 0)}/100, classifying session as ${secLevel}.`,
    `7. Final key action: Policy action ${keyAction} was enforced (${keyAction === 'ALLOW_KEY' ? 'key approved under configured security policy' : 'key rejected and discarded'}).`,
  ];

  // Section 10: Key Result
  let keyResultExplanation = '';
  if (keyAction === 'ALLOW_KEY') {
    keyResultExplanation = 'The generated key is approved for use under the configured Q-SHIELD security policy.';
  } else if (keyAction === 'REJECT_KEY') {
    keyResultExplanation = 'The current security policy does not permit the derived key to be used. The session was flagged as compromised or untrusted.';
  } else {
    keyResultExplanation = 'The current security policy issued a warning regarding key quality or signal deviations. Inspect telemetry before using key.';
  }

  // Section 11: How to explain this result ("WHAT TO SAY")
  let whatToSayText = '';
  if (config.attack === 'none') {
    whatToSayText = `"This is the clean BB84 baseline. We transmitted ${n} qubits with ${noisePct}% simulated channel noise. The resulting QBER was ${qberVal}%, the AI detector classified the telemetry as normal, ML-DSA authentication was valid, and the hybrid engine produced a secure decision, so the key was allowed under the configured security policy."`;
  } else if (config.attack === 'detector_blinding') {
    whatToSayText = `"This run simulates a detector-blinding attack at ${(config.attack_intensity * 100).toFixed(0)}% intensity. Although the QBER remained at ${qberVal}% (below the configured 11% high-QBER threshold), the simulated detector telemetry became abnormal. The AI detector identified the physical anomaly, and the hybrid security engine classified the session as compromised and rejected the key."`;
  } else if (config.attack === 'mitm') {
    whatToSayText = `"This run simulates a man-in-the-middle attack against the classical channel. ML-DSA-65 post-quantum signature verification detects that the classical message was tampered with, so the hybrid security engine blocks the attack and rejects the key."`;
  } else if (config.attack === 'pns') {
    whatToSayText = `"This run simulates a photon number splitting attack at ${(config.attack_intensity * 100).toFixed(0)}% intensity. Eve siphons off multi-photon pulses. Multi-signal analysis detects multi-photon statistics anomalies, and the hybrid engine classifies the session as ${secLevel} and enforces policy action ${keyAction}."`;
  } else if (config.attack === 'trojan_horse') {
    whatToSayText = `"This run simulates a Trojan-Horse optical probe attack at ${(config.attack_intensity * 100).toFixed(0)}% intensity. Bob's interface displays abnormal probe reflection telemetry, triggering an AI anomaly detection and resulting in policy action ${keyAction}."`;
  } else {
    whatToSayText = `"This run evaluates a ${config.attack} attack model at ${(config.attack_intensity * 100).toFixed(0)}% intensity. The multi-layer decision pipeline evaluated QBER (${qberVal}%), physical telemetry, AI anomaly detection, and PQC authentication to reach a final classification of ${secLevel} with key action ${keyAction}."`;
  }

  // Section 12: Technical Interpretation
  const technicalInterpretation = [
    {
      title: 'QBER (Quantum Bit Error Rate)',
      desc: `Measures error fraction in basis-matched sifting rounds. Current value: ${qberVal}%. Baseline threshold is 11.0%.`,
    },
    {
      title: 'AI Physical Telemetry Anomaly Detection',
      desc: `Monitors 8 hardware-level signals (timing jitter, APD response variance, click rates) using an unsupervised Isolation Forest model to detect zero-day attacks that bypass QBER.`,
    },
    {
      title: 'PQC Classical Channel Authentication',
      desc: `Applies NIST FIPS 204 ML-DSA-65 digital signatures to authenticate public basis reconciliation and error correction messages against MITM tampering.`,
    },
    {
      title: 'Physical Telemetry Stream',
      desc: `Analyzes physical detector phenomena (afterpulsing, timing jitter, optical reflections) to assess optical and electronic channel integrity.`,
    },
    {
      title: 'Stage 5 Hybrid Decision Engine',
      desc: `Synthesizes QBER (25%), AI (30%), PQC (30%), and Telemetry (15%) into a unified score (0–100) to prevent single-point-of-failure evasions.`,
    },
  ];

  // Section 13: Limitations
  const limitations = [
    'Simulation-Based Environment: All quantum states, channels, and single-photon detectors are software behavioral simulations.',
    'Software Threat Abstractions: Attack models (blinding, PNS, Trojan-Horse, MITM) simulate physical eavesdropping behavior algorithmically.',
    'Simulated Physical Telemetry: Telemetry signals are sampled from synthetic statistical distributions, not physical QKD hardware measurements.',
    'Classical Channel Scope: ML-DSA-65 authenticates classical sifting/reconciliation messages and does not protect or measure quantum states directly.',
    'Project Design Thresholds: The 11.0% QBER threshold and hybrid weighting scheme (25/30/30/15) represent project configuration choices, not universal physical laws.',
  ];

  return {
    execSummaryText,
    securityLevel: secLevel,
    securityScoreStr: secScore,
    decision,
    keyAction,
    configExplanation,
    bb84WhatHappened,
    bb84WhyItMatters,
    attackTitle,
    attackExplanation,
    telemetrySignals,
    abnormalTelemetryObs,
    aiExplanation,
    pqcExplanation,
    hybridWhyExplanation,
    decisionSteps,
    keyResultExplanation,
    whatToSayText,
    technicalInterpretation,
    limitations,
  };
}

export function generateMarkdownReportText(result: SimulationResult): string {
  const data = generateReportData(result);
  const { config, statistics, attack, mitm, privacy_amplification, ai_detection, pqc_authentication, hybrid_security } = result;
  const timestamp = new Date().toISOString();

  return `# Q-SHIELD SIMULATION EXPLANATION REPORT
**Timestamp:** ${timestamp}  
**Session ID:** QS-${Math.floor(1000 + Math.random() * 9000)}  

---

## SECTION 1 — EXECUTIVE SUMMARY
${data.execSummaryText}

- **Security Level:** ${data.securityLevel}
- **Security Score:** ${data.securityScoreStr}
- **Decision:** ${data.decision}
- **Key Action:** ${data.keyAction}

---

## SECTION 2 — SIMULATION CONFIGURATION
- **Transmitted Qubits:** ${config.num_qubits}
- **Channel Noise Rate:** ${(config.noise * 100).toFixed(1)}%
- **Attack Type:** ${config.attack.toUpperCase()}
- **Attack Intensity:** ${config.attack !== 'none' ? `${(config.attack_intensity * 100).toFixed(0)}%` : 'N/A'}
- **AI Detector:** ${config.enable_ai_detection ? 'ENABLED' : 'DISABLED'}
- **PQC Authentication:** ${config.enable_pqc_authentication ? 'ENABLED' : 'DISABLED'}
- **Hybrid Engine:** ${config.enable_hybrid_security ? 'ENABLED' : 'DISABLED'}

*Configuration Note:* ${data.configExplanation}

---

## SECTION 3 — BB84 RESULT
- **Transmitted Qubits:** ${statistics.transmitted}
- **Sifted Key Length:** ${statistics.sifted_key_length} bits
- **Derived Key Length:** ${privacy_amplification.final_key_length} bits
- **Measured QBER:** ${statistics.qber_percent.toFixed(2)}%
- **Key Yield:** ${((privacy_amplification.final_key_length / statistics.transmitted) * 100).toFixed(2)}%

### WHAT HAPPENED
${data.bb84WhatHappened}

### WHY IT MATTERS
${data.bb84WhyItMatters}

---

## SECTION 4 — ${data.attackTitle}
- **Attack Model:** ${attack.type.toUpperCase()}
- **Attack Intensity:** ${(attack.intensity * 100).toFixed(0)}%
- **Affected Rounds:** ${attack.affected_rounds} / ${statistics.transmitted}
- **Eve Estimated Info Leakage:** ${(attack.estimated_eve_information * 100).toFixed(1)}%
- **MITM Classical Message Tampered:** ${mitm.message_modified ? 'YES' : 'NO'}

*Explanation:*  
${data.attackExplanation}  
*(Note: Attack models are software behavioral simulations and do not represent physical hardware executions.)*

---

## SECTION 5 — PHYSICAL TELEMETRY ANALYSIS
| Signal Name | Measured Value | Unit | Status | Explanation |
| :--- | :--- | :--- | :--- | :--- |
${data.telemetrySignals.map(s => `| ${s.name} | ${s.valueStr} | ${s.unit} | ${s.status} | ${s.explanation} |`).join('\n')}

### KEY TELEMETRY OBSERVATIONS
${data.abnormalTelemetryObs}

---

## SECTION 6 — AI ANOMALY DETECTION
- **AI Detector Status:** ${ai_detection?.enabled ? 'ENABLED' : 'DISABLED'}
- **Classification Status:** ${ai_detection?.status || 'N/A'}
- **Anomaly Score:** ${ai_detection?.anomaly_score !== undefined ? `${(ai_detection.anomaly_score * 100).toFixed(1)}%` : 'N/A'}
- **Dominant Anomalous Signals:** ${ai_detection?.dominant_signals?.join(', ') || 'None'}
- **Stealth Condition Flag:** ${ai_detection?.stealth_attack_detected ? 'TRUE (Low QBER + High Telemetry Anomaly)' : 'FALSE'}

*Analysis:*  
${data.aiExplanation}

---

## SECTION 7 — PQC AUTHENTICATION
- **PQC Algorithm:** ${pqc_authentication?.algorithm || 'ML-DSA-65 (FIPS 204)'}
- **Signature Validity:** ${pqc_authentication?.signature_valid ? 'VALID' : 'INVALID'}
- **Classical Message Accepted:** ${pqc_authentication?.message_accepted ? 'YES' : 'NO'}
- **MITM Attack Blocked:** ${pqc_authentication?.mitm_blocked ? 'YES' : 'NO'}
- **Total Auth Latency:** ${pqc_authentication?.total_authentication_time_ms ? `${pqc_authentication.total_authentication_time_ms.toFixed(2)} ms` : 'N/A'}

*Analysis:*  
${data.pqcExplanation}  
*Important Clarification:* ML-DSA-65 is being used here to authenticate the classical communication channel. It does not provide direct protection of the quantum state.

---

## SECTION 8 — HYBRID SECURITY DECISION
- **Synthesis Security Score:** ${hybrid_security ? hybrid_security.security_score.toFixed(1) : 'N/A'} / 100
- **Security Level:** ${data.securityLevel}
- **Decision:** ${data.decision}
- **Key Policy Action:** ${data.keyAction}

### WEIGHTED COMPONENT BREAKDOWN
- **QBER Signal (25%):** ${hybrid_security?.component_scores.qber_score.toFixed(0) || 'N/A'}/100 — ${hybrid_security?.qber_assessment || 'N/A'}
- **AI Anomaly Score (30%):** ${hybrid_security?.component_scores.ai_anomaly_score.toFixed(0) || 'N/A'}/100 — ${hybrid_security?.ai_assessment || 'N/A'}
- **PQC Authentication (30%):** ${hybrid_security?.component_scores.pqc_auth_score.toFixed(0) || 'N/A'}/100 — ${hybrid_security?.pqc_assessment || 'N/A'}
- **Telemetry Health (15%):** ${hybrid_security?.component_scores.telemetry_health_score.toFixed(0) || 'N/A'}/100 — ${hybrid_security?.telemetry_assessment || 'N/A'}

*Why this decision occurred:*  
${data.hybridWhyExplanation}

---

## SECTION 9 — WHY THE SYSTEM MADE THIS DECISION
${data.decisionSteps.join('\n')}

---

## SECTION 10 — KEY RESULT
### KEY POLICY ACTION: ${data.keyAction}
${data.keyResultExplanation}  
*(Note: Key is allowed or rejected under the configured security policy. It is not claimed to be universally or mathematically guaranteed secure.)*

---

## SECTION 11 — HOW TO EXPLAIN THIS RESULT ("WHAT TO SAY")
${data.whatToSayText}

---

## SECTION 12 — TECHNICAL INTERPRETATION
${data.technicalInterpretation.map(t => `- **${t.title}:** ${t.desc}`).join('\n')}

---

## SECTION 13 — LIMITATIONS & SCIENTIFIC CAVEATS
${data.limitations.map(l => `- ${l}`).join('\n')}
`;
}
