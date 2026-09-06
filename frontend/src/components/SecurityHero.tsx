import React from 'react';
import { Key, Activity, Cpu, Lock, Shield, AlertTriangle } from 'lucide-react';
import { HybridSecurityAssessment, StatisticsSummary } from '../types/simulation';

interface SecurityHeroProps {
  hybrid?: HybridSecurityAssessment | null;
  statistics?: StatisticsSummary;
}

export const SecurityHero: React.FC<SecurityHeroProps> = ({ hybrid, statistics }) => {
  if (!hybrid) return null;

  const score = Math.max(0, Math.min(100, hybrid.security_score));
  const level = hybrid.security_level;
  const decision = hybrid.decision;
  const keyAction = hybrid.key_action;
  const comp = hybrid.component_scores;

  const qberPct = statistics ? statistics.qber_percent : (comp.qber_score > 0 ? (100 - comp.qber_score) * 0.11 : 0);

  // Status badges with shape indicators
  const levelBadgeMap = {
    SECURE: { label: '● SECURE', style: 'bg-emerald-950/60 text-emerald-300 border-emerald-800' },
    GUARDED: { label: '▲ GUARDED', style: 'bg-amber-950/60 text-amber-300 border-amber-800' },
    SUSPICIOUS: { label: '▲ SUSPICIOUS', style: 'bg-orange-950/60 text-orange-300 border-orange-800' },
    COMPROMISED: { label: '■ COMPROMISED', style: 'bg-rose-950/80 text-rose-300 border-rose-800' },
  };

  const keyActionBadgeMap = {
    ALLOW_KEY: { label: '✓ ALLOW_KEY', style: 'bg-emerald-950/80 text-emerald-300 border-emerald-700' },
    WARN: { label: '▲ ALLOW_WITH_WARNING', style: 'bg-amber-950/80 text-amber-300 border-amber-700' },
    REJECT_KEY: { label: '✕ REJECT_KEY', style: 'bg-rose-950/80 text-rose-300 border-rose-700 font-bold' },
  };

  return (
    <div className="bg-[#0c1118] border border-slate-800 rounded-xl p-5 font-mono text-xs space-y-5">
      {/* Top Status Summary Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-sky-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              SECURITY OPERATIONS CONSOLE MONITOR
            </h2>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Stage 5 Hybrid Decision Engine Real-Time System Evaluation
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 text-xs font-bold rounded border ${levelBadgeMap[level].style}`}>
            {levelBadgeMap[level].label}
          </span>
          <span className={`px-3 py-1 text-xs font-bold rounded border ${keyActionBadgeMap[keyAction].style}`}>
            {keyActionBadgeMap[keyAction].label}
          </span>
        </div>
      </div>

      {/* 6 Key Operational Status Indicators Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* 1. SECURITY LEVEL */}
        <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase block mb-1">1. SECURITY LEVEL</span>
          <span className={`font-bold block ${level === 'SECURE' ? 'text-emerald-400' : level === 'COMPROMISED' ? 'text-rose-400' : 'text-amber-400'}`}>
            {level === 'SECURE' ? '● SECURE' : level === 'COMPROMISED' ? '■ COMPROMISED' : `▲ ${level}`}
          </span>
        </div>

        {/* 2. SECURITY SCORE */}
        <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase block mb-1">2. SECURITY SCORE</span>
          <div className="flex items-baseline space-x-1">
            <span className="text-base font-bold text-white">{score.toFixed(1)}</span>
            <span className="text-[10px] text-slate-500">/ 100</span>
          </div>
        </div>

        {/* 3. QBER */}
        <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase block mb-1">3. QBER SIGNAL</span>
          <span className={`font-bold block ${qberPct <= 11.0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {qberPct.toFixed(2)}%
          </span>
        </div>

        {/* 4. AI ANOMALY */}
        <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase block mb-1">4. AI ANOMALY</span>
          <span className={`font-bold block ${comp.ai_anomaly_score >= 80 ? 'text-emerald-400' : comp.ai_anomaly_score <= 40 ? 'text-rose-400' : 'text-amber-400'}`}>
            {comp.ai_anomaly_score >= 80 ? '● NORMAL' : '■ ANOMALY'}
          </span>
        </div>

        {/* 5. PQC AUTH */}
        <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase block mb-1">5. PQC AUTH</span>
          <span className={`font-bold block ${comp.pqc_auth_score >= 80 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {comp.pqc_auth_score >= 80 ? '● VALID' : '■ INVALID'}
          </span>
        </div>

        {/* 6. KEY ACTION */}
        <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase block mb-1">6. KEY ACTION</span>
          <span className={`font-bold block ${keyAction === 'ALLOW_KEY' ? 'text-emerald-400' : 'text-rose-400'}`}>
            {keyAction}
          </span>
        </div>
      </div>

      {/* Horizontal Restrained Security Score Bar */}
      <div className="bg-slate-900/60 p-3.5 rounded-lg border border-slate-800 space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-300 font-bold">HYBRID SECURITY SYNTHESIS SCORE</span>
          <span className="text-slate-400">{decision}</span>
        </div>
        <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
          <div
            className={`h-full transition-all duration-500 ${
              score >= 80 ? 'bg-emerald-500' : score >= 50 ? 'bg-amber-500' : 'bg-rose-500'
            }`}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>

      {/* Hybrid Engine Weight Breakdown Table (25% QBER, 30% AI, 30% PQC, 15% Telemetry) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
        <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 space-y-1">
          <div className="flex justify-between text-[11px]">
            <span className="text-slate-400">QBER SIGNAL</span>
            <span className="text-slate-500 font-bold">25% WEIGHT</span>
          </div>
          <div className="text-xs font-bold text-white">{comp.qber_score.toFixed(0)} / 100</div>
          <p className="text-[10px] text-slate-500 truncate">{hybrid.qber_assessment}</p>
        </div>

        <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 space-y-1">
          <div className="flex justify-between text-[11px]">
            <span className="text-slate-400">AI ANOMALY</span>
            <span className="text-slate-500 font-bold">30% WEIGHT</span>
          </div>
          <div className="text-xs font-bold text-white">{comp.ai_anomaly_score.toFixed(0)} / 100</div>
          <p className="text-[10px] text-slate-500 truncate">{hybrid.ai_assessment}</p>
        </div>

        <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 space-y-1">
          <div className="flex justify-between text-[11px]">
            <span className="text-slate-400">PQC AUTH</span>
            <span className="text-slate-500 font-bold">30% WEIGHT</span>
          </div>
          <div className="text-xs font-bold text-white">{comp.pqc_auth_score.toFixed(0)} / 100</div>
          <p className="text-[10px] text-slate-500 truncate">{hybrid.pqc_assessment}</p>
        </div>

        <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 space-y-1">
          <div className="flex justify-between text-[11px]">
            <span className="text-slate-400">TELEMETRY</span>
            <span className="text-slate-500 font-bold">15% WEIGHT</span>
          </div>
          <div className="text-xs font-bold text-white">{comp.telemetry_health_score.toFixed(0)} / 100</div>
          <p className="text-[10px] text-slate-500 truncate">{hybrid.telemetry_assessment}</p>
        </div>
      </div>
    </div>
  );
};
