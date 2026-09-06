import React from 'react';
import { Activity, Radio, Zap, ShieldAlert, Cpu, Layers, Eye, Gauge } from 'lucide-react';
import { SimulationResult } from '../types/simulation';

interface TelemetryOverviewProps {
  result: SimulationResult;
}

export const TelemetryOverview: React.FC<TelemetryOverviewProps> = ({ result }) => {
  const { statistics, telemetry } = result;

  const count = telemetry.length || 1;
  const avgClickRate = telemetry.reduce((a, b) => a + b.click_rate, 0) / count;
  const avgJitter = telemetry.reduce((a, b) => a + b.timing_jitter, 0) / count;
  const avgVariance = telemetry.reduce((a, b) => a + b.detector_response_variance, 0) / count;
  const avgBurstRate = telemetry.reduce((a, b) => a + b.burst_rate, 0) / count;
  const avgFrequency = telemetry.reduce((a, b) => a + b.detection_frequency, 0) / count;
  const avgPhotonStats = telemetry.reduce((a, b) => a + b.photon_count_statistics, 0) / count;
  const avgProbeReflection = telemetry.reduce((a, b) => a + b.probe_reflection_intensity, 0) / count;

  const cards = [
    {
      title: 'QBER SIGNAL',
      value: `${statistics.qber_percent.toFixed(2)}%`,
      unit: '% error rate',
      status: statistics.qber_percent <= 11.0 ? '● NOMINAL' : '■ HIGH QBER',
      statusStyle: statistics.qber_percent <= 11.0 ? 'text-emerald-400' : 'text-rose-400 font-bold',
      trend: statistics.qber_percent <= 11.0 ? '→ stable' : '↑ abnormal',
      icon: Activity,
    },
    {
      title: 'CLICK RATE',
      value: avgClickRate.toFixed(2),
      unit: 'clicks / pulse',
      status: avgClickRate >= 0.8 && avgClickRate <= 1.2 ? '● NOMINAL' : '▲ ELEVATED',
      statusStyle: avgClickRate >= 0.8 && avgClickRate <= 1.2 ? 'text-emerald-400' : 'text-amber-400',
      trend: avgClickRate > 1.0 ? '↑ high' : '→ nominal',
      icon: Gauge,
    },
    {
      title: 'TIMING JITTER',
      value: `${avgJitter.toFixed(1)} ps`,
      unit: 'picoseconds',
      status: avgJitter > 30 ? '■ ABNORMAL' : '● NOMINAL',
      statusStyle: avgJitter > 30 ? 'text-rose-400 font-bold' : 'text-emerald-400',
      trend: avgJitter > 30 ? '↑ high jitter' : '→ nominal',
      icon: Zap,
    },
    {
      title: 'DETECTOR VARIANCE',
      value: avgVariance.toFixed(3),
      unit: 'variance index',
      status: avgVariance > 0.05 ? '▲ ANOMALOUS' : '● NOMINAL',
      statusStyle: avgVariance > 0.05 ? 'text-amber-400 font-bold' : 'text-emerald-400',
      trend: avgVariance > 0.05 ? '↑ elevated' : '→ nominal',
      icon: Cpu,
    },
    {
      title: 'BURST RATE',
      value: `${(avgBurstRate * 100).toFixed(1)}%`,
      unit: 'bursts / second',
      status: avgBurstRate > 0.1 ? '▲ ELEVATED' : '● NOMINAL',
      statusStyle: avgBurstRate > 0.1 ? 'text-amber-400' : 'text-emerald-400',
      trend: avgBurstRate > 0.1 ? '↑ burst' : '→ stable',
      icon: Radio,
    },
    {
      title: 'DETECTION FREQ',
      value: `${avgFrequency.toFixed(1)} MHz`,
      unit: 'clock rate',
      status: '● OPTIMAL',
      statusStyle: 'text-emerald-400',
      trend: '→ 80.0 MHz',
      icon: Layers,
    },
    {
      title: 'PHOTON STATISTICS',
      value: avgPhotonStats.toFixed(2),
      unit: 'photon count index',
      status: avgPhotonStats > 1.15 ? '▲ PNS RISK' : '● BASELINE',
      statusStyle: avgPhotonStats > 1.15 ? 'text-amber-400 font-bold' : 'text-emerald-400',
      trend: avgPhotonStats > 1.15 ? '↑ multi-photon' : '→ nominal',
      icon: ShieldAlert,
    },
    {
      title: 'PROBE REFLECTION',
      value: `${(avgProbeReflection * 100).toFixed(1)}%`,
      unit: 'optical return',
      status: avgProbeReflection > 0.05 ? '■ PROBE DETECTED' : '● CLEAN',
      statusStyle: avgProbeReflection > 0.05 ? 'text-rose-400 font-bold' : 'text-emerald-400',
      trend: avgProbeReflection > 0.05 ? '↑ reflection' : '→ zero',
      icon: Eye,
    },
  ];

  return (
    <div className="bg-[#0c1118] border border-slate-800 rounded-xl p-5 font-mono text-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Activity className="w-4 h-4 text-sky-400" />
          PHYSICAL TELEMETRY MONITORING STREAM (8 SIGNALS)
        </h3>
        <span className="text-[10px] text-slate-500">
          SAMPLES: {telemetry.length} ROUNDS
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div
              key={c.title}
              className="bg-slate-900/80 p-3.5 rounded-lg border border-slate-800 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5 text-slate-500" />
                    {c.title}
                  </span>
                  <span className={`text-[10px] font-bold ${c.statusStyle}`}>
                    {c.status}
                  </span>
                </div>

                <div className="text-xl font-bold font-mono text-white mb-0.5">
                  {c.value}
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-800/80 pt-2 mt-2">
                <span>{c.unit}</span>
                <span className="font-bold text-slate-300">{c.trend}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
