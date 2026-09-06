import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { RoundTelemetry } from '../types/simulation';
import { Activity } from 'lucide-react';

interface TelemetryAnomalyChartProps {
  telemetry: RoundTelemetry[];
}

export const TelemetryAnomalyChart: React.FC<TelemetryAnomalyChartProps> = ({ telemetry }) => {
  if (!telemetry || telemetry.length === 0) return null;

  // Downsample telemetry stream into windowed timeline for smooth chart rendering (max ~30 data points)
  const step = Math.max(1, Math.floor(telemetry.length / 30));
  const chartData = [];

  for (let i = 0; i < telemetry.length; i += step) {
    const item = telemetry[i];
    chartData.push({
      round: item.round_index + 1,
      qber_pct: Number((item.qber_signal * 100).toFixed(2)),
      jitter_ps: Number(item.timing_jitter.toFixed(1)),
      variance_x10: Number((item.detector_response_variance * 100).toFixed(2)),
      probe_pct: Number((item.probe_reflection_intensity * 100).toFixed(1)),
    });
  }

  return (
    <div className="bg-[#0b1021] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-500/10 border border-indigo-500/30 rounded-lg text-indigo-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white tracking-wide">
              Physical Telemetry Stream & Anomaly Demonstration
            </h3>
            <p className="text-xs text-slate-400">
              QBER vs. Timing Jitter (ps) and Detector Response Variance over transmission timeline
            </p>
          </div>
        </div>
      </div>

      <div className="h-64 w-full pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="round" stroke="#64748b" tick={{ fontSize: 10, fill: '#64748b' }} />
            <YAxis yAxisId="left" stroke="#38bdf8" tick={{ fontSize: 10, fill: '#38bdf8' }} domain={[0, 50]} label={{ value: 'QBER % / Var', angle: -90, position: 'insideLeft', fill: '#38bdf8', fontSize: 10 }} />
            <YAxis yAxisId="right" orientation="right" stroke="#f43f5e" tick={{ fontSize: 10, fill: '#f43f5e' }} domain={[0, 160]} label={{ value: 'Jitter (ps)', angle: 90, position: 'insideRight', fill: '#f43f5e', fontSize: 10 }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '0.75rem' }}
              itemStyle={{ fontFamily: 'monospace' }}
            />
            <Legend wrapperStyle={{ fontSize: '0.75rem', paddingTop: '10px' }} />
            <Line yAxisId="left" type="monotone" dataKey="qber_pct" name="QBER (%)" stroke="#38bdf8" strokeWidth={2.5} dot={false} />
            <Line yAxisId="right" type="monotone" dataKey="jitter_ps" name="Timing Jitter (ps)" stroke="#f43f5e" strokeWidth={2.5} dot={false} />
            <Line yAxisId="left" type="monotone" dataKey="variance_x10" name="Detector Variance (x100)" stroke="#f59e0b" strokeWidth={2} dot={false} strokeDasharray="4 4" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-[11px] font-mono text-slate-400 flex items-center justify-between">
        <span>
          <strong className="text-cyan-400">KEY OBSERVATION:</strong> During stealth attacks (such as Detector Blinding), the blue QBER line remains flat/low while the red Timing Jitter line spikes to &gt;120 ps, enabling AI detection.
        </span>
      </div>
    </div>
  );
};
