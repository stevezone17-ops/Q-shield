import React, { useState } from 'react';
import { SimulationResult } from '../types/simulation';
import { generateReportData, generateMarkdownReportText } from '../utils/reportGenerator';
import {
  FileText,
  Download,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  ShieldCheck,
  Award,
  Cpu,
  Lock,
  Activity,
  Layers,
  HelpCircle,
  AlertTriangle,
  History,
  Info,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SimulationExplanationReportProps {
  result: SimulationResult;
  history?: SimulationResult[];
  onSelectHistoryItem?: (res: SimulationResult) => void;
}

export const SimulationExplanationReport: React.FC<SimulationExplanationReportProps> = ({
  result,
  history = [],
  onSelectHistoryItem,
}) => {
  const [expanded, setExpanded] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [copyReportCopied, setCopyReportCopied] = useState<boolean>(false);

  const reportData = generateReportData(result);

  const handleDownloadMarkdown = () => {
    const mdText = generateMarkdownReportText(result);
    const blob = new Blob([mdText], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const timestampStr = new Date().toISOString().replace(/[:.]/g, '-');
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `QSHIELD_Simulation_Report_${timestampStr}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyExplanation = async () => {
    try {
      await navigator.clipboard.writeText(reportData.whatToSayText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Clipboard copy failed:', err);
    }
  };

  const handleCopyFullReport = async () => {
    try {
      const fullText = generateMarkdownReportText(result);
      await navigator.clipboard.writeText(fullText);
      setCopyReportCopied(true);
      setTimeout(() => setCopyReportCopied(false), 2000);
    } catch (err) {
      console.error('Full report copy failed:', err);
    }
  };

  const keyActionColorMap = {
    ALLOW_KEY: 'bg-emerald-950/90 text-emerald-300 border-emerald-700',
    WARN: 'bg-amber-950/90 text-amber-300 border-amber-700',
    REJECT_KEY: 'bg-rose-950/90 text-rose-300 border-rose-700 font-bold',
  };

  const levelBadgeMap = {
    SECURE: 'bg-emerald-950 text-emerald-300 border-emerald-800',
    GUARDED: 'bg-sky-950 text-sky-300 border-sky-800',
    SUSPICIOUS: 'bg-amber-950 text-amber-300 border-amber-800',
    COMPROMISED: 'bg-rose-950 text-rose-300 border-rose-800 font-bold',
  };

  return (
    <div className="bg-[#0b1324] border border-sky-900/60 rounded-xl overflow-hidden font-mono text-xs shadow-2xl space-y-0">
      {/* Top Banner Control Bar */}
      <div className="bg-slate-900/90 border-b border-slate-800 p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-sky-950/80 border border-sky-800 rounded-lg text-sky-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Q-SHIELD SIMULATION EXPLANATION REPORT
              </h2>
              <span className="px-2 py-0.5 text-[10px] bg-slate-950 text-sky-400 border border-slate-800 rounded font-bold">
                DYNAMIC ANALYZER
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Empirical breakdown based strictly on backend telemetry response
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleCopyExplanation}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded flex items-center gap-1.5 transition-colors font-bold text-[11px]"
            title="Copy presentation script to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-sky-400" />}
            <span>{copied ? 'COPIED EXPLANATION!' : 'COPY EXPLANATION'}</span>
          </button>

          <button
            onClick={handleDownloadMarkdown}
            className="px-3 py-1.5 bg-sky-950 hover:bg-sky-900 text-sky-200 border border-sky-700 rounded flex items-center gap-1.5 transition-colors font-bold text-[11px]"
            title="Download full report as Markdown file"
          >
            <Download className="w-3.5 h-3.5" />
            <span>DOWNLOAD REPORT (.MD)</span>
          </button>

          <button
            onClick={() => setExpanded(!expanded)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded flex items-center gap-1.5 transition-colors font-bold text-[11px]"
          >
            {expanded ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" />
                <span>HIDE REPORT</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" />
                <span>VIEW EXPLANATION REPORT</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Report Body */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="p-5 space-y-6 bg-[#080c14]"
          >
            {/* SECTION 1 — EXECUTIVE SUMMARY */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-2">
                  <Info className="w-4 h-4 text-sky-400" />
                  SECTION 1 — EXECUTIVE SUMMARY
                </h3>
                <span className={`px-2.5 py-0.5 rounded border text-[10px] ${keyActionColorMap[reportData.keyAction as keyof typeof keyActionColorMap]}`}>
                  {reportData.keyAction}
                </span>
              </div>

              <p className="text-[11px] text-slate-200 leading-relaxed bg-slate-950/70 p-3 rounded border border-slate-800/80">
                {reportData.execSummaryText}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-[11px]">
                <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">SECURITY LEVEL:</span>
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded border text-[10px] ${levelBadgeMap[reportData.securityLevel as keyof typeof levelBadgeMap]}`}>
                    {reportData.securityLevel}
                  </span>
                </div>

                <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">SECURITY SCORE:</span>
                  <span className="text-white font-bold text-sm mt-1 block">
                    {reportData.securityScoreStr}
                  </span>
                </div>

                <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">SECURITY DECISION:</span>
                  <span className="text-sky-300 font-bold text-[10px] mt-1 block truncate">
                    {reportData.decision}
                  </span>
                </div>

                <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">KEY POLICY ACTION:</span>
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded border text-[10px] ${keyActionColorMap[reportData.keyAction as keyof typeof keyActionColorMap]}`}>
                    {reportData.keyAction}
                  </span>
                </div>
              </div>
            </div>

            {/* SECTION 2 — SIMULATION CONFIGURATION */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-4 space-y-3">
              <h3 className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
                <Layers className="w-4 h-4 text-sky-400" />
                SECTION 2 — SIMULATION CONFIGURATION
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-[10px]">
                <div className="bg-slate-950 p-2 rounded border border-slate-800">
                  <span className="text-slate-500 block">QUBITS:</span>
                  <span className="text-white font-bold">{result.config.num_qubits}</span>
                </div>
                <div className="bg-slate-950 p-2 rounded border border-slate-800">
                  <span className="text-slate-500 block">NOISE:</span>
                  <span className="text-white font-bold">{(result.config.noise * 100).toFixed(1)}%</span>
                </div>
                <div className="bg-slate-950 p-2 rounded border border-slate-800">
                  <span className="text-slate-500 block">ATTACK:</span>
                  <span className="text-amber-400 font-bold uppercase">{result.config.attack}</span>
                </div>
                <div className="bg-slate-950 p-2 rounded border border-slate-800">
                  <span className="text-slate-500 block">INTENSITY:</span>
                  <span className="text-white font-bold">
                    {result.config.attack !== 'none' ? `${(result.config.attack_intensity * 100).toFixed(0)}%` : '0%'}
                  </span>
                </div>
                <div className="bg-slate-950 p-2 rounded border border-slate-800">
                  <span className="text-slate-500 block">STAGE 3 AI:</span>
                  <span className={result.config.enable_ai_detection ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                    {result.config.enable_ai_detection ? 'ENABLED' : 'DISABLED'}
                  </span>
                </div>
                <div className="bg-slate-950 p-2 rounded border border-slate-800">
                  <span className="text-slate-500 block">STAGE 4 PQC:</span>
                  <span className={result.config.enable_pqc_authentication ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                    {result.config.enable_pqc_authentication ? 'ENABLED' : 'DISABLED'}
                  </span>
                </div>
                <div className="bg-slate-950 p-2 rounded border border-slate-800">
                  <span className="text-slate-500 block">STAGE 5 HYBRID:</span>
                  <span className={result.config.enable_hybrid_security ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                    {result.config.enable_hybrid_security ? 'ENABLED' : 'DISABLED'}
                  </span>
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded border border-slate-800 text-[11px] text-slate-300">
                <span className="text-sky-400 font-bold">CONFIGURATION ANALYSIS: </span>
                {reportData.configExplanation}
              </div>
            </div>

            {/* SECTION 3 — BB84 RESULT */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-4 space-y-4">
              <h3 className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
                <Activity className="w-4 h-4 text-sky-400" />
                SECTION 3 — BB84 PROTOCOL METRICS & KEY YIELD
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 font-mono text-[11px]">
                <div className="bg-slate-950 p-3 rounded border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">TRANSMITTED QUBITS:</span>
                  <span className="text-white font-bold text-base">{result.statistics.transmitted}</span>
                </div>
                <div className="bg-slate-950 p-3 rounded border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">SIFTED KEY LENGTH:</span>
                  <span className="text-sky-300 font-bold text-base">{result.statistics.sifted_key_length} bits</span>
                </div>
                <div className="bg-slate-950 p-3 rounded border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">DERIVED SECRET KEY:</span>
                  <span className="text-emerald-400 font-bold text-base">{result.privacy_amplification.final_key_length} bits</span>
                </div>
                <div className="bg-slate-950 p-3 rounded border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">MEASURED QBER:</span>
                  <span className={`font-bold text-base ${result.statistics.qber_percent <= 11.0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {result.statistics.qber_percent.toFixed(2)}%
                  </span>
                </div>
                <div className="bg-slate-950 p-3 rounded border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">NET KEY YIELD:</span>
                  <span className="text-white font-bold text-base">
                    {((result.privacy_amplification.final_key_length / result.statistics.transmitted) * 100).toFixed(2)}%
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                <div className="bg-slate-950 p-3 rounded border border-slate-800 space-y-1">
                  <span className="text-sky-400 font-bold uppercase block">WHAT HAPPENED:</span>
                  <p className="text-slate-300 leading-relaxed">{reportData.bb84WhatHappened}</p>
                </div>
                <div className="bg-slate-950 p-3 rounded border border-slate-800 space-y-1">
                  <span className="text-amber-400 font-bold uppercase block">WHY IT MATTERS:</span>
                  <p className="text-slate-300 leading-relaxed">{reportData.bb84WhyItMatters}</p>
                </div>
              </div>
            </div>

            {/* SECTION 4 — ATTACK ANALYSIS */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-sky-400" />
                  SECTION 4 — {reportData.attackTitle}
                </h3>
                <span className="text-[10px] text-slate-500 font-bold">SOFTWARE BEHAVIORAL MODEL</span>
              </div>

              <div className="bg-slate-950 p-3.5 rounded border border-slate-800 space-y-2 text-[11px]">
                <p className="text-slate-200 leading-relaxed">{reportData.attackExplanation}</p>
                <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-500 italic">
                  Note: All attack models in Q-SHIELD represent software behavioral simulations for scientific evaluation and do not represent physical hardware execution.
                </div>
              </div>
            </div>

            {/* SECTION 5 — PHYSICAL TELEMETRY ANALYSIS */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-sky-400" />
                  SECTION 5 — PHYSICAL TELEMETRY ANALYSIS (8 MONITORED SIGNALS)
                </h3>
                <span className="text-[10px] text-slate-500 font-bold">SAMPLE SIZE: {result.telemetry.length} ROUNDS</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-[11px] border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/60">
                      <th className="py-2 px-3 font-bold">SIGNAL NAME</th>
                      <th className="py-2 px-3 font-bold">VALUE</th>
                      <th className="py-2 px-3 font-bold">UNIT</th>
                      <th className="py-2 px-3 font-bold">STATUS</th>
                      <th className="py-2 px-3 font-bold">EXPLANATION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.telemetrySignals.map((sig) => (
                      <tr key={sig.name} className="border-b border-slate-800/60 hover:bg-slate-950/40">
                        <td className="py-2 px-3 font-bold text-slate-200">{sig.name}</td>
                        <td className="py-2 px-3 font-bold text-white">{sig.valueStr}</td>
                        <td className="py-2 px-3 text-slate-400">{sig.unit}</td>
                        <td className="py-2 px-3">
                          <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${
                            sig.statusCategory === 'normal'
                              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                              : sig.statusCategory === 'warning'
                              ? 'bg-amber-950/80 text-amber-300 border-amber-800'
                              : 'bg-rose-950/80 text-rose-300 border-rose-800'
                          }`}>
                            {sig.status}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-slate-300 text-[10px]">{sig.explanation}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded text-[11px]">
                <span className="font-bold text-amber-400 block mb-1 uppercase">KEY TELEMETRY OBSERVATIONS:</span>
                <p className="text-slate-300">{reportData.abnormalTelemetryObs}</p>
              </div>
            </div>

            {/* SECTION 6 — AI ANOMALY DETECTION */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-4 space-y-3">
              <h3 className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
                <Cpu className="w-4 h-4 text-sky-400" />
                SECTION 6 — STAGE 3 AI ANOMALY DETECTION
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px] font-mono">
                <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">AI ENGINE STATUS:</span>
                  <span className="text-white font-bold">
                    {result.ai_detection?.enabled ? 'ENABLED' : 'DISABLED'}
                  </span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">CLASSIFICATION:</span>
                  <span className={`font-bold ${result.ai_detection?.status === 'NORMAL' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {result.ai_detection?.status || 'N/A'}
                  </span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">ANOMALY SCORE:</span>
                  <span className="text-white font-bold">
                    {result.ai_detection?.anomaly_score !== undefined ? `${(result.ai_detection.anomaly_score * 100).toFixed(1)}%` : 'N/A'}
                  </span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">STEALTH INDICATOR:</span>
                  <span className={`font-bold text-[10px] ${result.ai_detection?.stealth_attack_detected ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {result.ai_detection?.stealth_attack_detected ? 'STEALTH FLAG ACTIVE' : 'STANDARD'}
                  </span>
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded border border-slate-800 text-[11px] text-slate-300">
                <span className="text-sky-400 font-bold block mb-1 uppercase">AI MODEL EVALUATION:</span>
                <p className="leading-relaxed">{reportData.aiExplanation}</p>
              </div>
            </div>

            {/* SECTION 7 — PQC AUTHENTICATION */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-4 space-y-3">
              <h3 className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
                <Lock className="w-4 h-4 text-sky-400" />
                SECTION 7 — STAGE 4 POST-QUANTUM CLASSICAL AUTHENTICATION
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px] font-mono">
                <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">PQC ALGORITHM:</span>
                  <span className="text-white font-bold">ML-DSA-65 (FIPS 204)</span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">SIGNATURE VALIDITY:</span>
                  <span className={`font-bold ${result.pqc_authentication?.signature_valid ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {result.pqc_authentication?.signature_valid ? 'VALID' : 'INVALID'}
                  </span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">CLASSICAL MESSAGE:</span>
                  <span className="text-white font-bold">
                    {result.pqc_authentication?.message_accepted ? 'ACCEPTED' : 'REJECTED'}
                  </span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">AUTH LATENCY:</span>
                  <span className="text-white font-bold">
                    {result.pqc_authentication?.total_authentication_time_ms ? `${result.pqc_authentication.total_authentication_time_ms.toFixed(2)} ms` : 'N/A'}
                  </span>
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded border border-slate-800 text-[11px] text-slate-300 space-y-2">
                <div>
                  <span className="text-sky-400 font-bold block mb-1 uppercase">PQC VERIFICATION RESULT:</span>
                  <p className="leading-relaxed">{reportData.pqcExplanation}</p>
                </div>
                <div className="p-2 bg-sky-950/40 border border-sky-800 rounded text-sky-200 text-[10px] italic">
                  Important: ML-DSA-65 is being used here to authenticate the classical communication channel. It does not provide direct protection of the quantum state.
                </div>
              </div>
            </div>

            {/* SECTION 8 — HYBRID SECURITY DECISION */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-4 space-y-4">
              <h3 className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
                <Award className="w-4 h-4 text-sky-400" />
                SECTION 8 — STAGE 5 HYBRID SECURITY DECISION SYNTHESIS
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-[11px] font-mono">
                <div className="bg-slate-950 p-3 rounded border border-slate-800 space-y-1">
                  <div className="flex justify-between text-slate-400">
                    <span>QBER (25%)</span>
                    <span className="font-bold text-white">
                      {result.hybrid_security?.component_scores.qber_score.toFixed(0) || 'N/A'}/100
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-sky-500" style={{ width: `${result.hybrid_security?.component_scores.qber_score || 0}%` }} />
                  </div>
                </div>

                <div className="bg-slate-950 p-3 rounded border border-slate-800 space-y-1">
                  <div className="flex justify-between text-slate-400">
                    <span>AI ANOMALY (30%)</span>
                    <span className="font-bold text-white">
                      {result.hybrid_security?.component_scores.ai_anomaly_score.toFixed(0) || 'N/A'}/100
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-sky-500" style={{ width: `${result.hybrid_security?.component_scores.ai_anomaly_score || 0}%` }} />
                  </div>
                </div>

                <div className="bg-slate-950 p-3 rounded border border-slate-800 space-y-1">
                  <div className="flex justify-between text-slate-400">
                    <span>PQC AUTH (30%)</span>
                    <span className="font-bold text-white">
                      {result.hybrid_security?.component_scores.pqc_auth_score.toFixed(0) || 'N/A'}/100
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: `${result.hybrid_security?.component_scores.pqc_auth_score || 0}%` }} />
                  </div>
                </div>

                <div className="bg-slate-950 p-3 rounded border border-slate-800 space-y-1">
                  <div className="flex justify-between text-slate-400">
                    <span>TELEMETRY (15%)</span>
                    <span className="font-bold text-white">
                      {result.hybrid_security?.component_scores.telemetry_health_score.toFixed(0) || 'N/A'}/100
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500" style={{ width: `${result.hybrid_security?.component_scores.telemetry_health_score || 0}%` }} />
                  </div>
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded border border-slate-800 text-[11px] text-slate-300">
                <span className="text-sky-400 font-bold block mb-1 uppercase">WHY THIS DECISION OCCURRED:</span>
                <p className="leading-relaxed">{reportData.hybridWhyExplanation}</p>
              </div>
            </div>

            {/* SECTION 9 — WHY THE SYSTEM MADE THIS DECISION */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-4 space-y-3">
              <h3 className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
                <Layers className="w-4 h-4 text-sky-400" />
                SECTION 9 — WHY THE SYSTEM MADE THIS DECISION (STEP-BY-STEP RATIONALE)
              </h3>

              <div className="bg-slate-950 p-3.5 rounded border border-slate-800 space-y-2 text-[11px] font-mono">
                {reportData.decisionSteps.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-slate-200">
                    <span className="text-sky-400 font-bold shrink-0">{idx + 1}.</span>
                    <span>{step.substring(step.indexOf('.') + 1)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION 10 — KEY RESULT */}
            <div className={`p-4 rounded-lg border space-y-2 ${keyActionColorMap[reportData.keyAction as keyof typeof keyActionColorMap]}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                  {reportData.keyAction === 'ALLOW_KEY' ? <ShieldCheck className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                  SECTION 10 — KEY POLICY ACTION: {reportData.keyAction}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-950/60 border border-slate-800">
                  POLICY DECISION
                </span>
              </div>
              <p className="text-[11px] leading-relaxed">{reportData.keyResultExplanation}</p>
            </div>

            {/* SECTION 11 — HOW TO EXPLAIN THIS RESULT */}
            <div className="bg-gradient-to-r from-sky-950/80 via-slate-900 to-indigo-950/80 border border-sky-800/80 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-sky-800/60 pb-2">
                <h3 className="text-xs font-bold text-sky-300 uppercase tracking-wider flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-sky-400" />
                  SECTION 11 — HOW TO EXPLAIN THIS RESULT ("WHAT TO SAY" PRESENTATION SCRIPT)
                </h3>
                <button
                  onClick={handleCopyExplanation}
                  className="px-2.5 py-1 bg-sky-900 hover:bg-sky-800 text-sky-100 rounded border border-sky-700 font-bold text-[10px] flex items-center gap-1 transition-colors"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'COPIED!' : 'COPY SCRIPT'}</span>
                </button>
              </div>

              <div className="bg-slate-950/90 p-4 rounded border border-sky-900/60 text-[11px] text-sky-100 font-mono italic leading-relaxed">
                {reportData.whatToSayText}
              </div>
            </div>

            {/* SECTION 12 — TECHNICAL INTERPRETATION */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-4 space-y-3">
              <h3 className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
                <Info className="w-4 h-4 text-sky-400" />
                SECTION 12 — TECHNICAL INTERPRETATION (ADVANCED REFERENCE)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                {reportData.technicalInterpretation.map((t, idx) => (
                  <div key={idx} className="bg-slate-950 p-3 rounded border border-slate-800 space-y-1">
                    <span className="text-sky-300 font-bold block">{t.title}</span>
                    <p className="text-slate-400 text-[10px] leading-relaxed">{t.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION 13 — LIMITATIONS & SCIENTIFIC CAVEATS */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-4 space-y-3">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                SECTION 13 — SCIENTIFIC LIMITATIONS & CAVEATS
              </h3>

              <ul className="space-y-1.5 text-[10px] text-slate-400 font-mono list-disc list-inside bg-slate-950 p-3 rounded border border-slate-800">
                {reportData.limitations.map((lim, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {lim}
                  </li>
                ))}
              </ul>
            </div>

            {/* PART 6 — SIMULATION HISTORY */}
            {history.length > 0 && (
              <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h3 className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-2">
                    <History className="w-4 h-4 text-sky-400" />
                    SIMULATION SESSION HISTORY ({history.length} RUNS)
                  </h3>
                  <span className="text-[10px] text-slate-500">CLICK TO REVIEW REPORT</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {history.map((item, idx) => {
                    const itemKeyAction = item.hybrid_security?.key_action || (item.statistics.qber_percent <= 11.0 ? 'ALLOW_KEY' : 'REJECT_KEY');
                    const itemLevel = item.hybrid_security?.security_level || (item.statistics.qber_percent <= 11.0 ? 'SECURE' : 'COMPROMISED');
                    const isSelected = item === result;

                    return (
                      <button
                        key={idx}
                        onClick={() => onSelectHistoryItem && onSelectHistoryItem(item)}
                        className={`text-left p-3 rounded border font-mono text-[11px] transition-all flex flex-col justify-between space-y-2 ${
                          isSelected
                            ? 'bg-sky-950/80 border-sky-500 shadow-md ring-1 ring-sky-500/50'
                            : 'bg-slate-950 hover:bg-slate-900 border-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-300">
                            RUN #{history.length - idx} — {item.config.attack.toUpperCase()}
                          </span>
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${levelBadgeMap[itemLevel as keyof typeof levelBadgeMap]}`}>
                            {itemLevel}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-800/80 pt-1.5">
                          <span>QBER: {item.statistics.qber_percent.toFixed(1)}%</span>
                          <span>SCORE: {item.hybrid_security ? item.hybrid_security.security_score.toFixed(0) : 'N/A'}</span>
                          <span className={`font-bold ${itemKeyAction === 'ALLOW_KEY' ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {itemKeyAction}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
