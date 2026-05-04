#include "AlertManager.hpp"

static const char* TAG = "AlertManager";

AlertManager::AlertManager(uint8_t pin)
    : _pin(pin) {}

void AlertManager::begin() {
    pinMode(_pin, OUTPUT);
    digitalWrite(_pin, LOW);
    LOG_INFO(TAG, "Buzzer activ init pe pin %d", _pin);
}

void AlertManager::on() {
    digitalWrite(_pin, HIGH);
    _active = true;
    LOG_DEBUG(TAG, "Buzzer ON");
}

void AlertManager::off() {
    digitalWrite(_pin, LOW);
    _active = false;
    LOG_DEBUG(TAG, "Buzzer OFF");
}