import React from 'react';
import { UserCheck, Radio, ShieldAlert, CheckCircle, Lock } from 'lucide-react';
import { PQCAuthenticationResult, MITMMetadata } from '../types/simulation';

interface QuantumChannelVisualizationProps {
  attackType?: string;
  attackIntensity?: number;
  noise?: number;
  pqcResult?: PQCAuthenticationResult | null;
  mitm?: MITMMetadata | null;
}

export const QuantumChannelVisualization: React.FC<QuantumChannelVisualizationProps> = ({
  attackType = 'none',
  attackIntensity = 0.0,
  noise = 0.02,
  pqcResult = null,
  mitm = null,
}) => {
  const isAttackActive = attackType !== 'none' && attackIntensity > 0;
  const isPqcActive = pqcResult?.enabled ?? false;
  const isMitm = attackType === 'mitm';

  return (
    <div className="bg-[#0c1118] border border-slate-800 rounded-xl p-5 font-mono text-xs space-y-5">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Radio className="w-4 h-4 text-sky-400" />
            QUANTUM & CLASSICAL CHANNEL ARCHITECTURE
          </h3>
          <p className="text-[10px] text-slate-400">
            Physical Quantum Fiber Channel & Post-Quantum Classical Basis Reconciliation Channel
          </p>
        </div>

        <div className="text-[10px] bg-slate-900 px-2.5 py-1 rounded border border-slate-800 text-slate-300 font-bold">
          NOISE RATE: {(noise * 100).toFixed(1)}%
        </div>
      </div>

      {/* 1. QUANTUM OPTICAL FIBER CHANNEL */}
      <div className="space-y-2">
        <span className="text-[10px] font-bold text-sky-400 uppercase tracking-widest block">
          PHYSICAL QUANTUM OPTICAL FIBER CHANNEL
        </span>

        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3">
          {/* ALICE NODE */}
          <div className="bg-slate-900 border border-slate-700 p-3 rounded text-slate-200 min-w-[160px]">
            <span className="font-bold block text-white">ALICE (TRANSMITTER)</span>
            <span className="text-[10px] text-slate-400 block">States: |0&gt;, |1&gt;, |+&gt;, |-&gt;</span>
          </div>

          {/* CHANNEL LINE & EVE */}
          <div className="flex-1 flex items-center justify-center relative w-full px-2">
            <div className="h-0.5 w-full bg-slate-700 rounded relative">
              <div className="absolute inset-0 bg-sky-500/40" style={{ width: '100%' }} />
            </div>

            {isAttackActive ? (
              <div className="absolute inset-x-0 flex items-center justify-center">
                <div className="bg-rose-950 border border-rose-700 text-rose-300 px-3 py-1 rounded flex items-center space-x-2 text-[10px]">
                  <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                  <div>
                    <span className="font-bold block text-white">
                      EVE ({attackType.toUpperCase()})
                    </span>
                    <span className="text-rose-300 block">
                      Intensity: {(attackIntensity * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="absolute inset-x-0 flex items-center justify-center">
                <span className="bg-slate-900 border border-slate-800 text-slate-400 px-2.5 py-0.5 rounded text-[10px]">
                  SECURE FIBER OPTIC TRANSMISSION
                </span>
              </div>
            )}
          </div>

          {/* BOB NODE */}
          <div className="bg-slate-900 border border-slate-700 p-3 rounded text-slate-200 min-w-[160px]">
            <span className="font-bold block text-white">BOB (RECEIVER)</span>
            <span className="text-[10px] text-slate-400 block">Born's Rule Detection</span>
          </div>
        </div>
      </div>

      {/* 2. CLASSICAL RECONCILIATION CHANNEL */}
      <div className="space-y-2">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
          CLASSICAL BASIS RECONCILIATION CHANNEL (PUBLIC IP NETWORK)
        </span>

        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3 text-[11px]">
          <div className="text-slate-400">
            <span className="block font-bold text-white">ALICE CLASSICAL RECONCILIATION</span>
          </div>

          <div className="flex-1 flex items-center justify-center px-2">
            <div className={`p-2.5 rounded border w-full flex items-center justify-between ${
              isMitm
                ? isPqcActive && pqcResult?.mitm_blocked
                  ? 'bg-emerald-950/60 border-emerald-700 text-emerald-300'
                  : 'bg-rose-950/60 border-rose-700 text-rose-300'
                : isPqcActive
                ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}>
              <div className="flex items-center space-x-2">
                <Lock className="w-3.5 h-3.5 shrink-0" />
                <span>
                  {isPqcActive ? 'NIST FIPS 204 ML-DSA-65 SIGNED PAYLOAD' : 'UNAUTHENTICATED CLASSICAL PAYLOAD'}
                </span>
              </div>

              {isMitm && (
                <span className="font-bold px-2 py-0.5 rounded text-[10px] bg-slate-900 border border-slate-800">
                  {isPqcActive && pqcResult?.mitm_blocked ? 'MITM BLOCKED BY PQC' : 'CLASSICAL MITM TAMPERED'}
                </span>
              )}
            </div>
          </div>

          <div className="text-slate-400">
            <span className="block font-bold text-white">BOB VERIFICATION</span>
          </div>
        </div>
      </div>
    </div>
  );
};
