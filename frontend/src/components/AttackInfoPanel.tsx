import React from 'react';
import { AttackSummary, MITMMetadata, StatisticsSummary } from '../types/simulation';
import { ShieldAlert, Eye, AlertTriangle, Radio } from 'lucide-react';

interface AttackInfoPanelProps {
  attack: AttackSummary;
  mitm: MITMMetadata;
  statistics: StatisticsSummary;
}

export const AttackInfoPanel: React.FC<AttackInfoPanelProps> = ({ attack, mitm, statistics }) => {
  const isEnabled = attack.enabled && attack.type !== 'none';

  return (
    <div className="bg-[#0c1118] border border-slate-800 rounded-xl p-5 font-mono text-xs space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-rose-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                ATTACKER STATUS & TELEMETRY PANEL
              </h3>
              <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${
                isEnabled
                  ? 'bg-rose-950 text-rose-400 border-rose-800'
                  : 'bg-slate-900 text-slate-400 border-slate-800'
              }`}>
                {isEnabled ? '■ ATTACK ACTIVE' : '● CLEAN BASELINE'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Eavesdropping model, intercepted rounds telemetry, and information estimates
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4 text-xs font-mono">
          <div>
            <span className="text-slate-500 block text-[10px]">ATTACK TYPE:</span>
            <span className="text-white font-bold uppercase">{attack.type}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">INTENSITY:</span>
            <span className="text-rose-400 font-bold">{(attack.intensity * 100).toFixed(0)}%</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Description */}
        <div className="md:col-span-2 space-y-3">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            ATTACK METHODOLOGY DESCRIPTION
          </label>
          <p className="text-[11px] text-slate-300 leading-relaxed bg-slate-950 p-3 rounded border border-slate-800 font-sans">
            {attack.description}
          </p>

          <div className="space-y-1">
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400">INTENSITY SCALE:</span>
              <span className="text-rose-400 font-bold">{(attack.intensity * 100).toFixed(0)}%</span>
            </div>
            <div className="w-full bg-slate-950 rounded h-1.5 overflow-hidden border border-slate-800">
              <div
                className="bg-rose-500 h-full transition-all duration-500"
                style={{ width: `${attack.intensity * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Affected Rounds */}
        <div className="bg-slate-950 p-3.5 rounded border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-rose-400" />
              INTERCEPTED
            </span>
            <span className="text-rose-400 font-bold">{attack.affected_rounds}</span>
          </div>
          <div className="text-xl font-bold text-white">
            {(attack.affected_fraction * 100).toFixed(1)}%
          </div>
          <p className="text-[10px] text-slate-500">
            {attack.affected_rounds} of {statistics.transmitted} qubits intercepted
          </p>
        </div>

        {/* Eve Information Estimate */}
        <div className="bg-slate-950 p-3.5 rounded border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-amber-400" />
              EVE INFORMATION
            </span>
            <span className="text-amber-400 font-bold">{(attack.estimated_eve_information * 100).toFixed(1)}%</span>
          </div>
          <div className="text-xl font-bold text-amber-400">
            {attack.estimated_eve_information.toFixed(3)}
          </div>
          <p className="text-[10px] text-slate-500">
            Information leaked prior to Privacy Amplification
          </p>
        </div>
      </div>

      {/* MITM Classical Tampering Box */}
      {mitm.message_modified && (
        <div className="bg-rose-950/40 p-3.5 rounded border border-rose-800 space-y-2 text-[11px]">
          <div className="flex items-center space-x-2 text-rose-300 font-bold">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>CLASSICAL BASIS PAYLOAD TAMPERED BY MITM</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>
              <span className="text-slate-400 block text-[10px]">ALICE SENT BASES:</span>
              <div className="bg-slate-950 p-2 rounded text-sky-400 break-all">
                {mitm.original_message}
              </div>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">EVE MODIFIED BASES TO BOB:</span>
              <div className="bg-slate-950 p-2 rounded text-rose-400 font-bold break-all">
                {mitm.modified_message}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
