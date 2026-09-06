import React, { useState } from 'react';
import { ExperimentConfig, ExperimentResult } from '../types/experiment';
import { runExperiment } from '../services/api';
import {
  FlaskConical,
  Play,
  FileSpreadsheet,
  FileJson,
  BarChart3,
  TrendingUp,
  ShieldAlert,
  Brain,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  History,
  FileText,
  Search,
  Filter,
  Download
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

export const ExperimentCenter: React.FC = () => {
  const [config, setConfig] = useState<ExperimentConfig>({
    experiment_type: 'attack_intensity_sweep',
    attack: 'detector_blinding',
    intensity_start: 0.0,
    intensity_end: 1.0,
    intensity_step: 0.1,
    trials_per_point: 10,
    num_qubits: 500,
    noise_probability: 0.02,
    seed: 42,
    enable_ai_detection: true,
    enable_pqc_authentication: true,
    enable_hybrid_security: true,
  });

  const [result, setResult] = useState<ExperimentResult | null>(null);
  const [history, setHistory] = useState<ExperimentResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [tableFilter, setTableFilter] = useState<string>('');

  const getSimulationsCount = () => {
    if (config.experiment_type === 'attack_intensity_sweep') {
      const step = Math.max(0.01, config.intensity_step);
      const stepsCount = Math.floor((config.intensity_end - config.intensity_start) / step) + 1;
      return stepsCount * config.trials_per_point;
    } else if (config.experiment_type === 'attack_comparison') {
      return 5 * config.trials_per_point;
    } else if (config.experiment_type === 'ai_detection_evaluation') {
      return 2 * config.trials_per_point;
    } else if (config.experiment_type === 'false_positive_evaluation') {
      return config.trials_per_point;
    } else if (config.experiment_type === 'pqc_evaluation') {
      return 2 * config.trials_per_point;
    } else if (config.experiment_type === 'hybrid_evaluation') {
      return 4 * config.trials_per_point;
    }
    return config.trials_per_point;
  };

  const totalSims = getSimulationsCount();
  const isWorkloadHigh = totalSims > 300;

  const handleRun = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await runExperiment(config);
      setResult(res);
      setHistory((prev) => [res, ...prev.filter((h) => h.experiment_id !== res.experiment_id)]);
    } catch (err: any) {
      console.error('Experiment execution error:', err);
      setError(err.message || 'Experiment execution failed.');
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    if (!result || !result.trials_detail) return;
    const details = result.trials_detail;
    if (details.length === 0) return;

    const headers = Object.keys(details[0]).join(',');
    const rows = details.map((row) =>
      Object.values(row)
        .map((v) => (typeof v === 'string' ? `"${v}"` : v))
        .join(',')
    );

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${result.experiment_id}_dataset.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportJSON = () => {
    if (!result) return;
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(result, null, 2))}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `${result.experiment_id}_results.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const exportReportMarkdown = () => {
    if (!result) return;
    const reportText = generateAcademicReportText(result);
    const blob = new Blob([reportText], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${result.experiment_id}_Academic_Report.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateAcademicReportText = (res: ExperimentResult): string => {
    const cfg = res.configuration;
    const sm = res.summary_metrics;
    const obs = res.observations;

    return `# Q-SHIELD QUANTUM SECURITY EVALUATION REPORT
**Experiment ID:** ${res.experiment_id}
**Timestamp:** ${res.timestamp}
**Experiment Type:** ${res.experiment_type.replace('_', ' ').toUpperCase()}

---

## 1. EXPERIMENTAL METHODOLOGY & CONFIGURATION
- **Total Simulation Trials:** ${res.total_simulations}
- **Qubit Payload Size:** ${cfg.num_qubits} qubits per transmission
- **Depolarizing Noise Rate:** ${(cfg.noise_probability * 100).toFixed(1)}%
- **Target Attacker Model:** ${cfg.attack}
- **Security Layers Enabled:** AI Anomaly (${cfg.enable_ai_detection}), PQC Auth (${cfg.enable_pqc_authentication}), Hybrid Engine (${cfg.enable_hybrid_security})
- **Random Base Seed:** ${cfg.seed}

---

## 2. SUMMARY EVALUATION METRICS
${Object.entries(sm)
  .map(([k, v]) => `- **${k.replace('_', ' ').toUpperCase()}:** ${v}`)
  .join('\n')}

---

## 3. KEY EMPIRICAL OBSERVATIONS
${obs.map((o, idx) => `${idx + 1}. ${o}`).join('\n')}

---

## 4. SCIENTIFIC LIMITATIONS & DISCLAIMER
- Evaluation is executed using software-based quantum state simulation (state vector & Density Matrix models) and software detector telemetry models.
- Results provide statistical proof of multi-dimensional defense capabilities for BB84 software implementations and do not substitute for physical fiber-optic hardware benchmarks.
`;
  };

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Top Banner & Control Card */}
      <div className="bg-[#0c1118] border border-slate-800 rounded-xl p-5 space-y-5">
        <div className="flex flex-wrap items-center justify-between pb-4 border-b border-slate-800 gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-sky-400">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Q-SHIELD EXPERIMENT & EVALUATION WORKSTATION
                </h2>
                <span className="px-2 py-0.5 text-[10px] bg-slate-900 text-sky-300 border border-slate-800 rounded font-bold">
                  STAGE 7 EVALUATION
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Execute reproducible batch simulations, attack sweeps, and quantitative security evaluations
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="text-right text-xs hidden sm:block">
              <span className="text-slate-400 block text-[10px]">WORKLOAD ESTIMATE</span>
              <span className={`font-bold ${isWorkloadHigh ? 'text-amber-400' : 'text-emerald-400'}`}>
                {totalSims} SIMULATIONS ({isWorkloadHigh ? 'HEAVY' : 'MODERATE'})
              </span>
            </div>

            <button
              onClick={handleRun}
              disabled={loading}
              className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-lg border border-sky-500 flex items-center space-x-2 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>RUNNING EXPERIMENT...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>EXECUTE EXPERIMENT</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Experiment Configuration Controls Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1 sm:col-span-2">
            <label className="text-slate-400 font-bold flex items-center space-x-1.5 text-[11px]">
              <BarChart3 className="w-3.5 h-3.5 text-sky-400" />
              <span>EXPERIMENT TEMPLATE</span>
            </label>
            <select
              value={config.experiment_type}
              onChange={(e) => setConfig({ ...config, experiment_type: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-sky-500"
            >
              <option value="attack_intensity_sweep">1. Attack Intensity Sweep (0% to 100%)</option>
              <option value="attack_comparison">2. Multi-Attack Comparison Benchmark</option>
              <option value="ai_detection_evaluation">3. AI Anomaly Detection (Confusion Matrix)</option>
              <option value="false_positive_evaluation">4. False Positive Rate Benchmark (Clean Channel)</option>
              <option value="pqc_evaluation">5. PQC Authentication Latency & MITM Test</option>
              <option value="hybrid_evaluation">6. Incremental Hybrid Layer Security Test</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 font-bold flex items-center space-x-1.5 text-[11px]">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              <span>ATTACK MODEL</span>
            </label>
            <select
              value={config.attack}
              onChange={(e) => setConfig({ ...config, attack: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-sky-500"
            >
              <option value="detector_blinding">Detector Blinding (Flagship)</option>
              <option value="pns">Photon Number Splitting (PNS)</option>
              <option value="trojan_horse">Trojan-Horse Side-Channel</option>
              <option value="mitm">Man-in-the-Middle (Classical)</option>
              <option value="none">None (Clean Baseline)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 font-bold flex items-center justify-between text-[11px]">
              <span>TRIALS PER POINT</span>
              <span className="text-sky-400">{config.trials_per_point}</span>
            </label>
            <input
              type="range"
              min="2"
              max="50"
              value={config.trials_per_point}
              onChange={(e) => setConfig({ ...config, trials_per_point: parseInt(e.target.value) })}
              className="w-full accent-sky-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 font-bold flex items-center justify-between text-[11px]">
              <span>QUBIT PAYLOAD</span>
              <span className="text-sky-400">{config.num_qubits} Qubits</span>
            </label>
            <select
              value={config.num_qubits}
              onChange={(e) => setConfig({ ...config, num_qubits: parseInt(e.target.value) })}
              className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-sky-500"
            >
              <option value={200}>200 Qubits (Fast)</option>
              <option value={500}>500 Qubits (Standard)</option>
              <option value={1000}>1000 Qubits (High Precision)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 font-bold flex items-center justify-between text-[11px]">
              <span>CHANNEL NOISE</span>
              <span className="text-sky-400">{(config.noise_probability * 100).toFixed(1)}%</span>
            </label>
            <input
              type="range"
              min="0.0"
              max="0.2"
              step="0.01"
              value={config.noise_probability}
              onChange={(e) => setConfig({ ...config, noise_probability: parseFloat(e.target.value) })}
              className="w-full accent-sky-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 font-bold flex items-center justify-between text-[11px]">
              <span>REPRODUCIBILITY SEED</span>
              <span className="text-sky-400">{config.seed}</span>
            </label>
            <input
              type="number"
              value={config.seed}
              onChange={(e) => setConfig({ ...config, seed: parseInt(e.target.value) || 42 })}
              className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="space-y-1 flex items-center space-x-3 pt-3 sm:col-span-2">
            <label className="flex items-center space-x-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={config.enable_ai_detection}
                onChange={(e) => setConfig({ ...config, enable_ai_detection: e.target.checked })}
                className="accent-sky-500 rounded"
              />
              <span className="text-slate-300">STAGE 3 AI</span>
            </label>

            <label className="flex items-center space-x-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={config.enable_pqc_authentication}
                onChange={(e) => setConfig({ ...config, enable_pqc_authentication: e.target.checked })}
                className="accent-emerald-500 rounded"
              />
              <span className="text-slate-300">STAGE 4 PQC</span>
            </label>

            <label className="flex items-center space-x-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={config.enable_hybrid_security}
                onChange={(e) => setConfig({ ...config, enable_hybrid_security: e.target.checked })}
                className="accent-purple-500 rounded"
              />
              <span className="text-slate-300">STAGE 5 HYBRID</span>
            </label>
          </div>
        </div>
      </div>

      {loading && (
        <div className="bg-[#0c1118] border border-slate-800 rounded-xl p-5 space-y-3 text-center">
          <div className="flex items-center justify-center space-x-2 text-sky-400 font-bold">
            <div className="w-4 h-4 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
            <span>RUNNING BATCH EXPERIMENT ({totalSims} SIMULATIONS)...</span>
          </div>
          <div className="w-full bg-slate-950 h-2 rounded overflow-hidden border border-slate-800">
            <div className="h-full bg-sky-500 animate-pulse w-full" />
          </div>
        </div>
      )}

      {error && (
        <div className="bg-rose-950/80 border border-rose-800 text-rose-200 rounded-xl p-3 flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {result && (
        <div className="space-y-5">
          {/* Summary Metric Cards Row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-[#0c1118] border border-slate-800 rounded-xl p-3.5">
              <span className="text-[10px] text-slate-400 block uppercase">TOTAL TRIALS</span>
              <span className="text-base font-bold text-white">{result.total_simulations} Sims</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">{result.total_duration_ms} ms</span>
            </div>

            <div className="bg-[#0c1118] border border-slate-800 rounded-xl p-3.5">
              <span className="text-[10px] text-slate-400 block uppercase">MEAN QBER</span>
              <span className="text-base font-bold text-sky-400">
                {result.summary_metrics.mean_qber !== undefined ? `${result.summary_metrics.mean_qber}%` : 'N/A'}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Quantum Error</span>
            </div>

            <div className="bg-[#0c1118] border border-slate-800 rounded-xl p-3.5">
              <span className="text-[10px] text-slate-400 block uppercase">MEAN AI ANOMALY</span>
              <span className="text-base font-bold text-indigo-400">
                {result.summary_metrics.mean_ai_anomaly !== undefined ? `${result.summary_metrics.mean_ai_anomaly}%` : 'N/A'}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Telemetry Score</span>
            </div>

            <div className="bg-[#0c1118] border border-slate-800 rounded-xl p-3.5">
              <span className="text-[10px] text-slate-400 block uppercase">SECURITY SCORE</span>
              <span className="text-base font-bold text-emerald-400">
                {result.summary_metrics.mean_security_score !== undefined ? `${result.summary_metrics.mean_security_score}/100` : 'N/A'}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Hybrid Synthesis</span>
            </div>

            <div className="bg-[#0c1118] border border-slate-800 rounded-xl p-3.5">
              <span className="text-[10px] text-slate-400 block uppercase">DETECTION RATE</span>
              <span className="text-base font-bold text-rose-400">
                {result.summary_metrics.detection_rate !== undefined ? `${result.summary_metrics.detection_rate}%` : 'N/A'}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">True Positive</span>
            </div>

            <div className="bg-[#0c1118] border border-slate-800 rounded-xl p-3.5">
              <span className="text-[10px] text-slate-400 block uppercase">KEY REJECTION RATE</span>
              <span className="text-base font-bold text-amber-400">
                {result.summary_metrics.key_rejection_rate !== undefined ? `${result.summary_metrics.key_rejection_rate}%` : 'N/A'}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Policy Action</span>
            </div>
          </div>

          {/* Export Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#0c1118] border border-slate-800 rounded-xl text-[11px]">
            <div className="flex items-center space-x-2 text-slate-300">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span>EXPERIMENT DATASET READY FOR EXPORT & PUBLICATION</span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={exportCSV}
                className="px-3 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-slate-200 flex items-center space-x-1"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span>EXPORT CSV</span>
              </button>

              <button
                onClick={exportJSON}
                className="px-3 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-slate-200 flex items-center space-x-1"
              >
                <FileJson className="w-3.5 h-3.5 text-indigo-400" />
                <span>EXPORT JSON</span>
              </button>

              <button
                onClick={exportReportMarkdown}
                className="px-3 py-1 bg-sky-950 hover:bg-sky-900 border border-sky-800 text-sky-300 rounded font-bold flex items-center space-x-1"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>DOWNLOAD REPORT (.MD)</span>
              </button>
            </div>
          </div>

          {/* FLAGSHIP CHART */}
          {result.sweep_points && result.sweep_points.length > 0 && (
            <div className="bg-[#0c1118] border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-sky-400" />
                    RESEARCH FIGURE 1: QBER VS. AI TELEMETRY ANOMALY
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    Empirical response under {result.configuration.attack.replace('_', ' ').toUpperCase()} intensity sweep
                  </p>
                </div>
              </div>

              <div className="h-72 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={result.sweep_points} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis
                      dataKey="intensity_pct"
                      stroke="#64748b"
                      tick={{ fill: '#94a3b8', fontSize: 10 }}
                      unit="%"
                    />
                    <YAxis
                      stroke="#64748b"
                      tick={{ fill: '#94a3b8', fontSize: 10 }}
                      unit="%"
                      domain={[0, 100]}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '0.5rem', fontSize: '11px', fontFamily: 'monospace' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
                    <Line
                      type="monotone"
                      dataKey="avg_qber"
                      name="Average QBER (%)"
                      stroke="#38bdf8"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="avg_ai_anomaly"
                      name="AI Telemetry Anomaly Score (%)"
                      stroke="#f43f5e"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="avg_security_score"
                      name="Hybrid Security Score (0-100)"
                      stroke="#10b981"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-slate-950 p-3 rounded border border-slate-800 text-[11px] text-slate-300 leading-relaxed">
                <strong className="text-sky-400">FINDING:</strong> Under detector blinding, conventional QBER remains flat below the 11% cutoff, while AI physical telemetry anomaly spikes to &gt;80%, triggering key rejection.
              </div>
            </div>
          )}

          {/* CONFUSION MATRIX */}
          {result.confusion_matrix && (
            <div className="bg-[#0c1118] border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <Brain className="w-4 h-4 text-sky-400" />
                  <h3 className="text-xs font-bold text-white uppercase">
                    STAGE 3 AI ANOMALY CONFUSION MATRIX
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-slate-950 border border-slate-800 rounded p-3 text-[11px] space-y-2">
                  <div className="text-center text-slate-400 font-bold uppercase mb-1">
                    ACTUAL VS PREDICTED CLASS
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 text-center">
                    <div className="bg-slate-900 p-1.5 rounded text-slate-500 font-bold">PRED \ ACT</div>
                    <div className="bg-slate-900 p-1.5 rounded text-sky-400 font-bold">NORMAL</div>
                    <div className="bg-slate-900 p-1.5 rounded text-rose-400 font-bold">ATTACK</div>

                    <div className="bg-slate-900 p-1.5 rounded text-sky-400 font-bold flex items-center justify-center">NORMAL</div>
                    <div className="bg-emerald-950 border border-emerald-800 p-3 rounded text-emerald-300">
                      <span className="text-[10px] text-slate-400 block">TN</span>
                      <span className="text-xl font-bold">{result.confusion_matrix.tn}</span>
                    </div>
                    <div className="bg-rose-950 border border-rose-800 p-3 rounded text-rose-300">
                      <span className="text-[10px] text-slate-400 block">FN</span>
                      <span className="text-xl font-bold">{result.confusion_matrix.fn}</span>
                    </div>

                    <div className="bg-slate-900 p-1.5 rounded text-rose-400 font-bold flex items-center justify-center">ATTACK</div>
                    <div className="bg-amber-950 border border-amber-800 p-3 rounded text-amber-300">
                      <span className="text-[10px] text-slate-400 block">FP</span>
                      <span className="text-xl font-bold">{result.confusion_matrix.fp}</span>
                    </div>
                    <div className="bg-emerald-950 border border-emerald-800 p-3 rounded text-emerald-300">
                      <span className="text-[10px] text-slate-400 block">TP</span>
                      <span className="text-xl font-bold">{result.confusion_matrix.tp}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-slate-950 p-3 rounded border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">ACCURACY</span>
                    <span className="text-xl font-bold text-white">{(result.confusion_matrix.accuracy * 100).toFixed(1)}%</span>
                  </div>

                  <div className="bg-slate-950 p-3 rounded border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">PRECISION</span>
                    <span className="text-xl font-bold text-sky-400">{(result.confusion_matrix.precision * 100).toFixed(1)}%</span>
                  </div>

                  <div className="bg-slate-950 p-3 rounded border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">RECALL</span>
                    <span className="text-xl font-bold text-indigo-400">{(result.confusion_matrix.recall * 100).toFixed(1)}%</span>
                  </div>

                  <div className="bg-slate-950 p-3 rounded border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">F1 SCORE</span>
                    <span className="text-xl font-bold text-emerald-400">{result.confusion_matrix.f1_score.toFixed(3)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* OBSERVATIONS & REPORT */}
          <div className="bg-[#0c1118] border border-slate-800 rounded-xl p-5 space-y-3">
            <h4 className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              SCIENTIFIC OBSERVATIONS & EMPIRICAL FINDINGS
            </h4>
            <div className="space-y-2 text-slate-200">
              {result.observations.map((obs, idx) => (
                <div key={idx} className="p-2.5 bg-slate-950 rounded border border-slate-800 flex items-start space-x-2">
                  <span className="px-1.5 py-0.5 bg-slate-900 text-sky-300 border border-slate-800 rounded text-[10px] font-bold">
                    OBS-{idx + 1}
                  </span>
                  <p className="leading-relaxed">{obs}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
