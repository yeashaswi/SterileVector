import React, { useState } from 'react';
import { 
  FileCode2, 
  Copy, 
  Check, 
  Download, 
  Cpu, 
  Terminal, 
  ShieldCheck, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { CODE_SNIPPETS, CodeFile } from '../data/codeSnippets';

export const CodebaseViewer: React.FC = () => {
  const [activeFileId, setActiveFileId] = useState<string>('wristband_esp32');
  const [copied, setCopied] = useState<boolean>(false);

  const activeFile = CODE_SNIPPETS.find(f => f.id === activeFileId) || CODE_SNIPPETS[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(activeFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([activeFile.code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = activeFile.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#101014] p-5 rounded-2xl border border-[#36363B] flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileCode2 className="w-5 h-5 text-opred" />
            <h2 className="text-lg font-bold text-white tracking-wide">
              EMBEDDED CODEBASE & ARCHITECTURAL IMPLEMENTATIONS
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Complete, production-ready source code for all subsystems specified in the Sterile Vector paper.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#2C2C30] hover:bg-[#252530] text-slate-200 border border-[#2F2F3D] text-xs font-mono transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-opred" />
                <span>Copy Source</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-opred hover:bg-opred-hover text-white text-xs font-mono font-semibold transition-all shadow-md shadow-opred/20"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download {activeFile.name}</span>
          </button>
        </div>
      </div>

      {/* Code Browser Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Subsystem Navigation */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-mono text-slate-400 uppercase tracking-wider font-semibold px-1">
            Select Architecture:
          </div>

          <div className="space-y-2">
            {CODE_SNIPPETS.map(file => {
              const isSelected = file.id === activeFileId;
              return (
                <button
                  key={file.id}
                  onClick={() => setActiveFileId(file.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-[#15151C] border-opred shadow-lg shadow-opred/10'
                      : 'bg-[#101014] border-[#22222B] hover:bg-[#16161C] hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-opred' : 'bg-slate-600'}`} />
                      {file.name}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1C1C26] text-slate-300 border border-[#2B2B38] uppercase">
                      {file.language}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                    {file.description}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Architecture Summary Box */}
          <div className="p-4 rounded-xl bg-[#0D0D10] border border-[#36363B] space-y-2.5">
            <div className="text-xs font-mono font-bold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-opred" />
              <span>Compilation & Toolchain:</span>
            </div>
            <div className="text-[11px] font-mono text-slate-400 space-y-1">
              <div>• ESP32-C3: ESP-IDF v5.1 or Arduino Core 3.0</div>
              <div>• ARIES v3.0: CDAC VEGA SDK (GNU RISC-V 32-bit toolchain)</div>
              <div>• AI: PyTorch 2.2+ & ONNX/TFLite INT8 Quantizer</div>
              <div>• Baud Rate: 115200 8-N-1 (Hardware UART)</div>
            </div>
          </div>
        </div>

        {/* Right Code Display */}
        <div className="lg:col-span-8 bg-[#0C0C10] rounded-2xl border border-[#36363B] overflow-hidden flex flex-col shadow-2xl">
          {/* File Header Bar */}
          <div className="bg-[#121218] px-4 py-2.5 border-b border-[#36363B] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-300 font-bold">{activeFile.name}</span>
              <span className="text-[10px] font-mono text-slate-500">
                ({activeFile.code.split('\n').length} lines)
              </span>
            </div>
            <div className="text-[11px] font-mono text-opred font-semibold">
              Ready to Flash / Deploy
            </div>
          </div>

          {/* Syntax Highlighted Code Viewer */}
          <div className="relative p-4 max-h-[640px] overflow-auto font-mono text-xs leading-relaxed text-slate-300 select-all">
            <pre className="overflow-x-auto whitespace-pre">
              {activeFile.code}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
