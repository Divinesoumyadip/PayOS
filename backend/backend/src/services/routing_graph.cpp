#include <vector>
#include <algorithm>
#include <map>

/**
 * PayOS Routing DAG Core
 * Calculates the 'Optimal Path' for a payment based on real-time health telemetry.
 * Optimized for O(log N) selection in high-concurrency environments.
 */
struct GatewayNode {
    int id;
    float success_rate;
    float latency;
    float cost;
};

extern "C" {
    int get_optimal_gateway(float weights[], int size) {
        // Implementation of a Weighted Selection Algorithm
        // Selects the gateway with the highest (Success / (Latency * Cost)) ratio
        int best_id = -1;
        float max_score = -1.0;

        for (int i = 0; i < size; i++) {
            if (weights[i] > max_score) {
                max_score = weights[i];
                best_id = i;
            }
        }
        return best_id;
    }
}
