import React, { useState, useEffect } from 'react';
import { SimulationConfig, SimulationResult } from './types/simulation';
import { checkHealth, runSimulation } from './services/api';
import { Header } from './components/Header';
import { EmptyState } from './components/EmptyState';
import { SecurityHero } from './components/SecurityHero';
import { SimulationControls } from './components/SimulationControls';
import { QuantumChannelVisualization } from './components/QuantumChannelVisualization';
import { ProtocolFlowVisualization } from './components/ProtocolFlowVisualization';
import { StatisticsSummary } from './components/StatisticsSummary';
import { TelemetryOverview } from './components/TelemetryOverview';
import { AttackInfoPanel } from './components/AttackInfoPanel';
import { AISecurityPanel } from './components/AISecurityPanel';
import { PQCAuthenticationPanel } from './components/PQCAuthenticationPanel';
import { HybridSecurityPanel } from './components/HybridSecurityPanel';
import { SecurityEventTimeline } from './components/SecurityEventTimeline';
import { TelemetryAnomalyChart } from './components/TelemetryAnomalyChart';
import { AttackComparisonView } from './components/AttackComparisonView';
import { KeyDisplay } from './components/KeyDisplay';
import { QberChart } from './components/QberChart';
import { RoundInspectorTable } from './components/RoundInspectorTable';
import { ExperimentCenter } from './components/ExperimentCenter';
import { PresentationMode } from './components/PresentationMode';
import { SimulationExplanationReport } from './components/SimulationExplanationReport';
import { Footer } from './components/Footer';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [config, setConfig] = useState<SimulationConfig>({
    num_qubits: 500,
    noise: 0.02,
    seed: 42,
    attack: 'none',
    attack_intensity: 0.0,
    enable_ai_detection: true,
    enable_pqc_authentication: true,
    enable_hybrid_security: true,
  });

  const [result, setResult] = useState<SimulationResult | null>(null);
  const [selectedReportResult, setSelectedReportResult] = useState<SimulationResult | null>(null);
  const [simulationHistory, setSimulationHistory] = useState<SimulationResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        await checkHealth();
        setApiOnline(true);
        handleRunSimulation();
      } catch (err) {
        console.warn('Backend API connection check failed:', err);
        setApiOnline(false);
        setError('Backend API is offline. Ensure FastAPI server is running on http://127.0.0.1:8001.');
      }
    };
    init();
  }, []);

  const handleRunSimulation = async (customConfig?: Partial<SimulationConfig>) => {
    const runCfg = customConfig ? { ...config, ...customConfig } : config;
    if (customConfig) {
      setConfig(runCfg);
    }

    setLoading(true);
    setError(null);
    try {
      const res = await runSimulation(runCfg);
      setResult(res);
      setSelectedReportResult(res);
      setSimulationHistory((prev) => [res, ...prev]);
      setApiOnline(true);
    } catch (err: any) {
      console.error('Simulation execution error:', err);
      setError(err.message || 'An error occurred while executing the simulation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col font-mono selection:bg-sky-600 selection:text-white">
      {/* Top Command Bar & Navigation */}
      <Header
        apiOnline={apiOnline}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        sessionId="QS-8F42"
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-5">
        {/* Error Notification Banner */}
        {error && (
          <div className="bg-rose-950/90 border border-rose-800 text-rose-200 rounded-xl p-3.5 flex items-center justify-between gap-4 font-mono text-xs">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => handleRunSimulation()}
              className="px-3 py-1 bg-rose-900 hover:bg-rose-800 text-xs font-bold rounded border border-rose-700 flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              RETRY
            </button>
          </div>
        )}

        {/* Presentation Mode */}
        {activeTab === 'presentation' ? (
          <PresentationMode />
        ) : activeTab === 'experiment' ? (
          /* Experiment Workstation Mode */
          <ExperimentCenter />
        ) : (
          /* Single Simulation SOC Dashboard Mode */
          <>
            {/* Simulation Parameter & Threat Controls */}
            <SimulationControls
              config={config}
              onChange={setConfig}
              onRun={() => handleRunSimulation()}
              loading={loading}
            />

            {/* Engineering Pipeline Flow Visualization */}
            <ProtocolFlowVisualization
              hasResult={result !== null}
              attackType={config.attack}
              attackEnabled={config.attack !== 'none' && config.attack_intensity > 0}
              pqcResult={result?.pqc_authentication}
              hybridResult={result?.hybrid_security}
            />

            {/* Empty State when no simulation output */}
            {!result && !loading && (
              <EmptyState onRunPreset={(preset) => handleRunSimulation(preset)} />
            )}

            {/* Live Simulation SOC Dashboard Tabs */}
            {result && (
              <div className="space-y-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="space-y-5"
                  >
                    {/* 1. OVERVIEW TAB */}
                    {activeTab === 'overview' && (
                      <>
                        <SecurityHero hybrid={result.hybrid_security} statistics={result.statistics} />
                        <StatisticsSummary result={result} />
                        <TelemetryOverview result={result} />
                        <QuantumChannelVisualization
                          attackType={config.attack}
                          attackIntensity={config.attack_intensity}
                          noise={config.noise}
                          pqcResult={result.pqc_authentication}
                          mitm={result.mitm}
                        />
                        <HybridSecurityPanel hybrid={result.hybrid_security} statistics={result.statistics} />
                        <SecurityEventTimeline result={result} />
                      </>
                    )}

                    {/* 2. QUANTUM & ATTACKS TAB */}
                    {activeTab === 'quantum' && (
                      <>
                        <TelemetryOverview result={result} />
                        <QuantumChannelVisualization
                          attackType={config.attack}
                          attackIntensity={config.attack_intensity}
                          noise={config.noise}
                          pqcResult={result.pqc_authentication}
                          mitm={result.mitm}
                        />
                        <AttackInfoPanel
                          attack={result.attack}
                          mitm={result.mitm}
                          statistics={result.statistics}
                        />
                        <AttackComparisonView result={result} />
                        <TelemetryAnomalyChart telemetry={result.telemetry} />
                        <KeyDisplay result={result} />
                        <QberChart result={result} />
                      </>
                    )}

                    {/* 3. AI SECURITY TAB */}
                    {activeTab === 'ai' && (
                      <>
                        <AISecurityPanel ai={result.ai_detection} />
                        <TelemetryAnomalyChart telemetry={result.telemetry} />
                      </>
                    )}

                    {/* 4. PQC AUTH TAB */}
                    {activeTab === 'pqc' && (
                      <>
                        <PQCAuthenticationPanel pqc={result.pqc_authentication} mitm={result.mitm} />
                        <QuantumChannelVisualization
                          attackType={config.attack}
                          attackIntensity={config.attack_intensity}
                          noise={config.noise}
                          pqcResult={result.pqc_authentication}
                          mitm={result.mitm}
                        />
                      </>
                    )}

                    {/* 5. HYBRID ENGINE TAB */}
                    {activeTab === 'hybrid' && (
                      <>
                        <SecurityHero hybrid={result.hybrid_security} statistics={result.statistics} />
                        <HybridSecurityPanel hybrid={result.hybrid_security} statistics={result.statistics} />
                        <SecurityEventTimeline result={result} />
                      </>
                    )}

                    {/* 6. ROUND INSPECTOR TAB */}
                    {activeTab === 'inspector' && (
                      <RoundInspectorTable rounds={result.rounds} />
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* AUTOMATIC SIMULATION EXPLANATION REPORT */}
                {(selectedReportResult || result) && (
                  <SimulationExplanationReport
                    result={selectedReportResult || result!}
                    history={simulationHistory}
                    onSelectHistoryItem={(item) => setSelectedReportResult(item)}
                  />
                )}
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default App;
