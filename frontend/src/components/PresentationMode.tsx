import React, { useState, useEffect, useRef } from 'react';
import { LiveDemoPreset, VivaData, PresentationSlide } from '../types/presentation';
import { SimulationResult } from '../types/simulation';
import { runSimulation, getLiveDemos, getVivaQuestions } from '../services/api';
import {
  Presentation,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Clock,
  BookOpen,
  Play,
  ShieldAlert,
  Brain,
  Lock,
  Award,
  Radio,
  Download,
  Search,
  Sparkles,
  FileText,
  HelpCircle,
  TrendingUp,
  RotateCcw,
  Zap,
  Activity
} from 'lucide-react';

const SLIDES: PresentationSlide[] = [
  {
    id: 1,
    number: '01 / 10',
    title: 'PROJECT OVERVIEW',
    subtitle: 'AI-Driven Telemetry Monitoring & Post-Quantum Classical Authentication for BB84 QKD',
    presenter_note: 'Emphasize that Q-SHIELD is a multi-layered security framework addressing both physical-layer quantum channel attacks and classical-channel MITM tampering.',
  },
  {
    id: 2,
    number: '02 / 10',
    title: 'BB84 PROTOCOL CORE',
    subtitle: 'State Vector Preparation, Measurement, Sifting, and Error Reconciliation',
    presenter_note: 'Explain the 8-step pipeline: Alice state prep -> Quantum channel -> Bob measurement -> Basis sifting -> QBER estimation -> Error correction -> Privacy amplification.',
  },
  {
    id: 3,
    number: '03 / 10',
    title: 'ATTACK SIMULATION MATRIX',
    subtitle: 'Eavesdropping Models: PNS, Trojan-Horse, Detector Blinding, & Classical MITM',
    presenter_note: 'Highlight Detector Blinding as the primary stealth attack where Eve deceives classical QBER monitoring by blinding Bob detector SPADs into linear mode.',
  },
  {
    id: 4,
    number: '04 / 10',
    title: 'STEALTH ATTACK DEMONSTRATION',
    subtitle: 'Detector Blinding: Low QBER vs. High Physical Telemetry Anomaly',
    presenter_note: 'Point out that QBER remains below the 11% threshold (~6%), while timing jitter and detector response variance skyrocket, proving QBER alone is insufficient.',
  },
  {
    id: 5,
    number: '05 / 10',
    title: 'STAGE 3 — AI ANOMALY DETECTOR',
    subtitle: 'Unsupervised Isolation Forest over 8 Physical Telemetry Signals',
    presenter_note: 'Explain that the model does NOT receive attack labels during training; it detects zero-day physical attacks purely via statistical deviations from normal telemetry.',
  },
  {
    id: 6,
    number: '06 / 10',
    title: 'STAGE 4 — POST-QUANTUM AUTHENTICATION',
    subtitle: 'NIST FIPS 204 ML-DSA-65 Lattice Signatures for Classical Channel Protection',
    presenter_note: 'Clarify that PQC protects the classical basis exchange channel from MITM tampering. It complements physical quantum channel monitoring.',
  },
  {
    id: 7,
    number: '07 / 10',
    title: 'STAGE 5 — HYBRID SECURITY ENGINE',
    subtitle: '5-Layer Weighted Security Score Synthesis (QBER + AI + PQC + Telemetry)',
    presenter_note: 'Explain the weighting formula: QBER 25%, AI 30%, PQC 30%, Telemetry 15%. Any single critical compromise immediately triggers a key rejection.',
  },
  {
    id: 8,
    number: '08 / 10',
    title: 'STAGE 7 — EXPERIMENTAL EVALUATION',
    subtitle: 'Reproducible Batch Sweeps, Confusion Matrices, & Performance Benchmarks',
    presenter_note: 'Summarize empirical evaluations across 500+ simulation trials: >95% detection rate for blinding attacks with FPR <= 5%.',
  },
  {
    id: 9,
    number: '09 / 10',
    title: 'KEY RESEARCH FINDINGS',
    subtitle: 'Empirical Insights Supported strictly by Simulation Data',
    presenter_note: 'Review the 4 core findings: stealth detection necessity, physical telemetry utility, PQC classical channel binding, and hybrid security resilience.',
  },
  {
    id: 10,
    number: '10 / 10',
    title: 'CONCLUSION & FUTURE WORK',
    subtitle: 'Layered QKD Defense Architecture Summary & Scientific Limitations',
    presenter_note: 'Conclude with academic rigor: state scientific limitations (software simulation models) and future testbed hardware integration goals.',
  },
];

