import React from 'react';
import { Award, Layers, Key, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { HybridSecurityAssessment, StatisticsSummary } from '../types/simulation';

interface HybridSecurityPanelProps {
  hybrid?: HybridSecurityAssessment | null;
  statistics?: StatisticsSummary;
}

export const HybridSecurityPanel: React.FC<HybridSecurityPanelProps> = ({ hybrid }) => {
  if (!hybrid || !hybrid.enabled) {
    return (
      <div className="bg-[#0c1118] border border-slate-800 rounded-xl p-5 font-mono text-xs text-slate-400">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-2">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-slate-900 border border-slate-800 rounded text-slate-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                STAGE 5 — HYBRID SECURITY DECISION ENGINE
              </h3>
              <p className="text-[11px] text-slate-400">Multi-Dimensional Signal Synthesis & Policy Layer</p>
            </div>
          </div>
          <span className="px-3 py-1 bg-slate-900 text-slate-400 border border-slate-800 rounded font-bold">
            ○ ENGINE DISABLED
          </span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Stage 5 Hybrid Security Engine is disabled. Enable Stage 5 in controls above to synthesize QBER, Stage 3 AI Anomaly scores, Stage 4 PQC signature validity, and physical telemetry into a unified security evaluation.
        </p>
      </div>
    );
  }

  const score = Math.max(0, Math.min(100, hybrid.security_score));
  const level = hybrid.security_level;
  const decision = hybrid.decision;
  const keyAction = hybrid.key_action;
  const comp = hybrid.component_scores;

  const levelColorMap = {
    SECURE: 'bg-emerald-950 text-emerald-300 border-emerald-800',
    GUARDED: 'bg-sky-950 text-sky-300 border-sky-800',
    SUSPICIOUS: 'bg-amber-950 text-amber-300 border-amber-800',
    COMPROMISED: 'bg-rose-950 text-rose-300 border-rose-800 font-bold',
  };

  const keyActionMap = {
    ALLOW_KEY: 'bg-emerald-950 text-emerald-300 border-emerald-700',
    WARN: 'bg-amber-950 text-amber-300 border-amber-700',
    REJECT_KEY: 'bg-rose-950 text-rose-300 border-rose-700 font-bold',
  };

  return (
    <div className="bg-[#0c1118] border border-slate-800 rounded-xl p-5 font-mono text-xs space-y-5">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between pb-4 border-b border-slate-800 gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-sky-400">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                STAGE 5 — HYBRID SECURITY DECISION ENGINE
              </h3>
              <span className="px-2 py-0.5 text-[10px] bg-slate-900 text-sky-300 border border-slate-800 rounded font-bold">
                MULTI-SIGNAL SYNTHESIS
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Synthesizing QBER (25%), Stage 3 AI (30%), Stage 4 PQC (30%), and Physical Telemetry (15%)
            </p>
          </div>
        </div>

        <div className={`px-4 py-1.5 rounded border text-xs font-bold flex items-center gap-2 ${keyActionMap[keyAction]}`}>
          <Key className="w-4 h-4" />
          <span>KEY POLICY ACTION: {keyAction}</span>
        </div>
      </div>

      {/* Primary Score & Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Security Score */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-4 flex flex-col justify-between">
          <div className="flex justify-between text-[11px] text-slate-400">
            <span>SYNTHESIS SCORE</span>
            <span>SCALE 0–100</span>
          </div>

          <div className="flex items-baseline space-x-2 my-2">
            <span className={`text-3xl font-bold font-mono ${
              score >= 80 ? 'text-emerald-400' : score >= 50 ? 'text-amber-400' : 'text-rose-400'
            }`}>
              {score.toFixed(1)}
            </span>
            <span className="text-slate-500 font-mono">/ 100</span>
          </div>

          <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div
              className={`h-full ${score >= 80 ? 'bg-emerald-500' : score >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
              style={{ width: `${Math.max(4, score)}%` }}
            />
          </div>
        </div>

        {/* Security Level & Decision */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-4 space-y-3 font-mono">
          <span className="text-[11px] text-slate-400 block">CLASSIFICATION & DECISION</span>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-slate-500">LEVEL:</span>
              <span className={`px-2.5 py-0.5 rounded border ${levelColorMap[level]}`}>
                {level}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-slate-500">DECISION:</span>
              <span className="text-white font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                {decision}
              </span>
            </div>
          </div>
        </div>

        {/* Primary Threat Event */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-4 space-y-2 font-mono">
          <div className="flex justify-between text-[11px] text-slate-400">
            <span>THREAT ASSESSMENT</span>
            <span>{hybrid.evaluation_time_ms.toFixed(2)} ms</span>
          </div>

          {hybrid.critical_events.length > 0 ? (
            <div className="p-2 bg-rose-950/60 border border-rose-800 rounded text-rose-200 text-[11px] font-bold">
              CRITICAL: {hybrid.critical_events[0]}
            </div>
          ) : hybrid.dominant_risks.length > 0 ? (
            <div className="p-2 bg-amber-950/60 border border-amber-800 rounded text-amber-200 text-[11px]">
              RISK: {hybrid.dominant_risks[0]}
            </div>
          ) : (
            <div className="p-2 bg-emerald-950/40 border border-emerald-800 rounded text-emerald-300 text-[11px]">
              ✓ Nominal quantum channel condition.
            </div>
          )}
        </div>
      </div>

      {/* Multi-Dimensional Signal Breakdown Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-4 space-y-3">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-sky-400" />
          MULTI-DIMENSIONAL SIGNAL BREAKDOWN & WEIGHTED SCORES
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-[11px] font-mono">
          <div className="bg-slate-950 p-3 rounded border border-slate-800 space-y-1.5">
            <div className="flex justify-between text-slate-400">
              <span>QBER SIGNAL (25%)</span>
              <span className="font-bold text-white">{comp.qber_score.toFixed(0)}/100</span>
            </div>
            <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
              <div className="h-full bg-sky-500" style={{ width: `${comp.qber_score}%` }} />
            </div>
            <p className="text-[10px] text-slate-500 truncate">{hybrid.qber_assessment}</p>
          </div>

          <div className="bg-slate-950 p-3 rounded border border-slate-800 space-y-1.5">
            <div className="flex justify-between text-slate-400">
              <span>AI ANOMALY (30%)</span>
              <span className="font-bold text-white">{comp.ai_anomaly_score.toFixed(0)}/100</span>
            </div>
            <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
              <div className="h-full bg-sky-500" style={{ width: `${comp.ai_anomaly_score}%` }} />
            </div>
            <p className="text-[10px] text-slate-500 truncate">{hybrid.ai_assessment}</p>
          </div>

          <div className="bg-slate-950 p-3 rounded border border-slate-800 space-y-1.5">
            <div className="flex justify-between text-slate-400">
              <span>PQC AUTH (30%)</span>
              <span className="font-bold text-white">{comp.pqc_auth_score.toFixed(0)}/100</span>
            </div>
            <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500" style={{ width: `${comp.pqc_auth_score}%` }} />
            </div>
            <p className="text-[10px] text-slate-500 truncate">{hybrid.pqc_assessment}</p>
          </div>

          <div className="bg-slate-950 p-3 rounded border border-slate-800 space-y-1.5">
            <div className="flex justify-between text-slate-400">
              <span>TELEMETRY (15%)</span>
              <span className="font-bold text-white">{comp.telemetry_health_score.toFixed(0)}/100</span>
            </div>
            <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500" style={{ width: `${comp.telemetry_health_score}%` }} />
            </div>
            <p className="text-[10px] text-slate-500 truncate">{hybrid.telemetry_assessment}</p>
          </div>
        </div>
      </div>

      {/* Scientific Analysis & Policy Recommendation */}
      <div className="space-y-3 font-mono text-[11px]">
        <div className="p-3 bg-slate-950 border border-slate-800 rounded">
          <span className="font-bold text-sky-400 block mb-1 uppercase">SCIENTIFIC THREAT EVALUATION:</span>
          <p className="text-slate-300 leading-relaxed">{hybrid.explanation}</p>
        </div>

        <div className={`p-3 rounded border ${
          keyAction === 'REJECT_KEY'
            ? 'bg-rose-950/40 border-rose-800 text-rose-200'
            : keyAction === 'WARN'
            ? 'bg-amber-950/40 border-amber-800 text-amber-200'
            : 'bg-emerald-950/40 border-emerald-800 text-emerald-200'
        }`}>
          <span className="font-bold block mb-1 uppercase">ACTIONABLE POLICY RECOMMENDATION:</span>
          <p className="leading-relaxed">{hybrid.recommendation}</p>
        </div>
      </div>
    </div>
  );
};
