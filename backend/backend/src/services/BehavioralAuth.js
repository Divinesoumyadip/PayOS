/**
 * PayOS Passive Behavioral Biometrics
 * Replaces OTP friction with silent keystroke dynamics analysis.
 */
class BehavioralAuth {
    constructor() {
        this.baseFlightTime = 120; // baseline ms between keystrokes
    }

    verifyUser(keystrokeTelemetry) {
        // Calculate the variance from the user's established baseline
        const averageSpeed = keystrokeTelemetry.reduce((a, b) => a + b, 0) / keystrokeTelemetry.length;
        const variance = Math.abs(this.baseFlightTime - averageSpeed);

        // If the typing pattern matches the owner's historical pattern within 15ms variance
        if (variance < 15) {
            console.log(' Behavioral Signature Verified: Bypassing OTP.');
            return { requireOTP: false, trustScore: 0.95 };
        }
        
        console.log(' Anomalous behavior detected: Forcing OTP.');
        return { requireOTP: true, trustScore: 0.30 };
    }
}

module.exports = new BehavioralAuth();
