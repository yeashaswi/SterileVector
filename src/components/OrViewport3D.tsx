import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { 
  Maximize2, 
  RotateCcw, 
  Crosshair, 
  ShieldAlert, 
  Compass, 
  ZoomIn, 
  Zap, 
  Lock, 
  Sparkles,
  Eye
} from 'lucide-react';
import { TelemetryPacket, KinematicChannel } from '../types/telemetry';

interface OrViewport3DProps {
  telemetry: TelemetryPacket;
  kinematicChannel: KinematicChannel;
  onChannelToggle: () => void;
  onClutchHold: () => void;
  onRollFlick: () => void;
  onTapGesture: () => void;
  onStationaryHold: () => void;
  onTriggerWatchdogFault: () => void;
}

export const OrViewport3D: React.FC<OrViewport3DProps> = ({
  telemetry,
  kinematicChannel,
  onChannelToggle,
  onClutchHold,
  onRollFlick,
  onTapGesture,
  onStationaryHold,
  onTriggerWatchdogFault,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const vascularGroupRef = useRef<THREE.Group | null>(null);
  const targetAneurysmRef = useRef<THREE.Mesh | null>(null);

  // Viewport camera & orientation state
  const rotationEuler = useRef({ x: 0.3, y: 0.5, z: 0 });
  const zoomLevel = useRef<number>(5.5);

  const [fovAngle, setFovAngle] = useState(45);
  const [showVascularMesh, setShowVascularMesh] = useState(true);
  const [showBrainEnvelope, setShowBrainEnvelope] = useState(true);
  const [showCrosshairs, setShowCrosshairs] = useState(true);

  // Initialize Three.js Scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x09090b);

    // Camera
    const camera = new THREE.PerspectiveCamera(fovAngle, width / height, 0.1, 1000);
    camera.position.set(0, 0, zoomLevel.current);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = false;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting (Medical Studio Lighting)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.4);
    dirLight1.position.set(5, 10, 7);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xeb0028, 0.8); // OnePlus Red rim lighting
    dirLight2.position.set(-8, -4, -5);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0xffffff, 1.2, 50);
    pointLight.position.set(0, 4, 3);
    scene.add(pointLight);

    // Anatomical Root Group
    const anatomicalGroup = new THREE.Group();
    scene.add(anatomicalGroup);
    vascularGroupRef.current = anatomicalGroup;

    // --- PROCEDURAL CEREBRAL VASCULAR TREE (Circle of Willis & Arterial Tree) ---
    const vesselMaterial = new THREE.MeshStandardMaterial({
      color: 0xEB0028, // OnePlus Crimson Blood Vessel
      roughness: 0.25,
      metalness: 0.1,
      emissive: 0x3d0007,
    });

    const minorVesselMat = new THREE.MeshStandardMaterial({
      color: 0xd92b45,
      roughness: 0.35,
      metalness: 0.1,
      wireframe: false,
    });

    // Main basilar & vertebral trunk
    const basilarCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, -2.2, -0.4),
      new THREE.Vector3(0.05, -1.2, -0.2),
      new THREE.Vector3(0, -0.3, 0),
      new THREE.Vector3(-0.05, 0.4, 0.2),
    ]);
    const basilarGeo = new THREE.TubeGeometry(basilarCurve, 40, 0.14, 16, false);
    const basilarMesh = new THREE.Mesh(basilarGeo, vesselMaterial);
    anatomicalGroup.add(basilarMesh);

    // Bilateral Carotid Arteries & Circle of Willis ring
    const leftCarotid = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.6, -1.8, 0.2),
      new THREE.Vector3(-0.55, -0.8, 0.3),
      new THREE.Vector3(-0.4, 0.2, 0.1),
      new THREE.Vector3(-0.3, 0.6, 0.3),
      new THREE.Vector3(-0.7, 1.1, 0.4),
      new THREE.Vector3(-1.3, 1.4, 0.2),
    ]);
    const leftCarotidGeo = new THREE.TubeGeometry(leftCarotid, 32, 0.11, 14, false);
    anatomicalGroup.add(new THREE.Mesh(leftCarotidGeo, vesselMaterial));

    const rightCarotid = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.6, -1.8, 0.2),
      new THREE.Vector3(0.55, -0.8, 0.3),
      new THREE.Vector3(0.4, 0.2, 0.1),
      new THREE.Vector3(0.3, 0.6, 0.3),
      new THREE.Vector3(0.7, 1.1, 0.4),
      new THREE.Vector3(1.3, 1.4, 0.2),
    ]);
    const rightCarotidGeo = new THREE.TubeGeometry(rightCarotid, 32, 0.11, 14, false);
    anatomicalGroup.add(new THREE.Mesh(rightCarotidGeo, vesselMaterial));

    // Anterior Communicating Arteries Loop
    const circleRingCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.3, 0.6, 0.3),
      new THREE.Vector3(0, 0.75, 0.35),
      new THREE.Vector3(0.3, 0.6, 0.3),
      new THREE.Vector3(0.2, 0.3, 0.05),
      new THREE.Vector3(-0.2, 0.3, 0.05),
      new THREE.Vector3(-0.3, 0.6, 0.3),
    ]);
    const circleRingGeo = new THREE.TubeGeometry(circleRingCurve, 32, 0.07, 12, true);
    anatomicalGroup.add(new THREE.Mesh(circleRingGeo, minorVesselMat));

    // Middle Cerebral Artery (MCA) Sylvian branches (fine peripheral vasculature)
    const createBranch = (pts: [number, number, number][], radius = 0.05) => {
      const vPts = pts.map(p => new THREE.Vector3(...p));
      const curve = new THREE.CatmullRomCurve3(vPts);
      const geo = new THREE.TubeGeometry(curve, 24, radius, 10, false);
      return new THREE.Mesh(geo, minorVesselMat);
    };

    // Left branches
    anatomicalGroup.add(createBranch([[-0.7, 1.1, 0.4], [-1.2, 1.3, 0.8], [-1.8, 1.6, 0.6], [-2.1, 1.9, 0.2]], 0.06));
    anatomicalGroup.add(createBranch([[-1.2, 1.3, 0.8], [-1.5, 0.9, 1.1], [-2.0, 0.7, 1.0]], 0.04));
    anatomicalGroup.add(createBranch([[-0.3, 0.6, 0.3], [-0.4, 1.4, 0.7], [-0.3, 2.0, 0.6]], 0.05));

    // Right branches
    anatomicalGroup.add(createBranch([[0.7, 1.1, 0.4], [1.2, 1.3, 0.8], [1.8, 1.6, 0.6], [2.1, 1.9, 0.2]], 0.06));
    anatomicalGroup.add(createBranch([[1.2, 1.3, 0.8], [1.5, 0.9, 1.1], [2.0, 0.7, 1.0]], 0.04));
    anatomicalGroup.add(createBranch([[0.3, 0.6, 0.3], [0.4, 1.4, 0.7], [0.3, 2.0, 0.6]], 0.05));

    // Posterior Cerebral branches
    anatomicalGroup.add(createBranch([[0, 0.4, 0.2], [-0.5, 0.6, -0.3], [-1.1, 0.8, -0.7]], 0.06));
    anatomicalGroup.add(createBranch([[0, 0.4, 0.2], [0.5, 0.6, -0.3], [1.1, 0.8, -0.7]], 0.06));

    // TARGET SURGICAL PATHOLOGY: Aneurysm Sac (highlighted in pulsating red/gold)
    const aneurysmGeo = new THREE.SphereGeometry(0.24, 24, 24);
    const aneurysmMat = new THREE.MeshStandardMaterial({
      color: 0xff0033,
      emissive: 0x990015,
      roughness: 0.1,
      metalness: 0.2,
    });
    const aneurysmMesh = new THREE.Mesh(aneurysmGeo, aneurysmMat);
    aneurysmMesh.position.set(0.72, 1.14, 0.42);
    anatomicalGroup.add(aneurysmMesh);
    targetAneurysmRef.current = aneurysmMesh;

    // Semi-transparent Cranial Cortical Envelope (Brain Silhouette)
    const brainGeo = new THREE.SphereGeometry(2.3, 36, 36);
    brainGeo.scale(1.0, 0.85, 1.15); // Ellipsoidal brain shape
    const brainMat = new THREE.MeshStandardMaterial({
      color: 0x8899aa,
      transparent: true,
      opacity: 0.12,
      roughness: 0.8,
      wireframe: true,
    });
    const brainMesh = new THREE.Mesh(brainGeo, brainMat);
    brainMesh.name = 'brainEnvelope';
    brainMesh.position.set(0, 0.5, 0);
    anatomicalGroup.add(brainMesh);

    // Anatomical Grid Base
    const gridHelper = new THREE.GridHelper(6, 12, 0xeb0028, 0x22222a);
    gridHelper.position.y = -2.5;
    scene.add(gridHelper);

    // Render loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Subtle pulse on the target aneurysm
      if (targetAneurysmRef.current) {
        const pulse = 1.0 + 0.08 * Math.sin(elapsedTime * 4.0);
        targetAneurysmRef.current.scale.set(pulse, pulse, pulse);
      }

      // Smooth camera position
      if (cameraRef.current) {
        cameraRef.current.position.z = THREE.MathUtils.lerp(
          cameraRef.current.position.z,
          zoomLevel.current,
          0.1
        );
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container || !cameraRef.current || !rendererRef.current) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      cameraRef.current.aspect = newW / newH;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
    };
  }, []);

  // Update Three.js model based on active telemetry rates
  useEffect(() => {
    if (!vascularGroupRef.current) return;

    // Only apply rotation/zoom if system is in ACTIVE state (prevent Midas touch)
    if (telemetry.systemState === 'ACTIVE') {
      // In deadzone? Rates are 0
      if (!telemetry.inDeadZone) {
        if (kinematicChannel === 'ROTATION') {
          // Dominant axis rate application:
          // rateX maps to pitch (X rotation), rateY maps to yaw/roll (Y rotation)
          const dt = 0.035;
          const kScale = 0.000035;

          rotationEuler.current.x += telemetry.rateX * kScale * dt * 60;
          rotationEuler.current.y += telemetry.rateY * kScale * dt * 60;

          // Limit pitch to prevent disorientation in surgical theatre
          rotationEuler.current.x = Math.max(-1.4, Math.min(1.4, rotationEuler.current.x));

          vascularGroupRef.current.rotation.x = rotationEuler.current.x;
          vascularGroupRef.current.rotation.y = rotationEuler.current.y;
        } else if (kinematicChannel === 'ZOOM') {
          // In zoom mode: pitch controls zoom magnification factor
          const zoomDelta = telemetry.rateX * 0.00015;
          zoomLevel.current = Math.max(2.2, Math.min(9.0, zoomLevel.current - zoomDelta));
        }
      }
    }
  }, [telemetry, kinematicChannel]);

  // Handle brain envelope toggle
  useEffect(() => {
    if (vascularGroupRef.current) {
      const envelope = vascularGroupRef.current.getObjectByName('brainEnvelope');
      if (envelope) {
        envelope.visible = showBrainEnvelope;
      }
    }
  }, [showBrainEnvelope]);

  const resetViewport = () => {
    rotationEuler.current = { x: 0.3, y: 0.5, z: 0 };
    zoomLevel.current = 5.5;
    if (vascularGroupRef.current) {
      vascularGroupRef.current.rotation.x = 0.3;
      vascularGroupRef.current.rotation.y = 0.5;
      vascularGroupRef.current.rotation.z = 0;
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-140px)] min-h-[580px] bg-[#0A0A0C] rounded-2xl border border-[#23232B] overflow-hidden flex flex-col shadow-2xl">
      {/* Surgical OR Top HUD */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
        <div className="bg-[#121216]/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-[#2A2A35] flex items-center gap-3 shadow-lg">
          <div className="w-2.5 h-2.5 rounded-full bg-opred animate-pulse"></div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">Target Scan</div>
            <div className="text-sm font-bold text-white flex items-center gap-2">
              <span>Cerebral Aneurysm (ICA Bifurcation)</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-opred/20 text-opred border border-opred/40 font-semibold">
                ANR-3.4mm
              </span>
            </div>
          </div>
        </div>

        {/* Live Coordinate / Kinematics Readout */}
        <div className="bg-[#121216]/85 backdrop-blur-md px-3 py-2 rounded-xl border border-[#23232B] font-mono text-xs space-y-1">
          <div className="flex items-center justify-between gap-4 text-slate-400">
            <span>PITCH (θX):</span>
            <span className="text-white font-semibold">
              {(rotationEuler.current.x * (180 / Math.PI)).toFixed(1)}°
            </span>
          </div>
          <div className="flex items-center justify-between gap-4 text-slate-400">
            <span>ROLL (θY):</span>
            <span className="text-white font-semibold">
              {(rotationEuler.current.y * (180 / Math.PI)).toFixed(1)}°
            </span>
          </div>
          <div className="flex items-center justify-between gap-4 text-slate-400">
            <span>DISTANCE:</span>
            <span className="text-opred font-semibold">{zoomLevel.current.toFixed(2)}x</span>
          </div>
          <div className="flex items-center justify-between gap-4 text-slate-400 pt-1 border-t border-[#23232B]">
            <span>AXIS LOCK:</span>
            <span className="text-emerald-400 font-bold">{telemetry.dominantAxis}</span>
          </div>
        </div>
      </div>

      {/* Top Right Channel Indicator & Viewport Controls */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        {/* Active Kinematic Channel Pill */}
        <button
          onClick={onChannelToggle}
          className={`px-3 py-1.5 rounded-xl border font-mono text-xs font-semibold flex items-center gap-1.5 backdrop-blur-md transition-all ${
            kinematicChannel === 'ROTATION'
              ? 'bg-[#14141A]/90 text-white border-opred shadow-lg shadow-opred/20'
              : 'bg-opred text-white border-opred shadow-lg shadow-opred/40'
          }`}
          title="Acoustic Forearm Tap switches Rotation / Zoom"
        >
          {kinematicChannel === 'ROTATION' ? (
            <>
              <Compass className="w-3.5 h-3.5 text-opred" />
              <span>CHANNEL: ROTATE 3D</span>
            </>
          ) : (
            <>
              <ZoomIn className="w-3.5 h-3.5 text-white" />
              <span>CHANNEL: ZOOM FOCUS</span>
            </>
          )}
        </button>

        {/* Brain Envelope Wireframe Toggle */}
        <button
          onClick={() => setShowBrainEnvelope(!showBrainEnvelope)}
          className={`p-2 rounded-xl border backdrop-blur-md transition-all ${
            showBrainEnvelope
              ? 'bg-[#181820]/90 text-white border-[#3A3A48]'
              : 'bg-[#101014]/60 text-slate-500 border-[#23232B]'
          }`}
          title="Toggle Cranial Cortical Envelope"
        >
          <Eye className="w-4 h-4" />
        </button>

        {/* Reset Viewport */}
        <button
          onClick={resetViewport}
          className="p-2 rounded-xl bg-[#14141A]/80 hover:bg-[#202028] text-slate-300 hover:text-white border border-[#2A2A35] backdrop-blur-md transition-colors"
          title="Reset Camera Orientation"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Crosshairs & Reticle Overlay */}
      {showCrosshairs && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
          <div className="relative w-48 h-48 border border-dashed border-opred/30 rounded-full flex items-center justify-center">
            <div className="w-16 h-16 border border-opred/40 rounded-full"></div>
            <div className="absolute w-2 h-2 bg-opred rounded-full"></div>
            <div className="absolute w-full h-[1px] bg-opred/20"></div>
            <div className="absolute h-full w-[1px] bg-opred/20"></div>
            <div className="absolute -top-5 text-[9px] font-mono text-opred/80 tracking-widest uppercase">
              Sterile Reticle · Zero Zone ±3°
            </div>
          </div>
        </div>
      )}

      {/* THREE.JS CANVAS CONTAINER */}
      <div ref={mountRef} className="w-full flex-1 cursor-grab active:cursor-grabbing" />

      {/* Sterile Lock Overlay when System is LOCKED or FAULT */}
      {telemetry.systemState === 'LOCKED' && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] z-30 flex items-center justify-center pointer-events-none transition-all">
          <div className="bg-[#121218]/95 border border-[#2E2E38] rounded-2xl p-6 max-w-md text-center shadow-2xl space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#1C1C24] border border-slate-700 mx-auto flex items-center justify-center text-slate-300">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white tracking-wide uppercase">
              Sterile Display Locked
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Midas touch protection active. Unintentional surgical hand movements will not move the imaging viewport.
            </p>
            <div className="pt-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-opred/10 border border-opred/40 text-opred font-mono text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Forearm Palm-Up Clutch (Hold 2.0s) to Unlock</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FAULT State Critical Warning Banner */}
      {telemetry.systemState === 'FAULT' && (
        <div className="absolute inset-0 bg-red-950/80 backdrop-blur-sm z-30 flex items-center justify-center pointer-events-none transition-all">
          <div className="bg-[#18080A] border-2 border-opred rounded-2xl p-6 max-w-md text-center shadow-2xl space-y-3 animate-pulse">
            <ShieldAlert className="w-12 h-12 text-opred mx-auto" />
            <h3 className="text-lg font-bold text-white tracking-wide uppercase font-mono">
              HARDWARE SAFETY FAULT (&lt;200ms)
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              ARIES v3.0 RISC-V Safety Supervisor triggered autonomous hardware display lock. Packet stall or CRC corruption detected.
            </p>
          </div>
        </div>
      )}

      {/* Bottom Interactive Gesture Simulation Controller Pad */}
      <div className="absolute bottom-3 left-4 right-4 z-20 bg-[#101014]/90 backdrop-blur-md p-3 rounded-xl border border-[#23232B] flex flex-wrap items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-2">
          <div className="text-[11px] font-mono text-slate-400 uppercase flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-opred" />
            <span>Interactive Gesture Simulator:</span>
          </div>
          <span className="text-[10px] text-slate-500 hidden md:inline">
            (Test without wristband hardware)
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* 1. Forearm Palm-Up Clutch */}
          <button
            onClick={onClutchHold}
            className={`px-3 py-1 rounded-lg text-xs font-mono font-medium border transition-all ${
              telemetry.systemState === 'ACTIVE'
                ? 'bg-[#1C1C24] hover:bg-[#252530] text-slate-300 border-slate-700'
                : 'bg-opred hover:bg-opred-hover text-white border-opred glow-subtle'
            }`}
            title="Palm-Up Clutch (Hold 2.0s) -> Unlocks/locks interface"
          >
            {telemetry.systemState === 'ACTIVE' ? '✋ Lock (Clutch 2s)' : '✋ Unlock (Clutch 2s)'}
          </button>

          {/* 2. Rapid Forearm Roll Flick */}
          <button
            onClick={onRollFlick}
            className="px-3 py-1 rounded-lg bg-[#181820] hover:bg-[#22222E] text-slate-200 hover:text-white border border-[#2E2E3C] text-xs font-mono transition-colors"
            title="Rapid Forearm Roll Flick -> Toggle 3D Volume / 2D DICOM"
          >
            🔄 Roll Flick (Toggle 2D/3D)
          </button>

          {/* 3. Acoustic Tap on Forearm */}
          <button
            onClick={onTapGesture}
            className="px-3 py-1 rounded-lg bg-[#181820] hover:bg-[#22222E] text-slate-200 hover:text-white border border-[#2E2E3C] text-xs font-mono transition-colors"
            title="Acoustic Tap -> Toggle Rotation / Zoom"
          >
            👆 Acoustic Tap (Rotate/Zoom)
          </button>

          {/* 4. Neutral Stationary Hold */}
          <button
            onClick={onStationaryHold}
            className="px-3 py-1 rounded-lg bg-[#181820] hover:bg-[#22222E] text-slate-200 hover:text-white border border-[#2E2E3C] text-xs font-mono transition-colors"
            title="Neutral Hold (10s freeze auto safety lock)"
          >
            🛑 Neutral Hold (Freeze)
          </button>

          {/* 5. Watchdog Stall Injection */}
          <button
            onClick={onTriggerWatchdogFault}
            className="px-3 py-1 rounded-lg bg-red-950/60 hover:bg-red-900/80 text-opred hover:text-white border border-opred/40 text-xs font-mono transition-colors"
            title="Inject &gt;200ms packet stall to verify ARIES fail-safe lock"
          >
            ⚠️ Stall Link (&gt;200ms Fault)
          </button>
        </div>
      </div>
    </div>
  );
};
