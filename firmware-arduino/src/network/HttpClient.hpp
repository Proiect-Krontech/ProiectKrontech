#pragma once

#include <WiFiS3.h>
#include <ArduinoJson.h>
#include "../Config.hpp"
#include "../utils/Logger.hpp"

class HttpClient {
public:
    bool post_data(const JsonDocument& data, JsonDocument& out_cmd) {
        String body;
        serializeJson(data, body);

        if (!_connect()) return false;

        _client.print("POST ");
        _client.print(ServerCfg::PATH_DATA);
        _client.println(" HTTP/1.1");
        _client.print("Host: ");
        _client.println(ServerCfg::HOST);
        _client.println("Content-Type: application/json");
        _client.print("Content-Length: ");
        _client.println(body.length());
        _client.println("Connection: close");
        _client.println();
        _client.print(body);

        String response = _read_body();
        _client.stop();

        if (response.length() > 2) {
            DeserializationError err = deserializeJson(out_cmd, response);
            if (!err && out_cmd.containsKey("cmd")) {
                LOG_INFO("HTTP", "Comanda in raspuns: %s", response.c_str());
                return true;
            }
        }
        return false;
    }

    bool get_command(JsonDocument& out_cmd) {
        if (!_connect()) return false;

        _client.print("GET ");
        _client.print(ServerCfg::PATH_COMMAND);
        _client.println(" HTTP/1.1");
        _client.print("Host: ");
        _client.println(ServerCfg::HOST);
        _client.println("Connection: close");
        _client.println();

        String response = _read_body();
        _client.stop();

        if (response.length() <= 2) return false;

        DeserializationError err = deserializeJson(out_cmd, response);
        if (!err && out_cmd.containsKey("cmd")) {
            LOG_INFO("HTTP", "Comanda primita: %s", response.c_str());
            return true;
        }
        return false;
    }

private:
    WiFiClient _client;

    bool _connect() {
        if (!_client.connect(ServerCfg::HOST, ServerCfg::PORT)) {
            LOG_ERROR("HTTP", "Nu pot conecta la %s:%d", ServerCfg::HOST, ServerCfg::PORT);
            return false;
        }
        return true;
    }

    String _read_body() {
        uint32_t start = millis();
        String raw = "";

        while (_client.connected() && millis() - start < ServerCfg::HTTP_TIMEOUT_MS) {
            if (_client.available()) {
                raw += (char)_client.read();
            }
        }

        int sep = raw.indexOf("\r\n\r\n");
        if (sep == -1) return "";
        String body = raw.substring(sep + 4);
        body.trim();
        return body;
    }
};