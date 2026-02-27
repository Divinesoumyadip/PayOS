#include <cmath>
#include <vector>

/**
 * PayOS Statistical Anomaly Detector
 * Uses Z-Score (Standard Deviation) to detect outlier transactions.
 * Matches Juspay's 'Automatic Anomaly Detection' pillar.
 */
extern "C" {
    bool is_anomalous(float amount, float mean, float std_dev) {
        if (std_dev == 0) return false;
        float z_score = std::abs(amount - mean) / std_dev;
        // If the amount is > 3 standard deviations from the norm, flag it.
        return z_score > 3.0f;
    }
}
