#include <unity.h>
#include <cmath>
#include <cstdint>

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

struct WeightDistribution {
    float fl_pct = 0.0f;
    float fr_pct = 0.0f;
    float bl_pct = 0.0f;
    float br_pct = 0.0f;

    float front() const { return fl_pct + fr_pct; }
    float back()  const { return bl_pct + br_pct; }
    float left()  const { return fl_pct + bl_pct; }
    float right() const { return fr_pct + br_pct; }
};

struct PostureResult {
    PresenceStatus    presence      = PresenceStatus::EMPTY;
    float             total_kg      = 0.0f;
    WeightDistribution current;
    WeightDistribution reference;
    PostureAxisStatus front_back_status  = PostureAxisStatus::STRAIGHT;
    PostureAxisStatus left_right_status  = PostureAxisStatus::STRAIGHT;
    float diff_front_back  = 0.0f;
    float diff_left_right  = 0.0f;

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

static constexpr float EMPTY_THRESHOLD_KG    = 10.0f;
static constexpr float FRONT_BACK_THRESHOLD  = 8.0f;
static constexpr float LEFT_RIGHT_THRESHOLD  = 8.0f;
PostureAxisStatus classify_front_back(float diff) {
    if (diff >  FRONT_BACK_THRESHOLD)  return PostureAxisStatus::LEANING_FRONT;
    if (diff < -FRONT_BACK_THRESHOLD)  return PostureAxisStatus::LEANING_BACK;
    return PostureAxisStatus::STRAIGHT;
}

PostureAxisStatus classify_left_right(float diff) {
    if (diff >  LEFT_RIGHT_THRESHOLD)  return PostureAxisStatus::LEANING_LEFT;
    if (diff < -LEFT_RIGHT_THRESHOLD)  return PostureAxisStatus::LEANING_RIGHT;
    return PostureAxisStatus::STRAIGHT;
}

PostureResult analyze(const RawReadings& raw, float factor,
                      const WeightDistribution& ref) {
    PostureResult result;
    result.reference = ref;

    long total_raw = raw.total();
    float kg_total = static_cast<float>(total_raw) / factor;
    result.total_kg = kg_total;

    if (kg_total < EMPTY_THRESHOLD_KG) {
        result.presence = PresenceStatus::EMPTY;
        return result;
    }

    result.presence = PresenceStatus::OCCUPIED;
    result.current.fl_pct = static_cast<float>(raw.fl) / total_raw * 100.0f;
    result.current.fr_pct = static_cast<float>(raw.fr) / total_raw * 100.0f;
    result.current.bl_pct = static_cast<float>(raw.bl) / total_raw * 100.0f;
    result.current.br_pct = static_cast<float>(raw.br) / total_raw * 100.0f;

    result.diff_front_back  = result.current.front() - ref.front();
    result.diff_left_right  = result.current.left()  - ref.left();
    result.front_back_status = classify_front_back(result.diff_front_back);
    result.left_right_status = classify_left_right(result.diff_left_right);

    return result;
}

bool update_empty(bool is_empty, int& counter, int threshold) {
    if (!is_empty) { counter = 0; return false; }
    counter++;
    if (counter >= threshold) { counter = 0; return true; }
    return false;
}

void setUp(void) {}
void tearDown(void) {}

void test_wd_balanced_sum(void) {
    WeightDistribution wd{25.0f, 25.0f, 25.0f, 25.0f};
    float sum = wd.fl_pct + wd.fr_pct + wd.bl_pct + wd.br_pct;
    TEST_ASSERT_FLOAT_WITHIN(0.01f, 100.0f, sum);
}

void test_wd_front(void) {
    WeightDistribution wd{30.0f, 20.0f, 25.0f, 25.0f};
    TEST_ASSERT_FLOAT_WITHIN(0.01f, 50.0f, wd.front());
}

void test_wd_back(void) {
    WeightDistribution wd{25.0f, 25.0f, 30.0f, 20.0f};
    TEST_ASSERT_FLOAT_WITHIN(0.01f, 50.0f, wd.back());
}

void test_wd_left(void) {
    WeightDistribution wd{30.0f, 20.0f, 30.0f, 20.0f};
    TEST_ASSERT_FLOAT_WITHIN(0.01f, 60.0f, wd.left());
}

void test_wd_right(void) {
    WeightDistribution wd{20.0f, 30.0f, 20.0f, 30.0f};
    TEST_ASSERT_FLOAT_WITHIN(0.01f, 60.0f, wd.right());
}

void test_raw_total(void) {
    RawReadings r{100, 200, 300, 400};
    TEST_ASSERT_EQUAL(1000, r.total());
}

void test_raw_total_zero(void) {
    RawReadings r{0, 0, 0, 0};
    TEST_ASSERT_EQUAL(0, r.total());
}

void test_classify_straight(void) {
    TEST_ASSERT_TRUE(classify_front_back(0.0f)  == PostureAxisStatus::STRAIGHT);
    TEST_ASSERT_TRUE(classify_front_back(7.0f)  == PostureAxisStatus::STRAIGHT);
    TEST_ASSERT_TRUE(classify_front_back(-7.0f) == PostureAxisStatus::STRAIGHT);
}

void test_classify_front(void) {
    TEST_ASSERT_TRUE(classify_front_back(9.0f)  == PostureAxisStatus::LEANING_FRONT);
    TEST_ASSERT_TRUE(classify_front_back(20.0f) == PostureAxisStatus::LEANING_FRONT);
}

void test_classify_back(void) {
    TEST_ASSERT_TRUE(classify_front_back(-9.0f)  == PostureAxisStatus::LEANING_BACK);
    TEST_ASSERT_TRUE(classify_front_back(-25.0f) == PostureAxisStatus::LEANING_BACK);
}

void test_classify_left(void) {
    TEST_ASSERT_TRUE(classify_left_right(9.0f) == PostureAxisStatus::LEANING_LEFT);
}

void test_classify_right(void) {
    TEST_ASSERT_TRUE(classify_left_right(-9.0f) == PostureAxisStatus::LEANING_RIGHT);
}

void test_classify_at_threshold(void) {
    TEST_ASSERT_TRUE(classify_front_back(8.0f)  == PostureAxisStatus::STRAIGHT);
    TEST_ASSERT_TRUE(classify_front_back(-8.0f) == PostureAxisStatus::STRAIGHT);
    TEST_ASSERT_TRUE(classify_left_right(8.0f)  == PostureAxisStatus::STRAIGHT);
}

void test_analyze_empty_below(void) {
    RawReadings raw{100, 100, 100, 100};  // 400/100 = 4kg
    WeightDistribution ref{25, 25, 25, 25};
    PostureResult r = analyze(raw, 100.0f, ref);
    TEST_ASSERT_TRUE(r.presence == PresenceStatus::EMPTY);
    TEST_ASSERT_TRUE(r.total_kg < EMPTY_THRESHOLD_KG);
}

void test_analyze_empty_zero(void) {
    RawReadings raw{0, 0, 0, 0};
    WeightDistribution ref{25, 25, 25, 25};
    PostureResult r = analyze(raw, 100.0f, ref);
    TEST_ASSERT_TRUE(r.presence == PresenceStatus::EMPTY);
}

void test_analyze_occupied(void) {
    RawReadings raw{2000, 2000, 2000, 2000};  // 80kg
    WeightDistribution ref{25, 25, 25, 25};
    PostureResult r = analyze(raw, 100.0f, ref);
    TEST_ASSERT_TRUE(r.presence == PresenceStatus::OCCUPIED);
    TEST_ASSERT_TRUE(r.total_kg > EMPTY_THRESHOLD_KG);
}

void test_analyze_good_balanced(void) {
    RawReadings raw{2000, 2000, 2000, 2000};
    WeightDistribution ref{25, 25, 25, 25};
    PostureResult r = analyze(raw, 100.0f, ref);
    TEST_ASSERT_TRUE(r.is_good_posture());
    TEST_ASSERT_TRUE(r.front_back_status == PostureAxisStatus::STRAIGHT);
    TEST_ASSERT_TRUE(r.left_right_status == PostureAxisStatus::STRAIGHT);
}

void test_analyze_leaning_forward(void) {
    RawReadings raw{4000, 4000, 500, 500};
    WeightDistribution ref{25, 25, 25, 25};
    PostureResult r = analyze(raw, 100.0f, ref);
    TEST_ASSERT_TRUE(r.presence == PresenceStatus::OCCUPIED);
    TEST_ASSERT_TRUE(r.front_back_status == PostureAxisStatus::LEANING_FRONT);
    TEST_ASSERT_FALSE(r.is_good_posture());
}

void test_analyze_leaning_back(void) {
    RawReadings raw{500, 500, 4000, 4000};
    WeightDistribution ref{25, 25, 25, 25};
    PostureResult r = analyze(raw, 100.0f, ref);
    TEST_ASSERT_TRUE(r.front_back_status == PostureAxisStatus::LEANING_BACK);
    TEST_ASSERT_FALSE(r.is_good_posture());
}

void test_analyze_leaning_left(void) {
    RawReadings raw{4000, 500, 4000, 500};
    WeightDistribution ref{25, 25, 25, 25};
    PostureResult r = analyze(raw, 100.0f, ref);
    TEST_ASSERT_TRUE(r.left_right_status == PostureAxisStatus::LEANING_LEFT);
    TEST_ASSERT_FALSE(r.is_good_posture());
}

void test_analyze_leaning_right(void) {
    RawReadings raw{500, 4000, 500, 4000};
    WeightDistribution ref{25, 25, 25, 25};
    PostureResult r = analyze(raw, 100.0f, ref);
    TEST_ASSERT_TRUE(r.left_right_status == PostureAxisStatus::LEANING_RIGHT);
    TEST_ASSERT_FALSE(r.is_good_posture());
}

void test_analyze_pct_sum(void) {
    RawReadings raw{3000, 2000, 2500, 2500};
    WeightDistribution ref{25, 25, 25, 25};
    PostureResult r = analyze(raw, 100.0f, ref);
    float sum = r.current.fl_pct + r.current.fr_pct +
                r.current.bl_pct + r.current.br_pct;
    TEST_ASSERT_FLOAT_WITHIN(0.1f, 100.0f, sum);
}

void test_analyze_weight_calc(void) {
    RawReadings raw{2000, 2000, 2000, 2000};  // 8000/100 = 80kg
    WeightDistribution ref{25, 25, 25, 25};
    PostureResult r = analyze(raw, 100.0f, ref);
    TEST_ASSERT_FLOAT_WITHIN(0.01f, 80.0f, r.total_kg);
}

void test_good_posture_ok(void) {
    PostureResult r;
    r.presence = PresenceStatus::OCCUPIED;
    r.front_back_status = PostureAxisStatus::STRAIGHT;
    r.left_right_status = PostureAxisStatus::STRAIGHT;
    TEST_ASSERT_TRUE(r.is_good_posture());
}

void test_good_posture_empty(void) {
    PostureResult r;
    r.presence = PresenceStatus::EMPTY;
    r.front_back_status = PostureAxisStatus::STRAIGHT;
    r.left_right_status = PostureAxisStatus::STRAIGHT;
    TEST_ASSERT_FALSE(r.is_good_posture());
}

void test_good_posture_fb_bad(void) {
    PostureResult r;
    r.presence = PresenceStatus::OCCUPIED;
    r.front_back_status = PostureAxisStatus::LEANING_FRONT;
    r.left_right_status = PostureAxisStatus::STRAIGHT;
    TEST_ASSERT_FALSE(r.is_good_posture());
}

void test_good_posture_lr_bad(void) {
    PostureResult r;
    r.presence = PresenceStatus::OCCUPIED;
    r.front_back_status = PostureAxisStatus::STRAIGHT;
    r.left_right_status = PostureAxisStatus::LEANING_LEFT;
    TEST_ASSERT_FALSE(r.is_good_posture());
}

void test_good_posture_both_bad(void) {
    PostureResult r;
    r.presence = PresenceStatus::OCCUPIED;
    r.front_back_status = PostureAxisStatus::LEANING_FRONT;
    r.left_right_status = PostureAxisStatus::LEANING_RIGHT;
    TEST_ASSERT_FALSE(r.is_good_posture());
}

void test_counter_increment(void) {
    int counter = 0;
    update_empty(true, counter, 6);
    TEST_ASSERT_EQUAL(1, counter);
    update_empty(true, counter, 6);
    TEST_ASSERT_EQUAL(2, counter);
}

void test_counter_reset(void) {
    int counter = 3;
    update_empty(false, counter, 6);
    TEST_ASSERT_EQUAL(0, counter);
}

void test_counter_trigger(void) {
    int counter = 0;
    for (int i = 0; i < 5; i++) update_empty(true, counter, 6);
    TEST_ASSERT_EQUAL(5, counter);
    bool triggered = update_empty(true, counter, 6);
    TEST_ASSERT_TRUE(triggered);
    TEST_ASSERT_EQUAL(0, counter);
}

void test_counter_no_trigger(void) {
    int counter = 0;
    for (int i = 0; i < 5; i++) {
        bool triggered = update_empty(true, counter, 6);
        TEST_ASSERT_FALSE(triggered);
    }
}

void test_cal_factor(void) {
    long total = 7200;
    float ref_kg = 72.0f;
    float factor = static_cast<float>(total) / ref_kg;
    TEST_ASSERT_FLOAT_WITHIN(0.01f, 100.0f, factor);
}

void test_cal_factor_zero(void) {
    long total = 0;
    float factor = (total == 0) ? 1.0f : static_cast<float>(total) / 72.0f;
    TEST_ASSERT_FLOAT_WITHIN(0.01f, 1.0f, factor);
}

void test_cal_set_weight(void) {
    float factor = 100.0f;
    float old_kg = 72.0f;
    float new_kg = 85.0f;
    factor = factor * (new_kg / old_kg);
    float expected = 100.0f * (85.0f / 72.0f);
    TEST_ASSERT_FLOAT_WITHIN(0.01f, expected, factor);
}

int main(int argc, char **argv) {
    UNITY_BEGIN();

    RUN_TEST(test_wd_balanced_sum);
    RUN_TEST(test_wd_front);
    RUN_TEST(test_wd_back);
    RUN_TEST(test_wd_left);
    RUN_TEST(test_wd_right);

    RUN_TEST(test_raw_total);
    RUN_TEST(test_raw_total_zero);

    RUN_TEST(test_classify_straight);
    RUN_TEST(test_classify_front);
    RUN_TEST(test_classify_back);
    RUN_TEST(test_classify_left);
    RUN_TEST(test_classify_right);
    RUN_TEST(test_classify_at_threshold);

    RUN_TEST(test_analyze_empty_below);
    RUN_TEST(test_analyze_empty_zero);
    RUN_TEST(test_analyze_occupied);

    RUN_TEST(test_analyze_good_balanced);
    RUN_TEST(test_analyze_leaning_forward);
    RUN_TEST(test_analyze_leaning_back);
    RUN_TEST(test_analyze_leaning_left);
    RUN_TEST(test_analyze_leaning_right);
    RUN_TEST(test_analyze_pct_sum);
    RUN_TEST(test_analyze_weight_calc);

    RUN_TEST(test_good_posture_ok);
    RUN_TEST(test_good_posture_empty);
    RUN_TEST(test_good_posture_fb_bad);
    RUN_TEST(test_good_posture_lr_bad);
    RUN_TEST(test_good_posture_both_bad);

    RUN_TEST(test_counter_increment);
    RUN_TEST(test_counter_reset);
    RUN_TEST(test_counter_trigger);
    RUN_TEST(test_counter_no_trigger);

    RUN_TEST(test_cal_factor);
    RUN_TEST(test_cal_factor_zero);
    RUN_TEST(test_cal_set_weight);

    return UNITY_END();
}
