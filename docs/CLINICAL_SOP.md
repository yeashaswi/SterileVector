# SterileVector: Prototype Gesture & Testing Guide

> **⚠️ Important Notice**: SterileVector is an experimental student prototype and proof of concept. It is **not** a certified medical device, has never undergone clinical trials or regulatory approval (IEC 62304 / ISO 13485), and must **never** be used in live surgical or sterile operating environments. This document serves as a workbench testing and demonstration protocol only.

---

### 1. Prototype Overview & Bench Testing Purpose

This guide outlines how to set up, calibrate, and test the touchless gesture navigation prototype on a developer workbench. The system allows hands-free navigation of 3D anatomical models and 2D radiological slices using an ESP32-C3 wristband paired with an MPU-6050 IMU.

---

### 2. Workbench Setup & Calibration Procedure

1. **Powering the Wristband**:
   - Ensure the LiPo battery is charged via the TP4056 USB-C port, or power the ESP32-C3 SuperMini directly via USB-C.
   - Secure the prototype wristband to your forearm so the MPU-6050 rests flat on the volar (inner) surface.
2. **Connecting the Receiver / Host**:
   - Plug the receiver ESP32-C3 into your workstation via USB.
   - Open the web interface at `http://localhost:3000` (or connect the serial forwarder to the local WebSocket server).
3. **Calibrating Neutral Orientation**:
   - Rest your arm comfortably on the desk in a neutral position.
   - Trigger the clutch unlock (hold forearm stationary with palm up for 2 seconds) to zero out the gyro offsets and set the origin.

---

### 3. Gesture Mapping & Controls

| Action | Gesture | Motion Details | Interface Feedback |
| :--- | :--- | :--- | :--- |
| **Unlock / Lock Interface** | Forearm Palm-Up Clutch | Hold forearm palm-up and stationary for 2.0 seconds | Long haptic vibration (unlock) or 3 short pulses (lock) |
| **Rotate 3D Model** | Continuous Wrist Pitch / Roll | Tilt wrist up/down or rotate forearm slightly | 3D model rotates along the active axis; stops when inside the ±3° deadband |
| **Scroll 2D Slices** | Wrist Pitch (in 2D Mode) | Tilt wrist forward/backward | Steps forward/backward through axial CT/MRI slices |
| **Toggle 3D Scan $\leftrightarrow$ 2D Slices** | Forearm Roll Flick | Quick, transient wrist snap / roll flick | Switches between 3D volume viewer and 2D slice scrubber |
| **Toggle Rotation $\leftrightarrow$ Zoom Mode** | Forearm Tap | Light tap with index finger against forearm | Switches the active kinematic channel between rotation and zoom |
| **Idle Timeout Lock** | Stationary Hold | Keep arm motionless for > 10 seconds | Display automatically freezes and engages neutral lock |

---

### 4. Safety Watchdog Behavior (ARIES v3.0 Simulation)

- **Packet Timeout Protection**:
  If wireless communication drops or packet arrival exceeds 200 ms, the supervisor triggers an immediate viewport freeze to prevent runaway drift.
- **Deadband Filtering**:
  Subtle physiological hand tremors below ±3° are suppressed using a dead-zone filter to prevent jittery viewport shifts during normal resting postures.
- **Sensor Drift Realities**:
  Because the MPU-6050 is an inexpensive consumer sensor, orientation will drift over several minutes of continuous movement. Periodically re-engaging the clutch gesture resets the reference frame.
