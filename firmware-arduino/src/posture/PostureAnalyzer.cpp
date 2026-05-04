#include "PostureAnalyzer.hpp"
#include "../utils/Logger.hpp"
#include <Arduino.h>

static const char* TAG = "PostureAnalyzer";

void PostureAnalyzer::set_reference(const WeightDistribution& ref) {
    _ref = ref;
    LOG_INFO(TAG, "Referinta setata -> FL:%.1f%%  FR:%.1f%%  BL:%.1f%%  BR:%.1f%%",
             _ref.fl_pct, _ref.fr_pct, _ref.bl_pct, _ref.br_pct);
}

PostureResult PostureAnalyzer::analyze(const RawReadings& raw,
                                        float              factor) const {
    PostureResult result;
    result.reference = _ref;

    long total_raw = raw.total();

    float kg_total = static_cast<float>(total_raw) / factor;
    result.total_kg = kg_total;

    // ── Presence detection ─────────────────────────
    // if (kg_total < PRAG_PREZENTA_KG)
    if (kg_total < PresenceCfg::EMPTY_THRESHOLD_KG) {
        result.presence = PresenceStatus::EMPTY;
        LOG_DEBUG(TAG, "Scaun GOL (%.2f kg)", kg_total);
        return result;
    }

    result.presence = PresenceStatus::OCCUPIED;

    
    result.current.fl_pct = static_cast<float>(raw.fl) / total_raw * 100.0f;
    result.current.fr_pct = static_cast<float>(raw.fr) / total_raw * 100.0f;
    result.current.bl_pct = static_cast<float>(raw.bl) / total_raw * 100.0f;
    result.current.br_pct = static_cast<float>(raw.br) / total_raw * 100.0f;

   // ── Deviation calculation ─────────────────────
    result.diff_front_back  = result.current.front() - _ref.front();
    result.diff_left_right  = result.current.left()  - _ref.left();

    result.front_back_status = classify_front_back(result.diff_front_back);
    result.left_right_status = classify_left_right(result.diff_left_right);

    LOG_DEBUG(TAG, "OCUPAT | total=%.2fkg | FB=%+.1f%% (%s) | LR=%+.1f%% (%s)",
              kg_total,
              result.diff_front_back, to_cstr(result.front_back_status),
              result.diff_left_right, to_cstr(result.left_right_status));

    return result;
}

PostureAxisStatus PostureAnalyzer::classify_front_back(float diff) const {
    if (diff >  PostureCfg::FRONT_BACK_THRESHOLD)  return PostureAxisStatus::LEANING_FRONT;
    if (diff < -PostureCfg::FRONT_BACK_THRESHOLD)  return PostureAxisStatus::LEANING_BACK;
    return PostureAxisStatus::STRAIGHT;
}

PostureAxisStatus PostureAnalyzer::classify_left_right(float diff) const {
    if (diff >  PostureCfg::LEFT_RIGHT_THRESHOLD)  return PostureAxisStatus::LEANING_LEFT;
    if (diff < -PostureCfg::LEFT_RIGHT_THRESHOLD)  return PostureAxisStatus::LEANING_RIGHT;
    return PostureAxisStatus::STRAIGHT;
}

bool PostureAnalyzer::update_empty_counter(bool is_empty,
                                            int& empty_counter,
                                            int  threshold) const {
    if (!is_empty) {
        empty_counter = 0;
        return false;
    }
    empty_counter++;
    LOG_DEBUG(TAG, "Scaun gol: iteratie %d / %d pana la auto-zero.", empty_counter, threshold);
    if (empty_counter >= threshold) {
        LOG_INFO(TAG, "Auto-zero declansat dupa %d iteratii.", empty_counter);
        empty_counter = 0;
        return true;
    }
    return false;
}