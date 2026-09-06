import React from 'react';
import { ShieldCheck, ShieldAlert, Key, Lock, Cpu, CheckCircle2, XCircle, AlertTriangle, Layers, ArrowRight } from 'lucide-react';
import { PQCAuthenticationResult, MITMMetadata } from '../types/simulation';

interface PQCAuthenticationPanelProps {
  pqc?: PQCAuthenticationResult | null;
  mitm?: MITMMetadata | null;
}

export const PQCAuthenticationPanel: React.FC<PQCAuthenticationPanelProps> = ({ pqc, mitm }) => {
  if (!pqc || !pqc.enabled) {
    const isMitmModified = mitm?.message_modified ?? false;

    return (
      <div className="bg-[#0c1118] border border-amber-800/40 rounded-xl p-5 font-mono text-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-amber-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                POST-QUANTUM CLASSICAL CHANNEL AUTHENTICATION
              </h3>
              <p className="text-[11px] text-slate-400">Stage 4 Cryptographic Verification Engine</p>
            </div>
          </div>
          <span className="px-3 py-1 bg-slate-900 text-amber-400 border border-amber-800 rounded font-bold">
            ○ AUTHENTICATION DISABLED
          </span>
        </div>

        {isMitmModified ? (
          <div className="p-4 bg-rose-950/60 border border-rose-800 rounded-lg space-y-1">
            <h4 className="text-sm font-bold text-rose-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>CLASSICAL CHANNEL COMPROMISED (MITM ACTIVE)</span>
            </h4>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Eve intercepted and tampered with Alice's classical basis reconciliation payload.
              Because PQC Authentication is <strong className="text-rose-400 uppercase">DISABLED</strong>, Bob accepts the modified payload without cryptographic verification.
            </p>
          </div>
        ) : (
          <div className="p-3 bg-slate-900 border border-slate-800 rounded text-[11px] text-slate-400">
            PQC Authentication is currently disabled. Enable Stage 4 PQC Authentication in controls above to digitally sign classical basis payloads using NIST FIPS 204 ML-DSA-65.
          </div>
        )}
      </div>
    );
  }

  const isSigValid = pqc.signature_valid;
  const isBlocked = pqc.mitm_blocked;

  return (
    <div className="bg-[#0c1118] border border-slate-800 rounded-xl p-5 font-mono text-xs space-y-5">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-emerald-400">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                STAGE 4 — POST-QUANTUM CLASSICAL AUTHENTICATION
              </h3>
              <span className="px-2 py-0.5 text-[10px] bg-slate-900 text-emerald-300 border border-slate-800 rounded font-bold">
                NIST FIPS 204 ML-DSA-65
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Lattice-based digital signatures protecting classical basis reconciliation payloads
            </p>
          </div>
        </div>

        <div>
          {isSigValid ? (
            <span className="px-3.5 py-1 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded font-bold">
              ● AUTHENTICATED (VALID)
            </span>
          ) : (
            <span className="px-3.5 py-1 bg-rose-950 text-rose-400 border border-rose-800 rounded font-bold">
              ■ INVALID SIGNATURE (COMPROMISED)
            </span>
          )}
        </div>
      </div>

      {/* MITM Attack Blocked Banner */}
      {pqc.message_modified && isBlocked && (
        <div className="p-4 bg-emerald-950/60 border border-emerald-700/80 rounded-lg space-y-1">
          <h4 className="text-xs font-bold text-emerald-300 uppercase flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>CLASSICAL MAN-IN-THE-MIDDLE (MITM) ATTACK BLOCKED!</span>
          </h4>
          <p className="text-[11px] text-slate-200 leading-relaxed">
            Eve intercepted and altered Alice's basis reconciliation message during classical transit. Bob performed ML-DSA-65 post-quantum signature verification. Signature verification <strong className="text-emerald-400">FAILED</strong> on the tampered message. Bob REJECTED the message, neutralizing the MITM attack.
          </p>
        </div>
      )}

      {/* Classical Channel MITM Comparison */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-4 space-y-3">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          CLASSICAL CHANNEL MITM SECURITY VERIFICATION FLOW
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-center text-[11px]">
          <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
            <span className="text-[10px] text-slate-500 block">ALICE SENDER</span>
            <span className="font-bold text-white">ML-DSA-65 Sign Basis</span>
          </div>
          <div className={`p-2.5 rounded border ${pqc.message_modified ? 'bg-rose-950/60 border-rose-800 text-rose-300' : 'bg-slate-950 border-slate-800 text-slate-400'}`}>
            <span className="text-[10px] block text-slate-500">CLASSICAL CHANNEL</span>
            <span className="font-bold block">{pqc.message_modified ? 'Eve Modified Bases' : 'Passed Through Clean'}</span>
          </div>
          <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
            <span className="text-[10px] text-slate-500 block">BOB RECEIVER</span>
            <span className="font-bold text-sky-400">ML-DSA-65 Verify</span>
          </div>
          <div className={`p-2.5 rounded border ${isSigValid ? 'bg-emerald-950/80 border-emerald-700 text-emerald-300' : 'bg-rose-950/80 border-rose-700 text-rose-300 font-bold'}`}>
            <span className="text-[10px] block text-slate-500">DECISION</span>
            <span className="font-bold block">{isSigValid ? '● MESSAGE ACCEPTED' : '■ REJECTED (MITM BLOCKED)'}</span>
          </div>
        </div>
      </div>

      {/* Cryptographic Key & Signature Sizes Grid */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-4 space-y-3">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          CRYPTOGRAPHIC SPECIFICATION & BENCHMARK OVERHEAD
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
            <span className="text-[10px] text-slate-500 block">PUBLIC KEY</span>
            <span className="font-bold text-white">{pqc.public_key_bytes} Bytes</span>
          </div>
          <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
            <span className="text-[10px] text-slate-500 block">SECRET KEY</span>
            <span className="font-bold text-white">{pqc.private_key_bytes} Bytes</span>
          </div>
          <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
            <span className="text-[10px] text-slate-500 block">SIGNATURE</span>
            <span className="font-bold text-emerald-400">{pqc.signature_bytes} Bytes</span>
          </div>
          <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
            <span className="text-[10px] text-slate-500 block">KEYGEN LATENCY</span>
            <span className="font-bold text-sky-400">{pqc.key_generation_time_ms.toFixed(2)} ms</span>
          </div>
          <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
            <span className="text-[10px] text-slate-500 block">SIGN LATENCY</span>
            <span className="font-bold text-sky-400">{pqc.signing_time_ms.toFixed(2)} ms</span>
          </div>
          <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
            <span className="text-[10px] text-slate-500 block">VERIFY LATENCY</span>
            <span className="font-bold text-sky-400">{pqc.verification_time_ms.toFixed(2)} ms</span>
          </div>
        </div>
      </div>

      {/* Scientific Distinction Disclaimer Box */}
      <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-[11px] text-slate-400 space-y-1">
        <span className="text-cyan-400 font-bold uppercase block">CRITICAL SCIENTIFIC DISTINCTION:</span>
        <p>
          "ML-DSA-65 post-quantum signatures protect classical public channel messages (basis reconciliation payloads) against MITM tampering. PQC does NOT physically protect the quantum optical channel."
        </p>
      </div>
    </div>
  );
};
