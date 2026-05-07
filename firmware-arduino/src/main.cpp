#include <Arduino.h>
#include <ArduinoJson.h>

#include "Config.hpp"
#include "utils/Logger.hpp"
#include "sensors/HX711Driver.hpp"
#include "sensors/SensorManager.hpp"
#include "posture/PostureData.hpp"
#include "posture/PostureAnalyzer.hpp"
#include "alerts/AlertManager.hpp"
#include "StorageManager.hpp"
#include "network/WifiManager.hpp"
#include "network/HttpClient.hpp"


static const char* TAG = "main";

static HX711Driver drv_fl(PinCfg::FL_DOUT, PinCfg::FL_SCK);
static HX711Driver drv_fr(PinCfg::FR_DOUT, PinCfg::FR_SCK);
static HX711Driver drv_bl(PinCfg::BL_DOUT, PinCfg::BL_SCK);
static HX711Driver drv_br(PinCfg::BR_DOUT, PinCfg::BR_SCK);

static SensorManager sensors(&drv_fl, &drv_fr, &drv_bl, &drv_br);
static PostureAnalyzer analyzer;
static AlertManager alert(PinCfg::BUZZER);
static WifiManager     wifi;
static HttpClient      http;

static float              g_weight_kg      = CalibCfg::REFERENCE_WEIGHT_KG;
static float              g_factor      = 1.0f;
static WeightDistribution g_reference;
static int                g_empty_count = 0;
static bool               g_calibrated     = false;
static bool               g_buzzer_enabled = true;
static uint32_t           g_state_since    = 0;
static bool               g_last_good      = true;
static uint32_t           g_last_cmd_poll  = 0;

static void do_calibrate() {
    LOG_INFO(TAG, "=== CALIBRARE PORNITA ===");
    LOG_INFO(TAG, ">>> SCAUN GOL! Astept 5 secunde...");
    delay(CalibCfg::TARE_DELAY_MS);
    sensors.tare(CalibCfg::TARE_SAMPLES);
    LOG_INFO(TAG, ">>> Tara OK.");

    LOG_INFO(TAG, ">>> ASEAZA-TE DREPT PE SCAUN si stai nemiscat...");

    uint32_t stable_since = 0;
    bool     seated       = false;

    while (!seated) {
        delay(200);
        RawReadings raw   = sensors.read(1);
        float kg          = static_cast<float>(raw.total()) / g_factor;

        if (kg > PresenceCfg::EMPTY_THRESHOLD_KG) {
            if (stable_since == 0) {
                stable_since = millis();
                LOG_INFO(TAG, ">>> Greutate detectata (%.1fkg). Stai nemiscat...", kg);
            } else if (millis() - stable_since >= 2000) {
                seated = true;
            }
        } else {
            if (stable_since != 0) {
                LOG_INFO(TAG, ">>> Greutate pierduta. Aseaza-te din nou...");
            }
            stable_since = 0;
        }

        wifi.maintain();
    }

    LOG_INFO(TAG, ">>> Pozitie detectata! Calibrez in 3 secunde... Stai drept!");
    delay(3000);

    sensors.calibrate(CalibCfg::CALIB_SAMPLES, g_weight_kg, g_factor, g_reference);
    analyzer.set_reference(g_reference);
    StorageManager::save(g_weight_kg, g_factor, g_reference);
    g_calibrated = true;

    LOG_INFO(TAG, "=== CALIBRARE COMPLETA ===");
    LOG_INFO(TAG, "Referinta DREPT -> FL:%.1f%%  FR:%.1f%%  BL:%.1f%%  BR:%.1f%%",
             g_reference.fl_pct, g_reference.fr_pct,
             g_reference.bl_pct, g_reference.br_pct);
    LOG_INFO(TAG, "Factor: %.2f", g_factor);
    LOG_INFO(TAG, "=== MONITORIZARE ACTIVA ===");

    alert.on(); delay(800); alert.off();
    
}

static void handle_command(const JsonDocument& doc) {
    const char* cmd = doc["cmd"] | "";
    if (strlen(cmd) == 0) return;

    LOG_INFO(TAG, "Comanda primita: %s", cmd);

    if (strcmp(cmd, "set_weight") == 0) {
        float new_kg = doc["value"] | g_weight_kg;
        if (new_kg > 5.0f && new_kg < 300.0f) {
            g_factor    = g_factor * (new_kg / g_weight_kg);
            g_weight_kg = new_kg;
            StorageManager::save(g_weight_kg, g_factor, g_reference);
            LOG_INFO(TAG, "Greutate setata: %.1fkg", g_weight_kg);
        }
    } else if (strcmp(cmd, "calibrate") == 0) {
        do_calibrate();
    } else if (strcmp(cmd, "buzzer_on") == 0) {
        g_buzzer_enabled = true;
        LOG_INFO(TAG, "Buzzer activat.");
    } else if (strcmp(cmd, "buzzer_off") == 0) {
        g_buzzer_enabled = false;
        alert.off();
        LOG_INFO(TAG, "Buzzer dezactivat.");
    } else if (strcmp(cmd, "reset_calibration") == 0) {
        StorageManager::clear();
        g_calibrated = false;
        LOG_INFO(TAG, "Calibrare resetata.");
    }
}

