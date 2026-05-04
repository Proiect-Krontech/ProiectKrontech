#pragma once
#include <Arduino.h>

#ifndef SMARTPILLOW_VERSION
#define SMARTPILLOW_VERSION "0.1.0"
#endif

namespace PinCfg {
    constexpr uint8_t BL_DOUT = 3;
    constexpr uint8_t BL_SCK  = 2;
    constexpr uint8_t BR_DOUT = 5;
    constexpr uint8_t BR_SCK  = 4;
    constexpr uint8_t FL_DOUT = 6;
    constexpr uint8_t FL_SCK  = 7;
    constexpr uint8_t FR_DOUT = 9;
    constexpr uint8_t FR_SCK  = 8;
    constexpr uint8_t BUZZER  = 12;
}

namespace CalibCfg {

    constexpr float REFERENCE_WEIGHT_KG = 60.0f;
    constexpr uint8_t TARE_SAMPLES      = 64;
    constexpr uint8_t CALIB_SAMPLES     = 64;
    constexpr uint8_t LOOP_SAMPLES      = 10;
    constexpr uint32_t TARE_DELAY_MS    = 5000;
    constexpr uint32_t CALIB_DELAY_MS   = 5000;
}

namespace PresenceCfg {
    constexpr float EMPTY_THRESHOLD_KG  = 10.0f;
    constexpr uint8_t AUTO_ZERO_ITERATIONS = 6;
}

namespace PostureCfg {
    constexpr float FRONT_BACK_THRESHOLD    = 8.0f;
    constexpr float LEFT_RIGHT_THRESHOLD    = 8.0f;
}

namespace SerialCfg {
    constexpr uint32_t BAUD_RATE = 9600;
}

namespace TimingCfg {
    constexpr uint32_t LOOP_DELAY_MS = 500;
}