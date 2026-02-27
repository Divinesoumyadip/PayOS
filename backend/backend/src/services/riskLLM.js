const { pipeline } = require('@xenova/transformers');

/**
 * PayOS Local Risk LLM
 * Goal: Low-latency, local inference for fraud intent detection.
 * Matches Juspay's 'Intelligent Payment Operations' and 'Self-Healing' pillars.
 */
class RiskLLM {
    constructor() {
        this.classifier = null;
    }

    async init() {
        // Load a quantized, fast model for local execution (DistilBERT)
        this.classifier = await pipeline('text-classification', 'Xenova/distilbert-base-uncased-finetuned-sst-2-english');
        console.log(" Local Risk LLM Loaded Successfully");
    }

    async scanTransaction(metadata) {
        if (!this.classifier) await this.init();
        
        // Context-aware input for intent classification
        const input = \Transaction of \ via \ from IP \\;
        const results = await this.classifier(input);
        
        // Map sentiment labels to quantitative risk scores
        return results[0].label === 'NEGATIVE' ? 0.8 : 0.1;
    }
}

module.exports = new RiskLLM();
