// Telemetry Packet & State Definitions based on Sterile Vector Specification

export type SystemState = 'LOCKED' | 'ACTIVE' | 'PAUSED' | 'FAULT';
export type DisplayMode = '3D_VOLUME' | '2D_DICOM';
export type KinematicChannel = 'ROTATION' | 'ZOOM';

export type GestureClass = 'IDLE' | 'CLUTCH' | 'ROLL_FLICK' | 'TAP';

export interface TelemetryPacket {
  syncHeader: number;       // 0xAA (Byte 0)
  sequenceNumber: number;   // 0-255 roll-over (Byte 1)
  systemState: SystemState; // (Byte 2)
  displayMode: DisplayMode; // (Byte 2 bitfield)
  rateX: number;            // Pitch rate (-32768 to 32767) (Bytes 3-4)
  rateY: number;            // Roll rate (-32768 to 32767) (Bytes 5-6)
  rateZoom: number;         // Zoom rate delta (-32768 to 32767) (Bytes 7-8)
  eventFlags: {             // Byte 9
    clutchDetected: boolean;
    flickDetected: boolean;
    tapDetected: boolean;
  };
  batteryLevel: number;     // 0-100% (Byte 10)
  crc8Checksum: number;     // Polynomial 0x07 (Byte 11)
  
  // Computed runtime telemetry
  timestamp: number;
  pitchDeg: number;         // Tilt estimated in degrees
  rollDeg: number;          // Tilt estimated in degrees
  dominantAxis: 'PITCH' | 'ROLL' | 'NONE';
  inDeadZone: boolean;
  cnnConfidences: {
    idle: number;
    clutch: number;
    rollFlick: number;
    tap: number;
  };
  hapticStatus: 'OFF' | 'LONG_PULSE' | 'TRIPLE_PULSE';
  watchdogLatencyMs: number;
  ariesVerified: boolean;
  rawHex: string;
}

export interface HardwareMetrics {
  totalPackets: number;
  droppedPackets: number;
  crcErrors: number;
  rateExceededCount: number;
  watchdogTrips: number;
  averageLatencyMs: number;
  powerDrawMa: number;
}
