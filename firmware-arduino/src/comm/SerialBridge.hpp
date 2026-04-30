// SerialBridge.hpp — Trimite date la ESP32 prin UART (Serial1)
//
// Protocolul: un JSON per linie (\n delimiter), la config::kSendIntervalMs.
// ESP32 citește cu readStringUntil('\n') și parsează cu ArduinoJson.
//
// Format mesaj:
// {
//   "device_id": "PERNA001",
//   "timestamp": 171S17B905,
//   "posture": "good",
//   "confidence": 0.85,
//   "F": 0.54,
//   "S": 0.08,
//   "L": 3.2,
//   "R": 1.1,
//   "state_duration": 5,
// } dar poate fi configurabil