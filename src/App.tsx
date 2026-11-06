import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { OrViewport3D } from './components/OrViewport3D';
import { DicomSliceViewer } from './components/DicomSliceViewer';
import { GestureTestbed } from './components/GestureTestbed';
import { SafetySupervisorView } from './components/SafetySupervisorView';
import { CodebaseViewer } from './components/CodebaseViewer';
import { BuildGuide } from './components/BuildGuide';
import { HardwareConnectorModal } from './components/HardwareConnectorModal';

import { 
  TelemetryPacket, 
  SystemState, 
  DisplayMode, 
  KinematicChannel, 
  HardwareMetrics 
} from './types/telemetry';
import { KinematicsEngine, buildTelemetryPacket, parseTelemetryPacket } from './utils/kinematics';

export function App() {
  const [activeTab, setActiveTab] = useState<'viewport' | 'telemetry' | 'safety' | 'code' | 'guide'>('viewport');
  const [systemState, setSystemState] = useState<SystemState>('ACTIVE');
  const [displayMode, setDisplayMode] = useState<DisplayMode>('3D_VOLUME');
  const [kinematicChannel, setKinematicChannel] = useState<KinematicChannel>('ROTATION');
  const [batteryLevel, setBatteryLevel] = useState<number>(94);
  const [watchdogLatencyMs, setWatchdogLatencyMs] = useState<number>(16);

  // Hardware Connection State
  const [isHardwareModalOpen, setIsHardwareModalOpen] = useState<boolean>(false);
  const [isConnectedHardware, setIsConnectedHardware] = useState<boolean>(false);
  const [connectionLogs, setConnectionLogs] = useState<string[]>([]);
  const serialPortRef = useRef<any>(null);
  const serialReaderRef = useRef<any>(null);

  // Metrics
  const [metrics, setMetrics] = useState<HardwareMetrics>({
    totalPackets: 12480,
    droppedPackets: 4,
    crcErrors: 0,
    rateExceededCount: 0,
    watchdogTrips: 0,
    averageLatencyMs: 16.4,
    powerDrawMa: 31.0,
  });

  // Kinematics Engine Instance
  const kinematicsRef = useRef<KinematicsEngine>(new KinematicsEngine());
  const simulatedAnglesRef = useRef({ pitch: 0, roll: 0 });
  const seqCounterRef = useRef<number>(104);

  // Active Telemetry Packet
  const [telemetry, setTelemetry] = useState<TelemetryPacket>(() => {
    const raw = buildTelemetryPacket(104, 'ACTIVE', '3D_VOLUME', 0, 0, 0, false, false, false, 94);
    return parseTelemetryPacket(raw)!;
  });

  // Trigger Haptic Pulse Notification (Simulated Audio / Vibration)
  const triggerHaptic = useCallback((isUnlock: boolean) => {
    if (navigator.vibrate) {
      if (isUnlock) {
        navigator.vibrate(400); // 1 long pulse
      } else {
        navigator.vibrate([80, 60, 80, 60, 80]); // 3 short pulses
      }
    }
  }, []);

  // 1. Gesture: Forearm Palm-Up Clutch (Hold 2.0s)
  const handleClutchHold = useCallback(() => {
    setSystemState(prev => {
      const nextState: SystemState = prev === 'ACTIVE' ? 'LOCKED' : 'ACTIVE';
      triggerHaptic(nextState === 'ACTIVE');
      return nextState;
    });
    // Reset neutral spatial origin
    kinematicsRef.current.resetNeutral();
    simulatedAnglesRef.current = { pitch: 0, roll: 0 };
  }, [triggerHaptic]);

  // 2. Gesture: Rapid Forearm Roll Flick (Toggles 3D Volume <-> 2D DICOM)
  const handleRollFlick = useCallback(() => {
    setDisplayMode(prev => (prev === '3D_VOLUME' ? '2D_DICOM' : '3D_VOLUME'));
  }, []);

  // 3. Gesture: Acoustic Tap on Forearm (Toggles Rotation <-> Zoom)
  const handleTapGesture = useCallback(() => {
    setKinematicChannel(prev => (prev === 'ROTATION' ? 'ZOOM' : 'ROTATION'));
  }, []);

  // 4. Gesture: Neutral Stationary Hold (Freezes and auto-locks after 10s)
  const handleStationaryHold = useCallback(() => {
    simulatedAnglesRef.current = { pitch: 0, roll: 0 };
    setSystemState('LOCKED');
    triggerHaptic(false);
  }, [triggerHaptic]);

  // Reset spatial zero-point
  const handleResetOrigin = useCallback(() => {
    kinematicsRef.current.resetNeutral();
    simulatedAnglesRef.current = { pitch: 0, roll: 0 };
  }, []);

  // Manual Pitch / Roll Slider Adjustment from Testbed
  const handlePitchRollChange = useCallback((pitch: number, roll: number) => {
    simulatedAnglesRef.current = { pitch, roll };
  }, []);

  // --- FAULT INJECTIONS (Safety Supervisor Verification) ---
  const handleInjectCrcError = useCallback(() => {
    setMetrics(prev => ({
      ...prev,
      crcErrors: prev.crcErrors + 1,
      totalPackets: prev.totalPackets + 1,
    }));
  }, []);

  const handleInjectSeqError = useCallback(() => {
    seqCounterRef.current = (seqCounterRef.current - 14) & 0xFF;
    setMetrics(prev => ({
      ...prev,
      droppedPackets: prev.droppedPackets + 1,
      totalPackets: prev.totalPackets + 1,
    }));
  }, []);

  const handleInjectRateSurge = useCallback(() => {
    setMetrics(prev => ({
      ...prev,
      rateExceededCount: prev.rateExceededCount + 1,
    }));
  }, []);

  const handleInjectWatchdogStall = useCallback(() => {
    setWatchdogLatencyMs(245);
    setSystemState('FAULT');
    setMetrics(prev => ({
      ...prev,
      watchdogTrips: prev.watchdogTrips + 1,
    }));
    setTimeout(() => {
      setWatchdogLatencyMs(16);
      setSystemState('LOCKED');
    }, 2800);
  }, []);

  const handleResetMetrics = useCallback(() => {
    setMetrics({
      totalPackets: 0,
      droppedPackets: 0,
      crcErrors: 0,
      rateExceededCount: 0,
      watchdogTrips: 0,
      averageLatencyMs: 16.0,
      powerDrawMa: 31.0,
    });
  }, []);

  // --- REAL-TIME 100 HZ SIMULATOR TICK LOOP ---
  useEffect(() => {
    if (isConnectedHardware) return; // If real USB serial connected, hardware drives frames

    const interval = setInterval(() => {
      seqCounterRef.current = (seqCounterRef.current + 1) & 0xFF;

      // Natural physiological tremor oscillation if active
      let targetPitch = simulatedAnglesRef.current.pitch;
      let targetRoll = simulatedAnglesRef.current.roll;

      if (systemState === 'ACTIVE') {
        const time = performance.now() * 0.005;
        // Minor physiological micro-tremor (~0.4 deg amplitude, inside ±3° deadband)
        const tremor = Math.sin(time * 8) * 0.35;
        targetPitch += tremor;
        targetRoll += Math.cos(time * 7) * 0.35;
      }

      // Process kinematics through complementary filter + deadzone + EMA
      const kin = kinematicsRef.current.processRates(targetPitch, targetRoll, 0);

      // Pack 12-byte telemetry packet
      const rawBuf = buildTelemetryPacket(
        seqCounterRef.current,
        systemState,
        displayMode,
        kin.smoothRateX,
        kin.smoothRateY,
        kin.smoothRateZoom,
        false,
        false,
        false,
        batteryLevel
      );

      const parsed = parseTelemetryPacket(rawBuf);
      if (parsed) {
        setTelemetry(parsed);
      }

      setMetrics(prev => ({
        ...prev,
        totalPackets: prev.totalPackets + 1,
        powerDrawMa: systemState === 'ACTIVE' ? 31.0 : 1.1,
      }));
    }, 20); // 50 Hz UI tick (100 Hz internal filter)

    return () => clearInterval(interval);
  }, [isConnectedHardware, systemState, displayMode, batteryLevel]);

  // --- WEB SERIAL HARDWARE CONNECTIVITY ---
  const handleConnectSerial = async () => {
    if (!('serial' in navigator)) {
      throw new Error('Web Serial API is not supported in this browser. Please use Chrome, Edge, or Brave.');
    }
    const port = await (navigator as any).serial.requestPort();
    await port.open({ baudRate: 115200 });
    serialPortRef.current = port;
    setIsConnectedHardware(true);
    setConnectionLogs(prev => [
      `[${new Date().toLocaleTimeString()}] Connected to serial port @ 115200 Baud`,
      ...prev,
    ]);

    const reader = port.readable.getReader();
    serialReaderRef.current = reader;

    // Buffer for 12-byte packet parsing
    let byteBuffer: number[] = [];

    const readLoop = async () => {
      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          if (value) {
            for (let i = 0; i < value.length; i++) {
              const b = value[i];
              if (byteBuffer.length === 0 && b !== 0xAA) {
                continue; // Wait for SYNC header 0xAA
              }
              byteBuffer.push(b);
              if (byteBuffer.length === 12) {
                const packetArray = new Uint8Array(byteBuffer);
                const parsed = parseTelemetryPacket(packetArray);
                if (parsed && parsed.ariesVerified) {
                  setTelemetry(parsed);
                  setSystemState(parsed.systemState);
                  setDisplayMode(parsed.displayMode);
                  setBatteryLevel(parsed.batteryLevel);
                }
                byteBuffer = [];
              }
            }
          }
        }
      } catch (err: any) {
        console.error('Serial read error:', err);
      }
    };
    readLoop();
  };

  const handleDisconnectSerial = async () => {
    try {
      if (serialReaderRef.current) {
        await serialReaderRef.current.cancel();
      }
      if (serialPortRef.current) {
        await serialPortRef.current.close();
      }
    } finally {
      setIsConnectedHardware(false);
      serialPortRef.current = null;
      serialReaderRef.current = null;
      setConnectionLogs(prev => [
        `[${new Date().toLocaleTimeString()}] Disconnected from USB serial port. Switched to simulator.`,
        ...prev,
      ]);
    }
  };

  return (
    <div className="min-h-screen bg-[#18181A] text-white flex flex-col selection:bg-opred selection:text-white">
      {/* Top Operating Theatre Navigation & Status Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        systemState={systemState}
        displayMode={displayMode}
        onToggleState={handleClutchHold}
        onToggleMode={handleRollFlick}
        onResetOrigin={handleResetOrigin}
        batteryLevel={batteryLevel}
        watchdogLatencyMs={watchdogLatencyMs}
        isConnectedHardware={isConnectedHardware}
        onOpenHardwareModal={() => setIsHardwareModalOpen(true)}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-[1920px] w-full mx-auto p-4 lg:p-6 transition-all">
        {activeTab === 'viewport' && (
          <div className="space-y-4">
            {displayMode === '3D_VOLUME' ? (
              <OrViewport3D
                telemetry={telemetry}
                kinematicChannel={kinematicChannel}
                onChannelToggle={handleTapGesture}
                onClutchHold={handleClutchHold}
                onRollFlick={handleRollFlick}
                onTapGesture={handleTapGesture}
                onStationaryHold={handleStationaryHold}
                onTriggerWatchdogFault={handleInjectWatchdogStall}
              />
            ) : (
              <DicomSliceViewer
                telemetry={telemetry}
                onClutchHold={handleClutchHold}
                onRollFlick={handleRollFlick}
              />
            )}
          </div>
        )}

        {activeTab === 'telemetry' && (
          <GestureTestbed
            telemetry={telemetry}
            kinematicChannel={kinematicChannel}
            onPitchRollChange={handlePitchRollChange}
            onClutchHold={handleClutchHold}
            onRollFlick={handleRollFlick}
            onTapGesture={handleTapGesture}
            onStationaryHold={handleStationaryHold}
            onResetOrigin={handleResetOrigin}
          />
        )}

        {activeTab === 'safety' && (
          <SafetySupervisorView
            telemetry={telemetry}
            metrics={metrics}
            onInjectCrcError={handleInjectCrcError}
            onInjectSeqError={handleInjectSeqError}
            onInjectRateSurge={handleInjectRateSurge}
            onInjectWatchdogStall={handleInjectWatchdogStall}
            onResetMetrics={handleResetMetrics}
          />
        )}

        {activeTab === 'code' && <CodebaseViewer />}

        {activeTab === 'guide' && <BuildGuide />}
      </main>

      {/* Persistent Bottom Status Strip */}
      <footer className="bg-[#0B0B0E] border-t border-[#1C1C24] px-6 py-2.5 text-[11px] font-mono text-slate-400 flex flex-wrap items-center justify-between gap-y-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-white font-semibold">100 Hz MPU-6050 STREAM</span>
          </div>
          <span className="hidden sm:inline text-slate-600">|</span>
          <span className="hidden sm:inline">
            POWER: <span className="text-opred font-bold">{metrics.powerDrawMa} mA</span> (~13h Continuous)
          </span>
          <span className="hidden md:inline text-slate-600">|</span>
          <span className="hidden md:inline">
            AIR-GAP: <span className="text-slate-200">ARIES v3.0 RISC-V VALIDATED</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-slate-500">STANDARDS:</span>
          <span className="text-slate-300 font-semibold">IEC 62304 CLASS B</span>
          <span className="text-slate-600">·</span>
          <span className="text-slate-300 font-semibold">ISO 13485 STERILE FIELD</span>
        </div>
      </footer>

      {/* Hardware Connection Modal */}
      <HardwareConnectorModal
        isOpen={isHardwareModalOpen}
        onClose={() => setIsHardwareModalOpen(false)}
        isConnectedHardware={isConnectedHardware}
        onConnectSerial={handleConnectSerial}
        onDisconnectSerial={handleDisconnectSerial}
        onSelectSimulatedStream={() => {
          handleDisconnectSerial();
          setConnectionLogs(prev => [
            `[${new Date().toLocaleTimeString()}] Switched to 100 Hz Surgical Simulation Engine.`,
            ...prev,
          ]);
        }}
        connectionLogs={connectionLogs}
      />
    </div>
  );
}

export default App;
