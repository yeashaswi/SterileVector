import React, { useState } from 'react';
import { 
  Usb, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Radio, 
  Cpu, 
  Terminal,
  Zap
} from 'lucide-react';

interface HardwareConnectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  isConnectedHardware: boolean;
  onConnectSerial: () => Promise<void>;
  onDisconnectSerial: () => void;
  onSelectSimulatedStream: () => void;
  connectionLogs: string[];
}

export const HardwareConnectorModal: React.FC<HardwareConnectorModalProps> = ({
  isOpen,
  onClose,
  isConnectedHardware,
  onConnectSerial,
  onDisconnectSerial,
  onSelectSimulatedStream,
  connectionLogs,
}) => {
  const [connecting, setConnecting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConnect = async () => {
    setConnecting(true);
    setErrorMsg(null);
    try {
      await onConnectSerial();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to open serial port. Ensure USB is connected.');
    } finally {
      setConnecting(false);
    }
  };

  const isWebSerialSupported = 'serial' in navigator;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#121218] border border-[#2A2A38] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl space-y-4">
        {/* Header */}
        <div className="bg-[#171720] px-5 py-3.5 border-b border-[#242432] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Usb className="w-4 h-4 text-opred" />
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wide">
              Hardware Link Configuration
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#20202C] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="px-5 space-y-4 text-xs font-mono">
          <div className="p-3 rounded-xl bg-[#0B0B0E] border border-[#36363B] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Target Port:</span>
              <span className="text-white font-semibold">ARIES v3.0 / ESP32 Base Station</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Baud Rate:</span>
              <span className="text-opred font-bold">115,200 Baud (8N1)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Packet Format:</span>
              <span className="text-white">12-Byte Binary Frame (CRC-8 0x07)</span>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-opred text-opred flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Connection Actions */}
          <div className="space-y-2">
            {isConnectedHardware ? (
              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Hardware Link Active: ARIES v3.0 transmitting verified 100Hz stream.</span>
                </div>
                <button
                  onClick={onDisconnectSerial}
                  className="w-full py-2.5 rounded-xl bg-[#1C1C24] hover:bg-opred text-slate-200 hover:text-white border border-slate-700 transition-colors font-bold"
                >
                  Disconnect Serial Port
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <button
                  onClick={handleConnect}
                  disabled={connecting || !isWebSerialSupported}
                  className="w-full py-2.5 rounded-xl bg-opred hover:bg-opred-hover text-white font-bold transition-all shadow-lg shadow-opred/20 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Usb className="w-4 h-4" />
                  <span>{connecting ? 'Opening Serial Port...' : 'Connect Hardware USB Port'}</span>
                </button>

                {!isWebSerialSupported && (
                  <p className="text-[11px] text-amber-400">
                    * Web Serial is supported on Chromium browsers (Chrome, Edge, Opera, Brave).
                  </p>
                )}

                <button
                  onClick={() => {
                    onSelectSimulatedStream();
                    onClose();
                  }}
                  className="w-full py-2.5 rounded-xl bg-[#1A1A24] hover:bg-[#252535] text-slate-300 border border-slate-700 transition-colors flex items-center justify-center gap-2 font-medium"
                >
                  <Zap className="w-4 h-4 text-opred" />
                  <span>Use Real-Time 100 Hz Surgical Simulator</span>
                </button>
              </div>
            )}
          </div>

          {/* Console / Terminal Activity Log */}
          <div className="space-y-1">
            <span className="text-slate-400 font-bold text-[11px]">SERIAL ACTIVITY LOG:</span>
            <div className="p-3 bg-[#08080A] rounded-xl border border-[#20202A] h-28 overflow-y-auto font-mono text-[11px] text-slate-400 space-y-1">
              {connectionLogs.length === 0 ? (
                <div className="text-slate-600">No active serial events yet.</div>
              ) : (
                connectionLogs.map((log, i) => <div key={i}>{log}</div>)
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-[#171720] border-t border-[#242432] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#22222E] hover:bg-[#2C2C3C] text-white text-xs font-mono font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
