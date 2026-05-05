#pragma once

#include <HX711.h>
#include <Arduino.h>
#include "ILoadCell.hpp"


class HX711Driver : public ILoadCell {
public:
    HX711Driver(uint8_t dout_pin, uint8_t sck_pin);

    void begin()                          override;
    bool is_ready()               const   override;
    long read_average(uint8_t samples)    override;
    void set_zero(long zero_value)        override;
    long read_net(uint8_t samples)        override;

private:
    uint8_t _dout;
    uint8_t _sck;
    long    _zero = 0;
    HX711   _hx711;
};