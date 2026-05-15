#pragma once

#include <cstdint>
#include <cstring>
#include <cstdio>
#include <string>

typedef uint8_t byte;

#define OUTPUT 1
#define INPUT 0
#define HIGH 1
#define LOW 0

inline void pinMode(uint8_t, uint8_t) {}
inline void digitalWrite(uint8_t, uint8_t) {}
inline int digitalRead(uint8_t) { return 0; }
inline void delay(unsigned long) {}
inline unsigned long millis() { static unsigned long t = 0; return t += 500; }

class String {
public:
    String() : _buf("") {}
    String(const char* s) : _buf(s) {}
    String(float val, int dec) {
        char tmp[32];
        snprintf(tmp, sizeof(tmp), "%.*f", dec, val);
        _buf = tmp;
    }
    const char* c_str() const { return _buf.c_str(); }
private:
    std::string _buf;
};

class SerialClass {
public:
    void begin(unsigned long) {}
    void print(const char*) {}
    void println(const char*) {}
    void printf(const char*, ...) {}
};

extern SerialClass Serial;
