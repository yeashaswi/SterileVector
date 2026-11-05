# STERILE VECTOR 🩺

> **A Low-Power Forearm Gesture Interface for Touchless Surgical Imaging**  
> *Certified for Operating Room Sterility & Zero-Occlusion Display Control*

[![Medical Device Class](https://img.shields.io/badge/Medical_Standard-IEC_62304_Class_B-EB0028.svg)](#)
[![Safety Supervisor](https://img.shields.io/badge/Safety_Supervisor-ARIES_v3.0_RISC--V-111111.svg)](#)
[![Hardware Budget](https://img.shields.io/badge/BOM_Cost-%E2%82%B92%2C409_%2F_%3C%E2%82%B93%2C000-008060.svg)](#)
[![Battery Run Time](https://img.shields.io/badge/Active_Run_Time-~13_Hours-EB0028.svg)](#)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 🌟 Clinical Overview

During complex surgical procedures (neurosurgical aneurysms, orthopedic reconstructions, vascular interventions), surgeons frequently need to re-orient 3D radiological volumes, adjust magnification, and scrub through 2D axial CT/MRI slices.

Touching keyboards, mice, or touchscreens breaks the sterile field. Existing alternatives face critical bottlenecks:
- **Optical cameras** suffer from line-of-sight occlusion by surgical lamps, staff, and microscopes.
- **Voice control** fails in noisy operating rooms (drills, suction, alarms).
- **The "Midas Touch" problem**: inadvertent hand movements unintentionally trigger erratic viewport shifts.

**Sterile Vector** solves this with a low-power wristband combined with an independent **air-gapped ARIES v3.0 RISC-V Safety Supervisor**:
- **Zero Line-of-Sight Occlusion:** Inertial 6-axis sensing worn directly on the volar forearm.
- **Midas Touch Immunity:** Quantized 1D-CNN trained on 30 minutes of continuous surgical negative samples (forceps manipulation, suturing, holding scalpels).
- **Hard Failsafe:** Autonomous hardware display lock within **< 200 ms** if packets drop or sensors fail.
- **Ultra-Low Cost:** Total parts cost of **₹2,409** (under the ₹3,000 threshold).

---

## 🏗️ System Architecture

```
┌─────────────────────────────────┐       2.4 GHz ESP-NOW       ┌──────────────────────────────┐
│         EDGE WRISTBAND          │ ──────────────────────────> │      BASE STATION RX         │
│  - ESP32-C3 MCU (160MHz)        │   (12-Byte Binary Frame)    │  - ESP32-C3 Receiver         │
│  - MPU-6050 6-Axis IMU (100 Hz) │                             │  - Zero-Buffer Forwarder     │
│  - 1D-CNN INT8 Quantized (20Hz) │                             └──────────────┬───────────────┘
│  - Complementary Filter (β=0.98)│                                            │ Hardware UART
│  - Tremor Deadband (±3°)        │                                            │ (115,200 Baud)
│  - Coin Vibration Haptic Motor  │                                            ▼
└─────────────────────────────────┘                             ┌──────────────────────────────┐
                                                                │  ARIES v3.0 SAFETY SUPERVISOR│
                                                                │  - VEGA ET1031 RISC-V Core   │
                                                                │  - CRC-8 (0x07) Table Check  │
                                                                │  - Sequence Order Validator  │
                                                                │  - Angular Rate Governor     │
                                                                │  - <200ms Hard Watchdog Lock │
                                                                └──────────────┬───────────────┘
                                                                               │ USB / Wired UART
                                                                               ▼
                                                                ┌──────────────────────────────┐
                                                                │       OR DISPLAY HOST        │
                                                                │  - Three.js 3D Vascular Scan │
                                                                │  - 2D DICOM Axial CT Scrubber│
                                                                │  - Live HU Density Probe     │
                                                                └──────────────────────────────┘
```

---

## 🔬 Mathematical Signal Kinematics

### 1. Complementary Filter
$$\theta_t = \beta \cdot (\theta_{t-1} + \omega_t \cdot \Delta t) + (1 - \beta) \cdot \theta_{\text{acc},t} \quad (\beta \approx 0.98)$$

### 2. Physiological Tremor Dead-Zone
$$\omega = k \cdot \text{sgn}(\theta) \cdot \min\left(\max(0, |\theta| - 3^\circ), 12^\circ\right)$$

### 3. Exponential Moving Average Smoothing
$$y_t = \alpha \cdot x_t + (1 - \alpha) \cdot y_{t-1} \quad (\alpha \approx 0.30)$$

---

## ✋ Discrete Gesture Lexicon

| Gesture Name | Detection Mechanism | Clinical Action |
| :--- | :--- | :--- |
| **Forearm Palm-Up Clutch** | 1D-CNN + Hold for 2.0s | Unlocks/locks interface; resets neutral spatial origin. **1 long haptic pulse (400ms)** to unlock, **3 short pulses (80ms)** to lock. |
| **Sustained Wrist Pitch / Roll** | Kinematic Rate Controller | Continuous 3D model rotation (or axial slice scrubber in 2D DICOM Mode). |
| **Rapid Forearm Roll Flick** | 1D-CNN (Transient Dynamic) | Toggles display between 3D Volume and 2D DICOM CT/MRI Slices. |
| **Acoustic Tap on Forearm** | 1D-CNN (Impact Peak) | Switches kinematic channel between Model Rotation and Zoom Magnification. |
| **Neutral Stationary Hold** | Dead-Zone Evaluator | Freezes viewport; automatically engages safety lock after 10 s. |

---

## 💰 Hardware Bill of Materials (BOM)

| Item | Component | Qty | Unit (₹) | Total (₹) | Role |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **01** | ESP32-C3 SuperMini Modules | 2 | ₹250 | ₹500 | Wristband Edge + Base Station Receiver |
| **02** | MPU-6050 6-Axis IMU Breakout | 1 | ₹150 | ₹150 | ±4g Accel, ±500°/s Gyro @ 100 Hz I2C |
| **03** | LiPo Pouch Cell (3.7V, 500 mAh) | 1 | ₹200 | ₹200 | 13h Active Tracking / 55h Clinical Duty Cycle |
| **04** | TP4056 USB-C + ME6211 3.3V LDO | 1 | ₹90 | ₹90 | Ultra-low quiescent regulator |
| **05** | Custom 2-Layer PCB + Case | 1 | ₹800 | ₹800 | Autoclavable silicone sleeve + IP67 enclosure |
| **06** | 10mm Haptic Motor + Medical Strap | 1 | ₹450 | ₹450 | Volar tactile driver + silicone band |
| **07** | Passives & Contingency (10%) | — | — | ₹219 | SMD passives, diodes, bypass caps |
| **TOTAL** | | | | **₹2,409** | **Target: < ₹3,000** |

---

## 📁 Repository Structure

```
├── src/                    # Complete interactive medical application (React + Three.js + Tailwind)
├── firmware/
│   ├── wristband_firmware/ # ESP32-C3 100Hz IMU, 1D-CNN INT8, ESP-NOW firmware
│   ├── aries_v3_supervisor/# ARIES v3.0 RISC-V VEGA ET1031 safety supervisor
│   └── base_station_rx/    # ESP32-C3 receiver bridge
├── ai_pipeline/            # PyTorch 1D-CNN training, augmentation & INT8 C exporter
├── docs/                   # Complete Hardware Build Guide & Clinical SOP
└── .github/workflows/      # Automated GitHub Actions deployment to GitHub Pages
```

---

## 🚀 Quickstart & Local Development

```bash
# Clone the repository
git clone https://github.com/yeashaswi/SterileVector.git
cd SterileVector

# Install dependencies
npm install

# Start local interactive simulator
npm run dev
```

Open `http://localhost:3000` to interact with the full 3D surgical display, 2D DICOM slice stack, real-time kinematics HUD, and ARIES v3.0 fault injection suite.
