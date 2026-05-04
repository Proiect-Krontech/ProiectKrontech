#pragma once

#include "../posture/PostureData.hpp"
#include "../Config.hpp"
#include <Arduino.h>


// ──────────────────────────────────────────────────────────────────────────────
//PostureAnalyzer — receives RawReadings + factor and produces a PostureResult
// ──────────────────────────────────────────────────────────────────────────────

class PostureAnalyzer {
public:
    PostureAnalyzer() = default;

    void set_reference(const WeightDistribution& ref);

    // Analyzes a reading and returns the full result
    PostureResult analyze(const RawReadings& raw,
                          float              factor) const;

    bool update_empty_counter(bool is_empty,
                               int& empty_counter,
                               int  threshold) const;

private:
    WeightDistribution _ref;

    PostureAxisStatus classify_front_back(float diff) const;
    PostureAxisStatus classify_left_right(float diff) const;
};