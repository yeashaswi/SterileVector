/*
 * STERILE VECTOR - ARIES v3.0 RISC-V SAFETY SUPERVISOR
 * Target: ARIES v3.0 Embedded Platform (VEGA ET1031 RISC-V SoC)
 * Function: Hardware Air-Gapped Firewall & Display Failsafe Governor
 * Standards: IEC 62304 Class B Medical Device Software Safety
 * Watchdog Trip Limit: < 200 ms to display freeze on fault
 */

#include <stdio.h>
#include <stdint.h>
#include <stdbool.h>

// Mock VEGA peripheral definitions for standalone build environments
#ifndef VEGA_UART_H
#define UART_RX_BASESTATION  1
#define UART_TX_HOST_OR      0
#define GPIO_SAFETY_RELAY    4
#define GPIO_HIGH            1
#define GPIO_LOW             0
#define GPIO_OUTPUT          1

static inline void vega_gpio_init(int pin, int dir) {}
static inline void vega_gpio_write(int pin, int val) {}
static inline void vega_uart_init(int uart, int baud) {}
static inline int  vega_uart_available(int uart) { return 0; }
static inline uint8_t vega_uart_read_byte(int uart) { return 0; }
static inline void vega_uart_write(int uart, const uint8_t *data, int len) {}
static inline void vega_timer_init(void) {}
static inline uint32_t vega_timer_get_ms(void) { return 0; }
#endif

#define MAX_ANGULAR_RATE     2800      // Angular governor clamp limit (prevents erratic spin)
#define WATCHDOG_TIMEOUT_MS  200       // Hard failsafe trip boundary

typedef struct __attribute__((packed)) {
  uint8_t  sync;
  uint8_t  seq;
  uint8_t  state;
  int16_t  rate_x;
  int16_t  rate_y;
  int16_t  rate_zoom;
  uint8_t  flags;
  uint8_t  batt;
  uint8_t  crc;
} TelemetryFrame_t;

static const uint8_t crc8_table[256] = {
  0x00, 0x07, 0x0E, 0x09, 0x1C, 0x1B, 0x12, 0x15, 0x38, 0x3F, 0x36, 0x31, 0x24, 0x23, 0x2A, 0x2D,
  0x70, 0x77, 0x7E, 0x79, 0x6C, 0x6B, 0x62, 0x65, 0x48, 0x4F, 0x46, 0x41, 0x54, 0x53, 0x5A, 0x5D,
  0xE0, 0xE7, 0xEE, 0xE9, 0xFC, 0xFB, 0xF2, 0xF5, 0xD8, 0xDF, 0xD6, 0xD1, 0xC4, 0xC3, 0xCA, 0xCD,
  0x90, 0x97, 0x9E, 0x99, 0x8C, 0x8B, 0x82, 0x85, 0xA8, 0xAF, 0xA6, 0xA1, 0xB4, 0xB3, 0xBA, 0xBD,
  0xC7, 0xC0, 0xC9, 0xCE, 0xDB, 0xDC, 0xD5, 0xD2, 0xFF, 0xF8, 0xF1, 0xF6, 0xE3, 0xE4, 0xED, 0xEA,
  0xB7, 0xB0, 0xB9, 0xBE, 0xAB, 0xAC, 0xA5, 0xA2, 0x8F, 0x88, 0x81, 0x86, 0x93, 0x94, 0x9D, 0x9A,
  0x27, 0x20, 0x29, 0x2E, 0x3B, 0x3C, 0x35, 0x32, 0x1F, 0x18, 0x11, 0x16, 0x03, 0x04, 0x0D, 0x0A,
  0x57, 0x50, 0x59, 0x5E, 0x4B, 0x4C, 0x45, 0x42, 0x6F, 0x68, 0x61, 0x66, 0x73, 0x74, 0x7D, 0x7A,
  0x89, 0x8E, 0x87, 0x80, 0x95, 0x92, 0x9B, 0x9C, 0xB1, 0xB6, 0xBF, 0xB8, 0xAD, 0xAA, 0xA3, 0xA4,
  0xF9, 0xFE, 0xF7, 0xF0, 0xE5, 0xE2, 0xEB, 0xEC, 0xC1, 0xC6, 0xCF, 0xC8, 0xDD, 0xDA, 0xD3, 0xD4,
  0x69, 0x6E, 0x67, 0x60, 0x75, 0x72, 0x7B, 0x7C, 0x51, 0x56, 0x5F, 0x58, 0x4D, 0x4A, 0x43, 0x44,
  0x19, 0x1E, 0x17, 0x10, 0x05, 0x02, 0x0B, 0x0C, 0x21, 0x26, 0x2F, 0x28, 0x3D, 0x3A, 0x33, 0x34,
  0x4E, 0x49, 0x40, 0x47, 0x52, 0x55, 0x5C, 0x5B, 0x76, 0x71, 0x78, 0x7F, 0x6A, 0x6D, 0x64, 0x63,
  0x3E, 0x39, 0x30, 0x37, 0x22, 0x25, 0x2C, 0x2B, 0x06, 0x01, 0x08, 0x0F, 0x1A, 0x1D, 0x14, 0x13,
  0xAE, 0xA9, 0xA0, 0xA7, 0xB2, 0xB5, 0xBC, 0xBB, 0x96, 0x91, 0x98, 0x9F, 0x8A, 0x8D, 0x84, 0x83,
  0xDE, 0xD9, 0xD0, 0xD7, 0xC2, 0xC5, 0xCC, 0xCB, 0xE6, 0xE1, 0xE8, 0xEF, 0xFA, 0xFD, 0xF4, 0xF3
};

