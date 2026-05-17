#include "HX711Driver.hpp"
#include "../utils/Logger.hpp"

static const char* TAG = "HX711Driver";

HX711Driver::HX711Driver(uint8_t dout_pin, uint8_t sck_pin)
    : _dout(dout_pin), _sck(sck_pin) {}

void HX711Driver::begin() {
    _hx711.begin(_dout, _sck);
    LOG_DEBUG(TAG, "begin() DOUT=%d SCK=%d", _dout, _sck);
}

bool HX711Driver::is_ready() const {
    return const_cast<HX711&>(_hx711).is_ready();
}

long HX711Driver::read_average(uint8_t samples) {
    long val = _hx711.read_average(samples);
    LOG_DEBUG(TAG, "read_average(%d) = %ld  [DOUT=%d]", samples, val, _dout);
    return val;
}

void HX711Driver::set_zero(long zero_value) {
    _zero = zero_value;
    LOG_DEBUG(TAG, "set_zero(%ld)  [DOUT=%d]", zero_value, _dout);
}

long HX711Driver::read_net(uint8_t samples) {
    long raw = _hx711.read_average(samples);
    long net = raw - _zero;
    LOG_DEBUG(TAG, "read_net(%d) raw=%ld zero=%ld net=%ld  [DOUT=%d]",
              samples, raw, _zero, net, _dout);
    return net;
}