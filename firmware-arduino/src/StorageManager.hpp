#pragma once

#include <EEPROM.h>
#include "Config.hpp"
#include "posture/PostureData.hpp"
#include "utils/Logger.hpp"

class StorageManager {
public:
    static bool is_calibrated() {
        uint32_t magic = 0;
        EEPROM.get(EepromCfg::ADDR_MAGIC, magic);
        return magic == EepromCfg::MAGIC_VALUE;
    }

    static void save(float weight_kg, float factor, const WeightDistribution& ref) {
        EEPROM.put(EepromCfg::ADDR_MAGIC,     EepromCfg::MAGIC_VALUE);
        EEPROM.put(EepromCfg::ADDR_WEIGHT_KG, weight_kg);
        EEPROM.put(EepromCfg::ADDR_FACTOR,    factor);
        EEPROM.put(EepromCfg::ADDR_REF_FL,    ref.fl_pct);
        EEPROM.put(EepromCfg::ADDR_REF_FR,    ref.fr_pct);
        EEPROM.put(EepromCfg::ADDR_REF_BL,    ref.bl_pct);
        EEPROM.put(EepromCfg::ADDR_REF_BR,    ref.br_pct);
        LOG_INFO("Storage", "Salvat: %.1fkg factor=%.2f", weight_kg, factor);
    }

    static void load(float& weight_kg, float& factor, WeightDistribution& ref) {
        EEPROM.get(EepromCfg::ADDR_WEIGHT_KG, weight_kg);
        EEPROM.get(EepromCfg::ADDR_FACTOR,    factor);
        EEPROM.get(EepromCfg::ADDR_REF_FL,    ref.fl_pct);
        EEPROM.get(EepromCfg::ADDR_REF_FR,    ref.fr_pct);
        EEPROM.get(EepromCfg::ADDR_REF_BL,    ref.bl_pct);
        EEPROM.get(EepromCfg::ADDR_REF_BR,    ref.br_pct);
        LOG_INFO("Storage", "Incarcat: %.1fkg factor=%.2f", weight_kg, factor);
    }

    static void clear() {
        uint32_t zero = 0;
        EEPROM.put(EepromCfg::ADDR_MAGIC, zero);
        LOG_INFO("Storage", "EEPROM sters");
    }
};