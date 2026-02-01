import { SynthesizedObservation } from './observations'

export interface RiskAssessment {
    score: number          // 0-10 scale
    factors: string[]      // Contributing factors
    reversibility: 'high' | 'medium' | 'low'
    urgency: 'immediate' | 'high' | 'normal' | 'low'
}

export const RiskEngine = {
    /**
     * Evaluate risk for a hypothesis against an observation
     * Uses the spec rules: +5 for Checkout, x2 for Multi-merchant
     */
    evaluate(observation: SynthesizedObservation, hypothesis: any): RiskAssessment {
        let score = 1
        const factors: string[] = []
        let reversibility: 'high' | 'medium' | 'low' = 'high'
        let urgency: 'immediate' | 'high' | 'normal' | 'low' = 'normal'

        const context = `${observation.summary || ''} ${observation.fingerprint || ''} ${hypothesis.cause || ''}`.toLowerCase()

        // === IMPACT FACTORS ===

        // 1. Checkout/Payment Impact (+5) - As per spec
        if (context.includes('checkout') || context.includes('payment') || context.includes('transaction')) {
            score += 5
            factors.push('checkout_impact')
            reversibility = 'low'  // Money-related issues are hard to reverse
            urgency = 'high'
        }

        // 2. Multi-Merchant (x2) - As per spec
        if (observation.merchant_count > 1) {
            score *= 2
            factors.push('multi_merchant')
            urgency = urgency === 'high' ? 'immediate' : 'high'
        }

        // 3. Escalating Pattern (+2)
        if (observation.historical_pattern === 'escalating') {
            score += 2
            factors.push('escalating_pattern')
            urgency = 'immediate'
        }

        // 4. Recurring Issue (+1)
        if (observation.historical_pattern === 'recurring') {
            score += 1
            factors.push('recurring_issue')
        }

        // 5. Long-standing issue (+1 per 24 hours, max +3)
        if (observation.time_since_first > 24) {
            const hoursBonus = Math.min(3, Math.floor(observation.time_since_first / 24))
            score += hoursBonus
            factors.push(`unresolved_${hoursBonus * 24}h`)
        }

        // 6. High confidence hypothesis (+1)
        if (hypothesis.confidence > 0.8) {
            score += 1
            factors.push('high_confidence')
        }

        // 7. Critical keywords
        if (context.includes('500') || context.includes('timeout') || context.includes('crash')) {
            score += 2
            factors.push('critical_error')
            urgency = urgency === 'normal' ? 'high' : urgency
        }

        // 8. Data integrity concerns
        if (context.includes('corrupt') || context.includes('lost') || context.includes('missing')) {
            score += 3
            factors.push('data_integrity')
            reversibility = 'low'
            urgency = 'immediate'
        }

        // 9. Migration stage context
        if (observation.migration_stage === 'checkout_migration') {
            score += 1
            factors.push('active_migration')
        }

        // === MITIGATING FACTORS ===

        // Single merchant with low confidence (-1)
        if (observation.merchant_count === 1 && hypothesis.confidence < 0.6) {
            score = Math.max(1, score - 1)
            factors.push('isolated_low_confidence')
        }

        // Very new issue (< 1 hour) - might be transient
        if (observation.time_since_first < 1) {
            factors.push('recent_occurrence')
        }

        // Cap at 10
        score = Math.min(10, Math.max(1, score))

        return { score, factors, reversibility, urgency }
    },

    /**
     * Determine if an action should be auto-executed
     * Based on spec: Low Risk + High Confidence + Non-critical classification
     */
    shouldAutoExecute(riskScore: number, confidence: number, classification: string): boolean {
        // Never auto-execute for platform regressions
        if (classification === 'platform_regression') {
            return false
        }

        // Auto-execute only for low risk, high confidence merchant issues
        if (riskScore <= 3 && confidence >= 0.9 && classification === 'merchant_misconfiguration') {
            return true
        }

        return false
    },

    /**
     * Determine if human approval is required
     * Based on spec: confidence < 0.6 requires human review
     */
    requiresHumanApproval(riskScore: number, confidence: number, classification: string): boolean {
        // Low confidence always needs human review
        if (confidence < 0.6) {
            return true
        }

        // High risk always needs human review
        if (riskScore >= 7) {
            return true
        }

        // Platform regressions always need human review
        if (classification === 'platform_regression') {
            return true
        }

        // Migration errors with multiple merchants need review
        if (classification === 'migration_error' && riskScore >= 5) {
            return true
        }

        // Auth/Webhook/Rate limit issues are customer-facing and sensitive
        if (['auth_failure', 'webhook_failure', 'rate_limit'].includes(classification) && riskScore >= 5) {
            return true
        }

        // Medium-high risk checkout issues need review
        if (classification === 'checkout_failure' && riskScore >= 6) {
            return true
        }

        return false
    }
}
