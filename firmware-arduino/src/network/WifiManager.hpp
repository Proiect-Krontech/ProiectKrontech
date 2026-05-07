#pragma once

#include <WiFiS3.h>
#include "../Config.hpp"
#include "../utils/Logger.hpp"

class WifiManager {
public:
    void begin() {
        LOG_INFO("WiFi", "Conectare la %s ...", WifiCfg::SSID);
        _try_connect();
    }

    void maintain() {
        if (WiFi.status() == WL_CONNECTED) return;
        if (millis() - _last_try < WifiCfg::RETRY_MS) return;
        LOG_INFO("WiFi", "Reconectare...");
        _try_connect();
    }

    bool is_connected() const {
        return WiFi.status() == WL_CONNECTED;
    }

private:
    uint32_t _last_try = 0;

    void _try_connect() {
        _last_try = millis();
        WiFi.begin(WifiCfg::SSID, WifiCfg::PASSWORD);
        uint8_t tries = 0;
        while (WiFi.status() != WL_CONNECTED && tries < 20) {
            delay(500);
            tries++;
        }
        if (WiFi.status() == WL_CONNECTED) {
            LOG_INFO("WiFi", "Conectat! IP: %s", WiFi.localIP().toString().c_str());
        } else {
            LOG_ERROR("WiFi", "Esec conectare");
        }
    }
};