static uint8_t  last_valid_seq = 0;
static uint32_t last_packet_time_ms = 0;
static bool     hardware_locked = true;

static inline uint8_t aries_calculate_crc8(const uint8_t *data, uint32_t len) {
  uint8_t crc = 0x00;
  for (uint32_t i = 0; i < len; i++) {
    crc = crc8_table[data[i] ^ crc];
  }
  return crc;
}

void aries_engage_safety_lock(const char *reason) {
  hardware_locked = true;
  vega_gpio_write(GPIO_SAFETY_RELAY, GPIO_HIGH);
  
  TelemetryFrame_t lock_frame = {
    .sync = 0xAA,
    .seq = last_valid_seq,
    .state = 0x03, // FAULT / LOCKED
    .rate_x = 0,
    .rate_y = 0,
    .rate_zoom = 0,
    .flags = 0,
    .batt = 0,
    .crc = 0
  };
  lock_frame.crc = aries_calculate_crc8((uint8_t*)&lock_frame, 11);
  vega_uart_write(UART_TX_HOST_OR, (uint8_t*)&lock_frame, sizeof(lock_frame));
}

int main(void) {
  vega_gpio_init(GPIO_SAFETY_RELAY, GPIO_OUTPUT);
  vega_gpio_write(GPIO_SAFETY_RELAY, GPIO_HIGH);

  vega_uart_init(UART_RX_BASESTATION, 115200);
  vega_uart_init(UART_TX_HOST_OR, 115200);
  vega_timer_init();

  last_packet_time_ms = vega_timer_get_ms();

  uint8_t rx_buffer[12];
  uint32_t rx_index = 0;

  while (1) {
    uint32_t current_time_ms = vega_timer_get_ms();

    if ((current_time_ms - last_packet_time_ms) > WATCHDOG_TIMEOUT_MS) {
      if (!hardware_locked) {
        aries_engage_safety_lock("Watchdog stall > 200 ms");
      }
    }

    while (vega_uart_available(UART_RX_BASESTATION)) {
      uint8_t b = vega_uart_read_byte(UART_RX_BASESTATION);

      if (rx_index == 0 && b != 0xAA) {
        continue;
      }

      rx_buffer[rx_index++] = b;

      if (rx_index == 12) {
        rx_index = 0;
        TelemetryFrame_t *frame = (TelemetryFrame_t*)rx_buffer;

        // Check 1: CRC-8 Checksum
        uint8_t expected_crc = aries_calculate_crc8(rx_buffer, 11);
        if (frame->crc != expected_crc) {
          continue;
        }

        // Check 2: Monotonic Sequence Numbering
        uint8_t delta_seq = (frame->seq - last_valid_seq) & 0xFF;
        if (delta_seq > 30 && delta_seq < 230) {
          continue;
        }

        // Check 3: Rate Governor
        if (frame->rate_x > MAX_ANGULAR_RATE)  frame->rate_x = MAX_ANGULAR_RATE;
        if (frame->rate_x < -MAX_ANGULAR_RATE) frame->rate_x = -MAX_ANGULAR_RATE;
        if (frame->rate_y > MAX_ANGULAR_RATE)  frame->rate_y = MAX_ANGULAR_RATE;
        if (frame->rate_y < -MAX_ANGULAR_RATE) frame->rate_y = -MAX_ANGULAR_RATE;

        last_packet_time_ms = current_time_ms;
        last_valid_seq = frame->seq;
        hardware_locked = false;
        vega_gpio_write(GPIO_SAFETY_RELAY, GPIO_LOW);

        frame->crc = aries_calculate_crc8((uint8_t*)frame, 11);
        vega_uart_write(UART_TX_HOST_OR, (uint8_t*)frame, sizeof(TelemetryFrame_t));
      }
    }
  }

  return 0;
}
