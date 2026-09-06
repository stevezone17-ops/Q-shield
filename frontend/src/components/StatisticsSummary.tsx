import React from 'react';
import { Activity, Key, CheckCircle, Layers, ShieldAlert, ShieldCheck } from 'lucide-react';
import { SimulationResult } from '../types/simulation';

interface StatisticsSummaryProps {
  result: SimulationResult;
}

export const StatisticsSummary: React.FC<StatisticsSummaryProps> = ({ result }) => {
  const { statistics } = result;
  const keyAction = result.hybrid_security?.key_action || (statistics.qber_percent <= 11.0 ? 'ALLOW_KEY' : 'REJECT_KEY');

  const keyStatusMap = {
    ALLOW_KEY: {
      status: 'APPROVED BY SECURITY POLICY',
      statusStyle: 'text-emerald-400',
      desc: 'Approved under configured Q-SHIELD policy',
      icon: ShieldCheck,
    },
    WARN: {
      status: 'REQUIRES SECURITY REVIEW',
      statusStyle: 'text-amber-400 font-bold',
      desc: 'Requires review under configured Q-SHIELD policy',
      icon: ShieldAlert,
    },
    REJECT_KEY: {
      status: 'REJECTED BY SECURITY POLICY',
      statusStyle: 'text-rose-400 font-bold',
      desc: 'Rejected by configured Q-SHIELD policy',
      icon: ShieldAlert,
    },
  };

  const keyStatusInfo = keyStatusMap[keyAction as keyof typeof keyStatusMap] || keyStatusMap.REJECT_KEY;
  const KeyStatusIcon = keyStatusInfo.icon;

  const cards = [
    {
      title: 'QBER SIGNAL',
      value: `${statistics.qber_percent.toFixed(2)}%`,
      desc: statistics.qber_percent <= 11.0 ? 'Within 11% theoretical limit' : 'Exceeds 11% security bound!',
      icon: Activity,
      status: statistics.qber_percent <= 11.0 ? '● NOMINAL' : '■ HIGH ERROR',
      statusStyle: statistics.qber_percent <= 11.0 ? 'text-emerald-400' : 'text-rose-400 font-bold',
    },
    {
      title: 'TRANSMITTED QUBITS',
      value: statistics.transmitted.toLocaleString(),
      desc: `${statistics.retained} bits retained after sifting`,
      icon: Layers,
      status: '● TRANSMITTED',
      statusStyle: 'text-sky-400',
    },
    {
      title: 'SIFTED KEY LENGTH',
      value: `${statistics.sifted_key_length} bits`,
      desc: `Yield ratio: ${((statistics.sifted_key_length / statistics.transmitted) * 100).toFixed(1)}%`,
      icon: Key,
      status: '● SIFTED',
      statusStyle: 'text-indigo-400',
    },
    {
      title: 'DERIVED SECRET KEY',
      value: `${result.privacy_amplification.final_key_length} bits`,
      desc: keyStatusInfo.desc,
      icon: KeyStatusIcon,
      status: keyStatusInfo.status,
      statusStyle: keyStatusInfo.statusStyle,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-xs">
      {cards.map((c, idx) => {
        const Icon = c.icon;
        return (
          <div key={idx} className="bg-[#0c1118] p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2 gap-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 shrink-0">
                  <Icon className="w-3.5 h-3.5 text-slate-500" />
                  {c.title}
                </span>
                <span className={`text-[10px] font-bold text-right ${c.statusStyle}`}>
                  {c.status}
                </span>
              </div>
              <div className="text-xl font-bold font-mono text-white mb-1">
                {c.value}
              </div>
            </div>
            <p className="text-[10px] text-slate-400 mt-2 border-t border-slate-800/80 pt-2">
              {c.desc}
            </p>
          </div>
        );
      })}
    </div>
  );
};
