#pragma once

#include<Arduino.h>

#define LOG_LEVEL_DEBUG 0
#define LOG_LEVEL_INFO  1
#define LOG_LEVEL_WARN  2
#define LOG_LEVEL_ERROR 3
#define LOG_LEVEL_NONE  4


#ifndef LOG_LEVEL
#define LOG_LEVEL LOG_LEVEL_INFO
#endif

namespace Logger {

inline void _log(const char* level_str, const char* tag, const char* fmt, ...) {
    char buf[256];
    va_list args;
    va_start(args, fmt);
    vsnprintf(buf, sizeof(buf), fmt, args);
    va_end(args);

    Serial.print(F("["));
    unsigned long ms = millis();
    // Pad la 7 cifre pentru aliniere
    if (ms < 10)       Serial.print(F("      "));
    else if (ms < 100) Serial.print(F("     "));
    else if (ms < 1000) Serial.print(F("    "));
    else if (ms < 10000) Serial.print(F("   "));
    else if (ms < 100000) Serial.print(F("  "));
    else if (ms < 1000000) Serial.print(F(" "));
    Serial.print(ms);
    Serial.print(F(" ms] ["));
    Serial.print(level_str);
    Serial.print(F("] ["));
    Serial.print(tag);
    Serial.print(F("] "));
    Serial.println(buf);
}
}  

#if LOG_LEVEL <= LOG_LEVEL_DEBUG
#define LOG_DEBUG(tag, fmt, ...) Logger::_log("DEBUG", tag, fmt, ##__VA_ARGS__)
#else
#define LOG_DEBUG(tag, fmt, ...) do {} while(0)
#endif

#if LOG_LEVEL <= LOG_LEVEL_INFO
#define LOG_INFO(tag, fmt, ...) Logger::_log("INFO ", tag, fmt, ##__VA_ARGS__)
#else
#define LOG_INFO(tag, fmt, ...) do {} while(0)
#endif

#if LOG_LEVEL <= LOG_LEVEL_WARN
#define LOG_WARN(tag, fmt, ...) Logger::_log("WARN ", tag, fmt, ##__VA_ARGS__)
#else
#define LOG_WARN(tag, fmt, ...) do {} while(0)
#endif

#if LOG_LEVEL <= LOG_LEVEL_ERROR
#define LOG_ERROR(tag, fmt, ...) Logger::_log("ERROR", tag, fmt, ##__VA_ARGS__)
#else
#define LOG_ERROR(tag, fmt, ...) do {} while(0)
#endif