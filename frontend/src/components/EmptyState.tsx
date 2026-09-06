import React from 'react';
import { ShieldCheck, Play, Radio, Cpu, Lock, Award, Sparkles } from 'lucide-react';
import { SimulationConfig } from '../types/simulation';

interface EmptyStateProps {
  onRunPreset: (preset: Partial<SimulationConfig>) => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onRunPreset }) => {
  const presets = [
    {
      title: 'Clean BB84 Session',
      desc: 'Normal quantum channel with 2% depolarizing noise & active PQC/AI protection.',
      config: { attack: 'none', attack_intensity: 0.0, noise: 0.02, enable_ai_detection: true, enable_pqc_authentication: true, enable_hybrid_security: true },
      badge: 'STANDARD BASELINE',
      color: 'border-emerald-500/40 text-emerald-300 hover:border-emerald-400 bg-emerald-950/20'
    },
    {
      title: 'Detector Blinding Stealth Attack',
      desc: 'Physical blinding attack creating low QBER (<11%) but flagged by Stage 3 AI Anomaly Detector.',
      config: { attack: 'detector_blinding', attack_intensity: 0.8, noise: 0.02, enable_ai_detection: true, enable_pqc_authentication: true, enable_hybrid_security: true },
      badge: 'STEALTH THREAT',
      color: 'border-rose-500/40 text-rose-300 hover:border-rose-400 bg-rose-950/20'
    },
    {
      title: 'Classical MITM Attack (PQC Protected)',
      desc: 'Eve alters classical basis reconciliation message, intercepted & blocked by Stage 4 ML-DSA-65 signatures.',
      config: { attack: 'mitm', attack_intensity: 0.8, noise: 0.02, enable_ai_detection: true, enable_pqc_authentication: true, enable_hybrid_security: true },
      badge: 'PQC INTERCEPT',
      color: 'border-cyan-500/40 text-cyan-300 hover:border-cyan-400 bg-cyan-950/20'
    },
    {
      title: 'High Channel Noise (15% QBER)',
      desc: 'Excessive environmental depolarizing noise exceeding the 11% theoretical security bound.',
      config: { attack: 'none', attack_intensity: 0.0, noise: 0.15, enable_ai_detection: true, enable_pqc_authentication: true, enable_hybrid_security: true },
      badge: 'QBER BREACH',
      color: 'border-amber-500/40 text-amber-300 hover:border-amber-400 bg-amber-950/20'
    }
  ];

  return (
    <div className="bg-[#090e1d] border border-cyan-900/40 rounded-3xl p-8 sm:p-12 text-center shadow-2xl relative overflow-hidden my-8">
      {/* Visual Ambient Glow */}
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-3xl mx-auto space-y-6 relative z-10">
        <div className="inline-flex p-4 bg-gradient-to-br from-cyan-500/20 via-indigo-500/20 to-purple-500/20 border border-cyan-500/40 rounded-2xl text-cyan-400 glow-cyan mb-2">
          <ShieldCheck className="w-12 h-12" />
        </div>

        <div>
          <div className="inline-block px-3 py-1 text-xs font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800 rounded-full mb-3">
            Q-SHIELD READY FOR SIMULATION
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-wide font-mono">
            Quantum Communication Security Operations Center
          </h2>
          <p className="text-sm text-slate-300 max-w-xl mx-auto font-sans leading-relaxed mt-2">
            Simulate physical BB84 quantum key distribution, inject eavesdropping attacks (PNS, Trojan-Horse, Detector Blinding, MITM), evaluate Stage 3 AI anomaly detection, verify Stage 4 ML-DSA-65 post-quantum digital signatures, and synthesize Stage 5 hybrid security decisions.
          </p>
        </div>

        {/* Quick Presets Grid */}
        <div className="pt-4">
          <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            SELECT A DEMONSTRATION PRESET SCENARIO
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
            {presets.map((p, idx) => (
              <button
                key={idx}
                onClick={() => onRunPreset(p.config)}
                className={`p-5 rounded-2xl border transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between group ${p.color}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-slate-900/90 border border-slate-800">
                      {p.badge}
                    </span>
                    <Play className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                  </div>
                  <h4 className="text-sm font-bold font-mono text-white mb-1 group-hover:text-cyan-300 transition-colors">
                    {p.title}
                  </h4>
                  <p className="text-xs text-slate-400 font-sans leading-snug">
                    {p.desc}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
