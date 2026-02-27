/**
 * PayOS Circuit Breaker
 * States: CLOSED (Normal), OPEN (Failing), HALF-OPEN (Testing)
 * Matches Juspay's 'Self-Healing Systems' pillar.
 */
class CircuitBreaker {
    constructor() {
        this.failureThreshold = 5;
        this.failureCount = 0;
        this.state = 'CLOSED';
        this.nextAttempt = Date.now();
    }

    async execute(gatewayCall) {
        if (this.state === 'OPEN') {
            if (Date.now() > this.nextAttempt) {
                this.state = 'HALF-OPEN';
            } else {
                throw new Error('Circuit is OPEN: Gateway is currently unstable.');
            }
        }

        try {
            const result = await gatewayCall();
            this.onSuccess();
            return result;
        } catch (error) {
            this.onFailure();
            throw error;
        }
    }

    onSuccess() {
        this.failureCount = 0;
        this.state = 'CLOSED';
    }

    onFailure() {
        this.failureCount++;
        if (this.failureCount >= this.failureThreshold) {
            this.state = 'OPEN';
            this.nextAttempt = Date.now() + 30000; // Trip for 30 seconds
            console.log(' CIRCUIT BREAKER TRIPPED: Routing diverted.');
        }
    }
}

module.exports = new CircuitBreaker();
