import React from 'react';
import { SimulationResult } from '../types/simulation';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { LineChart as LineChartIcon } from 'lucide-react';

interface QberChartProps {
  result: SimulationResult;
}

export const QberChart: React.FC<QberChartProps> = ({ result }) => {
  const { rounds } = result;

  // Process rounds into sampled cumulative error data points
  const sampleRate = Math.max(1, Math.floor(rounds.length / 50));
  const chartData = [];

  let cumRetained = 0;
  let cumErrors = 0;

  for (let i = 0; i < rounds.length; i++) {
    const r = rounds[i];
    if (r.retained) {
      cumRetained++;
      if (r.error) {
        cumErrors++;
      }
    }

    if (i % sampleRate === 0 || i === rounds.length - 1) {
      const cumQber = cumRetained > 0 ? (cumErrors / cumRetained) * 100 : 0;
      chartData.push({
        round: r.index + 1,
        cumErrors,
        cumQber: parseFloat(cumQber.toFixed(2)),
        retained: cumRetained,
      });
    }
  }

  return (
    <div className="bg-[#0b1021] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400">
            <LineChartIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white tracking-wide">Cumulative QBER & Bit Error Telemetry</h3>
            <p className="text-xs text-slate-400">Empirical measurement noise profile calculated over retained rounds</p>
          </div>
        </div>

        <div className="flex items-center space-x-4 text-xs font-mono">
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-sm bg-rose-500 inline-block" />
            <span className="text-slate-300">Cumulative QBER (%)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-sm bg-amber-500 inline-block" />
            <span className="text-slate-300">Cumulative Errors</span>
          </div>
        </div>
      </div>

      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="qberGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="errorGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1b274f" />
            <XAxis
              dataKey="round"
              stroke="#64748b"
              fontSize={11}
              fontFamily="JetBrains Mono"
              tickFormatter={(v) => `R#${v}`}
            />
            <YAxis
              yAxisId="left"
              stroke="#f43f5e"
              fontSize={11}
              fontFamily="JetBrains Mono"
              domain={[0, 'auto']}
              unit="%"
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#f59e0b"
              fontSize={11}
              fontFamily="JetBrains Mono"
              domain={[0, 'auto']}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0b1021',
                borderColor: '#1b274f',
                borderRadius: '0.75rem',
                color: '#f8fafc',
                fontFamily: 'JetBrains Mono',
                fontSize: '12px',
              }}
            />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="cumQber"
              name="Cumulative QBER (%)"
              stroke="#f43f5e"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#qberGrad)"
            />
            <Area
              yAxisId="right"
              type="monotone"
              dataKey="cumErrors"
              name="Cumulative Errors"
              stroke="#f59e0b"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#errorGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
