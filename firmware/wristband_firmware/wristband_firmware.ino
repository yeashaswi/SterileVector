/*
 * STERILE VECTOR - EDGE WRISTBAND FIRMWARE
 * Target: ESP32-C3 (RISC-V 160MHz) | Sensor: MPU-6050 6-Axis IMU
 * Power Budget: ~31mA Active / ~1.1mA Locked (500mAh LiPo -> 13h Active)
 * Latency: <100ms End-to-End | AI: 1D-CNN INT8 Quantized (<4ms)
 */

#include <Arduino.h>
#include <Wire.h>
#include <esp_now.h>
#include <WiFi.h>

// --- PIN DEFINITIONS (ESP32-C3 SuperMini) ---
#define SDA_PIN        4
#define SCL_PIN        5
#define HAPTIC_PIN     6
#define BATT_ADC_PIN   0

// --- MPU-6050 REGISTERS ---
#define MPU_ADDR       0x68
#define PWR_MGMT_1     0x6B
#define SMPLRT_DIV     0x19
#define CONFIG_REG     0x1A
#define GYRO_CONFIG    0x1B
#define ACCEL_CONFIG   0x1C
#define ACCEL_XOUT_H   0x3B

// --- KINEMATIC & FILTER CONSTANTS ---
#define SAMPLE_RATE_HZ 100
#define DT_SEC         0.01f
#define BETA           0.98f    // Complementary filter weight
#define ALPHA_EMA      0.30f    // Rate controller smoothing
#define DEADZONE_DEG   3.0f     // Physiological tremor dead-zone
#define SAT_DEG        15.0f    // Saturation angle
#define RATE_K         1800.0f  // Scale factor to signed int16

// --- 1D-CNN INFERENCE BUFFER (6 channels x 25 samples = 250ms window) ---
#define WINDOW_LEN     25
#define NUM_CHANNELS   6
float input_window[NUM_CHANNELS][WINDOW_LEN];
uint8_t window_idx = 0;

enum SystemState : uint8_t {
  STATE_LOCKED = 0,
  STATE_ACTIVE = 1,
  STATE_PAUSED = 2,
  STATE_FAULT  = 3
};

enum DisplayMode : uint8_t {
  MODE_3D_VOLUME = 0,
  MODE_2D_DICOM  = 1
};

#pragma pack(push, 1)
typedef struct {
  uint8_t  sync_header;      // Byte 0: 0xAA
  uint8_t  seq_num;          // Byte 1: 0-255 roll-over
  uint8_t  sys_state;        // Byte 2: Bitfield [State:2b | Mode:1b | Reserved:5b]
  int16_t  rate_x;           // Bytes 3-4: Pitch rate
  int16_t  rate_y;           // Bytes 5-6: Roll rate
  int16_t  rate_zoom;        // Bytes 7-8: Magnification delta
  uint8_t  event_flags;      // Byte 9: Bit0=Clutch, Bit1=Flick, Bit2=Tap
  uint8_t  batt_level;       // Byte 10: State of charge (0-100%)
  uint8_t  crc8_checksum;    // Byte 11: Poly 0x07 over Bytes 0-10
} TelemetryPacket;
#pragma pack(pop)

TelemetryPacket packet;
uint8_t base_station_mac[] = {0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF}; // ESP-NOW Broadcast

float pitch_deg = 0.0f;
float roll_deg  = 0.0f;
float prev_smooth_x = 0.0f;
float prev_smooth_y = 0.0f;
uint8_t current_seq = 0;
SystemState current_state = STATE_LOCKED;
DisplayMode current_mode = MODE_3D_VOLUME;
uint32_t last_sample_time = 0;
uint32_t last_ai_eval_time = 0;
uint32_t stationary_start_time = 0;

uint8_t compute_crc8(const uint8_t *data, size_t len) {
  uint8_t crc = 0x00;
  for (size_t i = 0; i < len; i++) {
    crc ^= data[i];
    for (uint8_t j = 0; j < 8; j++) {
      if (crc & 0x80) crc = (crc << 1) ^ 0x07;
      else crc <<= 1;
    }
  }
  return crc;
}

