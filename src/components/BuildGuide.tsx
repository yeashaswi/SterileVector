import React, { useState } from 'react';
import { 
  BookOpen, 
  Cpu, 
  Wrench, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  Layers, 
  Battery, 
  ShieldCheck, 
  Terminal,
  Activity,
  Zap,
  ListChecks,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

interface StepSection {
  id: string;
  title: string;
  badge: string;
  content: React.ReactNode;
}

export const BuildGuide: React.FC = () => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'bom': true,
    'wiring': true,
    'enclosure': false,
    'flashing': false,
    'calibration': false,
    'clinical_sop': false,
  });

  const toggleSection = (id: string) => {
    setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#101014] p-5 rounded-2xl border border-[#36363B] flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-opred" />
            <h2 className="text-lg font-bold text-white tracking-wide">
              END-TO-END BUILD & CLINICAL IMPLEMENTATION MANUAL
            </h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-opred/20 text-opred border border-opred/40 font-semibold">
              COMPLETE SPECIFICATION
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Complete hardware procurement, schematic wiring, 3D printing enclosure, firmware flashing, and clinical operating room safety protocols.
          </p>
        </div>
      </div>

      {/* Guide Accordion Sections */}
      <div className="space-y-4">
        {/* SECTION 1: BILL OF MATERIALS (BOM) */}
        <div className="bg-[#1E1E21] rounded-2xl border border-[#36363B] overflow-hidden">
          <button
            onClick={() => toggleSection('bom')}
            className="w-full px-6 py-4 flex items-center justify-between bg-[#15151B] hover:bg-[#2C2C30] transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-opred/20 text-opred border border-opred/40 flex items-center justify-center font-mono text-xs font-bold">
                1
              </span>
              <div>
                <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wide">
                  Bill of Materials (BOM) & Parts Procurement
                </h3>
                <p className="text-xs text-slate-400">
                  Total Cost: ₹2,409 (Target: &lt;₹3,000) · 13h Active Battery Life
                </p>
              </div>
            </div>
            {expandedSections['bom'] ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
          </button>

          {expandedSections['bom'] && (
            <div className="p-6 space-y-4 text-xs font-mono">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#2A2A38] text-slate-400 text-[11px]">
                      <th className="py-2 px-3">COMPONENT ITEM</th>
                      <th className="py-2 px-3">PURPOSE IN ARCHITECTURE</th>
                      <th className="py-2 px-3">UNIT (RS)</th>
                      <th className="py-2 px-3">TOTAL (RS)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E1E28] text-slate-300">
                    <tr>
                      <td className="py-2.5 px-3 font-bold text-white">ESP32-C3 SuperMini (2 units)</td>
                      <td className="py-2.5 px-3 text-slate-400">Wristband Edge MCU + Base Station Receiver</td>
                      <td className="py-2.5 px-3">₹250</td>
                      <td className="py-2.5 px-3 text-opred font-bold">₹500</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-bold text-white">MPU-6050 6-Axis IMU Breakout</td>
                      <td className="py-2.5 px-3 text-slate-400">±4g Accel & ±500°/s Gyro sampled at 100 Hz</td>
                      <td className="py-2.5 px-3">₹150</td>
                      <td className="py-2.5 px-3 text-opred font-bold">₹150</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-bold text-white">LiPo Cell (3.7V, 500 mAh)</td>
                      <td className="py-2.5 px-3 text-slate-400">Lightweight pouch cell (13h active / 55h duty cycle)</td>
                      <td className="py-2.5 px-3">₹200</td>
                      <td className="py-2.5 px-3 text-opred font-bold">₹200</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-bold text-white">TP4056 Type-C + ME6211 LDO</td>
                      <td className="py-2.5 px-3 text-slate-400">Lithium charger + Ultra-low quiescent 3.3V regulator</td>
                      <td className="py-2.5 px-3">₹90</td>
                      <td className="py-2.5 px-3 text-opred font-bold">₹90</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-bold text-white">Custom 2-Layer PCB + Enclosure</td>
                      <td className="py-2.5 px-3 text-slate-400">Compact round wearable PCB + SLA 3D print</td>
                      <td className="py-2.5 px-3">₹800</td>
                      <td className="py-2.5 px-3 text-opred font-bold">₹800</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-bold text-white">Coin Haptic Motor, Strap, Wiring</td>
                      <td className="py-2.5 px-3 text-slate-400">10mm vibration motor + medical silicone strap</td>
                      <td className="py-2.5 px-3">₹450</td>
                      <td className="py-2.5 px-3 text-opred font-bold">₹450</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 text-slate-400">Engineering Contingency (10%)</td>
                      <td className="py-2.5 px-3 text-slate-500">Solder, flux, heatshrink, passive pass-throughs</td>
                      <td className="py-2.5 px-3">—</td>
                      <td className="py-2.5 px-3 text-slate-400 font-bold">₹219</td>
                    </tr>
                    <tr className="bg-[#15151D] font-bold text-white text-sm">
                      <td colSpan={3} className="py-3 px-3 text-right">TOTAL ESTIMATED HARDWARE BOM:</td>
                      <td className="py-3 px-3 text-opred">₹2,409</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="p-4 rounded-xl bg-[#0E0E12] border border-[#36363B] space-y-1">
                <span className="text-white font-bold">Supervisory Hardware:</span>
                <p className="text-slate-400">
                  Base Station links to an <span className="text-opred font-semibold">ARIES v3.0 Development Board</span> (powered by CDAC indigenous VEGA ET1031 RISC-V SoC). The ARIES board acts as an air-gapped critical supervisor and is reusable across surgical theaters.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 2: CIRCUIT SCHEMATICS & PINOUT */}
        <div className="bg-[#1E1E21] rounded-2xl border border-[#36363B] overflow-hidden">
          <button
            onClick={() => toggleSection('wiring')}
            className="w-full px-6 py-4 flex items-center justify-between bg-[#15151B] hover:bg-[#2C2C30] transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-opred/20 text-opred border border-opred/40 flex items-center justify-center font-mono text-xs font-bold">
                2
              </span>
              <div>
                <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wide">
                  Circuit Schematics & Hardware Pinout Wiring
                </h3>
                <p className="text-xs text-slate-400">
                  Wristband I2C sampling, haptic PWM, battery ADC, and ARIES UART bridge
                </p>
              </div>
            </div>
            {expandedSections['wiring'] ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
          </button>

          {expandedSections['wiring'] && (
            <div className="p-6 space-y-4 text-xs font-mono">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Wristband Connections */}
                <div className="p-4 rounded-xl bg-[#0D0D11] border border-[#242432] space-y-2">
                  <div className="text-white font-bold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-opred"></span>
                    <span>Wristband (ESP32-C3 SuperMini) Pinout:</span>
                  </div>
                  <div className="space-y-1 text-slate-300">
                    <div className="flex justify-between py-1 border-b border-[#1E1E28]">
                      <span className="text-slate-400">GPIO 4</span>
                      <span className="text-white font-semibold">MPU-6050 SDA (I2C Data, 400kHz)</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#1E1E28]">
                      <span className="text-slate-400">GPIO 5</span>
                      <span className="text-white font-semibold">MPU-6050 SCL (I2C Clock)</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#1E1E28]">
                      <span className="text-slate-400">GPIO 6</span>
                      <span className="text-white font-semibold">Haptic Motor Gate (via 2N7002 MOSFET)</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#1E1E28]">
                      <span className="text-slate-400">GPIO 0 (ADC1_CH0)</span>
                      <span className="text-white font-semibold">Battery Divider (100kΩ / 100kΩ)</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-400">3.3V & GND</span>
                      <span className="text-white font-semibold">ME6211 Clean 3.3V Rail & Common Ground</span>
                    </div>
                  </div>
                </div>

                {/* Base Station & ARIES Connections */}
                <div className="p-4 rounded-xl bg-[#0D0D11] border border-[#242432] space-y-2">
                  <div className="text-white font-bold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-opred"></span>
                    <span>Base Station & ARIES v3.0 Pinout:</span>
                  </div>
                  <div className="space-y-1 text-slate-300">
                    <div className="flex justify-between py-1 border-b border-[#1E1E28]">
                      <span className="text-slate-400">ESP32 Base TX (GPIO21)</span>
                      <span className="text-white font-semibold">ARIES UART1 RX (Pin 8)</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#1E1E28]">
                      <span className="text-slate-400">Common GND</span>
                      <span className="text-white font-semibold">Direct Ground Reference</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#1E1E28]">
                      <span className="text-slate-400">ARIES UART0 TX (Pin 1)</span>
                      <span className="text-white font-semibold">OR Host USB/UART (115200 Baud)</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#1E1E28]">
                      <span className="text-slate-400">ARIES GPIO 4</span>
                      <span className="text-white font-semibold">Hardware Safety Relay Interlock</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-400">Power Supply</span>
                      <span className="text-white font-semibold">Host 5V USB Bus Powered</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 3: 3D ERGONOMIC STERILE ENCLOSURE */}
        <div className="bg-[#1E1E21] rounded-2xl border border-[#36363B] overflow-hidden">
          <button
            onClick={() => toggleSection('enclosure')}
            className="w-full px-6 py-4 flex items-center justify-between bg-[#15151B] hover:bg-[#2C2C30] transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-opred/20 text-opred border border-opred/40 flex items-center justify-center font-mono text-xs font-bold">
                3
              </span>
              <div>
                <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wide">
                  3D Ergonomic Sterile Enclosure & Biocompatibility
                </h3>
                <p className="text-xs text-slate-400">
                  Medical silicone sleeve, IP67 waterproof seal, surgical drape integration
                </p>
              </div>
            </div>
            {expandedSections['enclosure'] ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
          </button>

          {expandedSections['enclosure'] && (
            <div className="p-6 space-y-4 text-xs font-mono text-slate-300">
              <div className="p-4 rounded-xl bg-[#0D0D11] border border-[#36363B] space-y-2">
                <div className="text-white font-bold">Surgical Theater Placement:</div>
                <p className="text-slate-400">
                  The band is positioned on the surgeon's non-dominant or dominant forearm approximately <strong>4 cm proximal to the ulnar styloid process</strong>. This placement isolates forearm pronation/supination (roll) and wrist extension/flexion (pitch) while minimizing unintentional finger suture twitch artifacts.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-[#0E0E12] border border-[#20202A] space-y-1">
                  <span className="text-white font-bold">Material:</span>
                  <p className="text-slate-400">USP Class VI Medical-Grade Silicone (Dow Corning Silastic).</p>
                </div>
                <div className="p-3 rounded-lg bg-[#0E0E12] border border-[#20202A] space-y-1">
                  <span className="text-white font-bold">Sterility Barrier:</span>
                  <p className="text-slate-400">Enclosed within disposable sterile surgical drape sleeve.</p>
                </div>
                <div className="p-3 rounded-lg bg-[#0E0E12] border border-[#20202A] space-y-1">
                  <span className="text-white font-bold">Haptic Transfer:</span>
                  <p className="text-slate-400">Direct acoustic coupling between motor and volar forearm skin.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 4: TOOLCHAIN SETUP & FLASHING */}
        <div className="bg-[#1E1E21] rounded-2xl border border-[#36363B] overflow-hidden">
          <button
            onClick={() => toggleSection('flashing')}
            className="w-full px-6 py-4 flex items-center justify-between bg-[#15151B] hover:bg-[#2C2C30] transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-opred/20 text-opred border border-opred/40 flex items-center justify-center font-mono text-xs font-bold">
                4
              </span>
              <div>
                <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wide">
                  Firmware Toolchain Setup & Flashing Instructions
                </h3>
                <p className="text-xs text-slate-400">
                  Step-by-step CLI commands for ESP32-C3 and CDAC VEGA SDK
                </p>
              </div>
            </div>
            {expandedSections['flashing'] ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
          </button>

          {expandedSections['flashing'] && (
            <div className="p-6 space-y-4 text-xs font-mono text-slate-300">
              <div className="space-y-2">
                <span className="text-white font-bold">1. Flash Edge Wristband (ESP32-C3):</span>
                <div className="p-3 rounded-lg bg-[#09090C] border border-[#36363B] text-slate-300 space-y-1">
                  <p className="text-slate-500"># Using Arduino CLI or ESP-IDF:</p>
                  <p className="text-opred">arduino-cli compile --fqbn esp32:esp32:esp32c3 wristband_firmware.ino</p>
                  <p className="text-opred">arduino-cli upload -p /dev/tty.usbmodem1101 --fqbn esp32:esp32:esp32c3 wristband_firmware.ino</p>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-white font-bold">2. Flash Base Station Receiver (ESP32-C3):</span>
                <div className="p-3 rounded-lg bg-[#09090C] border border-[#36363B] text-slate-300 space-y-1">
                  <p className="text-opred">arduino-cli compile --fqbn esp32:esp32:esp32c3 base_station_rx.ino</p>
                  <p className="text-opred">arduino-cli upload -p /dev/tty.usbmodem1102 --fqbn esp32:esp32:esp32c3 base_station_rx.ino</p>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-white font-bold">3. Flash ARIES v3.0 Board (VEGA ET1031 RISC-V):</span>
                <div className="p-3 rounded-lg bg-[#09090C] border border-[#36363B] text-slate-300 space-y-1">
                  <p className="text-slate-500"># Using CDAC VEGA SDK GNU Toolchain:</p>
                  <p className="text-opred">riscv32-unknown-elf-gcc -O2 -march=rv32imac -mabi=ilp32 aries_safety_supervisor.c -o aries_safety.elf</p>
                  <p className="text-opred">openocd -f interface/ftdi.cfg -f target/vega_et1031.cfg -c "program aries_safety.elf verify reset exit"</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 5: CLINICAL SOP */}
        <div className="bg-[#1E1E21] rounded-2xl border border-[#36363B] overflow-hidden">
          <button
            onClick={() => toggleSection('clinical_sop')}
            className="w-full px-6 py-4 flex items-center justify-between bg-[#15151B] hover:bg-[#2C2C30] transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-opred/20 text-opred border border-opred/40 flex items-center justify-center font-mono text-xs font-bold">
                5
              </span>
              <div>
                <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wide">
                  Clinical Operating Theater SOP & Surgeon Protocol
                </h3>
                <p className="text-xs text-slate-400">
                  Step-by-step touchless interaction procedure for neurosurgeons & surgical teams
                </p>
              </div>
            </div>
            {expandedSections['clinical_sop'] ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
          </button>

          {expandedSections['clinical_sop'] && (
            <div className="p-6 space-y-4 text-xs font-mono text-slate-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#0E0E12] border border-[#36363B] space-y-2">
                  <span className="text-white font-bold text-sm">SURGEON ACTION LEXICON:</span>
                  <div className="space-y-1.5 text-slate-400">
                    <div>
                      <strong className="text-white">1. Palm-Up Clutch (Hold 2.0s):</strong> Unlocks display from safe standby. Wristband responds with 1 long haptic pulse (400ms).
                    </div>
                    <div>
                      <strong className="text-white">2. Sustained Forearm Tilt:</strong> Tilting wrist rotates 3D model or scrubs axial CT slices smoothly. Motion stops when inside ±3° deadband.
                    </div>
                    <div>
                      <strong className="text-white">3. Acoustic Forearm Tap:</strong> Switches control mode from Model Rotation to Zoom Magnification.
                    </div>
                    <div>
                      <strong className="text-white">4. Rapid Forearm Roll Flick:</strong> Toggles display between 3D volume reconstruction and 2D DICOM axial slice stack.
                    </div>
                    <div>
                      <strong className="text-white">5. Neutral Stationary Hold (10s):</strong> Viewport freezes automatically and engages safety lock with 3 short haptic pulses.
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#0E0E12] border border-[#36363B] space-y-2">
                  <span className="text-white font-bold text-sm">SAFETY & ACCEPTANCE CRITERIA:</span>
                  <div className="space-y-1.5 text-slate-400">
                    <div className="flex items-center gap-2 text-emerald-400">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>False Triggers: &lt; 1 per 30 minutes in active surgery</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-400">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>End-to-End Latency: &lt; 100 ms total</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-400">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>Safety Failsafe Lock: &lt; 200 ms on packet/link failure</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-400">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>Battery Run-Time: ~13 hours continuous active tracking</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
