import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Cpu, 
  Wifi, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Play, 
  RotateCcw,
  Sliders,
  Radio,
  Lock,
  ArrowRight
} from 'lucide-react';
import { TelemetryPacket, HardwareMetrics } from '../types/telemetry';

interface SafetySupervisorViewProps {
  telemetry: TelemetryPacket;
  metrics: HardwareMetrics;
  onInjectCrcError: () => void;
  onInjectSeqError: () => void;
  onInjectRateSurge: () => void;
  onInjectWatchdogStall: () => void;
  onResetMetrics: () => void;
}

export const SafetySupervisorView: React.FC<SafetySupervisorViewProps> = ({
  telemetry,
  metrics,
  onInjectCrcError,
  onInjectSeqError,
  onInjectRateSurge,
  onInjectWatchdogStall,
  onResetMetrics,
}) => {
  const [governorThreshold, setGovernorThreshold] = useState(2500); // Max rate allowed

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#101014] p-5 rounded-2xl border border-[#36363B] flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-opred" />
            <h2 className="text-lg font-bold text-white tracking-wide">
              ARIES v3.0 RISC-V SAFETY SUPERVISOR
            </h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-opred/20 text-opred border border-opred/40 font-semibold">
              VEGA ET1031 INDIGENOUS CORE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Air-gapped clinical authority executing packet validation, sequence order verification, angular rate governor, and 200 ms autonomous hardware failsafe.
          </p>
        </div>

        <button
          onClick={onResetMetrics}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#181820] hover:bg-[#22222E] text-slate-300 border border-[#2A2A38] text-xs font-mono transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5 text-opred" />
          <span>Reset Safety Telemetry</span>
        </button>
      </div>

      {/* Hardware Safety Pipeline Flowchart */}
      <div className="bg-[#1E1E21] p-6 rounded-2xl border border-[#36363B] space-y-4">
        <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider font-semibold">
          Isolated Hardware Security Boundary (Air-Gapped critical path)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          {/* Node 1: Edge Wristband */}
          <div className="p-4 rounded-xl bg-[#0B0B0E] border border-[#262633] space-y-2 relative">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Unit 1: Transmitter</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            </div>
            <div className="text-sm font-bold text-white">Edge Wristband</div>
            <div className="text-[11px] font-mono text-slate-400 space-y-0.5">
              <div>• ESP32-C3 MCU (160MHz)</div>
              <div>• MPU-6050 IMU @ 100 Hz</div>
              <div>• 1D-CNN INT8 Quantized</div>
              <div className="text-opred font-semibold">• 31 mA Active / 1.1 mA Locked</div>
            </div>
          </div>

          {/* Node 2: Base Station RX */}
          <div className="p-4 rounded-xl bg-[#0B0B0E] border border-[#262633] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Unit 2: RF Receiver</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            </div>
            <div className="text-sm font-bold text-white">ESP32-C3 Base Station</div>
            <div className="text-[11px] font-mono text-slate-400 space-y-0.5">
              <div>• ESP-NOW 2.4 GHz Link</div>
              <div>• Zero-Buffer Bridge</div>
              <div>• Hardware UART Out</div>
              <div className="text-slate-300">• Baud: 115,200 8N1</div>
            </div>
          </div>

          {/* Node 3: ARIES v3.0 RISC-V Safety Supervisor */}
          <div className="p-4 rounded-xl bg-[#140E10] border-2 border-opred space-y-2 relative shadow-lg shadow-opred/10">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-opred font-bold uppercase">Safety Authority</span>
              <ShieldCheck className="w-3.5 h-3.5 text-opred" />
            </div>
            <div className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>ARIES v3.0 Board</span>
            </div>
            <div className="text-[11px] font-mono text-slate-300 space-y-0.5">
              <div className="text-white font-semibold">• VEGA ET1031 RISC-V</div>
              <div>• CRC-8 (0x07) Table Check</div>
              <div>• Monotonic Sequence Guard</div>
              <div className="text-opred font-bold">• 200 ms Hard Watchdog</div>
            </div>
          </div>

          {/* Node 4: Host OR Display */}
          <div className="p-4 rounded-xl bg-[#0B0B0E] border border-[#262633] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Unit 3: Presentation</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            </div>
            <div className="text-sm font-bold text-white">OR Display Host</div>
            <div className="text-[11px] font-mono text-slate-400 space-y-0.5">
              <div>• Three.js 3D Vascular</div>
              <div>• DICOM 2D CT/MRI Viewer</div>
              <div>• Zero-Latency WebGL</div>
              <div className="text-emerald-400 font-semibold">• Latency: &lt;100 ms E2E</div>
            </div>
          </div>
        </div>
      </div>

      {/* Safety Supervisor Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Watchdog Timer Status */}
        <div className="bg-[#1E1E21] p-4 rounded-xl border border-[#36363B] space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>WATCHDOG TIMER</span>
            <Clock className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {telemetry.watchdogLatencyMs} <span className="text-xs text-slate-400">ms</span>
          </div>
          <div className="text-[11px] font-mono text-slate-400">
            Trip limit: <span className="text-opred font-semibold">200 ms</span>
          </div>
        </div>

        {/* CRC-8 Health */}
        <div className="bg-[#1E1E21] p-4 rounded-xl border border-[#36363B] space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>CRC-8 PASS RATE</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {metrics.totalPackets > 0
              ? (((metrics.totalPackets - metrics.crcErrors) / metrics.totalPackets) * 100).toFixed(2)
              : '100.0'}
            %
          </div>
          <div className="text-[11px] font-mono text-slate-400">
            Dropped: <span className="text-opred">{metrics.crcErrors}</span> frames
          </div>
        </div>

        {/* Angular Rate Governor */}
        <div className="bg-[#1E1E21] p-4 rounded-xl border border-[#36363B] space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>RATE GOVERNOR</span>
            <ShieldCheck className="w-4 h-4 text-opred" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {metrics.rateExceededCount} <span className="text-xs text-slate-400">clamped</span>
          </div>
          <div className="text-[11px] font-mono text-slate-400">
            Limit: <span className="text-slate-300">±45°/s max spin</span>
          </div>
        </div>

        {/* Total Verified Frames */}
        <div className="bg-[#1E1E21] p-4 rounded-xl border border-[#36363B] space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>TOTAL FRAMES</span>
            <Cpu className="w-4 h-4 text-opred" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {metrics.totalPackets.toLocaleString()}
          </div>
          <div className="text-[11px] font-mono text-emerald-400">
            Pass criteria: &lt;1 false / 30 min
          </div>
        </div>
      </div>

      {/* Clinical Fault Injection Test Suite */}
      <div className="bg-[#1E1E21] p-6 rounded-2xl border border-[#36363B] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-opred" />
              <span>Clinical Safety Fault Injection Suite</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Demonstrate adherence to clinical benchmark: autonomous display lock within &lt;200 ms of sensor, packet, or link fault.
            </p>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-red-950/60 text-opred border border-opred/40 font-semibold">
            FAILSAFE VERIFICATION
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Fault 1: CRC-8 Checksum Corruption */}
          <div className="p-4 rounded-xl bg-[#0E0E12] border border-[#36363B] space-y-3 flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
                <span className="text-opred">01.</span> Corrupt CRC-8
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Fips bit 7 in Byte 11. Simulates electromagnetic interference or radio noise in the OR.
              </p>
            </div>
            <button
              onClick={onInjectCrcError}
              className="w-full py-2 px-3 rounded-lg bg-[#181822] hover:bg-opred hover:text-white text-slate-200 border border-slate-700 text-xs font-mono font-medium transition-colors"
            >
              Trigger CRC Fault
            </button>
          </div>

          {/* Fault 2: Out of Order Sequence */}
          <div className="p-4 rounded-xl bg-[#0E0E12] border border-[#36363B] space-y-3 flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
                <span className="text-opred">02.</span> Duplicate / Skewed SEQ
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Jumps sequence number backward by 12 frames to verify ARIES monotonic order rejection.
              </p>
            </div>
            <button
              onClick={onInjectSeqError}
              className="w-full py-2 px-3 rounded-lg bg-[#181822] hover:bg-opred hover:text-white text-slate-200 border border-slate-700 text-xs font-mono font-medium transition-colors"
            >
              Trigger Sequence Fault
            </button>
          </div>

          {/* Fault 3: Angular Rate Surge */}
          <div className="p-4 rounded-xl bg-[#0E0E12] border border-[#36363B] space-y-3 flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
                <span className="text-opred">03.</span> Angular Rate Surge
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Injects 32,767 max int16 angular surge. Verifies ARIES rate governor clamps speed to safe limits.
              </p>
            </div>
            <button
              onClick={onInjectRateSurge}
              className="w-full py-2 px-3 rounded-lg bg-[#181822] hover:bg-opred hover:text-white text-slate-200 border border-slate-700 text-xs font-mono font-medium transition-colors"
            >
              Trigger Rate Surge
            </button>
          </div>

          {/* Fault 4: 250ms Watchdog Stall */}
          <div className="p-4 rounded-xl bg-[#180A0D] border border-opred/50 space-y-3 flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
                <span className="text-opred">04.</span> 250ms RF Stall (&gt;200ms)
              </div>
              <p className="text-[11px] text-slate-300 mt-1">
                Cuts telemetry for 250ms. Proves display freezes into HARDWARE LOCK in under 200 ms.
              </p>
            </div>
            <button
              onClick={onInjectWatchdogStall}
              className="w-full py-2 px-3 rounded-lg bg-opred hover:bg-opred-hover text-white text-xs font-mono font-bold transition-all shadow-md shadow-opred/30"
            >
              Simulate Disconnect (&lt;200ms Lock)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
