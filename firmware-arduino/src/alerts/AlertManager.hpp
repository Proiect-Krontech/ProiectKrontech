#pragma once

#include <Arduino.h>
#include "../utils/Logger.hpp"


class AlertManager {
public:
    explicit AlertManager(uint8_t pin);

    void begin();
    void on();
    void off();
    bool is_active() const { return _active; }

private:
    uint8_t _pin;
    bool    _active = false;
};