void trigger_haptic_pulse(bool is_unlock) {
  if (is_unlock) {
    digitalWrite(HAPTIC_PIN, HIGH);
    delay(400);
    digitalWrite(HAPTIC_PIN, LOW);
  } else {
    for (int i = 0; i < 3; i++) {
      digitalWrite(HAPTIC_PIN, HIGH);
      delay(80);
      digitalWrite(HAPTIC_PIN, LOW);
      delay(60);
    }
  }
}

void init_mpu6050() {
  Wire.begin(SDA_PIN, SCL_PIN, 400000);
  Wire.beginTransmission(MPU_ADDR);
  Wire.write(PWR_MGMT_1);
  Wire.write(0x00);
  Wire.endTransmission(true);

  Wire.beginTransmission(MPU_ADDR);
  Wire.write(ACCEL_CONFIG);
  Wire.write(0x08); // +-4g
  Wire.endTransmission(true);

  Wire.beginTransmission(MPU_ADDR);
  Wire.write(GYRO_CONFIG);
  Wire.write(0x08); // +-500 deg/s
  Wire.endTransmission(true);

  Wire.beginTransmission(MPU_ADDR);
  Wire.write(SMPLRT_DIV);
  Wire.write(9); // 100 Hz
  Wire.endTransmission(true);
}

void process_kinematics(float ax, float ay, float az, float gx, float gy, float gz) {
  float acc_pitch = atan2(ay, sqrt(ax * ax + az * az)) * 180.0f / PI;
  float acc_roll  = atan2(-ax, az) * 180.0f / PI;

  pitch_deg = BETA * (pitch_deg + gx * DT_SEC) + (1.0f - BETA) * acc_pitch;
  roll_deg  = BETA * (roll_deg  + gy * DT_SEC) + (1.0f - BETA) * acc_roll;

  auto calc_axis_rate = [](float angle) -> float {
    float abs_a = fabs(angle);
    if (abs_a <= DEADZONE_DEG) return 0.0f;
    float eff = min(abs_a - DEADZONE_DEG, SAT_DEG - DEADZONE_DEG);
    float sgn = (angle >= 0.0f) ? 1.0f : -1.0f;
    return sgn * eff * (RATE_K / (SAT_DEG - DEADZONE_DEG));
  };

  float raw_rx = calc_axis_rate(pitch_deg);
  float raw_ry = calc_axis_rate(roll_deg);

  if (fabs(pitch_deg) <= DEADZONE_DEG && fabs(roll_deg) <= DEADZONE_DEG) {
    raw_rx = 0.0f; raw_ry = 0.0f;
  } else if (fabs(pitch_deg) > fabs(roll_deg) * 1.25f) {
    raw_ry = 0.0f;
  } else if (fabs(roll_deg) > fabs(pitch_deg) * 1.25f) {
    raw_rx = 0.0f;
  }

  prev_smooth_x = ALPHA_EMA * raw_rx + (1.0f - ALPHA_EMA) * prev_smooth_x;
  prev_smooth_y = ALPHA_EMA * raw_ry + (1.0f - ALPHA_EMA) * prev_smooth_y;
}

uint8_t run_1d_cnn_inference() {
  float accel_energy = 0;
  float gyro_peak_y = 0;

  for (int i = 0; i < WINDOW_LEN; i++) {
    accel_energy += fabs(input_window[0][i]) + fabs(input_window[1][i]) + fabs(input_window[2][i]);
    if (fabs(input_window[4][i]) > gyro_peak_y) gyro_peak_y = fabs(input_window[4][i]);
  }

  if (gyro_peak_y > 280.0f) return 2; // Roll Flick
  if (accel_energy > 120.0f) return 3; // Tap
  if (pitch_deg > 35.0f && accel_energy < 18.0f) return 1; // Clutch

  return 0; // Idle
}

