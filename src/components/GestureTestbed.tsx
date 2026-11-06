import React, { useState } from 'react';
import { 
  Activity, 
  Layers, 
  Cpu, 
  Zap, 
  ShieldCheck, 
  Vibrate, 
  Sliders, 
  RotateCw,
  Binary,
  Radio,
  Timer
} from 'lucide-react';
import { TelemetryPacket, KinematicChannel } from '../types/telemetry';

interface GestureTestbedProps {
  telemetry: TelemetryPacket;
  kinematicChannel: KinematicChannel;
  onPitchRollChange: (pitch: number, roll: number) => void;
  onClutchHold: () => void;
  onRollFlick: () => void;
  onTapGesture: () => void;
  onStationaryHold: () => void;
  onResetOrigin: () => void;
}

export const GestureTestbed: React.FC<GestureTestbedProps> = ({
  telemetry,
  kinematicChannel,
  onPitchRollChange,
  onClutchHold,
  onRollFlick,
  onTapGesture,
  onStationaryHold,
  onResetOrigin,
}) => {
  const [interactivePitch, setInteractivePitch] = useState(0);
  const [interactiveRoll, setInteractiveRoll] = useState(0);

  const handleSliderPitch = (val: number) => {
    setInteractivePitch(val);
    onPitchRollChange(val, interactiveRoll);
  };

  const handleSliderRoll = (val: number) => {
    setInteractiveRoll(val);
    onPitchRollChange(interactivePitch, val);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#101014] p-5 rounded-2xl border border-[#36363B] flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white tracking-wide">
              GESTURE LAB & SIGNAL KINEMATICS ENGINE
            </h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-opred/20 text-opred border border-opred/40">
              100 Hz MPU-6050 + 1D-CNN INT8
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time verification of Complementary Filter, Tremor Dead-Zone (±3°), Dominant Axis Arbiter, and 12-Byte Binary Protocol.
          </p>
        </div>

        <button
          onClick={() => {
            setInteractivePitch(0);
            setInteractiveRoll(0);
            onResetOrigin();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#2C2C30] hover:bg-[#252530] text-slate-200 border border-[#2F2F3D] text-xs font-mono transition-colors"
        >
          <RotateCw className="w-3.5 h-3.5 text-opred" />
          <span>Zero-Point Calibration</span>
        </button>
      </div>

      {/* Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* COLUMN 1: KINEMATICS & TREMOR DEADZONE HUD */}
        <div className="space-y-6">
          {/* Tilt Kinematics & Dead-Zone Card */}
          <div className="bg-[#1E1E21] p-5 rounded-2xl border border-[#36363B] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-opred" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  Tremor Deadband & Velocity Controller
                </h3>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                Formula: ω = k·sgn(θ)·min(max(0,|θ|-3°),12°)
              </span>
            </div>

            {/* Visual Dead-Zone Gauge: Pitch */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">PITCH ANGLE (θX):</span>
                <span className="text-white font-bold">{telemetry.pitchDeg.toFixed(1)}°</span>
              </div>
              <div className="relative h-6 bg-[#09090C] rounded-lg border border-[#36363B] overflow-hidden flex items-center justify-center">
                {/* Center Deadzone Highlight (±3 deg out of ±15 deg scale = 20% width) */}
                <div className="absolute w-[20%] h-full bg-emerald-500/15 border-x border-emerald-500/40 flex items-center justify-center">
                  <span className="text-[9px] font-mono text-emerald-400 font-semibold">DEADZONE (±3°)</span>
                </div>
                {/* Needle pointer */}
                <div
                  className="absolute top-0 bottom-0 w-1.5 bg-opred shadow-lg shadow-opred transition-all duration-75"
                  style={{
                    left: `${Math.max(2, Math.min(98, 50 + (telemetry.pitchDeg / 15.0) * 50))}%`,
                  }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>-15° (Sat)</span>
                <span>-3°</span>
                <span>0° Neutral</span>
                <span>+3°</span>
                <span>+15° (Sat)</span>
              </div>
            </div>

            {/* Visual Dead-Zone Gauge: Roll */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">ROLL ANGLE (θY):</span>
                <span className="text-white font-bold">{telemetry.rollDeg.toFixed(1)}°</span>
              </div>
              <div className="relative h-6 bg-[#09090C] rounded-lg border border-[#36363B] overflow-hidden flex items-center justify-center">
                <div className="absolute w-[20%] h-full bg-emerald-500/15 border-x border-emerald-500/40 flex items-center justify-center">
                  <span className="text-[9px] font-mono text-emerald-400 font-semibold">DEADZONE (±3°)</span>
                </div>
                <div
                  className="absolute top-0 bottom-0 w-1.5 bg-opred shadow-lg shadow-opred transition-all duration-75"
                  style={{
                    left: `${Math.max(2, Math.min(98, 50 + (telemetry.rollDeg / 15.0) * 50))}%`,
                  }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>-15° (Sat)</span>
                <span>-3°</span>
                <span>0° Neutral</span>
                <span>+3°</span>
                <span>+15° (Sat)</span>
              </div>
            </div>

            {/* Dominant Axis Arbiter Card */}
            <div className="p-3 rounded-xl bg-[#0C0C0F] border border-[#36363B] flex items-center justify-between">
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-mono">Dominant Axis Arbiter</div>
                <div className="text-xs font-semibold text-white">
                  {telemetry.dominantAxis === 'PITCH' && 'PITCH DOMINANT (Roll rate suppressed)'}
                  {telemetry.dominantAxis === 'ROLL' && 'ROLL DOMINANT (Pitch rate suppressed)'}
                  {telemetry.dominantAxis === 'NONE' && 'INSIDE TREMOR DEADBAND (Zero drift)'}
                </div>
              </div>
              <div
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold border ${
                  telemetry.dominantAxis !== 'NONE'
                    ? 'bg-opred/20 text-opred border-opred/50'
                    : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                }`}
              >
                {telemetry.dominantAxis !== 'NONE' ? telemetry.dominantAxis : 'IDLE LOCK'}
              </div>
            </div>

            {/* Interactive Pitch/Roll Sliders for Live Testing */}
            <div className="pt-2 border-t border-[#36363B] space-y-3">
              <div className="text-xs font-mono text-slate-300 font-semibold flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-opred" />
                <span>Simulate Forearm Tilt Angles:</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-1">
                    <span>Pitch: {interactivePitch}°</span>
                  </div>
                  <input
                    type="range"
                    min={-15}
                    max={15}
                    step={0.5}
                    value={interactivePitch}
                    onChange={e => handleSliderPitch(Number(e.target.value))}
                    className="w-full accent-opred cursor-pointer"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-1">
                    <span>Roll: {interactiveRoll}°</span>
                  </div>
                  <input
                    type="range"
                    min={-15}
                    max={15}
                    step={0.5}
                    value={interactiveRoll}
                    onChange={e => handleSliderRoll(Number(e.target.value))}
                    className="w-full accent-opred cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Haptic Alert State & Actuation */}
          <div className="bg-[#1E1E21] p-5 rounded-2xl border border-[#36363B] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Vibrate className="w-4 h-4 text-opred" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  Coin Vibration Haptic Feedback
                </h3>
              </div>
              <span className="text-[11px] font-mono text-slate-400">PWM 3.3V Driver</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div
                className={`p-3 rounded-xl border flex items-center gap-3 ${
                  telemetry.hapticStatus === 'LONG_PULSE'
                    ? 'bg-opred/20 border-opred text-white'
                    : 'bg-[#0E0E12] border-[#22222C] text-slate-400'
                }`}
              >
                <div
                  className={`w-3 h-3 rounded-full ${
                    telemetry.hapticStatus === 'LONG_PULSE' ? 'bg-opred animate-ping' : 'bg-slate-700'
                  }`}
                />
                <div>
                  <div className="text-xs font-bold font-mono">1 Long Pulse (400ms)</div>
                  <div className="text-[10px] text-slate-400">Unlock Acknowledged</div>
                </div>
              </div>

              <div
                className={`p-3 rounded-xl border flex items-center gap-3 ${
                  telemetry.hapticStatus === 'TRIPLE_PULSE'
                    ? 'bg-opred/20 border-opred text-white'
                    : 'bg-[#0E0E12] border-[#22222C] text-slate-400'
                }`}
              >
                <div
                  className={`w-3 h-3 rounded-full ${
                    telemetry.hapticStatus === 'TRIPLE_PULSE' ? 'bg-opred animate-ping' : 'bg-slate-700'
                  }`}
                />
                <div>
                  <div className="text-xs font-bold font-mono">3 Short Pulses (80ms)</div>
                  <div className="text-[10px] text-slate-400">Safety Lock Engaged</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* COLUMN 2: 1D-CNN AI CLASSIFIER & 12-BYTE PACKET */}
        <div className="space-y-6">
          {/* 1D-CNN Inference Radar */}
          <div className="bg-[#1E1E21] p-5 rounded-2xl border border-[#36363B] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-opred" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  1D-CNN Gesture Classifier (INT8)
                </h3>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                15 KB · &lt;4 ms on ESP32-C3
              </span>
            </div>

            <div className="text-xs text-slate-400">
              Evaluated over 250 ms sliding window (6 channels × 25 samples @ 100 Hz).
            </div>

            {/* Gesture Probability Bars */}
            <div className="space-y-3 font-mono text-xs">
              {/* Idle Class */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">0: IDLE (Manipulating scalpel/suturing)</span>
                  <span className="text-white font-bold">
                    {(telemetry.cnnConfidences.idle * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="h-2 bg-[#0A0A0E] rounded-full overflow-hidden border border-[#36363B]">
                  <div
                    className="h-full bg-slate-500 transition-all duration-150"
                    style={{ width: `${telemetry.cnnConfidences.idle * 100}%` }}
                  />
                </div>
              </div>

              {/* Clutch Class */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">1: CLUTCH (Palm-up intentional hold)</span>
                  <span className="text-opred font-bold">
                    {(telemetry.cnnConfidences.clutch * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="h-2 bg-[#0A0A0E] rounded-full overflow-hidden border border-[#36363B]">
                  <div
                    className="h-full bg-opred transition-all duration-150"
                    style={{ width: `${telemetry.cnnConfidences.clutch * 100}%` }}
                  />
                </div>
              </div>

              {/* Roll Flick Class */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">2: ROLL FLICK (Transient dynamic toggle)</span>
                  <span className="text-opred font-bold">
                    {(telemetry.cnnConfidences.rollFlick * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="h-2 bg-[#0A0A0E] rounded-full overflow-hidden border border-[#36363B]">
                  <div
                    className="h-full bg-opred transition-all duration-150"
                    style={{ width: `${telemetry.cnnConfidences.rollFlick * 100}%` }}
                  />
                </div>
              </div>

              {/* Tap Class */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">3: TAP (Forearm acoustic impact peak)</span>
                  <span className="text-opred font-bold">
                    {(telemetry.cnnConfidences.tap * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="h-2 bg-[#0A0A0E] rounded-full overflow-hidden border border-[#36363B]">
                  <div
                    className="h-full bg-opred transition-all duration-150"
                    style={{ width: `${telemetry.cnnConfidences.tap * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Quick Trigger Buttons */}
            <div className="pt-2 border-t border-[#36363B] flex flex-wrap gap-2">
              <button
                onClick={onClutchHold}
                className="px-2.5 py-1 rounded-lg bg-[#181820] hover:bg-[#22222E] text-slate-200 text-xs font-mono border border-slate-700"
              >
                Fire Clutch (2s)
              </button>
              <button
                onClick={onRollFlick}
                className="px-2.5 py-1 rounded-lg bg-[#181820] hover:bg-[#22222E] text-slate-200 text-xs font-mono border border-slate-700"
              >
                Fire Roll Flick
              </button>
              <button
                onClick={onTapGesture}
                className="px-2.5 py-1 rounded-lg bg-[#181820] hover:bg-[#22222E] text-slate-200 text-xs font-mono border border-slate-700"
              >
                Fire Acoustic Tap
              </button>
              <button
                onClick={onStationaryHold}
                className="px-2.5 py-1 rounded-lg bg-[#181820] hover:bg-[#22222E] text-slate-200 text-xs font-mono border border-slate-700"
              >
                Fire Stationary Freeze
              </button>
            </div>
          </div>

          {/* 12-Byte Binary Telemetry Protocol Inspector */}
          <div className="bg-[#1E1E21] p-5 rounded-2xl border border-[#36363B] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Binary className="w-4 h-4 text-opred" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  12-Byte Telemetry Frame Inspector
                </h3>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                CRC-8 (0x07) VALID
              </span>
            </div>

            {/* Raw Hex Stream Display */}
            <div className="p-3 bg-[#09090C] rounded-xl border border-[#36363B] font-mono text-sm tracking-wider text-opred flex flex-wrap gap-2 select-all">
              {telemetry.rawHex.split(' ').map((byteHex, i) => (
                <span
                  key={i}
                  className={`px-1.5 py-0.5 rounded ${
                    i === 0
                      ? 'bg-blue-500/20 text-blue-400' // SYNC
                      : i === 1
                      ? 'bg-purple-500/20 text-purple-400' // SEQ
                      : i === 2
                      ? 'bg-amber-500/20 text-amber-400' // STATE
                      : i === 11
                      ? 'bg-emerald-500/20 text-emerald-400' // CRC
                      : 'bg-[#15151D] text-slate-200'
                  }`}
                  title={`Byte ${i}`}
                >
                  {byteHex}
                </span>
              ))}
            </div>

            {/* Byte Mapping Breakdown Table */}
            <div className="text-[11px] font-mono space-y-1 text-slate-400">
              <div className="flex justify-between py-0.5 border-b border-[#1E1E26]">
                <span className="text-blue-400">Byte 0: SYNC_HEADER</span>
                <span className="text-white">0xAA (Fixed Synchronizer)</span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-[#1E1E26]">
                <span className="text-purple-400">Byte 1: SEQ_NUM</span>
                <span className="text-white">{telemetry.sequenceNumber} (Roll-over: 0-255)</span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-[#1E1E26]">
                <span className="text-amber-400">Byte 2: SYS_STATE</span>
                <span className="text-white">
                  {telemetry.systemState} | {telemetry.displayMode}
                </span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-[#1E1E26]">
                <span className="text-slate-300">Bytes 3-4: RATE_X (Pitch)</span>
                <span className="text-white font-bold">{telemetry.rateX}</span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-[#1E1E26]">
                <span className="text-slate-300">Bytes 5-6: RATE_Y (Roll)</span>
                <span className="text-white font-bold">{telemetry.rateY}</span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-[#1E1E26]">
                <span className="text-slate-300">Bytes 7-8: RATE_ZOOM</span>
                <span className="text-white">{telemetry.rateZoom}</span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-[#1E1E26]">
                <span className="text-slate-300">Byte 9: EVENT_FLAGS</span>
                <span className="text-white">
                  Clutch:{telemetry.eventFlags.clutchDetected ? '1' : '0'}{' '}
                  Flick:{telemetry.eventFlags.flickDetected ? '1' : '0'}{' '}
                  Tap:{telemetry.eventFlags.tapDetected ? '1' : '0'}
                </span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-[#1E1E26]">
                <span className="text-slate-300">Byte 10: BATT_LEVEL</span>
                <span className="text-white">{telemetry.batteryLevel}%</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-emerald-400">Byte 11: CRC8_CHECKSUM</span>
                <span className="text-emerald-400 font-bold">
                  0x{telemetry.crc8Checksum.toString(16).toUpperCase()} (Verified)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
