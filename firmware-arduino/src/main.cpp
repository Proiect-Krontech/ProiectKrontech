#include <Arduino.h>

#include "Config.hpp"
#include "utils/Logger.hpp"
#include "sensors/HX711Driver.hpp"
#include "sensors/SensorManager.hpp"
#include "posture/PostureData.hpp"
#include "posture/PostureAnalyzer.hpp"
#include "alerts/AlertManager.hpp"

static const char* TAG = "main";

static HX711Driver drv_fl(PinCfg::FL_DOUT, PinCfg::FL_SCK);
static HX711Driver drv_fr(PinCfg::FR_DOUT, PinCfg::FR_SCK);
static HX711Driver drv_bl(PinCfg::BL_DOUT, PinCfg::BL_SCK);
static HX711Driver drv_br(PinCfg::BR_DOUT, PinCfg::BR_SCK);

static SensorManager sensors(&drv_fl, &drv_fr, &drv_bl, &drv_br);

static PostureAnalyzer analyzer;

static AlertManager alert(PinCfg::BUZZER);

static float              g_factor      = 1.0f;
static WeightDistribution g_reference;
static int                g_empty_count = 0;

void do_tare_and_calibrate() {
    // PASUL 1: Tara
    LOG_INFO(TAG, ">>> SCAUN GOL! Astept 5 secunde...");
    delay(CalibCfg::TARE_DELAY_MS);
    sensors.tare(CalibCfg::TARE_SAMPLES);

    // PASUL 2: Calibrare
    LOG_INFO(TAG, ">>> ASEAZA-TE DREPT! Astept 5 secunde...");
    delay(CalibCfg::CALIB_DELAY_MS);
    sensors.calibrate(CalibCfg::CALIB_SAMPLES,
                      CalibCfg::REFERENCE_WEIGHT_KG,
                      g_factor,
                      g_reference);
    analyzer.set_reference(g_reference);

    LOG_INFO(TAG, "=== CALIBRARE COMPLETA ===");
    LOG_INFO(TAG, "Referinta DREPT -> FL:%.1f%%  FR:%.1f%%  BL:%.1f%%  BR:%.1f%%",
             g_reference.fl_pct, g_reference.fr_pct,
             g_reference.bl_pct, g_reference.br_pct);
    LOG_INFO(TAG, "Factor: %.2f", g_factor);
    LOG_INFO(TAG, "=== MONITORIZARE ACTIVA ===");

    alert.on();
    delay(800);
    alert.off();
}

static uint32_t g_last_loop = 0;

void setup() {
    Serial.begin(SerialCfg::BAUD_RATE);
    delay(500);

    alert.begin();
    sensors.begin();
    sensors.wait_until_ready();

    do_tare_and_calibrate();

    g_last_loop = millis();
}

void loop() {
    if (millis() - g_last_loop < TimingCfg::LOOP_DELAY_MS) return;
    g_last_loop = millis();

    RawReadings raw = sensors.read(CalibCfg::LOOP_SAMPLES);
    long total_raw  = raw.total();
    float kg_total  = static_cast<float>(total_raw) / g_factor;

    if (kg_total < PresenceCfg::EMPTY_THRESHOLD_KG) {
        g_empty_count++;
        if (g_empty_count >= PresenceCfg::AUTO_ZERO_ITERATIONS) {
            sensors.tare(CalibCfg::TARE_SAMPLES);
            LOG_INFO(TAG, ">>> Zero resetat.");
            g_empty_count = 0;
        }
        alert.off();
        LOG_INFO(TAG, "STATUS: Scaun GOL | Total: %.2fkg", kg_total);
        return;
    }
    g_empty_count = 0;

    PostureResult result = analyzer.analyze(raw, g_factor);

    float cur_fata   = result.current.front();
    float cur_spate  = result.current.back();
    float cur_stanga = result.current.left();
    float cur_dreapta= result.current.right();

    float ref_fata   = g_reference.front();
    float ref_spate  = g_reference.back();
    float ref_stanga = g_reference.left();
    float ref_dreapta= g_reference.right();

    float diff_fata   = result.diff_front_back;
    float diff_stanga = result.diff_left_right;

    LOG_INFO(TAG, "---");

    LOG_INFO(TAG, "[FATA/SPATE]  Status: %s", to_cstr(result.front_back_status));
    if (diff_fata >= 0)
        LOG_INFO(TAG, "  Fata: %.1f%% (ref %.1f%%)  |  Spate: %.1f%% (ref %.1f%%)  |  Abatere: +%.1f%%",
                 cur_fata, ref_fata, cur_spate, ref_spate, diff_fata);
    else
        LOG_INFO(TAG, "  Fata: %.1f%% (ref %.1f%%)  |  Spate: %.1f%% (ref %.1f%%)  |  Abatere: %.1f%%",
                 cur_fata, ref_fata, cur_spate, ref_spate, diff_fata);

    LOG_INFO(TAG, "[STANGA/DR]   Status: %s", to_cstr(result.left_right_status));
    if (diff_stanga >= 0)
        LOG_INFO(TAG, "  Stanga: %.1f%% (ref %.1f%%)  |  Dreapta: %.1f%% (ref %.1f%%)  |  Abatere: +%.1f%%",
                 cur_stanga, ref_stanga, cur_dreapta, ref_dreapta, diff_stanga);
    else
        LOG_INFO(TAG, "  Stanga: %.1f%% (ref %.1f%%)  |  Dreapta: %.1f%% (ref %.1f%%)  |  Abatere: %.1f%%",
                 cur_stanga, ref_stanga, cur_dreapta, ref_dreapta, diff_stanga);

    LOG_INFO(TAG, "[SENZORI]     FL:%.1fkg  FR:%.1fkg  BL:%.1fkg  BR:%.1fkg  |  TOTAL: %.1fkg",
             static_cast<float>(raw.fl) / g_factor,
             static_cast<float>(raw.fr) / g_factor,
             static_cast<float>(raw.bl) / g_factor,
             static_cast<float>(raw.br) / g_factor,
             kg_total);

    if (result.is_good_posture()) {
        alert.off();
    } else {
        alert.on();
    }
}