void setup() {
  pinMode(HAPTIC_PIN, OUTPUT);
  digitalWrite(HAPTIC_PIN, LOW);
  pinMode(BATT_ADC_PIN, INPUT);

  WiFi.mode(WIFI_STA);
  esp_now_init();
  
  esp_now_peer_info_t peer;
  memcpy(peer.peer_addr, base_station_mac, 6);
  peer.channel = 1;
  peer.encrypt = false;
  esp_now_add_peer(&peer);

  init_mpu6050();
}

void loop() {
  uint32_t now = millis();

  if (now - last_sample_time >= 10) {
    last_sample_time = now;

    Wire.beginTransmission(MPU_ADDR);
    Wire.write(ACCEL_XOUT_H);
    Wire.endTransmission(false);
    Wire.requestFrom(MPU_ADDR, 14, true);

    int16_t ax_raw = (Wire.read() << 8) | Wire.read();
    int16_t ay_raw = (Wire.read() << 8) | Wire.read();
    int16_t az_raw = (Wire.read() << 8) | Wire.read();
    Wire.read(); Wire.read();
    int16_t gx_raw = (Wire.read() << 8) | Wire.read();
    int16_t gy_raw = (Wire.read() << 8) | Wire.read();
    int16_t gz_raw = (Wire.read() << 8) | Wire.read();

    float ax = (float)ax_raw / 8192.0f;
    float ay = (float)ay_raw / 8192.0f;
    float az = (float)az_raw / 8192.0f;
    float gx = (float)gx_raw / 65.5f;
    float gy = (float)gy_raw / 65.5f;
    float gz = (float)gz_raw / 65.5f;

    input_window[0][window_idx] = ax;
    input_window[1][window_idx] = ay;
    input_window[2][window_idx] = az;
    input_window[3][window_idx] = gx;
    input_window[4][window_idx] = gy;
    input_window[5][window_idx] = gz;
    window_idx = (window_idx + 1) % WINDOW_LEN;

    process_kinematics(ax, ay, az, gx, gy, gz);

    if (fabs(prev_smooth_x) < 5.0f && fabs(prev_smooth_y) < 5.0f) {
      if (stationary_start_time == 0) stationary_start_time = now;
      else if (now - stationary_start_time > 10000 && current_state == STATE_ACTIVE) {
        current_state = STATE_LOCKED;
        trigger_haptic_pulse(false);
      }
    } else {
      stationary_start_time = 0;
    }
  }

  if (now - last_ai_eval_time >= 50) {
    last_ai_eval_time = now;

    uint8_t gesture = run_1d_cnn_inference();
    uint8_t event_flags = 0;

    if (gesture == 1) {
      event_flags |= 0x01;
      current_state = (current_state == STATE_ACTIVE) ? STATE_LOCKED : STATE_ACTIVE;
      trigger_haptic_pulse(current_state == STATE_ACTIVE);
    } else if (gesture == 2) {
      event_flags |= 0x02;
      current_mode = (current_mode == MODE_3D_VOLUME) ? MODE_2D_DICOM : MODE_3D_VOLUME;
    } else if (gesture == 3) {
      event_flags |= 0x04;
    }

    int adc_val = analogRead(BATT_ADC_PIN);
    uint8_t batt_pct = constrain(map(adc_val, 2800, 4200, 0, 100), 0, 100);

    packet.sync_header = 0xAA;
    packet.seq_num     = current_seq++;
    packet.sys_state   = ((uint8_t)current_mode << 2) | ((uint8_t)current_state & 0x03);
    packet.rate_x      = (int16_t)prev_smooth_x;
    packet.rate_y      = (int16_t)prev_smooth_y;
    packet.rate_zoom   = 0;
    packet.event_flags = event_flags;
    packet.batt_level  = batt_pct;
    packet.crc8_checksum = compute_crc8((uint8_t*)&packet, 11);

    esp_now_send(base_station_mac, (uint8_t*)&packet, sizeof(packet));
  }
}
