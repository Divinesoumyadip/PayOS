/**
 * PayOS High-Performance Ring Buffer
 * Pre-allocates memory to prevent Garbage Collection (GC) spikes.
 * Optimized for Juspay-scale telemetry and 'Infrastructure at scale'.
 */
class RingBufferLogger {
    constructor(size = 1000) {
        this.buffer = new Array(size);
        this.pos = 0;
        this.size = size;
    }

    log(entry) {
        // Zero-copy overwrite: O(1) performance
        this.buffer[this.pos] = { t: Date.now(), data: entry };
        this.pos = (this.pos + 1) % this.size;
    }

    dump() {
        return this.buffer.filter(x => x);
    }
}

module.exports = new RingBufferLogger();
