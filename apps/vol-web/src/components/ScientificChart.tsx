import React from 'react';
import { calculateFresnel, calculateThinLens, calculateDoubleSlit } from '@vickora/optics-engine';
import { getMaterial, getRefractiveIndex } from '@vickora/vol-data';

interface ScientificChartProps {
  stationId: string;
  params: Record<string, any>;
}

export const ScientificChart: React.FC<ScientificChartProps> = ({ stationId, params }) => {
  const width = 360;
  const height = 180;
  const padding = { top: 20, right: 20, bottom: 35, left: 45 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  if (stationId === 'geometric') {
    // Plot Fresnel Reflectance Rs and Rp vs angle theta_i [0, 90 deg]
    const wl = params.wavelengthNm ?? 632.8;
    const matId = params.materialId ?? 'nbk7';
    const mat = getMaterial(matId);
    const n2 = getRefractiveIndex(mat, wl);
    const n1 = 1.0;

    const currentThetaDeg = params.incidentAngleDeg ?? 30;

    const pointsRs: [number, number][] = [];
    const pointsRp: [number, number][] = [];

    for (let deg = 0; deg <= 89; deg += 1) {
      const rad = (deg * Math.PI) / 180.0;
      const res = calculateFresnel(rad, n1, n2);
      const x = padding.left + (deg / 90) * plotWidth;
      const yRs = padding.top + (1.0 - res.Rs) * plotHeight;
      const yRp = padding.top + (1.0 - res.Rp) * plotHeight;
      pointsRs.push([x, yRs]);
      pointsRp.push([x, yRp]);
    }

    const pathRs = pointsRs.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
    const pathRp = pointsRp.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');

    const currentX = padding.left + (currentThetaDeg / 90) * plotWidth;

    return (
      <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-semibold text-slate-300">Fresnel Curves R(θ)</span>
          <div className="flex items-center gap-3 text-[10px]">
            <span className="flex items-center gap-1 text-sky-400">
              <span className="w-2.5 h-0.5 bg-sky-400 inline-block"></span> R_s (perp)
            </span>
            <span className="flex items-center gap-1 text-amber-400">
              <span className="w-2.5 h-0.5 bg-amber-400 inline-block"></span> R_p (para)
            </span>
          </div>
        </div>
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto select-none">
          {/* Axes & Grid */}
          <line x1={padding.left} y1={padding.top + plotHeight} x2={padding.left + plotWidth} y2={padding.top + plotHeight} stroke="#334155" strokeWidth="1" />
          <line x1={padding.left} y1={padding.top} x2={padding.left} y2={padding.top + plotHeight} stroke="#334155" strokeWidth="1" />
          <line x1={padding.left} y1={padding.top + plotHeight / 2} x2={padding.left + plotWidth} y2={padding.top + plotHeight / 2} stroke="#1e293b" strokeDasharray="3 3" />

          {/* Curves */}
          <path d={pathRs} fill="none" stroke="#38bdf8" strokeWidth="1.8" />
          <path d={pathRp} fill="none" stroke="#fbbf24" strokeWidth="1.8" />

          {/* Current Angle Marker */}
          <line x1={currentX} y1={padding.top} x2={currentX} y2={padding.top + plotHeight} stroke="#ec4899" strokeWidth="1.5" strokeDasharray="2 2" />

          {/* Axis Labels */}
          <text x={padding.left - 8} y={padding.top + 5} fill="#64748b" fontSize="9" textAnchor="end">1.0</text>
          <text x={padding.left - 8} y={padding.top + plotHeight / 2 + 3} fill="#64748b" fontSize="9" textAnchor="end">0.5</text>
          <text x={padding.left - 8} y={padding.top + plotHeight + 3} fill="#64748b" fontSize="9" textAnchor="end">0.0</text>

          <text x={padding.left} y={height - 10} fill="#64748b" fontSize="9" textAnchor="middle">0°</text>
          <text x={padding.left + plotWidth / 2} y={height - 10} fill="#64748b" fontSize="9" textAnchor="middle">45°</text>
          <text x={padding.left + plotWidth} y={height - 10} fill="#64748b" fontSize="9" textAnchor="middle">90°</text>
          <text x={width / 2 + 10} y={height - 2} fill="#94a3b8" fontSize="9" textAnchor="middle">Incident Angle θ_i</text>
        </svg>
      </div>
    );
  }

  if (stationId === 'lenses') {
    // Plot Thin Lens Conjugate curve di vs do
    const fMm = params.focalLengthMm ?? 100;
    const fM = fMm / 1000.0;

    const points: [number, number][] = [];
    const minDo = Math.max(0.01, fM * 1.15);
    const maxDo = 0.6; // 600 mm

    for (let doM = minDo; doM <= maxDo; doM += 0.005) {
      const res = calculateThinLens(fM, doM, 0.02);
      const x = padding.left + ((doM - minDo) / (maxDo - minDo)) * plotWidth;
      const clampedDi = Math.min(0.6, res.imageDistanceM);
      const y = padding.top + (1.0 - clampedDi / 0.6) * plotHeight;
      points.push([x, y]);
    }

    const path = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');

    return (
      <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-semibold text-slate-300">Conjugate Curve d_i(d_o)</span>
          <span className="text-[10px] text-sky-400 font-mono">f = {fMm} mm</span>
        </div>
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto select-none">
          <line x1={padding.left} y1={padding.top + plotHeight} x2={padding.left + plotWidth} y2={padding.top + plotHeight} stroke="#334155" strokeWidth="1" />
          <line x1={padding.left} y1={padding.top} x2={padding.left} y2={padding.top + plotHeight} stroke="#334155" strokeWidth="1" />
          <path d={path} fill="none" stroke="#38bdf8" strokeWidth="2" />
          <text x={width / 2 + 10} y={height - 2} fill="#94a3b8" fontSize="9" textAnchor="middle">Object Distance d_o (m)</text>
          <text x={padding.left - 8} y={padding.top + plotHeight / 2} fill="#94a3b8" fontSize="9" textAnchor="end">d_i (m)</text>
        </svg>
      </div>
    );
  }

  // Wave Optics (Young's Double-Slit Intensity Profile)
  const wl = params.wavelengthNm ?? 532;
  const dMm = params.slitSeparationMm ?? 0.25;
  const aMm = params.slitWidthMm ?? 0.04;
  const LM = params.screenDistanceM ?? 1.2;

  const res = calculateDoubleSlit(
    {
      wavelengthNm: wl,
      slitSeparationM: dMm / 1000.0,
      slitWidthM: aMm / 1000.0,
      screenDistanceM: LM,
    },
    0.035, // 35 mm screen width
    200
  );

  const pointsI: [number, number][] = [];
  const pointsEnv: [number, number][] = [];

  res.profile.forEach((pt, i) => {
    const x = padding.left + (i / (res.profile.length - 1)) * plotWidth;
    const yI = padding.top + (1.0 - pt.intensity) * plotHeight;
    const yEnv = padding.top + (1.0 - pt.diffractionEnvelope) * plotHeight;
    pointsI.push([x, yI]);
    pointsEnv.push([x, yEnv]);
  });

  const pathI = pointsI.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  const pathEnv = pointsEnv.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-semibold text-slate-300">Screen Intensity Profile I(y)</span>
        <div className="flex items-center gap-2 text-[10px]">
          <span className="text-emerald-400 font-mono">Δy = {(res.fringeSpacingM * 1000).toFixed(2)} mm</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto select-none">
        <line x1={padding.left} y1={padding.top + plotHeight} x2={padding.left + plotWidth} y2={padding.top + plotHeight} stroke="#334155" strokeWidth="1" />
        <line x1={padding.left} y1={padding.top} x2={padding.left} y2={padding.top + plotHeight} stroke="#334155" strokeWidth="1" />

        {/* Envelope */}
        <path d={pathEnv} fill="none" stroke="#64748b" strokeWidth="1" strokeDasharray="3 3" />
        {/* Interference intensity */}
        <path d={pathI} fill="none" stroke="#10b981" strokeWidth="1.6" />

        <text x={padding.left - 8} y={padding.top + 5} fill="#64748b" fontSize="9" textAnchor="end">I₀</text>
        <text x={padding.left - 8} y={padding.top + plotHeight + 3} fill="#64748b" fontSize="9" textAnchor="end">0</text>
        <text x={padding.left} y={height - 10} fill="#64748b" fontSize="9" textAnchor="middle">-17mm</text>
        <text x={padding.left + plotWidth / 2} y={height - 10} fill="#64748b" fontSize="9" textAnchor="middle">0</text>
        <text x={padding.left + plotWidth} y={height - 10} fill="#64748b" fontSize="9" textAnchor="middle">+17mm</text>
        <text x={width / 2 + 10} y={height - 2} fill="#94a3b8" fontSize="9" textAnchor="middle">Screen Position y (mm)</text>
      </svg>
    </div>
  );
};
