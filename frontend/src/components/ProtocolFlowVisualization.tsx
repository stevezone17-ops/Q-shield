import React from 'react';
import { ArrowRight, UserCheck, ShieldCheck, Cpu, Radio, Lock, Award, ShieldAlert } from 'lucide-react';
import { PQCAuthenticationResult, HybridSecurityAssessment } from '../types/simulation';

interface ProtocolFlowVisualizationProps {
  hasResult: boolean;
  attackType?: string;
  attackEnabled?: boolean;
  pqcResult?: PQCAuthenticationResult | null;
  hybridResult?: HybridSecurityAssessment | null;
}

export const ProtocolFlowVisualization: React.FC<ProtocolFlowVisualizationProps> = ({
  hasResult,
  attackType = 'none',
  attackEnabled = false,
  pqcResult = null,
  hybridResult = null,
}) => {
  const isEveActive = attackEnabled && attackType !== 'none';
  const isPqcActive = pqcResult?.enabled ?? false;
  const isPqcTampered = pqcResult?.message_modified && !pqcResult?.signature_valid;
  const isHybridActive = hybridResult?.enabled ?? false;

  const steps = [
    {
      num: '01',
      title: 'ALICE PREP',
      desc: 'Quantum State Prep',
      status: '● PREPARED',
      statusColor: 'text-sky-400',
    },
    {
      num: '02',
      title: 'QUANTUM CHANNEL',
      desc: isEveActive ? `Eve (${attackType.toUpperCase()})` : 'Fiber Optics Transmission',
      status: isEveActive ? '■ INTERCEPTED' : '● TRANSMITTING',
      statusColor: isEveActive ? 'text-rose-400' : 'text-emerald-400',
    },
    {
      num: '03',
      title: 'ATTACK MONITOR',
      desc: 'Physical Telemetry',
      status: isEveActive ? '▲ ANOMALOUS' : '● NOMINAL',
      statusColor: isEveActive ? 'text-amber-400' : 'text-emerald-400',
    },
    {
      num: '04',
      title: 'BOB MEASURE',
      desc: "Born's Rule Detector",
      status: '● MEASURED',
      statusColor: 'text-sky-400',
    },
    {
      num: '05',
      title: 'BASIS RECONCILE',
      desc: isPqcActive ? 'ML-DSA-65 Signed' : 'Public IP Channel',
      status: isPqcActive ? (isPqcTampered ? '■ TAMPERED' : '● SIGNED') : '○ PUBLIC',
      statusColor: isPqcTampered ? 'text-rose-400' : isPqcActive ? 'text-emerald-400' : 'text-slate-400',
    },
    {
      num: '06',
      title: 'SIFTED KEY & QBER',
      desc: 'Error Estimation',
      status: '● EVALUATED',
      statusColor: 'text-indigo-400',
    },
    {
      num: '07',
      title: 'SECURITY DECISION',
      desc: hybridResult ? hybridResult.key_action : 'Decision Engine',
      status: hybridResult ? (hybridResult.key_action === 'REJECT_KEY' ? '■ REJECT' : '● ALLOW') : '○ STANDBY',
      statusColor: hybridResult?.key_action === 'REJECT_KEY' ? 'text-rose-400' : 'text-emerald-400',
    },
  ];

  return (
    <div className="bg-[#0c1118] border border-slate-800 rounded-xl p-5 font-mono text-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Radio className="w-4 h-4 text-sky-400" />
            ENGINEERING PIPELINE FLOW DIAGRAM
          </h3>
          <p className="text-[10px] text-slate-400">
            End-to-end security architecture pipeline: Quantum preparation through hybrid security policy
          </p>
        </div>

        <div className="flex items-center space-x-2 text-[10px]">
          {isPqcActive && (
            <span className="px-2 py-0.5 bg-slate-900 text-emerald-400 border border-emerald-800 rounded font-bold">
              PQC ML-DSA-65 ON
            </span>
          )}
          {isHybridActive && (
            <span className="px-2 py-0.5 bg-slate-900 text-sky-400 border border-slate-700 rounded font-bold">
              HYBRID ENGINE ON
            </span>
          )}
        </div>
      </div>

      {/* Connected Technical System Diagram Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-2">
        {steps.map((step, idx) => (
          <div key={step.num} className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 relative flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center text-[10px] text-slate-500 mb-1">
                <span>{step.num}</span>
                <span className={`font-bold ${step.statusColor}`}>{step.status}</span>
              </div>
              <h4 className="font-bold text-white text-[11px] uppercase tracking-wide truncate">{step.title}</h4>
              <p className="text-[10px] text-slate-400 mt-1 truncate">{step.desc}</p>
            </div>

            {idx < steps.length - 1 && (
              <div className="hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 z-10 text-slate-600">
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
