# SterileVector 🩺

An experimental wristband prototype for touchless gesture navigation of 3D medical scans.

SterileVector explores whether a low-cost inertial wristband can allow someone to inspect radiological images (rotate 3D volumes or scroll through 2D CT/MRI slices) without physically touching a keyboard, mouse, or screen.

---

## ⚠️ Important Disclaimer: Not a Certified Medical Device

> **This is an early-stage hobby / student prototype and proof of concept.**
> - It is **not** certified under IEC 62304, ISO 13485, FDA, CE, or any clinical standard.
> - It has **never** been tested in an operating room or sterile surgical environment.
> - The hardware is built from consumer-grade hobbyist components and breadboard modules. It is not sterile or autoclavable.
> - Do not use this system for real medical diagnostics or in clinical environments.

---

## How It Works

1. **Wristband (Hardware):** An ESP32-C3 microcontroller reads motion data from an MPU-6050 6-axis IMU (accelerometer + gyroscope) worn on the forearm.
2. **Wireless Transmission:** The wristband packages motion data and transmits it wirelessly via ESP-NOW to a receiver ESP32 board.
3. **Receiver & Safety Supervisor:** The receiver connects via serial/UART to a base station or host computer. We also tested an experimental watchdog implementation on an ARIES v3.0 RISC-V board to monitor packet timeouts and freeze screen movement if communication drops.
4. **Display Interface:** A web frontend (React + Three.js) reads the serial/websocket stream to rotate 3D anatomical models or scrub through 2D DICOM image slices.
5. **Clutch / Neutral Lock:** Holding the arm in a neutral palm-up posture locks/unlocks the interface so normal hand movements don't continuously move the camera.

```
[Wristband: ESP32-C3 + MPU-6050]
        │
        ▼ (ESP-NOW wireless packets)
[Base Station: ESP32-C3 Receiver]
        │
        ▼ (UART / USB Serial)
[Host: Three.js / React 3D Scan Viewer]
```

---

## Known Flaws & Current Limitations

- **IMU Drift:** The MPU-6050 is a budget hobbyist IMU and accumulates gyroscope drift over time. A complementary filter reduces jitter, but you still need to periodically re-zero the origin using the neutral clutch gesture.
- **Gesture Recognition is Basic:** The PyTorch 1D-CNN script in `ai_pipeline/` is a baseline prototype. In the current firmware, most gesture classification relies on simple kinematic thresholds and timing windows rather than deep learning on embedded silicon.
- **Wireless Jitter:** ESP-NOW provides low latency on a workbench, but packet drops or occasional lag spikes can happen in areas with congested 2.4 GHz Wi-Fi.
- **Prototype Enclosure:** The physical unit is currently assembled with standard prototype wiring, a TP4056 charging module, and a small LiPo battery—far from a sealed clinical enclosure.

---

## Repository Structure

```
├── src/                    # Web-based 3D scan viewer (React + Three.js + Tailwind)
├── firmware/
│   ├── wristband_firmware/ # ESP32-C3 IMU reading and ESP-NOW sender
│   ├── base_station_rx/    # ESP32-C3 receiver bridge
│   └── aries_v3_supervisor/# Experimental RISC-V watchdog supervisor code
├── ai_pipeline/            # Baseline 1D-CNN gesture classification prototype
└── docs/                   # Prototype build notes and wiring diagrams
```

---

## Running the Web Simulator

You can test the 3D viewer and simulated gesture controls in your browser without hardware connected:

```bash
git clone https://github.com/yeashaswi/SterileVector.git
cd SterileVector
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to test the viewport, slice scrubber, and simulated fault injection controls.

---

## License

MIT
