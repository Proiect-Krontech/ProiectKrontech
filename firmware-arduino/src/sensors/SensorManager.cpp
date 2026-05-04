#include "SensorManager.hpp"
#include "../utils/Logger.hpp"

static const char* TAG = "SensorManager";

SensorManager::SensorManager(ILoadCell* fl, ILoadCell* fr,
                              ILoadCell* bl, ILoadCell* br)
    : _fl(fl), _fr(fr), _bl(bl), _br(br) {}

void SensorManager::begin() {
    LOG_INFO(TAG, "Initializare 4 celule de sarcina...");
    _fl->begin();
    _fr->begin();
    _bl->begin();
    _br->begin();
    LOG_INFO(TAG, "begin() complet.");
}

void SensorManager::wait_until_ready() {
    LOG_INFO(TAG, "Astept ca toate modulele HX711 sa fie gata...");
    uint32_t waited = 0;
    while (!_fl->is_ready() || !_fr->is_ready() ||
           !_bl->is_ready() || !_br->is_ready()) {
        LOG_DEBUG(TAG, "Module nu sunt inca gata. Astept 500ms... (%lu ms total)", waited);
        delay(500);
        waited += 500;
    }
    LOG_INFO(TAG, "Toate modulele sunt gata. (%lu ms asteptare)", waited);
}

void SensorManager::tare(uint8_t samples) {
    LOG_INFO(TAG, "Incep tara cu %d samples per canal...", samples);

    long z_fl = _fl->read_average(samples);
    long z_fr = _fr->read_average(samples);
    long z_bl = _bl->read_average(samples);
    long z_br = _br->read_average(samples);

    _fl->set_zero(z_fl);
    _fr->set_zero(z_fr);
    _bl->set_zero(z_bl);
    _br->set_zero(z_br);

    LOG_INFO(TAG, "Tara completa -> FL:%ld  FR:%ld  BL:%ld  BR:%ld",
             z_fl, z_fr, z_bl, z_br);
}

void SensorManager::calibrate(uint8_t samples,
                               float   reference_weight_kg,
                               float&  out_factor,
                               WeightDistribution& out_ref) {
    LOG_INFO(TAG, "Incep calibrare cu %d samples, referinta=%.1f kg...",
             samples, reference_weight_kg);

    long r_fl = _fl->read_net(samples);
    long r_fr = _fr->read_net(samples);
    long r_bl = _bl->read_net(samples);
    long r_br = _br->read_net(samples);
    long total = r_fl + r_fr + r_bl + r_br;

    LOG_INFO(TAG, "Raw net -> FL:%ld  FR:%ld  BL:%ld  BR:%ld  total:%ld",
             r_fl, r_fr, r_bl, r_br, total);

    if (total == 0) {
        LOG_ERROR(TAG, "Total raw = 0! Imposibil de calculat factorul.");
        out_factor     = 1.0f;
        out_ref.fl_pct = 25.0f;
        out_ref.fr_pct = 25.0f;
        out_ref.bl_pct = 25.0f;
        out_ref.br_pct = 25.0f;
        return;
    }

    out_factor = static_cast<float>(total) / reference_weight_kg;

    out_ref.fl_pct = static_cast<float>(r_fl) / total * 100.0f;
    out_ref.fr_pct = static_cast<float>(r_fr) / total * 100.0f;
    out_ref.bl_pct = static_cast<float>(r_bl) / total * 100.0f;
    out_ref.br_pct = static_cast<float>(r_br) / total * 100.0f;

    LOG_INFO(TAG, "Calibrare completa:");
    LOG_INFO(TAG, "  Factor: %.4f", out_factor);
    LOG_INFO(TAG, "  Referinta DREPT -> FL:%.1f%%  FR:%.1f%%  BL:%.1f%%  BR:%.1f%%",
             out_ref.fl_pct, out_ref.fr_pct, out_ref.bl_pct, out_ref.br_pct);
}

RawReadings SensorManager::read(uint8_t samples) {
    RawReadings r;
    r.fl = _fl->read_net(samples);
    r.fr = _fr->read_net(samples);
    r.bl = _bl->read_net(samples);
    r.br = _br->read_net(samples);
    LOG_DEBUG(TAG, "read() FL:%ld  FR:%ld  BL:%ld  BR:%ld  total:%ld",
              r.fl, r.fr, r.bl, r.br, r.total());
    return r;
}