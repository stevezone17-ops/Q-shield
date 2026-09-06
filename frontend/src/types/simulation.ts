export interface TransmissionRound {
  index: number;
  alice_bit: number;
  alice_basis: string; // "rectilinear" | "diagonal"
  state: string;       // "|0>" | "|1>" | "|+>" | "|->"
  bob_basis: string;   // "rectilinear" | "diagonal"
  bob_measured_bit: number;
  basis_match: boolean;
  retained: boolean;
  error: boolean;
  attack_affected?: boolean;
  eve_info_estimate?: number;
  detector_event?: string;
  timing_jitter_ps?: number;
}

export interface SimulationConfig {
  num_qubits: number;
  noise: number;
  seed?: number | null;
  attack: string; // "none" | "pns" | "trojan_horse" | "detector_blinding" | "mitm"
  attack_intensity: number; // 0.0 to 1.0
  enable_ai_detection?: boolean;
  enable_pqc_authentication?: boolean;
  enable_hybrid_security?: boolean;
}

export interface AttackSummary {
  type: string;
  enabled: boolean;
  intensity: number;
  affected_rounds: number;
  affected_fraction: number;
  estimated_eve_information: number; // simulation estimate 0.0 to 1.0
  description: string;
}

export interface RoundTelemetry {
  round_index: number;
  qber_signal: number;
  click_rate: number;
  timing_jitter: number;
  detection_frequency: number;
  photon_count_statistics: number;
  burst_rate: number;
  error_rate: number;
  detector_response_variance: number;
  probe_reflection_intensity: number;
  attack_intensity: number;
  attack_type: string;
}

export interface MITMMetadata {
  message_intercepted: boolean;
  message_modified: boolean;
  original_message?: string | null;
  modified_message?: string | null;
}

export interface AIDetectionResult {
  enabled: boolean;
  status: "NORMAL" | "SUSPICIOUS" | "ATTACK_DETECTED";
  anomaly_score: number; // 0.0 to 1.0
  confidence: number; // 0.0 to 1.0
  qber_observed: number;
  qber_evaluated_as_suspicious: boolean;
  stealth_attack_detected: boolean;
  dominant_signals: string[];
  feature_indicators: Record<string, string>;
  explanation: string;
  model_algorithm: string;
  windows_analyzed: number;
}

export interface PQCAuthenticationResult {
  enabled: boolean;
  algorithm: string;
  signature_generated: boolean;
  signature_valid: boolean;
  message_modified: boolean;
  message_accepted: boolean;
  mitm_blocked: boolean;
  session_id: string;
  sequence: number;
  key_generation_time_ms: number;
  signing_time_ms: number;
  verification_time_ms: number;
  total_authentication_time_ms: number;
  public_key_bytes: number;
  private_key_bytes: number;
  signature_bytes: number;
  original_bases_sample: string;
  received_bases_sample: string;
  explanation: string;
}

export interface ComponentScores {
  qber_score: number;
  ai_anomaly_score: number;
  pqc_auth_score: number;
  telemetry_health_score: number;
}

export interface HybridSecurityAssessment {
  enabled: boolean;
  security_score: number;
  security_level: "SECURE" | "GUARDED" | "SUSPICIOUS" | "COMPROMISED";
  decision: "NO_ATTACK_DETECTED" | "ATTACK_SUSPECTED" | "ATTACK_DETECTED" | "ATTACK_BLOCKED" | "ATTACK_SUCCESSFUL";
  key_action: "ALLOW_KEY" | "WARN" | "REJECT_KEY";
  component_scores: ComponentScores;
  weights_used: Record<string, number>;
  qber_assessment: string;
  ai_assessment: string;
  pqc_assessment: string;
  telemetry_assessment: string;
  critical_events: string[];
  dominant_risks: string[];
  explanation: string;
  recommendation: string;
  evaluation_time_ms: number;
}

export interface StatisticsSummary {
  transmitted: number;
  matching_bases: number;
  mismatched_bases: number;
  discarded: number;
  retained: number;
  sifted_key_length: number;
  qber: number;
  qber_percent: number;
}

export interface ErrorCorrectionStats {
  sifted_key_length: number;
  reconciled_key_length: number;
  error_count: number;
  correction_overhead_bits: number;
  reconciliation_efficiency: number;
  method: string;
}

export interface PrivacyAmplificationStats {
  reconciled_key_length: number;
  final_key_length: number;
  compression_ratio: number;
  hash_algorithm: string;
}

export interface SimulationResult {
  config: SimulationConfig;
  statistics: StatisticsSummary;
  attack: AttackSummary;
  telemetry: RoundTelemetry[];
  mitm: MITMMetadata;
  error_correction: ErrorCorrectionStats;
  privacy_amplification: PrivacyAmplificationStats;
  alice_sifted_key: number[];
  bob_sifted_key: number[];
  reconciled_key: number[];
  final_secret_key_hex: string;
  final_secret_key_bits: number[];
  rounds: TransmissionRound[];
  execution_time_ms: number;
  ai_detection?: AIDetectionResult | null;
  pqc_authentication?: PQCAuthenticationResult | null;
  hybrid_security?: HybridSecurityAssessment | null;
  disclaimer: string;
}
