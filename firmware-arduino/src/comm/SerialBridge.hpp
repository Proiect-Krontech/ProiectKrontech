// SerialBridge.hpp — Trimite date la ESP32 prin UART (Serial1)
//
// Protocolul: un JSON per linie (\n delimiter), la config::kSendIntervalMs.
// ESP32 citește cu readStringUntil('\n') și parsează cu ArduinoJson.
//
// Format mesaj:
// {
//   "ts": 12345,
//   "state": 1,
//   "score": 82,
//   "issues": 0,
//   "front": 0.54,
//   "side": 0.08,
//   "pitch": 3.2,
//   "roll": 1.1,
//   "bad_ms": 0,
//   "seats": [11.2, 10.8, 12.5, 11.9, 8.3, 7.9, 7.7, 5.2]
// } dar poate fi configurabil