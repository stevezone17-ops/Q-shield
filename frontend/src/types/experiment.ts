export interface ExperimentConfig {
  experiment_type: string;
  attack: string;
  intensity_start: number;
  intensity_end: number;
  intensity_step: number;
  trials_per_point: number;
  num_qubits: number;
  noise_probability: number;
  seed: number;
  enable_ai_detection: boolean;
  enable_pqc_authentication: boolean;
  enable_hybrid_security: boolean;
}

export interface SweepPoint {
  intensity: number;
  intensity_pct: number;
  avg_qber: number;
  avg_ai_anomaly: number;
  avg_security_score: number;
  avg_jitter: number;
  avg_variance: number;
  detection_rate: number;
  rejection_rate: number;
}

export interface ComparisonPoint {
  attack: string;
  attack_name: string;
  intensity: number;
  avg_qber: number;
  avg_ai_anomaly: number;
  avg_security_score: number;
  avg_eve_info: number;
  detection_rate: number;
  key_rejection_rate: number;
}

export interface LayerPoint {
  layer_name: string;
  avg_security_score: number;
  rejection_rate: number;
  avg_exec_time_ms: number;
}

export interface ConfusionMatrix {
  tp: number;
  tn: number;
  fp: number;
  fn: number;
  total: number;
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  false_positive_rate: number;
  detection_rate: number;
}

export interface PerformanceBenchmarks {
  algorithm?: string;
  avg_keygen_ms?: number;
  avg_signing_ms?: number;
  avg_verify_ms?: number;
  signature_size_bytes?: number;
  mitm_block_rate_pqc_off?: number;
  mitm_block_rate_pqc_on?: number;
}

export interface ExperimentResult {
  experiment_id: string;
  experiment_type: string;
  timestamp: string;
  configuration: ExperimentConfig;
  total_simulations: number;
  total_duration_ms: number;
  avg_sim_time_ms: number;
  summary_metrics: Record<string, any>;
  confusion_matrix?: ConfusionMatrix | null;
  sweep_points?: SweepPoint[];
  comparison_points?: ComparisonPoint[];
  layer_points?: LayerPoint[];
  trials_detail: any[];
  observations: string[];
  performance_benchmarks?: PerformanceBenchmarks;
}
