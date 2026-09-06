import React from 'react';
import { Play, ShieldAlert, Cpu, Lock, Award, Sliders, RotateCcw } from 'lucide-react';
import { SimulationConfig } from '../types/simulation';

interface SimulationControlsProps {
  config: SimulationConfig;
  onChange: (config: SimulationConfig) => void;
  onRun: () => void;
  loading: boolean;
}

export const SimulationControls: React.FC<SimulationControlsProps> = ({
  config,
  onChange,
  onRun,
  loading,
}) => {
  const attacks = [
    { id: 'none', name: 'None (Clean Baseline)', desc: 'Standard physical QKD baseline with depolarizing channel noise.' },
    { id: 'pns', name: 'Photon Number Splitting (PNS)', desc: 'Splits multi-photon pulses to gain key info without high QBER.' },
    { id: 'trojan_horse', name: 'Trojan-Horse Probing', desc: 'Fires external optical probe pulses into Alice/Bob state optics.' },
    { id: 'detector_blinding', name: 'Detector Blinding (Stealth)', desc: 'Blinds APDs into linear mode to control clicks while maintaining low QBER.' },
    { id: 'mitm', name: 'Man-in-the-Middle (MITM)', desc: 'Interceptors alter classical basis reconciliation payloads.' },
  ];

  const getThreatBadge = (intensity: number) => {
    if (config.attack === 'none' || intensity === 0) return { label: '● CLEAN', style: 'text-slate-400' };
    if (intensity <= 0.3) return { label: '▲ LOW', style: 'text-emerald-400' };
    if (intensity <= 0.6) return { label: '▲ MODERATE', style: 'text-amber-400' };
    if (intensity <= 0.85) return { label: '■ HIGH', style: 'text-rose-400' };
    return { label: '■ CRITICAL', style: 'text-rose-400 font-bold' };
  };

  const threat = getThreatBadge(config.attack_intensity);

  const handleReset = () => {
    onChange({
      num_qubits: 500,
      noise: 0.02,
      seed: 42,
      attack: 'none',
      attack_intensity: 0.0,
      enable_ai_detection: true,
      enable_pqc_authentication: true,
      enable_hybrid_security: true,
    });
  };

  return (
    <div className="bg-[#0c1118] border border-slate-800 rounded-xl p-5 font-mono text-xs space-y-5">
      {/* Control Header & Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-sky-400">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              SIMULATION PARAMETERS & THREAT CONTROL CONSOLE
            </h3>
            <p className="text-[11px] text-slate-400">Configure Quantum Channel, Attacker Model & Defense Stages</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            disabled={loading}
            className="px-3 py-2 rounded-lg font-mono text-xs font-bold text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 flex items-center gap-1.5 transition-colors focus-visible:ring-2 focus-visible:ring-sky-400"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>RESET</span>
          </button>

          <button
            onClick={onRun}
            disabled={loading}
            className={`px-5 py-2 rounded-lg font-mono text-xs font-bold flex items-center space-x-2 transition-colors border focus-visible:ring-2 focus-visible:ring-sky-400 ${
              loading
                ? 'bg-slate-900 text-slate-500 border-slate-800 cursor-not-allowed'
                : 'bg-sky-600 hover:bg-sky-500 text-white border-sky-500'
            }`}
          >
            {loading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>ANALYZING QUANTUM CHANNEL...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>RUN SIMULATION</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 3 Parameter Controls Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* 1. Physical Parameters */}
        <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-800 space-y-3">
          <h4 className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-sky-400" />
            1. BB84 PHYSICAL PARAMETERS
          </h4>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-1 text-[11px]">
                <label htmlFor="num_qubits_slider" className="text-slate-400">TRANSMITTED QUBITS</label>
                <span className="text-sky-400 font-bold">{config.num_qubits} Qubits</span>
              </div>
              <input
                id="num_qubits_slider"
                type="range"
                min={100}
                max={2000}
                step={100}
                value={config.num_qubits}
                onChange={(e) => onChange({ ...config, num_qubits: parseInt(e.target.value) })}
                className="w-full h-1.5 bg-slate-950 rounded appearance-none cursor-pointer accent-sky-400"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1 text-[11px]">
                <label htmlFor="noise_slider" className="text-slate-400">CHANNEL NOISE RATE</label>
                <span className="text-sky-400 font-bold">{(config.noise * 100).toFixed(1)}%</span>
              </div>
              <input
                id="noise_slider"
                type="range"
                min={0}
                max={0.25}
                step={0.01}
                value={config.noise}
                onChange={(e) => onChange({ ...config, noise: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-slate-950 rounded appearance-none cursor-pointer accent-sky-400"
              />
            </div>
          </div>
        </div>

        {/* 2. Attacker Controls */}
        <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              2. ATTACK SIMULATION MODEL
            </h4>
            <span className={`text-[10px] font-bold ${threat.style}`}>
              THREAT: {threat.label}
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <label htmlFor="attack_select" className="sr-only">Select Attack Model</label>
              <select
                id="attack_select"
                value={config.attack}
                onChange={(e) => onChange({ ...config, attack: e.target.value })}
                className="w-full bg-slate-950 text-slate-200 border border-slate-800 rounded px-2.5 py-1.5 text-xs font-mono focus:border-rose-500 focus:outline-none"
              >
                {attacks.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>

            {config.attack !== 'none' && (
              <div>
                <div className="flex justify-between mb-1 text-[11px]">
                  <label htmlFor="intensity_slider" className="text-slate-400">ATTACK INTENSITY</label>
                  <span className="text-rose-400 font-bold">{(config.attack_intensity * 100).toFixed(0)}%</span>
                </div>
                <input
                  id="intensity_slider"
                  type="range"
                  min={0.1}
                  max={1.0}
                  step={0.05}
                  value={config.attack_intensity}
                  onChange={(e) => onChange({ ...config, attack_intensity: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-slate-950 rounded appearance-none cursor-pointer accent-rose-500"
                />
              </div>
            )}
          </div>
        </div>

        {/* 3. Stage Security Toggles */}
        <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-800 space-y-3">
          <h4 className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
            3. SECURITY STAGES
          </h4>

          <div className="space-y-2">
            <label className="flex items-center space-x-2 cursor-pointer bg-slate-950 border border-slate-800 p-2 rounded hover:border-slate-700 transition-colors">
              <input
                type="checkbox"
                checked={config.enable_ai_detection ?? true}
                onChange={(e) => onChange({ ...config, enable_ai_detection: e.target.checked })}
                className="w-3.5 h-3.5 text-sky-500 bg-slate-900 border-slate-700 rounded"
              />
              <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-sky-400" />
                STAGE 3 AI ANOMALY DETECTOR
              </span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer bg-slate-950 border border-slate-800 p-2 rounded hover:border-slate-700 transition-colors">
              <input
                type="checkbox"
                checked={config.enable_pqc_authentication ?? true}
                onChange={(e) => onChange({ ...config, enable_pqc_authentication: e.target.checked })}
                className="w-3.5 h-3.5 text-emerald-500 bg-slate-900 border-slate-700 rounded"
              />
              <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                STAGE 4 PQC AUTHENTICATION
              </span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer bg-slate-950 border border-slate-800 p-2 rounded hover:border-slate-700 transition-colors">
              <input
                type="checkbox"
                checked={config.enable_hybrid_security ?? true}
                onChange={(e) => onChange({ ...config, enable_hybrid_security: e.target.checked })}
                className="w-3.5 h-3.5 text-purple-500 bg-slate-900 border-slate-700 rounded"
              />
              <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-purple-400" />
                STAGE 5 HYBRID SECURITY ENGINE
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
