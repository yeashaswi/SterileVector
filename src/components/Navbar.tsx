import React from 'react';
import { 
  ShieldCheck, 
  Activity, 
  Layers, 
  FileCode2, 
  BookOpen, 
  Usb, 
  Battery, 
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
        return 'bg-[#5BA887]/15 text-[#5BA887] border-[#5BA887]/30';
      case 'LOCKED':
        return 'bg-[#232326] text-[#85858D] border-[#36363B]';
      case 'PAUSED':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'FAULT':
        return 'bg-[#E05656]/15 text-[#E05656] border-[#E05656]/40';
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#18181A]/85 backdrop-blur-md border-b border-[#2A2A2E] px-4 lg:px-6 py-2.5 transition-all">
      <div className="max-w-[1920px] mx-auto flex flex-wrap items-center justify-between gap-y-3">
        {/* Brand & Prototype Tag */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#232326] border border-[#36363B] flex items-center justify-center shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#E05656]"></span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-serif font-medium tracking-tight text-[#F4F4F6]">
                SterileVector
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#232326] text-[#85858D] border border-[#36363B]">
                Prototype
              </span>
            </div>
            <p className="text-[11px] text-[#85858D] hidden sm:block">
              Touchless 3D scan navigation via wearable IMU
            </p>
          </div>
        </div>

        {/* Central Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-[#1E1E21] p-1 rounded-xl border border-[#2A2A2E]">
          <button
            onClick={() => setActiveTab('viewport')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'viewport'
                ? 'bg-[#2C2C30] text-[#F4F4F6] border border-[#36363B] shadow-sm'
                : 'text-[#85858D] hover:text-[#F4F4F6] hover:bg-[#232326]'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>3D Viewport</span>
          </button>

          <button
            onClick={() => setActiveTab('telemetry')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'telemetry'
                ? 'bg-[#2C2C30] text-[#F4F4F6] border border-[#36363B] shadow-sm'
                : 'text-[#85858D] hover:text-[#F4F4F6] hover:bg-[#232326]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Gesture Lab</span>
          </button>

          <button
            onClick={() => setActiveTab('safety')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'safety'
                ? 'bg-[#2C2C30] text-[#F4F4F6] border border-[#36363B] shadow-sm'
                : 'text-[#85858D] hover:text-[#F4F4F6] hover:bg-[#232326]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Watchdog</span>
          </button>

          <button
            onClick={() => setActiveTab('code')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'code'
                ? 'bg-[#2C2C30] text-[#F4F4F6] border border-[#36363B] shadow-sm'
                : 'text-[#85858D] hover:text-[#F4F4F6] hover:bg-[#232326]'
            }`}
          >
            <FileCode2 className="w-3.5 h-3.5" />
            <span>Firmware</span>
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'guide'
                ? 'bg-[#2C2C30] text-[#F4F4F6] border border-[#36363B] shadow-sm'
                : 'text-[#85858D] hover:text-[#F4F4F6] hover:bg-[#232326]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Build Guide</span>
          </button>
        </nav>

        {/* Right Status Cluster */}
        <div className="flex items-center gap-2">
          {/* Quick Clutch Unlock/Lock Button */}
          <button
            onClick={onToggleState}
            title="Clutch Toggle (Simulates 2.0s Palm-up gesture)"
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono font-medium transition-all ${getStateColor(
              systemState
            )}`}
          >
            {systemState === 'ACTIVE' ? (
              <>
                <Unlock className="w-3.5 h-3.5 text-[#5BA887]" />
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

          {/* Mode Switch */}
          <button
            onClick={onToggleMode}
            title="Roll Flick Gesture Toggle"
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#232326] hover:bg-[#2C2C30] border border-[#36363B] text-xs font-mono text-[#BFBFC5] transition-colors"
          >
            <span className="text-[10px] text-[#85858D]">MODE:</span>
            <span className="text-[#F4F4F6] font-medium">
              {displayMode === '3D_VOLUME' ? '3D Volume' : '2D Slices'}
            </span>
          </button>

          {/* Zero Point Reset */}
          <button
            onClick={onResetOrigin}
            title="Reset Spatial Origin (Zero-Point)"
            className="p-1.5 rounded-lg bg-[#232326] hover:bg-[#2C2C30] border border-[#36363B] text-[#85858D] hover:text-[#F4F4F6] transition-colors"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>

          {/* Watchdog Status */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#232326] border border-[#36363B] text-[11px] font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-[#5BA887]"></span>
            <span className="text-[#85858D]">WDOG:</span>
            <span className={watchdogLatencyMs > 150 ? 'text-[#E05656] font-medium' : 'text-[#BFBFC5]'}>
              {watchdogLatencyMs}ms
            </span>
          </div>

          {/* Battery Status */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#232326] border border-[#36363B] text-[11px] font-mono">
            <Battery className="w-3.5 h-3.5 text-[#85858D]" />
            <span className="text-[#BFBFC5]">{batteryLevel}%</span>
          </div>

          {/* Hardware Connect Modal Toggle */}
          <button
            onClick={onOpenHardwareModal}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono border transition-all ${
              isConnectedHardware
                ? 'bg-[#5BA887]/15 text-[#5BA887] border-[#5BA887]/30'
                : 'bg-[#232326] hover:bg-[#2C2C30] border-[#36363B] text-[#BFBFC5] hover:text-[#F4F4F6]'
            }`}
          >
            <Usb className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {isConnectedHardware ? 'Serial Connected' : 'Connect HW'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
