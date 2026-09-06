import React from 'react';
import { SimulationResult } from '../types/simulation';
import { GitCompare, ShieldAlert, CheckCircle } from 'lucide-react';

interface AttackComparisonViewProps {
  result: SimulationResult;
}

export const AttackComparisonView: React.FC<AttackComparisonViewProps> = ({ result }) => {
  const { attack, statistics, telemetry } = result;
  const isAttackActive = attack.enabled && attack.type !== 'none';

  const avgJitter = telemetry.length > 0
    ? (telemetry.reduce((acc, t) => acc + t.timing_jitter, 0) / telemetry.length).toFixed(1)
    : '15.0';
  
  const avgVariance = telemetry.length > 0
    ? (telemetry.reduce((acc, t) => acc + t.detector_response_variance, 0) / telemetry.length).toFixed(3)
    : '0.010';

  const avgClickRate = telemetry.length > 0
    ? (telemetry.reduce((acc, t) => acc + t.click_rate, 0) / telemetry.length).toFixed(2)
    : '1.00';

  return (
    <div className="bg-[#0c1118] border border-slate-800 rounded-xl p-5 font-mono text-xs space-y-4">
      <div className="flex items-center space-x-3 border-b border-slate-800 pb-3">
        <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-sky-400">
          <GitCompare className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            ATTACK VS. BASELINE COMPARISON TELEMETRY
          </h3>
          <p className="text-[11px] text-slate-400">Side-by-side metric comparison between clean baseline and current simulation</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Baseline Profile Card */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase">
              <CheckCircle className="w-4 h-4" />
              CLEAN CHANNEL BASELINE
            </span>
            <span className="text-[10px] text-slate-500">ATTACK: NONE</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-500 block text-[10px]">EXPECTED QBER</span>
              <span className="text-slate-300 font-bold">~ 2.0% (Noise Only)</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">AFFECTED ROUNDS</span>
              <span className="text-slate-400 font-bold">0 (0.0%)</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">EVE INFO LEAKAGE</span>
              <span className="text-emerald-400 font-bold">0.00 (0%)</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">AVG TIMING JITTER</span>
              <span className="text-slate-300 font-bold">~ 15.0 ps</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">DETECTOR VARIANCE</span>
              <span className="text-slate-300 font-bold">~ 0.010</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">DETECTOR CLICK RATE</span>
              <span className="text-slate-300 font-bold">1.00 (Nominal)</span>
            </div>
          </div>
        </div>

        {/* Selected Attack Profile Card */}
        <div className={`border rounded-lg p-4 space-y-3 ${
          isAttackActive ? 'bg-rose-950/20 border-rose-800' : 'bg-slate-900/60 border-slate-800'
        }`}>
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className={`text-xs font-bold flex items-center gap-1.5 uppercase ${
              isAttackActive ? 'text-rose-400' : 'text-slate-400'
            }`}>
              <ShieldAlert className="w-4 h-4" />
              ACTIVE SIMULATION PROFILE
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
              isAttackActive ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-slate-900 text-slate-400'
            }`}>
              {attack.type.toUpperCase()} ({(attack.intensity * 100).toFixed(0)}%)
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-500 block text-[10px]">OBSERVED QBER</span>
              <span className={`font-bold ${statistics.qber > 0.11 ? 'text-rose-400' : 'text-amber-400'}`}>
                {statistics.qber_percent.toFixed(2)}%
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">AFFECTED ROUNDS</span>
              <span className="text-rose-400 font-bold">{attack.affected_rounds} ({(attack.affected_fraction * 100).toFixed(1)}%)</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">EVE INFO ESTIMATE</span>
              <span className="text-amber-400 font-bold">{attack.estimated_eve_information.toFixed(3)}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">AVG TIMING JITTER</span>
              <span className={`font-bold ${parseFloat(avgJitter) > 30 ? 'text-rose-400' : 'text-slate-300'}`}>
                {avgJitter} ps
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">DETECTOR VARIANCE</span>
              <span className={`font-bold ${parseFloat(avgVariance) > 0.05 ? 'text-rose-400' : 'text-slate-300'}`}>
                {avgVariance}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">DETECTOR CLICK RATE</span>
              <span className="text-slate-300 font-bold">{avgClickRate}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
