import React, { useState } from 'react';
import { SimulationResult } from '../types/simulation';
import { Key, Copy, Check, Info } from 'lucide-react';

interface KeyDisplayProps {
  result: SimulationResult;
}

export const KeyDisplay: React.FC<KeyDisplayProps> = ({ result }) => {
  const [copied, setCopied] = useState(false);
  const { alice_sifted_key, bob_sifted_key, reconciled_key, final_secret_key_hex, final_secret_key_bits } = result;

  const handleCopy = () => {
    navigator.clipboard.writeText(final_secret_key_hex);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const previewLen = 64;

  return (
    <div className="bg-[#0c1118] border border-slate-800 rounded-xl p-5 font-mono text-xs space-y-5">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-emerald-400">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">KEY PROGRESSION & DERIVED SECRET MATERIAL</h3>
            <p className="text-[11px] text-slate-400">Evolution through sifting, error correction, and privacy amplification</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center space-x-2 text-[10px] bg-slate-900 text-slate-300 border border-slate-800 px-2.5 py-1 rounded">
          <Info className="w-3.5 h-3.5 text-slate-400" />
          <span>SIMULATED KEY MATERIAL</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Alice vs Bob Sifted Keys */}
        <div className="space-y-3">
          <div>
            <label className="text-[10px] text-slate-400 flex items-center justify-between mb-1">
              <span>ALICE SIFTED KEY (FIRST {Math.min(previewLen, alice_sifted_key.length)} BITS)</span>
              <span className="text-sky-400 font-bold">{alice_sifted_key.length} bits</span>
            </label>
            <div className="bg-slate-950 border border-slate-800 rounded p-2.5 font-mono text-xs text-sky-300 break-all leading-relaxed tracking-widest max-h-24 overflow-y-auto">
              {alice_sifted_key.slice(0, previewLen).join('')}
              {alice_sifted_key.length > previewLen && <span className="text-slate-600">...</span>}
            </div>
          </div>

          <div>
            <label className="text-[10px] text-slate-400 flex items-center justify-between mb-1">
              <span>BOB SIFTED KEY (FIRST {Math.min(previewLen, bob_sifted_key.length)} BITS)</span>
              <span className="text-emerald-400 font-bold">{bob_sifted_key.length} bits</span>
            </label>
            <div className="bg-slate-950 border border-slate-800 rounded p-2.5 font-mono text-xs break-all leading-relaxed tracking-widest max-h-24 overflow-y-auto">
              {bob_sifted_key.slice(0, previewLen).map((b, idx) => {
                const isDiff = alice_sifted_key[idx] !== b;
                return (
                  <span
                    key={idx}
                    className={isDiff ? 'bg-rose-950 text-rose-300 font-bold px-0.5 rounded' : 'text-emerald-300'}
                  >
                    {b}
                  </span>
                );
              })}
              {bob_sifted_key.length > previewLen && <span className="text-slate-600">...</span>}
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              Highlighted bits indicate channel errors prior to cascade reconciliation.
            </p>
          </div>
        </div>

        {/* Reconciled Key & Final Secret Key */}
        <div className="space-y-3">
          <div>
            <label className="text-[10px] text-slate-400 flex items-center justify-between mb-1">
              <span>RECONCILED KEY (ERROR CORRECTED)</span>
              <span className="text-amber-400 font-bold">{reconciled_key.length} bits</span>
            </label>
            <div className="bg-slate-950 border border-slate-800 rounded p-2.5 font-mono text-xs text-amber-300 break-all leading-relaxed tracking-widest max-h-24 overflow-y-auto">
              {reconciled_key.slice(0, previewLen).join('')}
              {reconciled_key.length > previewLen && <span className="text-slate-600">...</span>}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] text-slate-400">
                FINAL DERIVED SECRET KEY (SHA-256 HEX)
              </label>
              <button
                onClick={handleCopy}
                className="text-[10px] text-sky-400 hover:text-white flex items-center gap-1 bg-slate-900 px-2 py-0.5 rounded border border-slate-800"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'COPIED' : 'COPY HEX'}</span>
              </button>
            </div>
            <div className="bg-slate-950 border border-emerald-800 rounded p-3 font-mono text-xs text-emerald-400 break-all tracking-wider font-bold">
              0x{final_secret_key_hex}
            </div>
            <div className="mt-1.5 text-[10px] text-slate-400 flex items-center justify-between">
              <span>Binary ({final_secret_key_bits.length} bits):</span>
              <span className="text-slate-300 font-semibold">{final_secret_key_bits.slice(0, 32).join('')}...</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
