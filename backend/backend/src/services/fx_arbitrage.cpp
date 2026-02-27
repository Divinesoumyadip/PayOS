#include <vector>
#include <limits>

/**
 * PayOS Cross-Border FX Arbitrage Router
 * Uses Graph Theory to find the lowest-cost settlement path across international gateways.
 * A bleeding-edge solution for Juspay's global expansion.
 */
struct Edge {
    int source_currency;
    int target_currency;
    float exchange_rate_cost; // Log of the rate to use shortest path algorithms
};

extern "C" {
    // Returns the cost of the most optimal FX path
    float find_optimal_fx_path(int nodes, int edges_count, int* u, int* v, float* weight, int start_node, int end_node) {
        std::vector<float> dist(nodes, std::numeric_limits<float>::max());
        dist[start_node] = 0;

        // Bellman-Ford implementation for optimal routing
        for (int i = 1; i < nodes; i++) {
            for (int j = 0; j < edges_count; j++) {
                if (dist[u[j]] != std::numeric_limits<float>::max() && dist[u[j]] + weight[j] < dist[v[j]]) {
                    dist[v[j]] = dist[u[j]] + weight[j];
                }
            }
        }
        return dist[end_node];
    }
}
