/*
 * STERILE VECTOR - BASE STATION RECEIVER FIRMWARE
 * Target: ESP32-C3 (SuperMini Form Factor)
 * Role: Translates ESP-NOW 2.4GHz wireless frames to ARIES v3.0 UART
 * Latency Overhead: < 1.2 ms | Baud: 115,200 8N1
 */

#include <Arduino.h>
#include <esp_now.h>
#include <WiFi.h>

#define UART_TX_TO_ARIES 21
#define UART_RX_TO_ARIES 20
HardwareSerial AriesSerial(1);

void onDataRecv(const uint8_t *mac_addr, const uint8_t *data, int data_len) {
  if (data_len == 12 && data[0] == 0xAA) {
    AriesSerial.write(data, 12);
  }
}

void setup() {
  Serial.begin(115200);
  AriesSerial.begin(115200, SERIAL_8N1, UART_RX_TO_ARIES, UART_TX_TO_ARIES);

  WiFi.mode(WIFI_STA);
  WiFi.disconnect();

  if (esp_now_init() != ESP_OK) {
    Serial.println("ESP-NOW Init Failed!");
    return;
  }

  esp_now_register_recv_cb(onDataRecv);
  Serial.println("Sterile Vector Base Station Ready. Listening on Channel 1...");
}

void loop() {
  delay(10);
}
