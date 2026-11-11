import React, { useEffect, useRef, useState } from 'react';
import { VolXrAdapter } from '@vickora/vol-xr';
import { getPractice, UniversityLabPractice, LabMode } from '@vickora/vol-learning';
import { listMaterials, getMaterial, getRefractiveIndex } from '@vickora/vol-data';
import {
  calculateFresnel,
  calculateThinLens,
  calculateDoubleSlit,
} from '@vickora/optics-engine';
import { ExperimentRecord } from '@vickora/shared';
import { ScientificChart } from './ScientificChart.js';
import { ReportModal } from './ReportModal.js';
import { Language, TRANSLATIONS } from '../i18n.js';
import {
  Glasses,
  CheckCircle,
  Compass,
  Sliders,
  FileSpreadsheet,
  RotateCcw,
  BookOpen,
  Trophy,
  ArrowLeft,
  Atom,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Globe,
} from 'lucide-react';

interface LaboratoryViewProps {
  onBackToLanding: () => void;
  onRequestDemo: () => void;
  lang?: Language;
  onToggleLang?: () => void;
}

export const LaboratoryView: React.FC<LaboratoryViewProps> = ({
  onBackToLanding,
  lang = 'es',
  onToggleLang,
}) => {
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const adapterRef = useRef<VolXrAdapter | null>(null);

  const t = TRANSLATIONS[lang];

  // Collapsible panels state (allows user to hide/show panels to never saturate window)
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState<boolean>(true);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState<boolean>(true);

  const [activeStationId, setActiveStationId] = useState<string>('geometric');
  const [labMode, setLabMode] = useState<LabMode>('guided');
  const [activePractice, setActivePractice] = useState<UniversityLabPractice>(getPractice('exp-snell'));

  // Experiment parameters
  const [params, setParams] = useState<Record<string, any>>({
    incidentAngleDeg: 30,
    wavelengthNm: 632.8,
    materialId: 'nbk7',
    focalLengthMm: 100,
    objectDistanceMm: 250,
    objectHeightMm: 20,
    slitSeparationMm: 0.25,
    slitWidthMm: 0.04,
    screenDistanceM: 1.2,
  });

  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});
  const [challengeCompleted, setChallengeCompleted] = useState<boolean>(false);
  const [recordedMeasurements, setRecordedMeasurements] = useState<ExperimentRecord['measurements']>([]);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [isVRSupported, setIsVRSupported] = useState<boolean>(false);

  // Initialize 3D simulation once on mount
  useEffect(() => {
    if (!canvasContainerRef.current) return;

    const adapter = new VolXrAdapter(canvasContainerRef.current);
    adapter.start();
    adapterRef.current = adapter;

    // Check VR capability for WebXR / Meta Quest 3S
    adapter.app.session.checkVRSupport().then((supported) => {
      setIsVRSupported(supported);
    });

    return () => {
      adapter.dispose();
      adapterRef.current = null;
    };
  }, []);

  // Update 3D scene when station or params change
  useEffect(() => {
    if (!adapterRef.current) return;
    adapterRef.current.navigateToStation(activeStationId);
    adapterRef.current.setExperimentState(params);

    if (activeStationId === 'geometric') {
      setActivePractice(getPractice('exp-snell'));
    } else if (activeStationId === 'lenses') {
      setActivePractice(getPractice('exp-lenses'));
    } else if (activeStationId === 'wave') {
      setActivePractice(getPractice('exp-doubleslit'));
    } else if (activeStationId === 'polarization') {
      setActivePractice(getPractice('exp-polarization'));
    } else if (activeStationId === 'laser') {
      setActivePractice(getPractice('exp-michelson'));
    } else if (activeStationId === 'photonics') {
      setActivePractice(getPractice('exp-fiber'));
    }
  }, [activeStationId]);

  // Sync params to 3D ray tracing engine
  useEffect(() => {
    if (!adapterRef.current) return;
    adapterRef.current.setExperimentState(params);

    // Check challenge completion if active
    if (labMode === 'challenge' && activePractice.challenges.length > 0) {
      const chal = activePractice.challenges[0];
      let currentVal = 0;
      if (activeStationId === 'geometric') {
        const mat = getMaterial(params.materialId ?? 'nbk7');
        const n2 = getRefractiveIndex(mat, params.wavelengthNm ?? 632.8);
        const thetaRad = ((params.incidentAngleDeg ?? 30) * Math.PI) / 180.0;
        const fresnel = calculateFresnel(thetaRad, 1.0, n2);
        currentVal = fresnel.Rp;
      } else if (activeStationId === 'lenses') {
        const res = calculateThinLens(
          (params.focalLengthMm ?? 100) / 1000.0,
          (params.objectDistanceMm ?? 250) / 1000.0,
          (params.objectHeightMm ?? 20) / 1000.0
        );
        currentVal = res.magnification;
      } else if (activeStationId === 'wave') {
        const res = calculateDoubleSlit({
          wavelengthNm: params.wavelengthNm ?? 532,
          slitSeparationM: (params.slitSeparationMm ?? 0.25) / 1000.0,
          slitWidthM: (params.slitWidthMm ?? 0.04) / 1000.0,
          screenDistanceM: params.screenDistanceM ?? 1.2,
        });
        currentVal = res.fringeSpacingM * 1000.0;
      }

      if (Math.abs(currentVal - chal.targetValue) <= chal.tolerance) {
        setChallengeCompleted(true);
      } else {
        setChallengeCompleted(false);
      }
    }
  }, [params, labMode, activeStationId, activePractice]);

  const handleParamChange = (key: string, value: any) => {
    setParams((prev) => ({ ...prev, [key]: value }));
  };

  const handleRecordMeasurement = () => {
    const newItems: ExperimentRecord['measurements'] = [];

    if (activeStationId === 'geometric') {
      const mat = getMaterial(params.materialId);
      const n2 = getRefractiveIndex(mat, params.wavelengthNm);
      const thetaRad = (params.incidentAngleDeg * Math.PI) / 180.0;
      const fresnel = calculateFresnel(thetaRad, 1.0, n2);

      newItems.push({
        name: lang === 'es' ? 'Ángulo de Incidencia' : 'Incident Angle',
        symbol: 'θ_i',
        value: params.incidentAngleDeg,
        unit: '°',
        theoreticalValue: params.incidentAngleDeg,
        errorPercentage: 0.0,
      });
      newItems.push({
        name: lang === 'es' ? 'Ángulo Refractado' : 'Refracted Angle',
        symbol: 'θ_t',
        value: fresnel.thetaTransmittedRad ? (fresnel.thetaTransmittedRad * 180.0) / Math.PI : 90,
        unit: '°',
        theoreticalValue: fresnel.thetaTransmittedRad ? (fresnel.thetaTransmittedRad * 180.0) / Math.PI : 90,
        errorPercentage: 0.0,
      });
      newItems.push({
        name: lang === 'es' ? 'Reflectancia (no polarizada)' : 'Reflectance (unpolarized)',
        symbol: 'R',
        value: fresnel.Runpolarized,
        unit: 'ratio',
        theoreticalValue: fresnel.Runpolarized,
        errorPercentage: 0.0,
      });
    } else if (activeStationId === 'lenses') {
      const fM = params.focalLengthMm / 1000.0;
      const doM = params.objectDistanceMm / 1000.0;
      const hoM = params.objectHeightMm / 1000.0;
      const res = calculateThinLens(fM, doM, hoM);

      newItems.push({
        name: lang === 'es' ? 'Distancia Imagen' : 'Image Distance',
        symbol: 'd_i',
        value: res.imageDistanceM * 1000.0,
        unit: 'mm',
        theoreticalValue: res.imageDistanceM * 1000.0,
        errorPercentage: 0.0,
      });
      newItems.push({
        name: lang === 'es' ? 'Magnificación Transversal' : 'Transverse Magnification',
        symbol: 'm',
        value: res.magnification,
        unit: '',
        theoreticalValue: res.magnification,
        errorPercentage: 0.0,
      });
    } else if (activeStationId === 'wave') {
      const res = calculateDoubleSlit({
        wavelengthNm: params.wavelengthNm,
        slitSeparationM: params.slitSeparationMm / 1000.0,
        slitWidthM: params.slitWidthMm / 1000.0,
        screenDistanceM: params.screenDistanceM,
      });

      newItems.push({
        name: lang === 'es' ? 'Espaciado de Franjas' : 'Fringe Spacing',
        symbol: 'Δy',
        value: res.fringeSpacingM * 1000.0,
        unit: 'mm',
        theoreticalValue: res.fringeSpacingM * 1000.0,
        errorPercentage: 0.0,
      });
      newItems.push({
        name: lang === 'es' ? 'Espaciado Angular' : 'Angular Spacing',
        symbol: 'Δθ',
        value: res.angularFringeSpacingRad * 1000.0,
        unit: 'mrad',
        theoreticalValue: res.angularFringeSpacingRad * 1000.0,
        errorPercentage: 0.0,
      });
    }

    setRecordedMeasurements((prev) => [...prev, ...newItems]);
  };

  const handleEnterVR = () => {
    if (adapterRef.current) {
      adapterRef.current.app.session.enterVR().catch((err) => {
        alert('WebXR error: ' + err.message);
      });
    }
  };

  // Compile active experiment record for report
  const activeRecord: ExperimentRecord = {
    id: `rec_${Date.now()}`,
    experimentId: activePractice.id,
    title: activePractice.title,
    stationId: activeStationId,
    timestamp: new Date().toISOString(),
    durationSeconds: 120,
    initialConditions: params,
    measurements: recordedMeasurements.length > 0 ? recordedMeasurements : [
      {
        name: lang === 'es' ? 'Parámetro de Referencia' : 'Reference Parameter',
        symbol: 'Ref_0',
        value: 1.0,
        unit: 'a.u.',
        theoreticalValue: 1.0,
        errorPercentage: 0.0,
      },
    ],
    parameters: params,
    theoreticalSummary: activePractice.theory,
    conclusions: activePractice.conclusions,
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden flex flex-col bg-[#0a0d14] text-slate-100 select-none">
      {/* Top Application Bar */}
      <header className="h-14 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md px-3 md:px-5 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToLanding}
            className="flex items-center gap-1 px-2.5 py-1 text-xs text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> {t.exitLab}
          </button>
          <div className="h-4 w-px bg-slate-800"></div>
          <div className="flex items-center gap-2">
            <Atom className="w-5 h-5 text-sky-400 animate-pulse" />
            <span className="font-bold tracking-tight text-white text-sm">VOL</span>
            <span className="text-[10px] font-mono text-sky-400 bg-sky-950/80 border border-sky-800/80 px-1.5 py-0.2 rounded hidden sm:inline">
              Vickora Labs
            </span>
          </div>
        </div>

        {/* Station Navigation Tabs */}
        <div className="hidden lg:flex items-center gap-1 bg-slate-900/80 border border-slate-800 p-0.5 rounded-lg">
          {[
            { id: 'geometric', label: t.stations.geometric },
            { id: 'lenses', label: t.stations.lenses },
            { id: 'wave', label: t.stations.wave },
            { id: 'polarization', label: t.stations.polarization },
            { id: 'laser', label: t.stations.laser },
            { id: 'photonics', label: t.stations.photonics },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setActiveStationId(st.id)}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition ${
                activeStationId === st.id
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

        {/* Right Actions, Mode, Language, & VR */}
        <div className="flex items-center gap-2">
          {/* Quick Toggle 3D Full View */}
          <button
            onClick={() => {
              if (isLeftPanelOpen || isRightPanelOpen) {
                setIsLeftPanelOpen(false);
                setIsRightPanelOpen(false);
              } else {
                setIsLeftPanelOpen(true);
                setIsRightPanelOpen(true);
              }
            }}
            className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition ${
              !isLeftPanelOpen && !isRightPanelOpen
                ? 'bg-sky-600 border-sky-400 text-white shadow-md'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
            title={!isLeftPanelOpen && !isRightPanelOpen ? t.restorePanels : t.viewFull3D}
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden xl:inline text-[11px]">
              {!isLeftPanelOpen && !isRightPanelOpen ? t.restorePanels : t.viewFull3D}
            </span>
          </button>

          {/* Mode Selector */}
          <div className="flex items-center gap-0.5 bg-slate-900 border border-slate-800 p-0.5 rounded-lg text-xs">
            <button
              onClick={() => setLabMode('guided')}
              className={`px-2 py-0.5 rounded font-medium transition ${
                labMode === 'guided' ? 'bg-slate-800 text-sky-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t.guidedMode}
            </button>
            <button
              onClick={() => setLabMode('free')}
              className={`px-2 py-0.5 rounded font-medium transition ${
                labMode === 'free' ? 'bg-slate-800 text-sky-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t.freeMode}
            </button>
            <button
              onClick={() => setLabMode('challenge')}
              className={`px-2 py-0.5 rounded font-medium transition ${
                labMode === 'challenge' ? 'bg-slate-800 text-amber-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t.challengeMode}
            </button>
          </div>

          {/* Language Switcher */}
          {onToggleLang && (
            <button
              onClick={onToggleLang}
              className="flex items-center gap-1 px-2 py-1 text-xs font-semibold bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 rounded-lg transition"
              title="Cambiar idioma / Switch language"
            >
              <Globe className="w-3.5 h-3.5 text-sky-400" />
              <span className="uppercase font-mono">{lang}</span>
            </button>
          )}

          {/* WebXR VR Mode Button */}
          <button
            onClick={handleEnterVR}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg border transition ${
              isVRSupported
                ? 'bg-gradient-to-r from-sky-600 to-indigo-600 border-sky-400 text-white shadow-lg shadow-sky-950/50 hover:brightness-110'
                : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
            title={isVRSupported ? t.enterVR : t.webxrReady}
          >
            <Glasses className="w-4 h-4" />
            <span className="hidden sm:inline">{isVRSupported ? t.enterVR : t.webxrReady}</span>
          </button>

          {/* Notebook & Report Modal Trigger */}
          <button
            onClick={() => setShowReportModal(true)}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-emerald-700/80 hover:bg-emerald-600 text-white rounded-lg border border-emerald-500/30 transition shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>{t.report} ({recordedMeasurements.length})</span>
          </button>
        </div>
      </header>

      {/* Main 3D Canvas + Overlay Layout */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
        {/* Full-screen 3D Viewport rendered by Three.js & VXR Core */}
        <div
          ref={canvasContainerRef}
          className="absolute inset-0 w-full h-full bg-[#0a0d14]"
          style={{ width: '100%', height: '100%', display: 'block' }}
        />

        {/* 3D Navigation Help Overlay */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-950/80 backdrop-blur-md border border-slate-800/80 px-4 py-1.5 rounded-full text-[11px] text-slate-300 pointer-events-none flex items-center gap-3 z-10 shadow-lg">
          <span className="flex items-center gap-1 font-mono text-sky-400">
            <Compass className="w-3.5 h-3.5" /> {t.navigationHelpDesktop}
          </span>
          <span className="text-slate-600 hidden md:inline">|</span>
          <span className="text-slate-400 hidden md:inline">{t.navigationHelpQuest}</span>
        </div>

        {/* Floating Collapsed Pill for Left Panel (When closed) */}
        {!isLeftPanelOpen && (
          <button
            onClick={() => setIsLeftPanelOpen(true)}
            className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-2 bg-slate-950/90 hover:bg-slate-900 border border-slate-800 text-sky-400 hover:text-sky-300 rounded-xl shadow-xl transition backdrop-blur-md text-xs font-semibold"
            title={t.showPractice}
          >
            <BookOpen className="w-4 h-4" />
            <span>{t.showPractice}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Floating Collapsed Pill for Right Panel (When closed) */}
        {!isRightPanelOpen && (
          <button
            onClick={() => setIsRightPanelOpen(true)}
            className="absolute top-4 right-4 z-20 flex items-center gap-2 px-3 py-2 bg-slate-950/90 hover:bg-slate-900 border border-slate-800 text-sky-400 hover:text-sky-300 rounded-xl shadow-xl transition backdrop-blur-md text-xs font-semibold"
            title={t.showWorkspace}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <Sliders className="w-4 h-4" />
            <span>{t.showWorkspace}</span>
          </button>
        )}

        {/* Left Sidebar: Learning & Guided Steps Panel (Collapsible) */}
        {isLeftPanelOpen && (
          <div className="absolute top-4 left-4 w-72 md:w-88 max-h-[calc(100vh-80px)] bg-slate-950/95 backdrop-blur-md border border-slate-800/90 rounded-xl flex flex-col shadow-2xl z-20 overflow-hidden transition-all duration-200">
            <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/70">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-sky-400" />
                <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                  {labMode === 'guided' && t.guidedMode}
                  {labMode === 'free' && t.freeMode}
                  {labMode === 'challenge' && t.challengeMode}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-sky-400 bg-sky-950/80 border border-sky-800/60 px-1.5 py-0.5 rounded">
                  {activePractice.academicLevel}
                </span>
                <button
                  onClick={() => setIsLeftPanelOpen(false)}
                  className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
                  title={t.hidePanel}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-3.5 overflow-y-auto space-y-3.5 text-xs">
              {/* Practice Title */}
              <div>
                <h3 className="text-sm font-bold text-slate-100 leading-snug">{activePractice.title}</h3>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  {activePractice.setupDescription}
                </p>
              </div>

              {/* Challenge Mode Active */}
              {labMode === 'challenge' && activePractice.challenges.length > 0 && (
                <div className="bg-amber-950/40 border border-amber-800/60 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                      <Trophy className="w-4 h-4" /> {activePractice.challenges[0].title}
                    </div>
                    {challengeCompleted ? (
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> {t.solved}
                      </span>
                    ) : (
                      <span className="text-[10px] text-amber-400 font-mono">{t.inProgress}</span>
                    )}
                  </div>
                  <p className="text-[11px] text-amber-200/90 leading-relaxed">
                    {activePractice.challenges[0].description}
                  </p>
                  {challengeCompleted && (
                    <p className="text-[11px] text-emerald-300 bg-emerald-950/60 p-2 rounded border border-emerald-900 leading-relaxed">
                      {activePractice.challenges[0].solutionExplanation}
                    </p>
                  )}
                </div>
              )}

              {/* Guided Lab Steps */}
              {labMode === 'guided' && activePractice.procedure.length > 0 && (
                <div className="space-y-2">
                  <span className="font-semibold text-slate-300 uppercase tracking-wider text-[10px] block">
                    {t.procedureCheckpoints}
                  </span>
                  <div className="space-y-1.5">
                    {activePractice.procedure.map((step) => (
                      <div
                        key={step.stepNumber}
                        onClick={() =>
                          setCompletedSteps((prev) => ({
                            ...prev,
                            [step.stepNumber]: !prev[step.stepNumber],
                          }))
                        }
                        className={`p-2 rounded-lg border cursor-pointer transition flex items-start gap-2 ${
                          completedSteps[step.stepNumber]
                            ? 'bg-slate-900/60 border-emerald-600/40 text-slate-300'
                            : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 text-slate-200'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={!!completedSteps[step.stepNumber]}
                          onChange={() => {}}
                          className="mt-0.5 rounded text-sky-500 focus:ring-0"
                        />
                        <div className="flex-1">
                          <span className="font-semibold text-slate-100 block text-[11px]">
                            {t.step} {step.stepNumber}: {step.title}
                          </span>
                          <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
                            {step.instruction}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Theory & Mathematical Models Accordion */}
              <div className="border-t border-slate-800 pt-3 space-y-1.5">
                <span className="font-semibold text-slate-300 uppercase tracking-wider text-[10px] block">
                  {t.mathematicalModels}
                </span>
                <div className="bg-slate-950 p-2 rounded border border-slate-800/80 font-mono text-[10px] text-sky-300 space-y-0.5">
                  {activePractice.mathematicalModel.map((eq, i) => (
                    <div key={i}>{eq}</div>
                  ))}
                </div>
              </div>

              {/* Safety Protocols */}
              <div className="border-t border-slate-800 pt-3">
                <span className="font-semibold text-amber-400 uppercase tracking-wider text-[10px] block mb-1">
                  {t.safetyProtocols}
                </span>
                <ul className="list-disc list-inside text-[10px] text-slate-400 space-y-0.5">
                  {activePractice.safety.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Right Sidebar: Scientific Workspace & Instrument Controls (Collapsible) */}
        {isRightPanelOpen && (
          <div className="absolute top-4 right-4 w-72 md:w-88 max-h-[calc(100vh-80px)] bg-slate-950/95 backdrop-blur-md border border-slate-800/90 rounded-xl flex flex-col shadow-2xl z-20 overflow-hidden transition-all duration-200">
            <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/70">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-sky-400" />
                <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                  {t.instrumentWorkspace}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setParams({
                      incidentAngleDeg: 30,
                      wavelengthNm: 632.8,
                      materialId: 'nbk7',
                      focalLengthMm: 100,
                      objectDistanceMm: 250,
                      objectHeightMm: 20,
                      slitSeparationMm: 0.25,
                      slitWidthMm: 0.04,
                      screenDistanceM: 1.2,
                    })
                  }
                  className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
                  title={t.resetParams}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsRightPanelOpen(false)}
                  className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
                  title={t.hidePanel}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-3.5 overflow-y-auto space-y-3.5 text-xs">
              {/* Station Specific Controls */}
              {activeStationId === 'geometric' && (
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-300 font-medium">{t.incidentAngle}</span>
                      <span className="font-mono text-sky-400 font-semibold">{params.incidentAngleDeg}°</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={85}
                      step={0.5}
                      value={params.incidentAngleDeg}
                      onChange={(e) => handleParamChange('incidentAngleDeg', parseFloat(e.target.value))}
                      className="w-full accent-sky-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-300 font-medium">{t.laserWavelength}</span>
                      <span className="font-mono text-emerald-400 font-semibold">{params.wavelengthNm} nm</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[
                        { nm: 405, label: '405' },
                        { nm: 488, label: '488' },
                        { nm: 532, label: '532' },
                        { nm: 632.8, label: '633' },
                      ].map((w) => (
                        <button
                          key={w.nm}
                          onClick={() => handleParamChange('wavelengthNm', w.nm)}
                          className={`py-1 text-[10px] rounded border font-mono transition ${
                            params.wavelengthNm === w.nm
                              ? 'bg-sky-600 border-sky-400 text-white font-bold'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {w.nm}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">{t.opticalGlassMaterial}</label>
                    <select
                      value={params.materialId}
                      onChange={(e) => handleParamChange('materialId', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-sky-500 font-mono text-xs"
                    >
                      {listMaterials().map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} (n_d = {m.nd.toFixed(4)})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {activeStationId === 'lenses' && (
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-300 font-medium">{t.focalLength}</span>
                      <span className="font-mono text-sky-400 font-semibold">{params.focalLengthMm} mm</span>
                    </div>
                    <input
                      type="range"
                      min={-150}
                      max={250}
                      step={10}
                      value={params.focalLengthMm}
                      onChange={(e) => handleParamChange('focalLengthMm', parseFloat(e.target.value))}
                      className="w-full accent-sky-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-300 font-medium">{t.objectDistance}</span>
                      <span className="font-mono text-emerald-400 font-semibold">{params.objectDistanceMm} mm</span>
                    </div>
                    <input
                      type="range"
                      min={30}
                      max={500}
                      step={5}
                      value={params.objectDistanceMm}
                      onChange={(e) => handleParamChange('objectDistanceMm', parseFloat(e.target.value))}
                      className="w-full accent-emerald-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-300 font-medium">{t.objectHeight}</span>
                      <span className="font-mono text-amber-400 font-semibold">{params.objectHeightMm} mm</span>
                    </div>
                    <input
                      type="range"
                      min={5}
                      max={40}
                      step={1}
                      value={params.objectHeightMm}
                      onChange={(e) => handleParamChange('objectHeightMm', parseFloat(e.target.value))}
                      className="w-full accent-amber-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {activeStationId === 'wave' && (
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-300 font-medium">{t.laserWavelength}</span>
                      <span className="font-mono text-emerald-400 font-semibold">{params.wavelengthNm} nm</span>
                    </div>
                    <input
                      type="range"
                      min={400}
                      max={700}
                      step={5}
                      value={params.wavelengthNm}
                      onChange={(e) => handleParamChange('wavelengthNm', parseFloat(e.target.value))}
                      className="w-full accent-emerald-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-300 font-medium">{t.slitSeparation}</span>
                      <span className="font-mono text-sky-400 font-semibold">{params.slitSeparationMm} mm</span>
                    </div>
                    <input
                      type="range"
                      min={0.1}
                      max={0.8}
                      step={0.02}
                      value={params.slitSeparationMm}
                      onChange={(e) => handleParamChange('slitSeparationMm', parseFloat(e.target.value))}
                      className="w-full accent-sky-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-300 font-medium">{t.screenDistance}</span>
                      <span className="font-mono text-indigo-400 font-semibold">{params.screenDistanceM} m</span>
                    </div>
                    <input
                      type="range"
                      min={0.5}
                      max={2.5}
                      step={0.1}
                      value={params.screenDistanceM}
                      onChange={(e) => handleParamChange('screenDistanceM', parseFloat(e.target.value))}
                      className="w-full accent-indigo-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {/* Roadmap Station Notice */}
              {['polarization', 'laser', 'photonics'].includes(activeStationId) && (
                <div className="bg-sky-950/30 border border-sky-800/50 p-3 rounded-lg text-slate-300">
                  <span className="font-bold text-sky-400 block mb-1">{t.roadmapNoticeTitle}</span>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {t.roadmapNoticeDesc}
                  </p>
                </div>
              )}

              {/* Real-time Scientific Curve / Chart */}
              {['geometric', 'lenses', 'wave'].includes(activeStationId) && (
                <ScientificChart stationId={activeStationId} params={params} />
              )}

              {/* Record Measurement Action */}
              <div className="border-t border-slate-800 pt-2.5">
                <button
                  onClick={handleRecordMeasurement}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-sky-400 font-semibold rounded-lg flex items-center justify-center gap-2 transition border border-slate-700"
                >
                  <FileSpreadsheet className="w-4 h-4" /> {t.recordData}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Official Printable Report Modal */}
      {showReportModal && (
        <ReportModal
          record={activeRecord}
          onClose={() => setShowReportModal(false)}
        />
      )}
    </div>
  );
};
