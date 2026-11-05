# STERILE VECTOR: HARDWARE BUILD & ENGINEERING SPECIFICATION

## A Low-Power Forearm Gesture Interface for Touchless Surgical Imaging

### 1. Bill of Materials (BOM) & Parts List (Total: ₹2,409)

| Item | Component | Quantity | Unit Cost (₹) | Total Cost (₹) | Clinical & Electrical Role |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **01** | ESP32-C3 SuperMini MCU | 2 | ₹250 | ₹500 | Wristband Edge AI MCU + Base Station Receiver |
| **02** | MPU-6050 6-Axis IMU Breakout | 1 | ₹150 | ₹150 | ±4g Accel, ±500°/s Gyro @ 100 Hz I2C sampling |
| **03** | Lithium Polymer Battery (3.7V, 500 mAh) | 1 | ₹200 | ₹200 | Ultra-slim pouch cell (13 hrs continuous active) |
| **04** | TP4056 Type-C Charger + ME6211 LDO | 1 | ₹90 | ₹90 | USB-C charging + ultra-low-dropout 3.3V rail |
| **05** | Custom 2-Layer PCB + 3D Enclosure | 1 | ₹800 | ₹800 | SLA medical-grade resin case + IP67 silicone seal |
| **06** | 10mm Coin Haptic Motor + Medical Strap | 1 | ₹450 | ₹450 | Volar tactile driver + autoclavable silicone strap |
| **07** | Passive Passives & Contingency (10%) | — | — | ₹219 | SMD resistors, ceramic bypass capacitors, flux |
| **TOTAL** | **Complete Wearable Edge Hardware** | — | — | **₹2,409** | **Complies with &lt; ₹3,000 cost budget** |

---

### 2. Circuit Schematics & Pinout Mapping

#### 2.1 Wristband Edge Transmitter (ESP32-C3 SuperMini)
- **GPIO 4 (SDA)** $\rightarrow$ MPU-6050 SDA (with 4.7kΩ pull-up to 3.3V)
- **GPIO 5 (SCL)** $\rightarrow$ MPU-6050 SCL (with 4.7kΩ pull-up to 3.3V)
- **GPIO 6 (PWM)** $\rightarrow$ Gate of 2N7002 N-channel MOSFET driving 10mm coin vibration motor (drain tied to motor (-), motor (+) tied to 3.3V, 1N4148 flyback diode across motor terminals)
- **GPIO 0 (ADC1_CH0)** $\rightarrow$ Midpoint of 100kΩ / 100kΩ voltage divider between LiPo positive terminal and GND for battery state-of-charge calculation
- **3.3V Out** $\rightarrow$ ME6211 low-dropout linear regulator (quiescent current $< 50 \mu\text{A}$)
- **GND** $\rightarrow$ Ground plane

#### 2.2 Base Station Receiver (ESP32-C3) to ARIES v3.0 Board
- **ESP32 Base TX (GPIO 21)** $\rightarrow$ ARIES v3.0 Board UART1 RX (Pin 8)
- **ESP32 Base RX (GPIO 20)** $\rightarrow$ ARIES v3.0 Board UART1 TX (Pin 7)
- **GND** $\rightarrow$ ARIES v3.0 GND
- **ARIES v3.0 UART0 TX (Pin 1)** $\rightarrow$ Host OR Display PC via FTDI / USB-UART bridge at 115,200 Baud (8-N-1)
- **ARIES v3.0 GPIO 4** $\rightarrow$ Hardware Safety Interlock Relay

---

### 3. Firmware State Machine & Mathematical Signal Pipeline

```
           [ 100 Hz MPU-6050 I2C Sampling ]
                         │
                         ▼
           [ Complementary Tilt Filter (β = 0.98) ]
                         │
                         ▼
           [ Involuntary Tremor Dead-Zone (±3°) ]
           - If |θ| ≤ 3°: Output velocity is 0°/s
           - If 3° < |θ| ≤ 15°: ω = k·(|θ| - 3°)
                         │
                         ▼
           [ Dominant Axis Arbiter ]
           - If Pitch dominant: roll rate = 0 (suppress diagonal creep)
           - If Roll dominant: pitch rate = 0
                         │
                         ▼
           [ Exponential Moving Average (α = 0.3) ]
                         │
                         ▼
           [ 1D-CNN INT8 Quantized Classifier (20 Hz) ]
           - Sliding Window: 6 channels x 25 samples (250 ms)
           - 4 Classes: Idle (0), Clutch (1), Roll Flick (2), Tap (3)
                         │
                         ▼
           [ 12-Byte Binary Frame Assembly + CRC-8 (0x07) ]
                         │
                         ▼
           [ ESP-NOW 2.4 GHz Low-Power Broadcast ]
```

---

### 4. ARIES v3.0 RISC-V Safety Supervisor Implementation

The ARIES v3.0 development board operates as the independent, air-gapped critical safety authority between the wireless RF receiver and the OR surgical display:
1. **CRC-8 Checksum Verification**: Discards any packet failing the $0\text{x}07$ polynomial check immediately.
2. **Monotonic Sequence Ordering**: Discards duplicated, stalled, or out-of-order packets.
3. **Angular Velocity Governor**: Clamps output angular velocities to $\pm 2800$ LSB ($\approx 45^\circ/\text{s}$) to prevent sudden uncommanded imaging spins if the surgeon bumps an arm.
4. **Autonomous 200 ms Hardware Watchdog**: If wireless packets stall for $> 200\text{ ms}$ (due to out-of-range, battery dead, or RF jamming), ARIES asserts hardware GPIO 4 high, engages the safety lock relay, and freezes the display within 200 ms.
