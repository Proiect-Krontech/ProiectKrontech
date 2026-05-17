#pragma once

#include <stdint.h>

class ILoadCell {
public:
    virtual ~ILoadCell() = default;

    virtual void begin() = 0;

    virtual bool is_ready() const = 0;

    virtual long read_average(uint8_t samples) = 0;

    virtual void set_zero(long zero_value) = 0;

    virtual long read_net(uint8_t samples) = 0;
};