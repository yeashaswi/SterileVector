# STERILE VECTOR: CLINICAL OPERATING THEATER STANDARD OPERATING PROCEDURE (SOP)

## Document ID: SOP-SV-2026-V3 | Classification: Class B Medical Device Software

### 1. Purpose & Clinical Scope
This Standard Operating Procedure defines the touchless surgical image navigation protocol using the **Sterile Vector** forearm wearable and the **ARIES v3.0 RISC-V Safety Supervisor** in sterile operating theaters. This protocol prevents sterile field breaches during neurosurgical, orthopaedic, and vascular procedures while eliminating line-of-sight occlusion and acoustic noise limitations of camera/voice systems.

---

### 2. Sterile Preparation & Band Doffing / Donning Protocol

1. **Pre-Scrub Donning**:
   - The surgeon or scrub assistant equips the Sterile Vector wristband on the **volar forearm 4 cm proximal to the ulnar styloid process**.
   - Verify battery indicator shows $> 60\%$ (estimated $> 8$ hours of surgical runtime).
2. **Sterile Barrier Draping**:
   - The surgeon performs standard surgical scrub.
   - The band is enclosed underneath standard surgical gown sleeves and covered with an autoclavable medical-grade transparent barrier sleeve (USP Class VI biocompatible).
   - Haptic vibration signals remain clearly transmissible through skin conduction.
3. **Base Station Power-Up**:
   - Circulating nurse connects the Base Station / ARIES v3.0 Supervisor to the OR imaging workstation via USB-C.
   - Verify green ARIES Supervisor LED blinks at 1 Hz indicating system armed.

---

### 3. Intraoperative Touchless Gesture Lexicon

| Clinical Action | Gesture Name | Physical Motion | System Feedback |
| :--- | :--- | :--- | :--- |
| **Unlock Display (Engage)** | Forearm Palm-Up Clutch | Hold forearm supinated (palm up) stationary for 2.0 seconds | **1 Long Haptic Pulse (400ms)**; HUD reticle turns active crimson |
| **Lock Display (Disengage)** | Forearm Palm-Up Clutch | Repeat palm-up hold for 2.0 seconds while active | **3 Short Haptic Pulses (80ms)**; HUD reticle locks |
| **Continuous 3D Model Rotation** | Sustained Wrist Pitch/Roll | Gentle wrist extension/flexion (pitch) or pronation/supination (roll) | Anatomical model rotates along dominant axis; stops in ±3° deadband |
| **Axial CT/MRI Slice Scrubbing** | Sustained Wrist Pitch | In 2D Slice Mode, wrist tilt scrubs axial slices | Slices advance in real-time with crosshair HU density probe |
| **Toggle 3D Volume $\leftrightarrow$ 2D Slices** | Rapid Forearm Roll Flick | Quick, transient wrist snap / roll flick | Instantaneous display mode switch (<30ms) |
| **Toggle Rotation $\leftrightarrow$ Zoom Focus** | Acoustic Forearm Tap | Light tap with index finger or thumb against forearm | HUD channel switches between ROTATE and ZOOM |
| **Emergency Safety Lockout** | Neutral Stationary Hold | Keep forearm stationary in deadzone for $> 10$ seconds | Display freezes automatically; engages safety lock |

---

### 4. Safety Fail-Safe & Fault Recovery (ARIES v3.0)

- **RF Packet Loss / Battery Depletion**:
  If the wristband drops out of range or battery drops below 10%, ARIES v3.0 triggers an autonomous hardware display freeze in **$< 200\text{ ms}$**, eliminating erratic drift.
- **Midas Touch Immunity**:
  Routine surgical tasks (handling forceps, suturing, passing scalpel, talking with hands) are classified as **IDLE** by the 1D-CNN and strictly ignored (< 1 false activation per 30 minutes).
