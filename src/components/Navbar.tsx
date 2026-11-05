import React from 'react';
import { 
  ShieldCheck, 
  Activity, 
  Layers, 
  Cpu, 
  FileCode2, 
  BookOpen, 
  Usb, 
  Battery, 
  BatteryCharging, 
  Lock, 
  Unlock, 
  AlertTriangle,
  RotateCw
} from 'lucide-react';
import { SystemState, DisplayMode } from '../types/telemetry';

interface NavbarProps {
  activeTab: 'viewport' | 'telemetry' | 'safety' | 'code' | 'guide';
  setActiveTab: (tab: 'viewport' | 'telemetry' | 'safety' | 'code' | 'guide') => void;
  systemState: SystemState;
  displayMode: DisplayMode;
  onToggleState: () => void;
  onToggleMode: () => void;
  onResetOrigin: () => void;
  batteryLevel: number;
  watchdogLatencyMs: number;
  isConnectedHardware: boolean;
  onOpenHardwareModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  systemState,
  displayMode,
  onToggleState,
  onToggleMode,
  onResetOrigin,
  batteryLevel,
  watchdogLatencyMs,
  isConnectedHardware,
  onOpenHardwareModal
}) => {
  const getStateColor = (state: SystemState) => {
    switch (state) {
      case 'ACTIVE':
        return 'bg-opred/20 text-opred border-opred/60 animate-pulse';
      case 'LOCKED':
        return 'bg-slate-800 text-slate-300 border-slate-700';
      case 'PAUSED':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/50';
      case 'FAULT':
        return 'bg-red-950 text-red-500 border-red-600 animate-pulse';
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0A0A0C]/90 backdrop-blur-md border-b border-[#23232B] px-4 lg:px-6 py-2.5 transition-all">
      <div className="max-w-[1920px] mx-auto flex flex-wrap items-center justify-between gap-y-3">
        {/* Brand & Clinical Tag */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#141418] border border-opred flex items-center justify-center shadow-lg shadow-opred/20">
            <span className="w-2.5 h-2.5 rounded-full bg-opred animate-pulse"></span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-wider text-white uppercase font-sans">
                STERILE <span className="text-opred">VECTOR</span>
              </h1>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#18181D] text-slate-400 border border-[#2A2A35]">
                v3.0.4-CLINICAL
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Touchless Forearm Gesture Interface · ARIES v3.0 RISC-V Supervisor
            </p>
          </div>
        </div>

        {/* Central Navigation Pills */}
        <nav className="flex items-center gap-1 bg-[#121216] p-1 rounded-xl border border-[#23232B]">
          <button
            onClick={() => setActiveTab('viewport')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'viewport'
                ? 'bg-opred text-white shadow-md shadow-opred/30'
                : 'text-slate-400 hover:text-white hover:bg-[#1A1A22]'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>OR Viewport</span>
          </button>

          <button
            onClick={() => setActiveTab('telemetry')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'telemetry'
                ? 'bg-opred text-white shadow-md shadow-opred/30'
                : 'text-slate-400 hover:text-white hover:bg-[#1A1A22]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Gesture Lab</span>
          </button>

          <button
            onClick={() => setActiveTab('safety')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'safety'
                ? 'bg-opred text-white shadow-md shadow-opred/30'
                : 'text-slate-400 hover:text-white hover:bg-[#1A1A22]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>ARIES Safety</span>
          </button>

          <button
            onClick={() => setActiveTab('code')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'code'
                ? 'bg-opred text-white shadow-md shadow-opred/30'
                : 'text-slate-400 hover:text-white hover:bg-[#1A1A22]'
            }`}
          >
            <FileCode2 className="w-3.5 h-3.5" />
            <span>Firmware Repo</span>
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'guide'
                ? 'bg-opred text-white shadow-md shadow-opred/30'
                : 'text-slate-400 hover:text-white hover:bg-[#1A1A22]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Build Guide</span>
          </button>
        </nav>

        {/* Right Status Cluster */}
        <div className="flex items-center gap-2.5">
          {/* Quick Clutch Unlock/Lock Button */}
          <button
            onClick={onToggleState}
            title="Surgeon Clutch Trigger (Simulates 2.0s Palm-up gesture)"
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono font-semibold transition-all ${getStateColor(
              systemState
            )}`}
          >
            {systemState === 'ACTIVE' ? (
              <>
                <Unlock className="w-3.5 h-3.5 text-opred" />
                <span>ACTIVE</span>
              </>
            ) : systemState === 'LOCKED' ? (
              <>
                <Lock className="w-3.5 h-3.5" />
                <span>LOCKED</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{systemState}</span>
              </>
            )}
          </button>

          {/* Mode Switch (Roll Flick shortcut) */}
          <button
            onClick={onToggleMode}
            title="Roll Flick Gesture Toggle"
            className="hidden md:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#15151A] hover:bg-[#202028] border border-[#2A2A35] text-xs font-mono text-slate-200 transition-colors"
          >
            <span className="text-[10px] text-slate-500">MODE:</span>
            <span className="text-white font-semibold">
              {displayMode === '3D_VOLUME' ? '3D CT/MRI' : '2D AXIAL'}
            </span>
          </button>

          {/* Zero Point Reset */}
          <button
            onClick={onResetOrigin}
            title="Reset Spatial Origin (Zero-Point)"
            className="p-1.5 rounded-lg bg-[#15151A] hover:bg-[#202028] border border-[#2A2A35] text-slate-300 hover:text-white transition-colors"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>

          {/* Watchdog Status */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#15151A] border border-[#2A2A35] text-[11px] font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-slate-400">WDOG:</span>
            <span className={watchdogLatencyMs > 150 ? 'text-opred font-bold' : 'text-slate-200'}>
              {watchdogLatencyMs}ms / 200ms
            </span>
          </div>

          {/* Battery Status */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#15151A] border border-[#2A2A35] text-[11px] font-mono">
            <Battery className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-200">{batteryLevel}%</span>
            <span className="text-slate-500 hidden xl:inline">(~12.8h)</span>
          </div>

          {/* Hardware Connect Web Serial Button */}
          <button
            onClick={onOpenHardwareModal}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono border transition-all ${
              isConnectedHardware
                ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400'
                : 'bg-[#15151A] hover:bg-[#202028] border-opred/40 text-slate-200 hover:border-opred'
            }`}
          >
            <Usb className={`w-3.5 h-3.5 ${isConnectedHardware ? 'text-emerald-400' : 'text-opred'}`} />
            <span className="hidden sm:inline">
              {isConnectedHardware ? 'ARIES USB OK' : 'Connect USB'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
