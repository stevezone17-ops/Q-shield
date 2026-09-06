import React from 'react';
import { AlertCircle, Shield } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-800/80 bg-[#060913] py-8 text-xs font-mono text-slate-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-2 text-slate-400">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span className="font-semibold text-slate-300">Q-SHIELD Security Research Platform</span>
            <span>— Stage 1 BB84 Core Simulator</span>
          </div>

          <div className="flex items-center space-x-4 text-slate-400">
            <span>Academic Software Simulation</span>
            <span>•</span>
            <span>FastAPI & React Core Engine</span>
          </div>
        </div>

        <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl flex items-start space-x-3 text-[11px] text-slate-400 leading-relaxed">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p>
            <strong className="text-slate-300">Academic & Technical Disclaimer:</strong> This application is a mathematical and cryptographic software simulation of the BB84 Quantum Key Distribution protocol. It does not control or connect to physical photonic QKD hardware. All key material and error metrics are programmatically generated and derived strictly from simulated quantum measurements and channel parameters.
          </p>
        </div>
      </div>
    </footer>
  );
};
