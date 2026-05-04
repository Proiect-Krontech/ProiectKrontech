#pragma once

#include "ILoadCell.hpp"
#include "../posture/PostureData.hpp"


class SensorManager {
public:
    SensorManager(ILoadCell* fl, ILoadCell* fr, ILoadCell* bl, ILoadCell* br);

    void begin();

    void wait_until_ready();

    void tare(uint8_t samples);

    void calibrate(uint8_t samples,
                   float   reference_weight_kg,
                   float&  out_factor,
                   WeightDistribution& out_ref);

    RawReadings read(uint8_t samples);

private:
    ILoadCell* _fl;
    ILoadCell* _fr;
    ILoadCell* _bl;
    ILoadCell* _br;
};