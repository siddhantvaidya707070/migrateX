export const RiskEngine = {
    evaluate(observation: any, hypothesis: any): { score: number; factors: string[] } {
        let score = 1
        const factors: string[] = []

        // 1. Checkout Impact (+5)
        // Heuristic: "checkout" in fingerprint or summary or hypothesis
        const txt = (observation.summary + hypothesis.cause).toLowerCase()
        if (txt.includes('checkout') || txt.includes('payment')) {
            score += 5
            factors.push('checkout_impact')
        }

        // 2. Multi-Merchant (x2)
        if (observation.merchant_count > 1) {
            score *= 2
            factors.push('multi_merchant')
        }

        // 3. High Confidence (+1)
        if (hypothesis.confidence > 0.8) {
            score += 1
            factors.push('high_confidence')
        }

        // Cap at 10
        score = Math.min(score, 10)

        return { score, factors }
    }
}
