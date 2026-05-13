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
        return WiFi.status() == WL_CONNECTED &&
               WiFi.localIP() != IPAddress(0, 0, 0, 0);
    }

private:
    uint32_t _last_try = 0;

    void _try_connect() {
        _last_try = millis();

        WiFi.disconnect();
        delay(500);

        WiFi.begin(WifiCfg::SSID, WifiCfg::PASSWORD);

        uint8_t tries = 0;

        while (WiFi.status() != WL_CONNECTED && tries < 30) {
            delay(500);
            tries++;

            LOG_INFO("WiFi",
                     "Astept conexiune... (%d/30)",
                     tries);
        }

        if (WiFi.status() == WL_CONNECTED) {

            uint8_t ip_tries = 0;

            while (WiFi.localIP() == IPAddress(0, 0, 0, 0) &&
                   ip_tries < 20) {

                delay(500);
                ip_tries++;

                LOG_INFO("WiFi",
                         "Astept IP de la DHCP... (%d/20)",
                         ip_tries);
            }

            if (WiFi.localIP() != IPAddress(0, 0, 0, 0)) {

                LOG_INFO("WiFi",
                         "Conectat! IP: %s",
                         WiFi.localIP().toString().c_str());

                LOG_INFO("WiFi",
                         "Gateway: %s",
                         WiFi.gatewayIP().toString().c_str());

                LOG_INFO("WiFi",
                         "Server target: %s:%d",
                         ServerCfg::HOST,
                         ServerCfg::PORT);

            } else {

                LOG_ERROR("WiFi",
                          "Conectat la WiFi dar IP invalid (0.0.0.0). Reincerc...");

                WiFi.disconnect();
            }

        } else {

            LOG_ERROR("WiFi",
                      "Esec conectare la %s",
                      WifiCfg::SSID);
        }
    }
};