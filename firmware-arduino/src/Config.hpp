#pragma once
#include <Arduino.h>


#ifndef SMARTPILLOW_VERSION
#define SMARTPILLOW_VERSION "0.2.0"
#endif

namespace WifiCfg {

    constexpr const char* SSID     = "202";   
    constexpr const char* PASSWORD = "Panini2025";   
    constexpr uint32_t    RETRY_MS = 5000;
}


namespace ServerCfg {

    constexpr const char* HOST          = "192.168.0.100";
    constexpr uint16_t    PORT          = 3000;
    constexpr const char* PATH_DATA     = "/api/data?code=SP-MW7ZF6";
    constexpr const char* PATH_COMMAND  = "/api/command?code=SP-MW7ZF6";
    constexpr uint32_t    CMD_POLL_MS   = 1000;
    constexpr uint32_t    HTTP_TIMEOUT_MS = 3000;
}

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
    constexpr uint8_t TARE_SAMPLES      = 16;
    constexpr uint8_t CALIB_SAMPLES     = 16;
    constexpr uint8_t LOOP_SAMPLES      = 1;
    constexpr uint32_t TARE_DELAY_MS    = 5000;
    constexpr uint32_t CALIB_DELAY_MS   = 12000;
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
    constexpr uint32_t BAUD_RATE = 115200;
}

namespace TimingCfg {
    constexpr uint32_t LOOP_DELAY_MS = 500;
}

namespace EepromCfg {

    constexpr uint16_t ADDR_MAGIC = 0;

    constexpr uint32_t MAGIC_VALUE = 0xCAFE0001;

    constexpr uint16_t ADDR_WEIGHT_KG = 4;
    constexpr uint16_t ADDR_FACTOR    = 8;

    constexpr uint16_t ADDR_REF_FL = 12;
    constexpr uint16_t ADDR_REF_FR = 16;

    constexpr uint16_t ADDR_REF_BL = 20;
    constexpr uint16_t ADDR_REF_BR = 24;
}