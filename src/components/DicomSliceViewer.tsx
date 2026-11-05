import React, { useState, useEffect, useRef } from 'react';
import { 
  Sliders, 
  Layers, 
  Crosshair, 
  Maximize2, 
  RotateCcw, 
  Scan, 
  Eye, 
  FileText,
  Lock,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { TelemetryPacket } from '../types/telemetry';

interface DicomSliceViewerProps {
  telemetry: TelemetryPacket;
  onClutchHold: () => void;
  onRollFlick: () => void;
}

// Medical CT Presets
const PRESETS = [
  { name: 'Brain (Soft Tissue)', wl: 40, ww: 80, desc: 'Ventricles, grey/white matter' },
  { name: 'Angiography (Vascular)', wl: 280, ww: 650, desc: 'Contrast-enhanced cerebral vessels' },
  { name: 'Bone (Calvarium)', wl: 500, ww: 2000, desc: 'Cranial fractures & osteotomy' },
  { name: 'Subdural Hematoma', wl: 75, ww: 150, desc: 'Acute blood & hyperdensities' },
];

export const DicomSliceViewer: React.FC<DicomSliceViewerProps> = ({
  telemetry,
  onClutchHold,
  onRollFlick,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const totalSlices = 64;
  const [currentSlice, setCurrentSlice] = useState(32);
  const [selectedPresetIndex, setSelectedPresetIndex] = useState(0);
  const [zoom, setZoom] = useState(1.0);
  const [probeHu, setProbeHu] = useState<{ x: number; y: number; hu: number } | null>(null);

  // Wrist pitch scrubs through slices when in ACTIVE mode
  useEffect(() => {
    if (telemetry.systemState === 'ACTIVE' && !telemetry.inDeadZone) {
      // rateX controls slice delta
      if (Math.abs(telemetry.rateX) > 200) {
        const delta = Math.sign(telemetry.rateX) * (Math.abs(telemetry.rateX) > 1000 ? 2 : 1);
        setCurrentSlice(prev => Math.max(1, Math.min(totalSlices, prev + delta)));
      }
    }
  }, [telemetry]);

  // Procedural CT/MRI slice generation on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const cx = width / 2;
    const cy = height / 2;
    const preset = PRESETS[selectedPresetIndex];

    // Clear background
    ctx.fillStyle = '#060608';
    ctx.fillRect(0, 0, width, height);

    // Anatomical Slice Normalized Z (0.0 at base of skull, 1.0 at vertex)
    const zNorm = currentSlice / totalSlices;

    // Skull Outer Calvarium (Bone)
    const skullRadiusX = (width * 0.38) * Math.sin(Math.PI * (0.15 + zNorm * 0.7));
    const skullRadiusY = (height * 0.44) * Math.sin(Math.PI * (0.15 + zNorm * 0.7));

    if (skullRadiusX > 10 && skullRadiusY > 10) {
      // Skull bone ring
      ctx.beginPath();
      ctx.ellipse(cx, cy, skullRadiusX, skullRadiusY, 0, 0, Math.PI * 2);
      ctx.strokeStyle = preset.name.includes('Bone') ? '#FFFFFF' : '#888899';
      ctx.lineWidth = 14 * (preset.name.includes('Bone') ? 1.4 : 1.0);
      ctx.stroke();

      // Brain parenchyma background
      ctx.beginPath();
      ctx.ellipse(cx, cy, skullRadiusX - 12, skullRadiusY - 12, 0, 0, Math.PI * 2);
      ctx.fillStyle = preset.name.includes('Brain') ? '#26262c' : '#1a1a20';
      ctx.fill();

      // Cerebral Hemispheric Fissure (Midline)
      ctx.beginPath();
      ctx.moveTo(cx, cy - skullRadiusY + 14);
      ctx.lineTo(cx, cy + skullRadiusY - 14);
      ctx.strokeStyle = '#141418';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Ventricles (Shape depends on slice level)
      if (zNorm >= 0.35 && zNorm <= 0.75) {
        const ventScale = Math.sin((zNorm - 0.35) * Math.PI / 0.4);
        const ventWidth = 24 * ventScale;
        const ventHeight = 55 * ventScale;

        // Left Lateral Ventricle
        ctx.beginPath();
        ctx.ellipse(cx - 24, cy - 8, ventWidth, ventHeight, -0.2, 0, Math.PI * 2);
        ctx.fillStyle = '#09090c'; // CSF is dark on CT
        ctx.fill();

        // Right Lateral Ventricle
        ctx.beginPath();
        ctx.ellipse(cx + 24, cy - 8, ventWidth, ventHeight, 0.2, 0, Math.PI * 2);
        ctx.fillStyle = '#09090c';
        ctx.fill();
      }

      // Vascular structures / Circle of Willis on slices 0.2 to 0.45
      if (zNorm >= 0.25 && zNorm <= 0.48) {
        // High-density contrast in vessels (Circle of Willis)
        const isAngio = preset.name.includes('Angiography');
        ctx.fillStyle = isAngio ? '#EB0028' : '#e2e2ea';

        // Basilar artery dot
        ctx.beginPath();
        ctx.arc(cx, cy + 45, 6, 0, Math.PI * 2);
        ctx.fill();

        // Internal Carotid bilateral dots
        ctx.beginPath();
        ctx.arc(cx - 42, cy + 15, 8, 0, Math.PI * 2);
        ctx.arc(cx + 42, cy + 15, 8, 0, Math.PI * 2);
        ctx.fill();

        // TARGET LESION: Aneurysm Outpouching visible around slice 34
        if (currentSlice >= 30 && currentSlice <= 38) {
          ctx.save();
          ctx.fillStyle = '#FF0033';
          ctx.beginPath();
          ctx.arc(cx + 48, cy + 10, 11, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Pulsing halo
          ctx.strokeStyle = 'rgba(235, 0, 40, 0.6)';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(cx + 48, cy + 10, 17, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }
      }

      // Cortical sulcal convolutions (subtle grey lines)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        const r1 = skullRadiusX - 16;
        const r2 = skullRadiusX - 35;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(angle) * r1, cy + Math.sin(angle) * r1);
        ctx.lineTo(cx + Math.cos(angle) * r2, cy + Math.sin(angle) * r2);
        ctx.stroke();
      }
    }

    // Grid & Axis labels (A, P, L, R)
    ctx.fillStyle = '#71717A';
    ctx.font = 'bold 12px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('ANTERIOR [A]', cx, 24);
    ctx.fillText('POSTERIOR [P]', cx, height - 12);
    ctx.textAlign = 'left';
    ctx.fillText('[R]', 16, cy);
    ctx.textAlign = 'right';
    ctx.fillText('[L]', width - 16, cy);

    // Crosshair target on aneurysm if on slice 34
    if (currentSlice >= 30 && currentSlice <= 38) {
      ctx.strokeStyle = 'rgba(235, 0, 40, 0.7)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      // Horizontal crosshair
      ctx.beginPath();
      ctx.moveTo(0, cy + 10);
      ctx.lineTo(width, cy + 10);
      ctx.stroke();
      // Vertical crosshair
      ctx.beginPath();
      ctx.moveTo(cx + 48, 0);
      ctx.lineTo(cx + 48, height);
      ctx.stroke();
      ctx.setLineDash([]);

      // Pathology Callout
      ctx.fillStyle = '#EB0028';
      ctx.font = 'bold 11px "JetBrains Mono", monospace';
      ctx.fillText('TARGET: ICA ANEURYSM (3.4mm)', cx + 64, cy + 14);
    }
  }, [currentSlice, selectedPresetIndex]);

  // Handle canvas mouse move for HU probe inspection
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.floor(e.clientX - rect.left);
    const y = Math.floor(e.clientY - rect.top);

    // Calculate approximate simulated Hounsfield Units based on geometry
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);

    let hu = -1000; // Air
    if (dist < 170) {
      hu = 35 + Math.floor(Math.sin(x * y) * 8); // Brain grey matter ~35-45 HU
      if (Math.abs(x - (cx + 48)) < 15 && Math.abs(y - (cy + 10)) < 15 && currentSlice >= 30 && currentSlice <= 38) {
        hu = 285; // Contrast enhanced aneurysm blood pool
      } else if (dist < 35) {
        hu = 8; // Ventricle CSF ~5-15 HU
      }
    } else if (dist < 190) {
      hu = 950; // Cortical bone ~1000 HU
    }

    setProbeHu({ x, y, hu });
  };

  return (
    <div className="relative w-full h-[calc(100vh-140px)] min-h-[580px] bg-[#0A0A0C] rounded-2xl border border-[#23232B] overflow-hidden flex flex-col shadow-2xl">
      {/* Top DICOM Metadata Bar */}
      <div className="bg-[#101014] px-5 py-3 border-b border-[#23232B] flex flex-wrap items-center justify-between gap-3 z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-opred/10 border border-opred/40 text-opred">
            <Scan className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-white font-bold text-sm">CT HEAD + ANGIOGRAPHY 0.625mm</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1C1C24] text-slate-300 border border-[#2E2E3A]">
                AXIAL STACK
              </span>
            </div>
            <div className="text-[11px] font-mono text-slate-400">
              PATIENT: #SV-99420 · FOV: 220mm · KV: 120 · MA: 350
            </div>
          </div>
        </div>

        {/* Window Presets Buttons */}
        <div className="flex items-center gap-1.5 bg-[#16161D] p-1 rounded-xl border border-[#262633]">
          {PRESETS.map((preset, idx) => (
            <button
              key={preset.name}
              onClick={() => setSelectedPresetIndex(idx)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
                selectedPresetIndex === idx
                  ? 'bg-opred text-white shadow-md shadow-opred/20'
                  : 'text-slate-400 hover:text-white hover:bg-[#20202A]'
              }`}
            >
              {preset.name.split(' ')[0]}
            </button>
          ))}
        </div>

        {/* Slice Navigation Counter */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            onClick={() => setCurrentSlice(s => Math.max(1, s - 1))}
            className="p-1 rounded bg-[#181820] hover:bg-[#22222C] text-slate-300"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="px-3 py-1 rounded-lg bg-[#14141A] border border-[#2A2A38] text-white font-semibold">
            SLICE <span className="text-opred">{currentSlice.toString().padStart(2, '0')}</span> / {totalSlices}
          </div>
          <button
            onClick={() => setCurrentSlice(s => Math.min(totalSlices, s + 1))}
            className="p-1 rounded bg-[#181820] hover:bg-[#22222C] text-slate-300"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="relative flex-1 flex items-center justify-center bg-[#060608] overflow-hidden">
        {/* Subtle scanline overlay for clinical CRT/DICOM authenticity */}
        <div className="absolute inset-0 scanline pointer-events-none opacity-20"></div>

        <canvas
          ref={canvasRef}
          width={560}
          height={560}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setProbeHu(null)}
          className="rounded-xl border border-[#1E1E26] shadow-2xl cursor-crosshair"
        />

        {/* Live HU Probe Floater */}
        {probeHu && (
          <div className="absolute top-4 left-4 bg-[#121216]/90 backdrop-blur-md px-3 py-2 rounded-xl border border-[#2B2B38] font-mono text-xs shadow-xl space-y-0.5">
            <div className="text-[10px] text-slate-400 uppercase">Hounsfield Unit (HU) Probe</div>
            <div className="text-sm font-bold text-white flex items-center gap-2">
              <span className={probeHu.hu > 150 ? 'text-opred' : 'text-emerald-400'}>
                {probeHu.hu >= 0 ? `+${probeHu.hu}` : probeHu.hu} HU
              </span>
              <span className="text-[10px] text-slate-400">
                {probeHu.hu > 800 ? '(Bone)' : probeHu.hu > 150 ? '(Vascular Contrast)' : probeHu.hu > 20 ? '(Brain Tissue)' : probeHu.hu > 0 ? '(CSF Fluid)' : '(Air)'}
              </span>
            </div>
            <div className="text-[10px] text-slate-500">
              POS: X={probeHu.x} Y={probeHu.y}
            </div>
          </div>
        )}

        {/* Current Window Level/Width Readout */}
        <div className="absolute top-4 right-4 bg-[#121216]/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-[#2B2B38] font-mono text-xs space-y-1">
          <div className="text-[10px] text-slate-400 uppercase">Window Contrast</div>
          <div className="text-white font-semibold">
            WL: <span className="text-opred">{PRESETS[selectedPresetIndex].wl}</span> | WW:{' '}
            <span className="text-opred">{PRESETS[selectedPresetIndex].ww}</span>
          </div>
          <div className="text-[10px] text-slate-400">
            {PRESETS[selectedPresetIndex].desc}
          </div>
        </div>

        {/* Lock Shield Overlay if system is locked */}
        {telemetry.systemState === 'LOCKED' && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] z-30 flex items-center justify-center pointer-events-none">
            <div className="bg-[#121218]/95 border border-[#2E2E38] rounded-2xl p-6 max-w-md text-center shadow-2xl space-y-2">
              <Lock className="w-8 h-8 text-slate-400 mx-auto" />
              <h3 className="text-sm font-bold text-white tracking-wide uppercase font-mono">
                DICOM Slice Navigation Locked
              </h3>
              <p className="text-xs text-slate-400">
                Tilt scrubbing paused. Execute Forearm Palm-Up Clutch to resume slice navigation.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Scrubber & Gesture Bar */}
      <div className="bg-[#101014] px-5 py-3 border-t border-[#23232B] flex flex-wrap items-center justify-between gap-4 z-10">
        <div className="flex-1 max-w-xl flex items-center gap-3">
          <span className="text-xs font-mono text-slate-400 whitespace-nowrap">Axial Scrubber:</span>
          <input
            type="range"
            min={1}
            max={totalSlices}
            value={currentSlice}
            onChange={e => setCurrentSlice(Number(e.target.value))}
            className="w-full accent-opred cursor-pointer"
          />
          <span className="text-xs font-mono text-opred font-bold w-12 text-right">
            {currentSlice}/{totalSlices}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRollFlick}
            className="px-3 py-1 rounded-lg bg-opred hover:bg-opred-hover text-white text-xs font-mono font-semibold transition-all shadow-md shadow-opred/20"
          >
            🔄 Roll Flick: Back to 3D Volume
          </button>
          <button
            onClick={onClutchHold}
            className="px-3 py-1 rounded-lg bg-[#1A1A24] hover:bg-[#252535] text-slate-300 text-xs font-mono border border-slate-700 transition-colors"
          >
            ✋ Clutch 2.0s {telemetry.systemState === 'ACTIVE' ? 'Lock' : 'Unlock'}
          </button>
        </div>
      </div>
    </div>
  );
};
