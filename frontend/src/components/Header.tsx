import React from 'react';
import { Shield, Cpu, Activity, Lock, Award, Eye, Terminal, Radio, FlaskConical, Presentation } from 'lucide-react';

interface HeaderProps {
  apiOnline: boolean | null;
  activeTab: string;
  onTabChange: (tab: string) => void;
  sessionId?: string;
}

export const Header: React.FC<HeaderProps> = ({
  apiOnline,
  activeTab,
  onTabChange,
  sessionId = "QS-8F42"
}) => {
  const tabs = [
    { id: 'overview', label: 'OVERVIEW', icon: Shield },
    { id: 'quantum', label: 'QUANTUM & ATTACKS', icon: Radio },
    { id: 'ai', label: 'AI DETECTOR', icon: Cpu },
    { id: 'pqc', label: 'PQC AUTH', icon: Lock },
    { id: 'hybrid', label: 'HYBRID ENGINE', icon: Award },
    { id: 'inspector', label: 'ROUND INSPECTOR', icon: Eye },
    { id: 'experiment', label: 'EXPERIMENTS', icon: FlaskConical },
    { id: 'presentation', label: 'PRESENTATION', icon: Presentation },
  ];

  return (
    <header className="border-b border-slate-800 bg-[#070c14] sticky top-0 z-50">
      {/* Top Banner Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Left Branding */}
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-sky-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2.5">
              <h1 className="text-base font-bold text-white font-mono tracking-wide">
                Q-SHIELD
              </h1>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 bg-slate-900 text-slate-300 border border-slate-800 rounded">
                STAGE 1–8 COMPLETE
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Quantum Communication Security Framework
            </p>
          </div>
        </div>

        {/* Right System Status Pills */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono">
          {/* Operational Pulse */}
          <div className="flex items-center space-x-2 px-2.5 py-1 rounded border bg-emerald-950/40 border-emerald-800/60 text-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="font-bold text-[11px]">SYSTEM OPERATIONAL</span>
          </div>

          {/* Session Tag */}
          <div className="hidden sm:flex items-center space-x-1.5 text-slate-300 bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
            <Terminal className="w-3.5 h-3.5 text-slate-400" />
            <span>SESSION <strong className="text-white">{sessionId}</strong></span>
          </div>

          {/* API Health Pill */}
          <div className="flex items-center space-x-2 px-2.5 py-1 rounded border bg-slate-900 border-slate-800">
            <Activity className={`w-3.5 h-3.5 ${apiOnline === true ? 'text-emerald-400' : apiOnline === false ? 'text-rose-400' : 'text-slate-500'}`} />
            <span className="text-slate-300">
              API {apiOnline === true ? <span className="text-emerald-400 font-bold">ONLINE</span> : apiOnline === false ? <span className="text-rose-400 font-bold">OFFLINE</span> : <span className="text-slate-400">CHECKING...</span>}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tab Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-800/80">
        <nav className="flex space-x-1 overflow-x-auto py-1.5 scrollbar-none" aria-label="SOC Navigation">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`px-3 py-1.5 rounded-lg font-mono text-xs font-semibold transition-colors flex items-center space-x-1.5 whitespace-nowrap ${
                  isActive
                    ? 'bg-slate-800 text-sky-300 border border-slate-700 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-sky-400' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
