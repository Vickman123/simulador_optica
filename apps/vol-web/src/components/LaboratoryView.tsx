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
import {
  Glasses,
  CheckCircle,
  CheckCircle2,
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
  Sparkles,
  Lightbulb,
  Plus,
  Minus,
  Play,
} from 'lucide-react';

interface LaboratoryViewProps {
  onBackToLanding: () => void;
  onRequestDemo?: () => void;
  lang?: string;
  onToggleLang?: () => void;
}

export const LaboratoryView: React.FC<LaboratoryViewProps> = ({ onBackToLanding }) => {
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const adapterRef = useRef<VolXrAdapter | null>(null);

  // Paneles desplegables / ocultables para no saturar la pantalla
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState<boolean>(true);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState<boolean>(true);

  const [activeStationId, setActiveStationId] = useState<string>('geometric');
  const [labMode, setLabMode] = useState<LabMode>('guided');
  const [activePractice, setActivePractice] = useState<UniversityLabPractice>(getPractice('exp-snell'));

  // Parámetros experimentales
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
  const [actionToast, setActionToast] = useState<string | null>(null);

  const handleExecuteStep = (step: any) => {
    if (step.presetParams) {
      setParams((prev) => ({ ...prev, ...step.presetParams }));
    }
    setCompletedSteps((prev) => ({ ...prev, [step.stepNumber]: true }));
    if (step.feedbackText) {
      setActionToast(step.feedbackText);
      setTimeout(() => setActionToast(null), 5500);
    }
  };

  // Inicialización de la simulación 3D
  useEffect(() => {
    if (!canvasContainerRef.current) return;

    const adapter = new VolXrAdapter(canvasContainerRef.current);
    adapter.start();
    adapterRef.current = adapter;

    adapter.app.session.checkVRSupport().then((supported) => {
      setIsVRSupported(supported);
    });

    return () => {
      adapter.dispose();
      adapterRef.current = null;
    };
  }, []);

  // Cambio de estación activa
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

  // Sincronización de parámetros con el motor físico
  useEffect(() => {
    if (!adapterRef.current) return;
    adapterRef.current.setExperimentState(params);

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

  // Botón para registrar datos en el cuaderno
  const handleRecordMeasurement = () => {
    const newItems: ExperimentRecord['measurements'] = [];

    if (activeStationId === 'geometric') {
      const mat = getMaterial(params.materialId);
      const n2 = getRefractiveIndex(mat, params.wavelengthNm);
      const thetaRad = (params.incidentAngleDeg * Math.PI) / 180.0;
      const fresnel = calculateFresnel(thetaRad, 1.0, n2);

      newItems.push({
        name: 'Ángulo de Incidencia',
        symbol: 'θ_i',
        value: params.incidentAngleDeg,
        unit: '°',
        theoreticalValue: params.incidentAngleDeg,
        errorPercentage: 0.0,
      });
      newItems.push({
        name: 'Ángulo Refractado en Vidrio',
        symbol: 'θ_t',
        value: fresnel.thetaTransmittedRad ? (fresnel.thetaTransmittedRad * 180.0) / Math.PI : 90,
        unit: '°',
        theoreticalValue: fresnel.thetaTransmittedRad ? (fresnel.thetaTransmittedRad * 180.0) / Math.PI : 90,
        errorPercentage: 0.0,
      });
      newItems.push({
        name: 'Luz Reflejada (Rebote)',
        symbol: 'R',
        value: fresnel.Runpolarized * 100,
        unit: '%',
        theoreticalValue: fresnel.Runpolarized * 100,
        errorPercentage: 0.0,
      });
    } else if (activeStationId === 'lenses') {
      const fM = params.focalLengthMm / 1000.0;
      const doM = params.objectDistanceMm / 1000.0;
      const hoM = params.objectHeightMm / 1000.0;
      const res = calculateThinLens(fM, doM, hoM);

      newItems.push({
        name: 'Distancia de la Imagen',
        symbol: 'd_i',
        value: res.imageDistanceM * 1000.0,
        unit: 'mm',
        theoreticalValue: res.imageDistanceM * 1000.0,
        errorPercentage: 0.0,
      });
      newItems.push({
        name: 'Aumento (Magnificación)',
        symbol: 'm',
        value: res.magnification,
        unit: 'veces',
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
        name: 'Espaciado entre Franjas de Luz',
        symbol: 'Δy',
        value: res.fringeSpacingM * 1000.0,
        unit: 'mm',
        theoreticalValue: res.fringeSpacingM * 1000.0,
        errorPercentage: 0.0,
      });
    }

    setRecordedMeasurements((prev) => [...prev, ...newItems]);
  };

  const handleEnterVR = () => {
    if (adapterRef.current) {
      adapterRef.current.app.session.enterVR().catch((err) => {
        alert('WebXR no pudo iniciar: ' + err.message);
      });
    }
  };

  // Cálculo en vivo para la caja didáctica
  const getDidacticExplanation = () => {
    if (activeStationId === 'geometric') {
      const mat = getMaterial(params.materialId ?? 'nbk7');
      const n2 = getRefractiveIndex(mat, params.wavelengthNm ?? 632.8);
      const thetaRad = ((params.incidentAngleDeg ?? 30) * Math.PI) / 180.0;
      const fresnel = calculateFresnel(thetaRad, 1.0, n2);
      const thetaTDeg = fresnel.thetaTransmittedRad ? ((fresnel.thetaTransmittedRad * 180) / Math.PI).toFixed(1) : '90';
      const rPct = (fresnel.Runpolarized * 100).toFixed(1);
      const tPct = (fresnel.Tunpolarized * 100).toFixed(1);

      if (params.incidentAngleDeg === 0) {
        return '🎯 El rayo entra completamente perpendicular (0°). Al no chocar en diagonal, pasa recto sin desviarse.';
      }
      if (Math.abs(params.incidentAngleDeg - 56.6) <= 1.5 && params.materialId === 'nbk7') {
        return '✨ ¡Estás en el Ángulo de Brewster (56.6°)! Fíjate cómo el reflejo paralelo (curva dorada) se anula por completo. Así funcionan los lentes de sol polarizados para eliminar los charcos de luz en el pavimento.';
      }
      return `💡 El haz incide a ${params.incidentAngleDeg}°. Como el ${mat.name} es más denso que el aire, frena la luz y la desvía hacia adentro a ${thetaTDeg}°. El ${rPct}% rebota hacia atrás y el ${tPct}% entra al vidrio.`;
    }

    if (activeStationId === 'lenses') {
      const fM = (params.focalLengthMm ?? 100) / 1000.0;
      const doM = (params.objectDistanceMm ?? 250) / 1000.0;
      const res = calculateThinLens(fM, doM, (params.objectHeightMm ?? 20) / 1000.0);
      const diMm = (res.imageDistanceM * 1000).toFixed(0);
      const mag = Math.abs(res.magnification).toFixed(2);

      if (params.focalLengthMm < 0) {
        return `👓 Lente divergente (foco negativo). Los rayos se dispersan hacia afuera. Siempre verás una imagen pequeña y derecha a través del cristal.`;
      }
      if (params.objectDistanceMm < params.focalLengthMm) {
        return `🔍 ¡Efecto Lupa activo! El objeto está muy cerca (${params.objectDistanceMm} mm, dentro del foco de ${params.focalLengthMm} mm). La imagen no se puede proyectar en una pared; es una imagen virtual que se ve ${mag} veces más grande mirando a través de la lente.`;
      }
      return `📽️ Modo Proyector: La lente concentra los rayos para formar una imagen real e invertida (de cabeza) a ${diMm} mm de distancia, con un tamaño ${mag} veces el original.`;
    }

    if (activeStationId === 'wave') {
      const res = calculateDoubleSlit({
        wavelengthNm: params.wavelengthNm ?? 532,
        slitSeparationM: (params.slitSeparationMm ?? 0.25) / 1000.0,
        slitWidthM: (params.slitWidthMm ?? 0.04) / 1000.0,
        screenDistanceM: params.screenDistanceM ?? 1.2,
      });
      const dyMm = (res.fringeSpacingM * 1000).toFixed(2);
      return `🌊 ¡La luz se comporta como una ola en el agua! Al salir de las 2 rendijas, las ondas se suman creando franjas de luz brillantes cada ${dyMm} mm en la pantalla, separadas por líneas de oscuridad absoluta.`;
    }

    return 'Estación en desarrollo para la versión 1.1.';
  };

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
        name: 'Punto de Calibración',
        symbol: 'Cal_0',
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
      {/* Barra Superior de Navegación */}
      <header className="h-14 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md px-3 md:px-5 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToLanding}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition border border-slate-800"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Salir al Inicio
          </button>
          <div className="h-4 w-px bg-slate-800"></div>
          <div className="flex items-center gap-2">
            <Atom className="w-5 h-5 text-sky-400" />
            <span className="font-extrabold tracking-tight text-white text-sm">VOL</span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-2 py-0.5 rounded-full">
              Laboratorio 3D
            </span>
          </div>
        </div>

        {/* Pestañas de las Estaciones */}
        <div className="hidden lg:flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl">
          {[
            { id: 'geometric', label: 'A. Óptica Geométrica' },
            { id: 'lenses', label: 'B. Sistemas de Lentes' },
            { id: 'wave', label: 'C. Doble Rendija de Young' },
            { id: 'polarization', label: 'D. Polarización (Pronto)' },
            { id: 'laser', label: 'E. Láser (Pronto)' },
            { id: 'photonics', label: 'F. Fibra Óptica (Pronto)' },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setActiveStationId(st.id)}
              className={`px-3 py-1 text-xs rounded-lg font-bold transition ${
                activeStationId === st.id
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

        {/* Acciones Rápidas */}
        <div className="flex items-center gap-2">
          {/* Botón de Vista Completa 3D */}
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
            className={`p-1.5 rounded-lg border text-xs flex items-center gap-1.5 transition font-semibold ${
              !isLeftPanelOpen && !isRightPanelOpen
                ? 'bg-sky-600 border-sky-400 text-white shadow-md'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
            title={!isLeftPanelOpen && !isRightPanelOpen ? 'Restaurar Paneles' : 'Ocultar Paneles y Ver 3D Completo'}
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden xl:inline text-[11px]">
              {!isLeftPanelOpen && !isRightPanelOpen ? 'Restaurar Paneles' : 'Vista 3D Completa'}
            </span>
          </button>

          {/* Selector de Modo de Aprendizaje */}
          <div className="flex items-center gap-0.5 bg-slate-900 border border-slate-800 p-0.5 rounded-lg text-xs">
            <button
              onClick={() => setLabMode('guided')}
              className={`px-2.5 py-1 rounded-md font-bold transition ${
                labMode === 'guided' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Paso a Paso
            </button>
            <button
              onClick={() => setLabMode('free')}
              className={`px-2.5 py-1 rounded-md font-bold transition ${
                labMode === 'free' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Libre
            </button>
            <button
              onClick={() => setLabMode('challenge')}
              className={`px-2.5 py-1 rounded-md font-bold transition ${
                labMode === 'challenge' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Reto
            </button>
          </div>

          {/* Botón VR Meta Quest */}
          <button
            onClick={handleEnterVR}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border transition ${
              isVRSupported
                ? 'bg-gradient-to-r from-sky-600 to-indigo-600 border-sky-400 text-white shadow-lg hover:brightness-110'
                : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
            title={isVRSupported ? 'Entrar a Realidad Virtual en Meta Quest 3S' : 'Compatible con Meta Quest Browser'}
          >
            <Glasses className="w-4 h-4" />
            <span className="hidden sm:inline">{isVRSupported ? 'Entrar a VR (Quest 3S)' : 'WebXR Listo'}</span>
          </button>

          {/* Reporte Oficial */}
          <button
            onClick={() => setShowReportModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg border border-emerald-500/40 transition shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Reporte ({recordedMeasurements.length})</span>
          </button>
        </div>
      </header>

      {/* Área Central: 3D + Paneles Desplegables */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
        {/* Lienzo 3D de Three.js y VXR Core */}
        <div
          ref={canvasContainerRef}
          className="absolute inset-0 w-full h-full bg-[#0a0d14]"
          style={{ width: '100%', height: '100%', display: 'block' }}
        />

        {/* Tarjeta Didáctica Flotante: ¿Qué está pasando con la luz? */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 max-w-xl w-[90%] bg-slate-950/90 backdrop-blur-md border border-sky-500/30 rounded-2xl p-3 shadow-2xl flex items-start gap-3">
          <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400 shrink-0 mt-0.5">
            <Lightbulb className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 block mb-0.5">
              Explicación Didáctica en Tiempo Real
            </span>
            <p className="text-xs text-slate-200 leading-relaxed font-medium">
              {getDidacticExplanation()}
            </p>
          </div>
        </div>

        {/* Notificación de Paso Aplicado */}
        {actionToast && (
          <div className="absolute top-24 left-1/2 -translate-x-1/2 z-30 max-w-lg bg-emerald-600/95 backdrop-blur-md text-white px-4 py-2.5 rounded-2xl shadow-2xl shadow-emerald-950/80 border border-emerald-300/40 flex items-center gap-2.5 text-xs font-bold animate-pulse">
            <CheckCircle2 className="w-4 h-4 text-emerald-200 shrink-0" />
            <span className="flex-1">{actionToast}</span>
            <button
              onClick={() => setActionToast(null)}
              className="text-emerald-200 hover:text-white font-mono text-xs px-1"
            >
              ✕
            </button>
          </div>
        )}

        {/* Botón flotante para abrir el panel izquierdo cuando está cerrado */}
        {!isLeftPanelOpen && (
          <button
            onClick={() => setIsLeftPanelOpen(true)}
            className="absolute top-20 left-4 z-20 flex items-center gap-2 px-3.5 py-2.5 bg-slate-950/95 hover:bg-slate-900 border border-slate-700 text-sky-400 rounded-xl shadow-2xl transition backdrop-blur-md text-xs font-bold"
          >
            <BookOpen className="w-4 h-4" />
            <span>Guía de Práctica</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        {/* Botón flotante para abrir el panel derecho cuando está cerrado */}
        {!isRightPanelOpen && (
          <button
            onClick={() => setIsRightPanelOpen(true)}
            className="absolute top-20 right-4 z-20 flex items-center gap-2 px-3.5 py-2.5 bg-slate-950/95 hover:bg-slate-900 border border-slate-700 text-sky-400 rounded-xl shadow-2xl transition backdrop-blur-md text-xs font-bold"
          >
            <ChevronLeft className="w-4 h-4" />
            <Sliders className="w-4 h-4" />
            <span>Controles de Instrumentos</span>
          </button>
        )}

        {/* Panel Izquierdo: Guía de Aprendizaje (Plegable) */}
        {isLeftPanelOpen && (
          <div className="absolute top-4 left-4 w-80 md:w-92 max-h-[calc(100vh-80px)] bg-slate-950/95 backdrop-blur-md border border-slate-800 rounded-2xl flex flex-col shadow-2xl z-20 overflow-hidden transition-all duration-200">
            <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-sky-400" />
                <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                  {labMode === 'guided' && 'Paso a Paso'}
                  {labMode === 'free' && 'Laboratorio Libre'}
                  {labMode === 'challenge' && 'Reto Científico'}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-sky-400 bg-sky-950 border border-sky-800/80 px-2 py-0.5 rounded-full">
                  {activePractice.academicLevel}
                </span>
                <button
                  onClick={() => setIsLeftPanelOpen(false)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                  title="Ocultar panel"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-4 overflow-y-auto space-y-4 text-xs">
              {/* Título de la práctica */}
              <div>
                <h3 className="text-sm font-bold text-white leading-snug">{activePractice.title}</h3>
                <p className="text-[11px] text-slate-300 mt-1.5 leading-relaxed">
                  {activePractice.setupDescription}
                </p>
              </div>

              {/* Modo Reto */}
              {labMode === 'challenge' && activePractice.challenges.length > 0 && (
                <div className="bg-amber-950/50 border border-amber-800/80 rounded-xl p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                      <Trophy className="w-4 h-4" /> {activePractice.challenges[0].title}
                    </div>
                    {challengeCompleted ? (
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded-full border border-emerald-800 flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> ¡Resuelto!
                      </span>
                    ) : (
                      <span className="text-[10px] text-amber-400 font-mono">En progreso</span>
                    )}
                  </div>
                  <p className="text-[11px] text-amber-100 leading-relaxed font-medium">
                    {activePractice.challenges[0].description}
                  </p>
                  {challengeCompleted && (
                    <p className="text-[11px] text-emerald-200 bg-emerald-950/80 p-2.5 rounded-lg border border-emerald-800 leading-relaxed">
                      {activePractice.challenges[0].solutionExplanation}
                    </p>
                  )}
                </div>
              )}

              {/* Pasos Guiados con Botón de Acción Directa */}
              {labMode === 'guided' && activePractice.procedure.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200 uppercase tracking-wider text-[10px] block">
                      Pasos de la Práctica (Haz clic para Probar)
                    </span>
                    <span className="text-[10px] text-sky-400 font-bold bg-sky-950/80 px-2 py-0.5 rounded border border-sky-800/80">
                      {Object.values(completedSteps).filter(Boolean).length} de {activePractice.procedure.length} hechos
                    </span>
                  </div>
                  <div className="space-y-3">
                    {activePractice.procedure.map((step) => {
                      const isCompleted = !!completedSteps[step.stepNumber];
                      return (
                        <div
                          key={step.stepNumber}
                          className={`p-3 rounded-xl border transition flex flex-col gap-2.5 ${
                            isCompleted
                              ? 'bg-emerald-950/40 border-emerald-500/60 text-slate-100 shadow-md shadow-emerald-950/40'
                              : 'bg-slate-900/90 border-slate-800 hover:border-sky-700/60 text-slate-200'
                          }`}
                        >
                          <div className="flex items-start gap-2.5">
                            <button
                              type="button"
                              onClick={() =>
                                setCompletedSteps((prev) => ({
                                  ...prev,
                                  [step.stepNumber]: !prev[step.stepNumber],
                                }))
                              }
                              className="mt-0.5 text-slate-400 hover:text-white"
                              title="Marcar como completado"
                            >
                              {isCompleted ? (
                                <CheckCircle className="w-4 h-4 text-emerald-400 fill-emerald-500/20" />
                              ) : (
                                <div className="w-4 h-4 rounded border border-slate-600 bg-slate-800" />
                              )}
                            </button>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className="font-extrabold text-white text-xs">
                                  Paso {step.stepNumber}: {step.title}
                                </span>
                                {isCompleted && (
                                  <span className="text-[9px] font-bold text-emerald-300 bg-emerald-950 border border-emerald-600 px-1.5 py-0.2 rounded-full">
                                    ✓ Completado
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                                {step.instruction}
                              </p>
                            </div>
                          </div>

                          {/* BOTÓN DE ACCIÓN DIRECTA - 1 CLIC */}
                          <button
                            type="button"
                            onClick={() => handleExecuteStep(step)}
                            className="w-full py-2 px-3 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 active:scale-[0.98] text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-sky-950/50 transition hover:shadow-sky-800/40"
                          >
                            <Play className="w-3.5 h-3.5 fill-current text-sky-200" />
                            <span>{step.actionLabel || `▶ Ejecutar Paso ${step.stepNumber}`}</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Explicación Teórica Fácil */}
              <div className="border-t border-slate-800/80 pt-3 space-y-1.5">
                <span className="font-bold text-sky-400 uppercase tracking-wider text-[10px] block">
                  ¿Por qué ocurre esto? (Fundamento Teórico)
                </span>
                <p className="text-[11px] text-slate-300 leading-relaxed bg-slate-900/50 p-2.5 rounded-xl border border-slate-800">
                  {activePractice.theory}
                </p>
              </div>

              {/* Protocolos de Seguridad */}
              <div className="border-t border-slate-800/80 pt-3">
                <span className="font-bold text-amber-400 uppercase tracking-wider text-[10px] block mb-1">
                  Reglas de Seguridad en el Laboratorio
                </span>
                <ul className="list-disc list-inside text-[11px] text-slate-400 space-y-1">
                  {activePractice.safety.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Panel Derecho: Espacio de Instrumentos y Controles (Plegable) */}
        {isRightPanelOpen && (
          <div className="absolute top-4 right-4 w-80 md:w-92 max-h-[calc(100vh-80px)] bg-slate-950/95 backdrop-blur-md border border-slate-800 rounded-2xl flex flex-col shadow-2xl z-20 overflow-hidden transition-all duration-200">
            <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-sky-400" />
                <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                  Controles del Experimento
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
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                  title="Restablecer valores originales"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsRightPanelOpen(false)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                  title="Ocultar panel"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-4 overflow-y-auto space-y-4 text-xs">
              {/* Presets Rápidos de 1 Clic para cualquier usuario */}
              <div className="space-y-1.5">
                <span className="font-bold text-slate-300 uppercase tracking-wider text-[10px] flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-sky-400" /> Atajos Rápidos de 1 Clic
                </span>
                {activeStationId === 'geometric' && (
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => handleParamChange('incidentAngleDeg', 0)}
                      className="px-2 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-[11px] font-bold text-slate-200 transition text-left"
                    >
                      🎯 Recto (0°)
                    </button>
                    <button
                      onClick={() => handleParamChange('incidentAngleDeg', 30)}
                      className="px-2 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-[11px] font-bold text-slate-200 transition text-left"
                    >
                      📐 Refracción (30°)
                    </button>
                    <button
                      onClick={() => {
                        handleParamChange('incidentAngleDeg', 56.6);
                        handleParamChange('materialId', 'nbk7');
                      }}
                      className="px-2 py-1.5 bg-sky-950/80 hover:bg-sky-900 border border-sky-700/80 rounded-lg text-[11px] font-bold text-sky-300 transition text-left col-span-2"
                    >
                      ✨ Ángulo de Brewster (Sin reflejo P)
                    </button>
                  </div>
                )}

                {activeStationId === 'lenses' && (
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => {
                        handleParamChange('focalLengthMm', 100);
                        handleParamChange('objectDistanceMm', 60);
                      }}
                      className="px-2 py-1.5 bg-sky-950/80 hover:bg-sky-900 border border-sky-700/80 rounded-lg text-[11px] font-bold text-sky-300 transition text-left"
                    >
                      🔍 Efecto Lupa (2x)
                    </button>
                    <button
                      onClick={() => {
                        handleParamChange('focalLengthMm', 100);
                        handleParamChange('objectDistanceMm', 200);
                      }}
                      className="px-2 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-[11px] font-bold text-slate-200 transition text-left"
                    >
                      ⚖️ Simétrico (2f)
                    </button>
                    <button
                      onClick={() => {
                        handleParamChange('focalLengthMm', 100);
                        handleParamChange('objectDistanceMm', 150);
                      }}
                      className="px-2 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-[11px] font-bold text-slate-200 transition text-left"
                    >
                      📽️ Proyector (2X Real)
                    </button>
                    <button
                      onClick={() => {
                        handleParamChange('focalLengthMm', -100);
                        handleParamChange('objectDistanceMm', 250);
                      }}
                      className="px-2 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-[11px] font-bold text-slate-200 transition text-left"
                    >
                      👓 Lente Cóncava
                    </button>
                  </div>
                )}

                {activeStationId === 'wave' && (
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => {
                        handleParamChange('wavelengthNm', 532);
                        handleParamChange('slitSeparationMm', 0.25);
                      }}
                      className="px-2 py-1.5 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/80 rounded-lg text-[11px] font-bold text-emerald-300 transition text-left"
                    >
                      🟢 Láser Verde (532 nm)
                    </button>
                    <button
                      onClick={() => {
                        handleParamChange('wavelengthNm', 632.8);
                        handleParamChange('slitSeparationMm', 0.25);
                      }}
                      className="px-2 py-1.5 bg-red-950/80 hover:bg-red-900 border border-red-700/80 rounded-lg text-[11px] font-bold text-red-300 transition text-left"
                    >
                      🔴 Láser Rojo (633 nm)
                    </button>
                  </div>
                )}
              </div>

              {/* Controles de la Estación A (Óptica Geométrica) */}
              {activeStationId === 'geometric' && (
                <div className="space-y-3.5 border-t border-slate-800/80 pt-3">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-slate-200 font-bold">Inclinación del Láser (Ángulo)</span>
                      <span className="font-mono text-sky-400 font-bold bg-sky-950/80 px-2 py-0.5 rounded border border-sky-800/80">
                        {params.incidentAngleDeg}°
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleParamChange('incidentAngleDeg', Math.max(0, params.incidentAngleDeg - 5))}
                        className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-slate-300"
                        title="Restar 5 grados"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <input
                        type="range"
                        min={0}
                        max={85}
                        step={0.5}
                        value={params.incidentAngleDeg}
                        onChange={(e) => handleParamChange('incidentAngleDeg', parseFloat(e.target.value))}
                        className="flex-1 accent-sky-500 bg-slate-800 h-2 rounded-lg appearance-none cursor-pointer"
                      />
                      <button
                        onClick={() => handleParamChange('incidentAngleDeg', Math.min(85, params.incidentAngleDeg + 5))}
                        className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-slate-300"
                        title="Sumar 5 grados"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Botones de ángulos directos */}
                    <div className="grid grid-cols-4 gap-1 mt-1.5">
                      <button
                        type="button"
                        onClick={() => handleParamChange('incidentAngleDeg', 0)}
                        className={`py-1 text-[10px] rounded font-bold border transition ${
                          params.incidentAngleDeg === 0
                            ? 'bg-sky-600 border-sky-400 text-white shadow-sm'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        0° Recto
                      </button>
                      <button
                        type="button"
                        onClick={() => handleParamChange('incidentAngleDeg', 30)}
                        className={`py-1 text-[10px] rounded font-bold border transition ${
                          params.incidentAngleDeg === 30
                            ? 'bg-sky-600 border-sky-400 text-white shadow-sm'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        30°
                      </button>
                      <button
                        type="button"
                        onClick={() => handleParamChange('incidentAngleDeg', 56.7)}
                        className={`py-1 text-[10px] rounded font-bold border transition ${
                          Math.abs(params.incidentAngleDeg - 56.7) < 0.2
                            ? 'bg-amber-600 border-amber-300 text-white shadow-sm'
                            : 'bg-slate-900 border-slate-800 text-amber-400 hover:text-amber-300'
                        }`}
                        title="Ángulo de Brewster"
                      >
                        56.7° ✨
                      </button>
                      <button
                        type="button"
                        onClick={() => handleParamChange('incidentAngleDeg', 80)}
                        className={`py-1 text-[10px] rounded font-bold border transition ${
                          params.incidentAngleDeg === 80
                            ? 'bg-sky-600 border-sky-400 text-white shadow-sm'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        80° Rasante
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-200 font-bold mb-1.5 text-xs">Color del Láser</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleParamChange('wavelengthNm', 632.8)}
                        className={`py-2 px-3 text-xs rounded-xl border font-bold transition flex items-center justify-center gap-2 ${
                          params.wavelengthNm === 632.8
                            ? 'bg-red-600 border-red-300 text-white shadow-lg shadow-red-950/80 ring-2 ring-red-400 scale-[1.02]'
                            : 'bg-red-950/40 border-red-900/60 text-red-200 hover:bg-red-900/50'
                        }`}
                      >
                        <span className="w-2.5 h-2.5 rounded-full bg-red-400 animate-pulse"></span>
                        🔴 Rojo (633 nm)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleParamChange('wavelengthNm', 532)}
                        className={`py-2 px-3 text-xs rounded-xl border font-bold transition flex items-center justify-center gap-2 ${
                          params.wavelengthNm === 532
                            ? 'bg-emerald-600 border-emerald-300 text-white shadow-lg shadow-emerald-950/80 ring-2 ring-emerald-400 scale-[1.02]'
                            : 'bg-emerald-950/40 border-emerald-900/60 text-emerald-200 hover:bg-emerald-900/50'
                        }`}
                      >
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                        🟢 Verde (532 nm)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleParamChange('wavelengthNm', 488)}
                        className={`py-2 px-3 text-xs rounded-xl border font-bold transition flex items-center justify-center gap-2 ${
                          params.wavelengthNm === 488
                            ? 'bg-cyan-600 border-cyan-300 text-white shadow-lg shadow-cyan-950/80 ring-2 ring-cyan-400 scale-[1.02]'
                            : 'bg-cyan-950/40 border-cyan-900/60 text-cyan-200 hover:bg-cyan-900/50'
                        }`}
                      >
                        <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
                        🔵 Cian (488 nm)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleParamChange('wavelengthNm', 405)}
                        className={`py-2 px-3 text-xs rounded-xl border font-bold transition flex items-center justify-center gap-2 ${
                          params.wavelengthNm === 405
                            ? 'bg-purple-600 border-purple-300 text-white shadow-lg shadow-purple-950/80 ring-2 ring-purple-400 scale-[1.02]'
                            : 'bg-purple-950/40 border-purple-900/60 text-purple-200 hover:bg-purple-900/50'
                        }`}
                      >
                        <span className="w-2.5 h-2.5 rounded-full bg-purple-400"></span>
                        🟣 Violeta (405 nm)
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-200 font-bold mb-1">Tipo de Vidrio</label>
                    <select
                      value={params.materialId}
                      onChange={(e) => handleParamChange('materialId', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-sky-500 font-medium text-xs cursor-pointer"
                    >
                      {listMaterials().map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} (Índice n = {m.nd.toFixed(3)})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Controles de la Estación B (Lentes) */}
              {activeStationId === 'lenses' && (
                <div className="space-y-3.5 border-t border-slate-800/80 pt-3">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-slate-200 font-bold">Curvatura / Foco de la Lente</span>
                      <span className="font-mono text-sky-400 font-bold bg-sky-950/80 px-2 py-0.5 rounded border border-sky-800/80">
                        {params.focalLengthMm} mm
                      </span>
                    </div>
                    <input
                      type="range"
                      min={-150}
                      max={250}
                      step={10}
                      value={params.focalLengthMm}
                      onChange={(e) => handleParamChange('focalLengthMm', parseFloat(e.target.value))}
                      className="w-full accent-sky-500 bg-slate-800 h-2 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                      <span>Cóncava (Divergente)</span>
                      <span>Convexa (Convergente)</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-slate-200 font-bold">Distancia del Objeto</span>
                      <span className="font-mono text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/80">
                        {params.objectDistanceMm} mm
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleParamChange('objectDistanceMm', Math.max(30, params.objectDistanceMm - 10))}
                        className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-slate-300"
                        title="Acercar 10 mm"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <input
                        type="range"
                        min={30}
                        max={500}
                        step={5}
                        value={params.objectDistanceMm}
                        onChange={(e) => handleParamChange('objectDistanceMm', parseFloat(e.target.value))}
                        className="flex-1 accent-emerald-500 bg-slate-800 h-2 rounded-lg appearance-none cursor-pointer"
                      />
                      <button
                        onClick={() => handleParamChange('objectDistanceMm', Math.min(500, params.objectDistanceMm + 10))}
                        className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-slate-300"
                        title="Alejar 10 mm"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Controles de la Estación C (Doble Rendija) */}
              {activeStationId === 'wave' && (
                <div className="space-y-3.5 border-t border-slate-800/80 pt-3">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-slate-200 font-bold">Separación entre Rendijas (d)</span>
                      <span className="font-mono text-sky-400 font-bold bg-sky-950/80 px-2 py-0.5 rounded border border-sky-800/80">
                        {params.slitSeparationMm} mm
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0.1}
                      max={0.8}
                      step={0.02}
                      value={params.slitSeparationMm}
                      onChange={(e) => handleParamChange('slitSeparationMm', parseFloat(e.target.value))}
                      className="w-full accent-sky-500 bg-slate-800 h-2 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-slate-200 font-bold">Distancia a la Pantalla (L)</span>
                      <span className="font-mono text-indigo-400 font-bold bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-800/80">
                        {params.screenDistanceM} m
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0.5}
                      max={2.5}
                      step={0.1}
                      value={params.screenDistanceM}
                      onChange={(e) => handleParamChange('screenDistanceM', parseFloat(e.target.value))}
                      className="w-full accent-indigo-500 bg-slate-800 h-2 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {/* Gráfica Científica Analítica */}
              {['geometric', 'lenses', 'wave'].includes(activeStationId) && (
                <div className="border-t border-slate-800/80 pt-2">
                  <ScientificChart stationId={activeStationId} params={params} />
                </div>
              )}

              {/* Botón para Registrar Medición */}
              <div className="border-t border-slate-800/80 pt-2.5">
                <button
                  onClick={handleRecordMeasurement}
                  className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-sky-950/60 text-xs"
                >
                  <FileSpreadsheet className="w-4 h-4" /> Registrar Medición en Cuaderno
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Reporte Imprimible */}
      {showReportModal && (
        <ReportModal
          record={activeRecord}
          onClose={() => setShowReportModal(false)}
          lang="es"
        />
      )}
    </div>
  );
};
