// Standard CRC-8 Implementation using Polynomial 0x07 (ATM/SMBus)
// Generates look-up table and validates packets

const CRC8_POLY = 0x07;
const crcTable = new Uint8Array(256);

// Pre-compute CRC8 lookup table for maximum runtime performance
for (let i = 0; i < 256; i++) {
  let curr = i;
  for (let j = 0; j < 8; j++) {
    if ((curr & 0x80) !== 0) {
      curr = ((curr << 1) ^ CRC8_POLY) & 0xff;
    } else {
      curr = (curr << 1) & 0xff;
    }
  }
  crcTable[i] = curr;
}

/**
 * Computes CRC-8 checksum over a buffer using polynomial 0x07
 */
export function computeCRC8(buffer: Uint8Array, length: number): number {
  let crc = 0x00;
  for (let i = 0; i < length; i++) {
    const data = buffer[i] ^ crc;
    crc = crcTable[data];
  }
  return crc;
}

/**
 * Validates a 12-byte Sterile Vector packet
 * Bytes 0-10 are payload, Byte 11 is the checksum
 */
export function validatePacketCRC(packetBytes: Uint8Array): boolean {
  if (packetBytes.length < 12) return false;
  const calculated = computeCRC8(packetBytes, 11);
  return calculated === packetBytes[11];
}
