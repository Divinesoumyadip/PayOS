/**
 * PayOS Telemetry Engine
 * Tracks microsecond-level latency for C++ core modules.
 * Essential for 99.999% availability at Juspay scale.
 */
class TelemetryService {
    constructor() {
        this.metrics = {
            routingLatency: [],
            fraudScanLatency: [],
            throughput: 0
        };
    }

    record(metric, value) {
        this.metrics[metric].push(value);
        if (this.metrics[metric].length > 100) this.metrics[metric].shift(); // Sliding window
        this.metrics.throughput++;
    }

    getStats() {
        const p99 = (arr) => {
            if (arr.length === 0) return 0;
            const sorted = [...arr].sort((a, b) => a - b);
            return sorted[Math.floor(sorted.length * 0.99)];
        };

        return {
            p99Routing: p99(this.metrics.routingLatency),
            p99Fraud: p99(this.metrics.fraudScanLatency),
            tps: this.metrics.throughput / 60 // Transactions Per Second
        };
    }
}

module.exports = new TelemetryService();