void setup() {
    Serial.begin(SerialCfg::BAUD_RATE);
    delay(500);

    LOG_INFO(TAG, "=== Smart Pillow v0.2.0 ===");

    alert.begin();
    sensors.begin();
    sensors.wait_until_ready();

    if (StorageManager::is_calibrated()) {
        StorageManager::load(g_weight_kg, g_factor, g_reference);
        analyzer.set_reference(g_reference);
        g_calibrated = true;
        LOG_INFO(TAG, "Calibrare incarcata din EEPROM. Factor=%.2f", g_factor);
        alert.on(); delay(200); alert.off();
        delay(100);
        alert.on(); delay(200); alert.off();
    } else {
        LOG_INFO(TAG, "Nicio calibrare salvata. Apasa 'Porneste calibrare' din dashboard.");
    }

    wifi.begin();

    g_state_since = millis();
}

static uint32_t g_last_loop = 0;


void loop() {
    wifi.maintain();

    if (millis() - g_last_cmd_poll >= ServerCfg::CMD_POLL_MS){
       g_last_cmd_poll = millis();
        if (wifi.is_connected()) {
            StaticJsonDocument<128> cmd_doc;
            if (http.get_command(cmd_doc)) {
                handle_command(cmd_doc);
            }
        }
    }

    if (millis() - g_last_loop < TimingCfg::LOOP_DELAY_MS) return;
    g_last_loop = millis();

    if (!g_calibrated) return;

    RawReadings raw = sensors.read(CalibCfg::LOOP_SAMPLES);
    float kg_total  = static_cast<float>(raw.total()) / g_factor;

    if (kg_total < PresenceCfg::EMPTY_THRESHOLD_KG) {
        g_empty_count++;
        if (g_empty_count >= PresenceCfg::AUTO_ZERO_ITERATIONS) {
            sensors.tare(CalibCfg::TARE_SAMPLES);
            LOG_INFO(TAG, "Auto-zero resetat.");
            g_empty_count = 0;
        }
        alert.off();

        if (wifi.is_connected()) {
            StaticJsonDocument<128> doc;
            doc["device_id"]  = "PERNA001";
            doc["posture"]    = "empty";
            doc["kg"]         = 0;
            doc["calibrated"] = g_calibrated;
            StaticJsonDocument<64> cmd_doc;
            http.post_data(doc, cmd_doc);
        }
        return;
    }
    g_empty_count = 0;

    PostureResult result = analyzer.analyze(raw, g_factor);
    bool good_now = result.is_good_posture();

   if (good_now != g_last_good) {
        g_state_since = millis();
        g_last_good   = good_now;
    }
    uint32_t state_duration_s = (millis() - g_state_since) / 1000UL;

    LOG_INFO(TAG, "[F/S] %s | [S/D] %s | %.1fkg | %lus",
             to_cstr(result.front_back_status),
             to_cstr(result.left_right_status),
             kg_total, state_duration_s);

    // ── Buzzer ─────────────────────────────────────────────────────────────
    if (g_buzzer_enabled) {
        good_now ? alert.off() : alert.on();
    }
    if (wifi.is_connected()) {
        StaticJsonDocument<320> doc;
        doc["device_id"]      = "PERNA001";
        doc["timestamp"]      = millis();
        doc["posture"]        = good_now ? "ok" : "bad";
        doc["F"]              = serialized(String(result.current.front(), 1));
        doc["S"]              = serialized(String(result.current.back(),  1));
        doc["L"]              = serialized(String(result.current.left(),  1));
        doc["R"]              = serialized(String(result.current.right(), 1));
        doc["kg"]             = serialized(String(kg_total, 1));
        doc["buzzer"]         = alert.is_active();
        doc["calibrated"]     = g_calibrated;
        doc["weight_ref"]     = serialized(String(g_weight_kg, 1));
        doc["state_duration"] = state_duration_s;

        StaticJsonDocument<128> cmd_doc;
        if (http.post_data(doc, cmd_doc)) {
            handle_command(cmd_doc);
        }
    }
}