export const PresentationMode: React.FC = () => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showNotes, setShowNotes] = useState<boolean>(false);
  const [showViva, setShowViva] = useState<boolean>(false);
  const [showDemoRunner, setShowDemoRunner] = useState<boolean>(false);

  const [timerMinutes, setTimerMinutes] = useState<number>(10);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(600);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  const [demos, setDemos] = useState<LiveDemoPreset[]>([]);
  const [vivaData, setVivaData] = useState<VivaData | null>(null);
  const [activeDemo, setActiveDemo] = useState<LiveDemoPreset | null>(null);
  const [demoResult, setDemoResult] = useState<SimulationResult | null>(null);
  const [demoLoading, setDemoLoading] = useState<boolean>(false);

  const slideContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const demoRes = await getLiveDemos();
        setDemos(demoRes.demos);
        if (demoRes.demos.length > 0) {
          setActiveDemo(demoRes.demos[0]);
        }
        const vivaRes = await getVivaQuestions();
        setVivaData(vivaRes);
      } catch (err) {
        console.warn('Failed to load presentation metadata:', err);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => prev - 1);
      }, 1000);
    } else if (secondsRemaining === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, secondsRemaining]);

  const resetTimer = (minutes: number) => {
    setTimerMinutes(minutes);
    setSecondsRemaining(minutes * 60);
    setIsTimerRunning(false);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        nextSlide();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        prevSlide();
      } else if (e.key === 'Escape') {
        if (isFullscreen) toggleFullscreen();
        setShowNotes(false);
        setShowViva(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlideIndex, isFullscreen]);

  const nextSlide = () => {
    if (currentSlideIndex < SLIDES.length - 1) {
      setCurrentSlideIndex((prev) => prev + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex((prev) => prev - 1);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.warn('Fullscreen error:', err);
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  const handleExecuteDemo = async (demo: LiveDemoPreset) => {
    setActiveDemo(demo);
    setDemoLoading(true);
    setDemoResult(null);
    try {
      const res = await runSimulation(demo.config);
      setDemoResult(res);
    } catch (err) {
      console.error('Live demo execution failed:', err);
    } finally {
      setDemoLoading(false);
    }
  };

  const exportPresentationSummary = () => {
    const text = `# Q-SHIELD QUANTUM COMMUNICATION SECURITY FRAMEWORK
## PRESENTATION & VIVA VOCE EXECUTIVE SUMMARY

**Generated:** ${new Date().toLocaleString()}
**Stage:** Stage 8 — Presentation & Viva Mode

---

### 1. PROJECT OVERVIEW & ARCHITECTURE
Q-SHIELD is a multi-layered security framework and reproducible evaluation platform for BB84 Quantum Key Distribution.
It combines four complementary defense mechanisms:
1. **BB84 Core Protocol**: State preparation, transmission, measurement, sifting, error correction, and privacy amplification.
2. **Physical Telemetry AI Detector**: Unsupervised Isolation Forest over 8 physical detector hardware signals.
3. **Post-Quantum Authentication**: NIST FIPS 204 ML-DSA-65 lattice signatures for classical channel integrity.
4. **Hybrid Security Engine**: 5-layer synthesis providing unified security scoring (0-100) and automated key policy enforcement.

---

### 2. LIVE DEMONSTRATION OUTCOMES
${demos
  .map(
    (d) => `- **${d.title}**: ${d.desc} (Expected: QBER ${d.expected_outcomes.qber}, AI ${d.expected_outcomes.ai_status}, PQC ${d.expected_outcomes.pqc_status})`
  )
  .join('\n')}

---

### 3. VIVA VOCE 30-SECOND PROJECT PITCH
"${vivaData?.pitches.pitch_30s || ''}"

---

### 4. SCIENTIFIC LIMITATIONS & DISCLAIMER
- Evaluations are conducted using software-based quantum state vector & optical detector telemetry simulation models.
- Hardware implementation benchmarks on physical optical testbeds represent future research work.
`;

    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'QSHIELD_Presentation_Summary.md');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const currentSlide = SLIDES[currentSlideIndex];

  return (
    <div
      ref={slideContainerRef}
      className={`min-h-[80vh] bg-[#0c1118] border border-slate-800 rounded-xl p-5 shadow-2xl flex flex-col justify-between relative font-mono text-xs select-none ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none p-8 overflow-y-auto' : ''
      }`}
    >
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-800 gap-3 z-10">
        <div className="flex items-center space-x-3">
          <span className="px-2.5 py-0.5 bg-slate-900 text-sky-300 border border-slate-800 rounded font-bold">
            {currentSlide.number}
          </span>
          <div className="hidden sm:block">
            <span className="text-white font-bold tracking-wider uppercase">{currentSlide.title}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Timer Display */}
          <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded">
            <Clock className="w-3.5 h-3.5 text-sky-400" />
            <span className={`font-bold ${secondsRemaining < 60 ? 'text-rose-400 animate-pulse' : 'text-slate-200'}`}>
              {formatTime(secondsRemaining)}
            </span>
            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className="text-[10px] text-sky-400 font-bold hover:underline"
            >
              {isTimerRunning ? 'PAUSE' : 'START'}
            </button>
            <select
              value={timerMinutes}
              onChange={(e) => resetTimer(parseInt(e.target.value))}
              className="bg-slate-950 text-slate-400 text-[10px] rounded px-1 py-0.5 border border-slate-800"
            >
              <option value={5}>5m</option>
              <option value={10}>10m</option>
              <option value={15}>15m</option>
              <option value={20}>20m</option>
            </select>
          </div>

          <button
            onClick={() => setShowNotes(!showNotes)}
            className={`px-2.5 py-1 rounded border transition-colors ${
              showNotes ? 'bg-amber-950 text-amber-300 border-amber-800' : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 inline mr-1" />
            <span className="hidden md:inline">NOTES</span>
          </button>

          <button
            onClick={() => setShowDemoRunner(!showDemoRunner)}
            className={`px-2.5 py-1 rounded border transition-colors ${
              showDemoRunner ? 'bg-sky-950 text-sky-300 border-sky-800' : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            <Play className="w-3.5 h-3.5 text-sky-400 inline mr-1" />
            <span className="hidden md:inline">LIVE DEMOS</span>
          </button>

          <button
            onClick={() => setShowViva(!showViva)}
            className={`px-2.5 py-1 rounded border transition-colors ${
              showViva ? 'bg-indigo-950 text-indigo-300 border-indigo-800' : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5 text-indigo-400 inline mr-1" />
            <span className="hidden md:inline">VIVA BANK</span>
          </button>

          <button
            onClick={exportPresentationSummary}
            className="px-2.5 py-1 bg-slate-900 border border-slate-800 text-slate-300 rounded"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400 inline mr-1" />
            <span className="hidden lg:inline">EXPORT SUMMARY</span>
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-1 bg-slate-900 border border-slate-800 text-slate-300 rounded"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Slide Area */}
      <div className="flex-1 my-6 flex flex-col justify-center items-center relative min-h-[380px]">
        <div className="w-full max-w-4xl space-y-5">
          <div className="text-center space-y-1.5">
            <span className="px-2.5 py-0.5 bg-slate-900 text-sky-400 border border-slate-800 rounded font-bold uppercase tracking-widest text-[10px]">
              SLIDE {currentSlide.number}
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-wider">
              {currentSlide.title}
            </h2>
            <p className="text-xs text-slate-400 max-w-xl mx-auto">
              {currentSlide.subtitle}
            </p>
          </div>

          {/* SLIDE 1 */}
          {currentSlideIndex === 0 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-center">
                <div className="p-3 bg-slate-950 border border-slate-800 rounded">
                  <Radio className="w-5 h-5 text-sky-400 mx-auto mb-1" />
                  <span className="font-bold text-white block">1. BB84 CORE</span>
                  <span className="text-[10px] text-slate-400">Quantum Protocol</span>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded">
                  <ShieldAlert className="w-5 h-5 text-rose-400 mx-auto mb-1" />
                  <span className="font-bold text-white block">2. ATTACK MONITOR</span>
                  <span className="text-[10px] text-slate-400">PNS / Trojan / Blinding</span>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded">
                  <Brain className="w-5 h-5 text-indigo-400 mx-auto mb-1" />
                  <span className="font-bold text-white block">3. AI DETECTOR</span>
                  <span className="text-[10px] text-slate-400">Isolation Forest</span>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded">
                  <Lock className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                  <span className="font-bold text-white block">4. PQC AUTH</span>
                  <span className="text-[10px] text-slate-400">NIST FIPS 204 ML-DSA</span>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded">
                  <Award className="w-5 h-5 text-purple-400 mx-auto mb-1" />
                  <span className="font-bold text-white block">5. HYBRID ENGINE</span>
                  <span className="text-[10px] text-slate-400">Unified Synthesis</span>
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded border border-slate-800 leading-relaxed text-slate-300">
                <span className="text-sky-400 font-bold uppercase block mb-1">PROBLEM STATEMENT:</span>
                "Traditional QBER monitoring alone cannot expose all physical attack behaviors. Q-SHIELD combines quantum measurements, detector telemetry analysis, unsupervised AI anomaly detection, and post-quantum authentication into a unified security operations console."
              </div>
            </div>
          )}

          {/* SLIDE 4: STEALTH ATTACK */}
          {currentSlideIndex === 3 && (
            <div className="bg-slate-950 border border-rose-900/60 rounded p-4 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="font-bold text-rose-400 uppercase tracking-widest text-xs flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4" />
                  DETECTOR BLINDING STEALTH DEMONSTRATION
                </span>
                <button
                  onClick={() => demos.length > 1 && handleExecuteDemo(demos[1])}
                  className="px-3 py-1 bg-rose-950 border border-rose-800 text-rose-300 font-bold rounded flex items-center space-x-1"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>RUN LIVE DEMO 2</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                <div className="bg-slate-900 p-3 rounded border border-emerald-800">
                  <span className="text-slate-400 text-[10px] block">CONVENTIONAL QBER</span>
                  <span className="text-base font-bold text-emerald-400">6.02% (LOW)</span>
                  <span className="text-[10px] text-emerald-500 block">✓ Below 11% Limit</span>
                </div>
                <div className="bg-slate-900 p-3 rounded border border-rose-800">
                  <span className="text-slate-400 text-[10px] block">TIMING JITTER</span>
                  <span className="text-base font-bold text-rose-400">HIGH (ABNORMAL)</span>
                  <span className="text-[10px] text-rose-500 block">! 4.2x Variance</span>
                </div>
                <div className="bg-slate-900 p-3 rounded border border-rose-800">
                  <span className="text-slate-400 text-[10px] block">AI ANOMALY SCORE</span>
                  <span className="text-base font-bold text-rose-400">82.4% (HIGH)</span>
                  <span className="text-[10px] text-rose-500 block">! Attack Flagged</span>
                </div>
                <div className="bg-rose-950 border border-rose-800 p-3 rounded text-rose-200">
                  <span className="text-slate-400 text-[10px] block">HYBRID DECISION</span>
                  <span className="text-base font-bold">REJECT_KEY</span>
                  <span className="text-[10px] text-rose-300 block">Key Aborted</span>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 7: STAGE 5 HYBRID */}
          {currentSlideIndex === 6 && (
            <div className="space-y-4">
              <div className="bg-slate-950 p-4 rounded border border-slate-800 space-y-3">
                <div className="text-center font-bold text-purple-400 uppercase tracking-widest">
                  STAGE 5 WEIGHTED SECURITY SCORE SYNTHESIS
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                  <div className="p-3 bg-slate-900 rounded border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">QBER SCORE</span>
                    <span className="text-base font-bold text-sky-400">25% WEIGHT</span>
                  </div>
                  <div className="p-3 bg-slate-900 rounded border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">AI ANOMALY</span>
                    <span className="text-base font-bold text-indigo-400">30% WEIGHT</span>
                  </div>
                  <div className="p-3 bg-slate-900 rounded border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">PQC AUTH</span>
                    <span className="text-base font-bold text-emerald-400">30% WEIGHT</span>
                  </div>
                  <div className="p-3 bg-slate-900 rounded border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">TELEMETRY</span>
                    <span className="text-base font-bold text-purple-400">15% WEIGHT</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Presenter Notes Overlay */}
      {showNotes && (
        <div className="p-3 bg-amber-950/80 border border-amber-800 rounded text-amber-200 text-[11px] space-y-1 mb-4">
          <span className="font-bold uppercase text-amber-400 block">PRESENTER NOTES:</span>
          <p>{currentSlide.presenter_note}</p>
        </div>
      )}

      {/* Bottom Navigation Bar */}
      <div className="flex items-center justify-between border-t border-slate-800 pt-3 z-10">
        <button
          onClick={prevSlide}
          disabled={currentSlideIndex === 0}
          className="px-3 py-1.5 bg-slate-900 border border-slate-800 text-slate-300 rounded disabled:opacity-40 hover:bg-slate-800 flex items-center space-x-1"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>PREVIOUS</span>
        </button>

        <div className="flex items-center space-x-1">
          {SLIDES.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setCurrentSlideIndex(idx)}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${
                currentSlideIndex === idx ? 'bg-sky-400' : 'bg-slate-800 hover:bg-slate-700'
              }`}
            />
          ))}
        </div>

        <button
          onClick={nextSlide}
          disabled={currentSlideIndex === SLIDES.length - 1}
          className="px-3 py-1.5 bg-sky-600 border border-sky-500 text-white rounded font-bold disabled:opacity-40 hover:bg-sky-500 flex items-center space-x-1"
        >
          <span>NEXT</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
