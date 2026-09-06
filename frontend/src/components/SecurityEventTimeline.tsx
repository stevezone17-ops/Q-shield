import React from 'react';
import { Terminal, CheckCircle2, AlertTriangle, XCircle, Clock } from 'lucide-react';
import { SimulationResult } from '../types/simulation';

interface SecurityEventTimelineProps {
  result: SimulationResult;
}

export const SecurityEventTimeline: React.FC<SecurityEventTimelineProps> = ({ result }) => {
  const events = [];
  const now = new Date();
  const formatTime = (offsetMs: number) => {
    const t = new Date(now.getTime() - offsetMs);
    return t.toISOString().substring(11, 19);
  };

  events.push({
    time: formatTime(150),
    title: 'BB84 QUANTUM STATE PREPARATION',
    desc: `Alice initialized ${result.statistics.transmitted} random bit/basis quantum states.`,
    type: 'info'
  });

  if (result.attack.enabled && result.attack.type !== 'none') {
    events.push({
      time: formatTime(120),
      title: `EAVESDROPPING ATTACK DETECTED: ${result.attack.type.toUpperCase()}`,
      desc: `Attacker intercepting channel at ${(result.attack.intensity * 100).toFixed(0)}% intensity. Affected ${result.attack.affected_rounds} rounds.`,
      type: 'warning'
    });
  }

  events.push({
    time: formatTime(90),
    title: 'QUANTUM CHANNEL TRANSMISSION & BASIS RECONCILIATION',
    desc: `Bob measured qubits. Sifting retained ${result.statistics.retained} bits with QBER ${result.statistics.qber_percent.toFixed(2)}%.`,
    type: 'info'
  });

  if (result.ai_detection?.enabled) {
    const isAnomaly = result.ai_detection.status !== 'NORMAL';
    events.push({
      time: formatTime(60),
      title: `STAGE 3 AI ANOMALY INFERENCE: ${result.ai_detection.status}`,
      desc: result.ai_detection.explanation,
      type: isAnomaly ? 'warning' : 'success'
    });
  }

  if (result.pqc_authentication?.enabled) {
    const isValid = result.pqc_authentication.signature_valid;
    events.push({
      time: formatTime(30),
      title: `STAGE 4 ML-DSA-65 PQC DIGITAL SIGNATURE`,
      desc: isValid ? 'Classical channel message signature verified successfully.' : 'Signature verification FAILED! Message altered in transit.',
      type: isValid ? 'success' : 'danger'
    });
  }

  if (result.hybrid_security?.enabled) {
    const isRejected = result.hybrid_security.key_action === 'REJECT_KEY';
    events.push({
      time: formatTime(10),
      title: `STAGE 5 HYBRID ENGINE DECISION: ${result.hybrid_security.key_action}`,
      desc: `Overall Score: ${result.hybrid_security.security_score.toFixed(1)}/100 (${result.hybrid_security.security_level}). ${result.hybrid_security.recommendation}`,
      type: isRejected ? 'danger' : 'success'
    });
  }

  return (
    <div className="bg-[#090e1d] border border-slate-800 rounded-3xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
        <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          CHRONOLOGICAL SECURITY EVENT LOG TIMELINE
        </h3>
        <span className="text-[10px] font-mono text-slate-500">
          EXECUTION TIME: {result.execution_time_ms.toFixed(2)} MS
        </span>
      </div>

      <div className="space-y-3 font-mono text-xs">
        {events.map((e, idx) => (
          <div key={idx} className="flex items-start space-x-3 p-3 rounded-xl bg-slate-950 border border-slate-800/80">
            <div className="mt-0.5 shrink-0">
              {e.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : e.type === 'warning' ? (
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              ) : e.type === 'danger' ? (
                <XCircle className="w-4 h-4 text-rose-400" />
              ) : (
                <Clock className="w-4 h-4 text-cyan-400" />
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between mb-0.5">
                <span className="font-bold text-white tracking-wide">{e.title}</span>
                <span className="text-[10px] text-slate-500">{e.time}</span>
              </div>
              <p className="text-[11px] text-slate-400 font-sans leading-snug">{e.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
