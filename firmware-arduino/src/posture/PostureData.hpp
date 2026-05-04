#pragma once
#include <Arduino.h>

// ──────────────────────────────────────────────────────────────────────────────
//  PostureData
// ──────────────────────────────────────────────────────────────────────────────

enum class PostureAxisStatus : uint8_t {
    STRAIGHT,       
    LEANING_FRONT,  
    LEANING_BACK,   
    LEANING_LEFT,   
    LEANING_RIGHT,  
};

enum class PresenceStatus : uint8_t {
    EMPTY,      
    OCCUPIED,   
};

// Percentage distribution of weight across the 4 sensors
struct WeightDistribution {
    float fl_pct = 0.0f;  // Front Left 
    float fr_pct = 0.0f;  // Front Right 
    float bl_pct = 0.0f;  // Back Left
    float br_pct = 0.0f;  // Back Right

    float front() const { return fl_pct + fr_pct; }
    float back()  const { return bl_pct + br_pct; }
    float left()  const { return fl_pct + bl_pct; }
    float right() const { return fr_pct + br_pct; }
};

// Complete result of a single analysis cycle
struct PostureResult {
    PresenceStatus    presence      = PresenceStatus::EMPTY;
    float             total_kg      = 0.0f;

    WeightDistribution current;   // distributia curenta (%)
    WeightDistribution reference; // distributia de referinta "DREPT" (%)

    PostureAxisStatus front_back_status  = PostureAxisStatus::STRAIGHT;
    PostureAxisStatus left_right_status  = PostureAxisStatus::STRAIGHT;

    float diff_front_back  = 0.0f;  // deviatie % pe axa fata/spate
    float diff_left_right  = 0.0f;  // deviatie % pe axa stanga/dreapta

    bool is_good_posture() const {
        return presence == PresenceStatus::OCCUPIED &&
               front_back_status  == PostureAxisStatus::STRAIGHT &&
               left_right_status  == PostureAxisStatus::STRAIGHT;
    }
};


struct RawReadings {
    long fl = 0;
    long fr = 0;
    long bl = 0;
    long br = 0;
    long total() const { return fl + fr + bl + br; }
};


inline const char* to_cstr(PostureAxisStatus s) {
    switch (s) {
        case PostureAxisStatus::STRAIGHT:      return "DREPT";
        case PostureAxisStatus::LEANING_FRONT: return "APLECAT IN FATA";
        case PostureAxisStatus::LEANING_BACK:  return "APLECAT IN SPATE";
        case PostureAxisStatus::LEANING_LEFT:  return "INCLINAT STANGA";
        case PostureAxisStatus::LEANING_RIGHT: return "INCLINAT DREAPTA";
        default:                               return "NECUNOSCUT";
    }
}

inline const char* to_cstr(PresenceStatus s) {
    return s == PresenceStatus::OCCUPIED ? "OCUPAT" : "GOL";
}