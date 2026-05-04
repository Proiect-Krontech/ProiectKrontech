#pragma once

#include "../posture/PostureData.hpp"
#include "../Config.hpp"
#include <Arduino.h>


// ──────────────────────────────────────────────────────────────────────────────
//  PostureAnalyzer — primeste RawReadings + factor si produce un PostureResult
//
//  Toata logica de detectie postura e izolata aici.
//  Nu stie nimic despre hardware sau Serial.
// ──────────────────────────────────────────────────────────────────────────────

class PostureAnalyzer {
public:
    PostureAnalyzer() = default;

    // Seteaza referinta de distributie (se apeleaza dupa calibrare)
    void set_reference(const WeightDistribution& ref);

    // Analizeaza o citire si returneaza rezultatul complet
    PostureResult analyze(const RawReadings& raw,
                          float              factor) const;

    // Auto-zero: daca scaunul e gol destul de mult, reseteaza offsetul
    // Returneaza true daca a fost resetat zero-ul
    bool update_empty_counter(bool is_empty,
                               int& empty_counter,
                               int  threshold) const;

private:
    WeightDistribution _ref;

    PostureAxisStatus classify_front_back(float diff) const;
    PostureAxisStatus classify_left_right(float diff) const;
};