import React from 'react';
import { Cpu, AlertTriangle, ShieldAlert, CheckCircle2, Activity } from 'lucide-react';
import { AIDetectionResult } from '../types/simulation';

interface AISecurityPanelProps {
  ai?: AIDetectionResult | null;
}

export const AISecurityPanel: React.FC<AISecurityPanelProps> = ({ ai }) => {
  if (!ai || !ai.enabled) {
    return (
      <div className="bg-[#0c1118] border border-slate-800 rounded-xl p-5 text-slate-400 font-mono text-xs flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Cpu className="w-4 h-4 text-slate-500" />
          <span>Stage 3 AI Anomaly Detector is currently disabled. Enable it in Simulation Controls.</span>
        </div>
      </div>
    );
  }

  const getStatusBadge = () => {
    switch (ai.status) {
      case 'ATTACK_DETECTED':
        return (
          <span className="px-3 py-1 bg-rose-950/80 border border-rose-800 text-rose-300 rounded font-mono text-xs font-bold">
            ■ ATTACK DETECTED
          </span>
        );
      case 'SUSPICIOUS':
        return (
          <span className="px-3 py-1 bg-amber-950/80 border border-amber-800 text-amber-300 rounded font-mono text-xs font-bold">
            ▲ SUSPICIOUS TELEMETRY
          </span>
        );
      case 'NORMAL':
      default:
        return (
          <span className="px-3 py-1 bg-emerald-950/80 border border-emerald-800 text-emerald-300 rounded font-mono text-xs font-bold">
            ● NORMAL TELEMETRY
          </span>
        );
    }
  };

  return (
    <div className="bg-[#0c1118] border border-slate-800 rounded-xl p-5 font-mono text-xs space-y-5">
      {/* Panel Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-sky-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                STAGE 3 — AI ANOMALY DETECTOR
              </h2>
              <span className="px-2 py-0.5 text-[10px] bg-slate-900 text-sky-300 border border-slate-800 rounded">
                MODEL: {ai.model_algorithm}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Unsupervised Isolation Forest over 8 physical-channel telemetry signals
            </p>
          </div>
        </div>

        {getStatusBadge()}
      </div>

      {/* Stealth Attack Highlight Box (Section 13) */}
      {ai.stealth_attack_detected && (
        <div className="bg-slate-950 border border-rose-800 rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-rose-400 uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              STEALTH ATTACK EXPOSURE DEMONSTRATION
            </span>
            <span className="px-2 py-0.5 text-[10px] bg-rose-950 text-rose-300 border border-rose-800 rounded font-bold">
              LOW QBER + HIGH AI ANOMALY
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center my-2">
            <div className="bg-slate-900 p-2.5 rounded border border-emerald-800/80">
              <span className="text-[10px] text-slate-400 block">OBSERVED QBER</span>
              <span className="text-sm font-bold text-emerald-400">{(ai.qber_observed * 100).toFixed(2)}%</span>
              <span className="text-[9px] text-slate-500 block">✓ Below 11% limit</span>
            </div>
            <div className="bg-slate-900 p-2.5 rounded border border-rose-800/80">
              <span className="text-[10px] text-slate-400 block">AI ANOMALY SCORE</span>
              <span className="text-sm font-bold text-rose-400">{(ai.anomaly_score * 100).toFixed(1)}%</span>
              <span className="text-[9px] text-slate-500 block">■ Attack threshold exceeded</span>
            </div>
            <div className="bg-rose-950/60 p-2.5 rounded border border-rose-700 text-rose-200">
              <span className="text-[10px] text-slate-400 block">SECURITY DECISION</span>
              <span className="text-sm font-bold block">REJECT_KEY</span>
              <span className="text-[9px] text-rose-300 block">Key generation aborted</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-300 leading-relaxed pt-1">
            <strong className="text-cyan-400">ANALYTICAL EXPLANATION:</strong> "QBER remains below the configured high-QBER threshold ({(ai.qber_observed * 100).toFixed(2)}% &lt; 11%), while abnormal detector/channel telemetry drives the anomaly score above the attack-detection threshold."
          </p>
        </div>
      )}

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Anomaly Score Bar */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3.5 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">ANOMALY SCORE</span>
            <span className={`font-bold ${ai.anomaly_score >= 0.7 ? 'text-rose-400' : ai.anomaly_score >= 0.4 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {(ai.anomaly_score * 100).toFixed(1)}%
            </span>
          </div>
          <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div
              className={`h-full transition-all duration-500 ${
                ai.anomaly_score >= 0.7 ? 'bg-rose-500' : ai.anomaly_score >= 0.4 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, Math.max(5, ai.anomaly_score * 100))}%` }}
            />
          </div>
          <div className="flex justify-between text-[9px] text-slate-500">
            <span>0% Normal</span>
            <span>40% Suspicious</span>
            <span>70%+ Attack</span>
          </div>
        </div>

        {/* Confidence Level */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3.5 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">MODEL CONFIDENCE</span>
            <span className="text-sky-400 font-bold">{(ai.confidence * 100).toFixed(0)}%</span>
          </div>
          <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div className="h-full bg-sky-500" style={{ width: `${ai.confidence * 100}%` }} />
          </div>
          <div className="text-[9px] text-slate-500">Statistical Significance: High</div>
        </div>

        {/* Telemetry Windows */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3.5 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">TELEMETRY WINDOWS</span>
            <span className="text-white font-bold">{ai.windows_analyzed} Windows</span>
          </div>
          <p className="text-[10px] text-slate-400">
            Window Size: 50 rounds | Step: 25 rounds (50% overlap)
          </p>
        </div>
      </div>

      {/* Dominant Signals & Explanation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Dominant Signals */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3.5 space-y-2">
          <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase">
            <Activity className="w-3.5 h-3.5 text-sky-400" />
            DOMINANT ANOMALOUS SIGNALS (Z-SCORE &gt; 1.5)
          </h4>
          {ai.dominant_signals.length > 0 ? (
            <div className="space-y-1.5 pt-1">
              {ai.dominant_signals.map((sig, idx) => (
                <div key={idx} className="flex justify-between text-[11px] bg-slate-950 p-2 rounded border border-slate-800">
                  <span className="text-slate-300">{sig}</span>
                  <span className="text-rose-400 font-bold">ANOMALOUS</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 italic text-[11px]">No dominant statistical anomalies detected.</p>
          )}
        </div>

        {/* Explanation */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3.5 space-y-2">
          <h4 className="text-xs font-bold text-sky-300 uppercase">MODEL EVALUATION EXPLANATION</h4>
          <p className="text-[11px] text-slate-300 leading-relaxed bg-slate-950 p-2.5 rounded border border-slate-800">
            "{ai.explanation}"
          </p>
        </div>
      </div>

      {/* Zero-label Research Disclaimer Box */}
      <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-[11px] text-slate-400 space-y-1">
        <span className="text-amber-400 font-bold uppercase block">SCIENTIFIC DISCLAIMER:</span>
        <p>
          "Detection is based strictly on simulated physical-channel detector telemetry. The AI model operates unsupervised without prior knowledge of attack labels or attack intensity."
        </p>
      </div>
    </div>
  );
};
