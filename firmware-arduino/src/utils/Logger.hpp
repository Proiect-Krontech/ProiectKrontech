//Logger.hpp — Logging centralizat cu nivel de severitate
//
// Folosire:
//   LOG_INFO("SensorManager", "HX711 canal %d ready", channel);
//   LOG_WARN("PostureAnalyzer", "Imbalance: %.2f", ratio);
//   LOG_ERROR("SerialBridge", "JSON serialize failed");
//   LOG_VERBOSE("LoadCell", "Raw: %ld", raw_value);  // doar dacă kLogVerbose