# Smart Pillow — Firmware

Firmware for **Arduino Uno R4 WiFi** (Renesas RA4M1).  
Reads 8 load cells grouped in pairs across 4 HX711 modules, 
analyzes posture and sends data via WiFi.

---

## Project Structure

```
firmware/
├── src/
│   ├── Config.hpp                  ← all constants (pins, thresholds, timings)
│   ├── Secrets.hpp                 ← WiFi / API credentials template (do not commit real values)
│   ├── StorageManager.hpp          ← local storage management
│   ├── main.cpp                    ← setup() + loop()
│   │
│   ├── sensors/
│   │   ├── ILoadCell.hpp           ← pure interface
│   │   ├── HX711Driver.hpp/.cpp    ← real driver
│   │   └── SensorManager.hpp/.cpp  ← orchestration + sliding average
│   │
│   ├── posture/
│   │   ├── PostureData.hpp         ← data structures (PostureResult, enums)
│   │   └── PostureAnalyzer.hpp/.cpp ← posture detection algorithm
│   │
│   ├── alerts/
│   │   └── AlertManager.hpp/.cpp   ← non-blocking alert management
│   │
│   ├── network/
│   │   ├── WifiManager.hpp         ← WiFi connection and management
│   │   └── HttpClient.hpp          ← sends data to server via HTTP
│   │
│   └── utils/
│       └── Logger.hpp              ← centralized logging with levels
│
├── test/
│   └── test_native/
│       ├── test_alert_manager.cpp
│       ├── test_posture_analyzer.cpp
│       ├── test_sensor_manager.cpp
│       └── test_posture_data.cpp
│
└── platformio.ini
```

---

## Quick Setup

### 1. Install PlatformIO

```bash
pip install platformio
# or use the PlatformIO IDE extension in VS Code
```

### 2. Run unit tests (no hardware required)

```bash
cd firmware
pio test -e native
```

### 3. Build firmware

```bash
pio run -e uno_r4_wifi
```

### 4. Upload to Arduino

```bash
pio run -e uno_r4_wifi --target upload
```

### 5. Serial monitor

```bash
pio device monitor --baud 115200
```

---

## Credentials Setup

In `src/Secrets.hpp`, replace the placeholder values with your local configuration.
> **Warning:** Do not commit real credentials.

---

## Hardware Connections

### HX711 (load cells)

| HX711 | DOUT | SCK | Cells |
|-------|------|-----|-------|
| #BL (BackLeft)   | 3 | 2 | 1, 2 |
| #BR (BackRight)  | 5 | 4 | 3, 4 |
| #FL (FrontLeft)  | 6 | 7 | 5, 6 |
| #FR (FrontRight) | 9 | 8 | 7, 8 |

### Buzzer

| Signal | Pin |
|--------|-----|
| Arduino Pin → R 1kΩ → 2N2222 Base | 12 |
| 2N2222 Emitter | GND |
| 2N2222 Collector → Buzzer GND | - |
| Buzzer VCC | 3.3V |

---

## Conventional Commits

```
feat(sensors): add HX711 driver and iloadcell interface
feat(network): add HttpClient and WifiManager
feat(alerts): add AlertManager
feat: add posture analyzer module
feat: add storage manager integration
refactor: remove accelerometer and BuzzerPatterns modules
chore: add shared secrets template
```

---

## Coding Style

**Google C++ Style Guide** — automatic formatting:

```bash
clang-format -i src/**/*.cpp src/**/*.hpp
```

`.clang-format` file in the repository root:

```yaml
BasedOnStyle: Google
IndentWidth: 4
ColumnLimit: 100
```
