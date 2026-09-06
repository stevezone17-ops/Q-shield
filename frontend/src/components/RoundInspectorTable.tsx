import React, { useState } from 'react';
import { TransmissionRound } from '../types/simulation';
import { Table, ChevronLeft, ChevronRight, Search } from 'lucide-react';

interface RoundInspectorTableProps {
  rounds: TransmissionRound[];
}

export const RoundInspectorTable: React.FC<RoundInspectorTableProps> = ({ rounds }) => {
  const [filter, setFilter] = useState<'all' | 'retained' | 'errors' | 'attacked'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const pageSize = 25;

  const filteredRounds = rounds.filter((r) => {
    if (filter === 'retained' && !r.retained) return false;
    if (filter === 'errors' && (!r.retained || !r.error)) return false;
    if (filter === 'attacked' && !r.attack_affected) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        r.index.toString().includes(term) ||
        r.alice_basis.toLowerCase().includes(term) ||
        r.bob_basis.toLowerCase().includes(term) ||
        r.state.toLowerCase().includes(term) ||
        (r.detector_event && r.detector_event.toLowerCase().includes(term))
      );
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filteredRounds.length / pageSize));
  const pageRounds = filteredRounds.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleFilterChange = (newFilter: 'all' | 'retained' | 'errors' | 'attacked') => {
    setFilter(newFilter);
    setCurrentPage(1);
  };

  return (
    <div className="bg-[#0c1118] border border-slate-800 rounded-xl p-5 font-mono text-xs space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-sky-400">
            <Table className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">TRANSMISSION ROUND TELEMETRY INSPECTOR</h3>
            <p className="text-[11px] text-slate-400">Bit-by-bit quantum state preparation, basis alignment, measurements, and attack telemetry</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search index, event or basis..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-slate-950 border border-slate-800 rounded pl-8 pr-3 py-1 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500 font-mono w-52"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center bg-slate-950 p-1 rounded border border-slate-800">
            <button
              onClick={() => handleFilterChange('all')}
              className={`px-2.5 py-0.5 text-[11px] font-mono rounded transition-colors ${
                filter === 'all' ? 'bg-slate-800 text-sky-300 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              ALL ({rounds.length})
            </button>
            <button
              onClick={() => handleFilterChange('retained')}
              className={`px-2.5 py-0.5 text-[11px] font-mono rounded transition-colors ${
                filter === 'retained' ? 'bg-slate-800 text-emerald-300 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              RETAINED ({rounds.filter((r) => r.retained).length})
            </button>
            <button
              onClick={() => handleFilterChange('errors')}
              className={`px-2.5 py-0.5 text-[11px] font-mono rounded transition-colors ${
                filter === 'errors' ? 'bg-slate-800 text-rose-300 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              ERRORS ({rounds.filter((r) => r.retained && r.error).length})
            </button>
            <button
              onClick={() => handleFilterChange('attacked')}
              className={`px-2.5 py-0.5 text-[11px] font-mono rounded transition-colors ${
                filter === 'attacked' ? 'bg-rose-950 text-rose-300 font-bold border border-rose-800' : 'text-slate-400 hover:text-white'
              }`}
            >
              ATTACKED ({rounds.filter((r) => r.attack_affected).length})
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded border border-slate-800">
        <table className="w-full text-left border-collapse font-mono text-xs">
          <thead>
            <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
              <th className="py-2.5 px-3 font-bold">#</th>
              <th className="py-2.5 px-3 font-bold text-sky-400">Alice Bit</th>
              <th className="py-2.5 px-3 font-bold text-sky-400">Alice Basis</th>
              <th className="py-2.5 px-3 font-bold text-slate-300">State</th>
              <th className="py-2.5 px-3 font-bold text-emerald-400">Bob Basis</th>
              <th className="py-2.5 px-3 font-bold text-emerald-400">Bob Bit</th>
              <th className="py-2.5 px-3 font-bold text-center">Retained</th>
              <th className="py-2.5 px-3 font-bold text-center">Error</th>
              <th className="py-2.5 px-3 font-bold text-center text-rose-400">Attack Event</th>
              <th className="py-2.5 px-3 font-bold text-right text-amber-400">Eve Info</th>
              <th className="py-2.5 px-3 font-bold text-right text-slate-400">Jitter (ps)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
            {pageRounds.length === 0 ? (
              <tr>
                <td colSpan={11} className="py-8 text-center text-slate-500">
                  No transmission rounds found matching current filter.
                </td>
              </tr>
            ) : (
              pageRounds.map((r) => (
                <tr key={r.index} className={`hover:bg-slate-900/50 transition-colors ${r.attack_affected ? 'bg-rose-950/20' : ''}`}>
                  <td className="py-2 px-3 text-slate-500 font-semibold">{r.index + 1}</td>
                  <td className="py-2 px-3 font-bold text-sky-300">{r.alice_bit}</td>
                  <td className="py-2 px-3 text-slate-300">
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-900 border border-slate-800">
                      {r.alice_basis === 'rectilinear' ? '+ (rect)' : '× (diag)'}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-slate-300 font-bold">{r.state}</td>
                  <td className="py-2 px-3 text-slate-300">
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-900 border border-slate-800">
                      {r.bob_basis === 'rectilinear' ? '+ (rect)' : '× (diag)'}
                    </span>
                  </td>
                  <td className="py-2 px-3 font-bold text-emerald-300">{r.bob_measured_bit}</td>
                  <td className="py-2 px-3 text-center">
                    {r.retained ? (
                      <span className="px-1.5 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded text-[10px] font-bold">
                        RETAINED
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 bg-slate-900 text-slate-500 rounded text-[10px]">
                        DISCARDED
                      </span>
                    )}
                  </td>
                  <td className="py-2 px-3 text-center">
                    {r.retained ? (
                      r.error ? (
                        <span className="px-1.5 py-0.5 bg-rose-950 text-rose-400 border border-rose-800 rounded text-[10px] font-bold">
                          ERROR
                        </span>
                      ) : (
                        <span className="text-emerald-400 font-bold">OK</span>
                      )
                    ) : (
                      <span className="text-slate-600">-</span>
                    )}
                  </td>
                  <td className="py-2 px-3 text-center">
                    {r.attack_affected ? (
                      <span className="px-1.5 py-0.5 bg-rose-950 text-rose-300 border border-rose-800 rounded text-[10px] font-bold">
                        {r.detector_event || 'INTERCEPTED'}
                      </span>
                    ) : (
                      <span className="text-slate-600 text-[10px]">NORMAL</span>
                    )}
                  </td>
                  <td className="py-2 px-3 text-right font-bold text-amber-400">
                    {r.eve_info_estimate ? r.eve_info_estimate.toFixed(2) : '0.00'}
                  </td>
                  <td className="py-2 px-3 text-right text-slate-400">
                    {r.timing_jitter_ps ? r.timing_jitter_ps.toFixed(1) : '15.0'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between pt-1 text-xs text-slate-400">
        <div>
          Showing {filteredRounds.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{' '}
          {Math.min(currentPage * pageSize, filteredRounds.length)} of {filteredRounds.length} rounds
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1 bg-slate-900 border border-slate-800 rounded text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1 bg-slate-900 border border-slate-800 rounded text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
