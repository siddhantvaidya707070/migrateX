import { SynthesizedObservation } from './observations'
import { RiskAssessment } from './risk'

export type Classification =
    | 'merchant_misconfiguration'
    | 'migration_error'
    | 'platform_regression'
    | 'documentation_gap'
    | 'checkout_failure'
    | 'auth_failure'
    | 'webhook_failure'
    | 'rate_limit'

export interface Decision {
    type: Classification
    confidence: number
    reasoning: string
    suggestedAction: string
}

export const Classifier = {
    /**
     * Classify the root cause and determine appropriate action
     * Uses deterministic decision tree logic
     */
    classify(
        observation: SynthesizedObservation,
        hypothesis: any,
        riskAssessment: RiskAssessment
    ): Decision {
        const context = `${observation.summary || ''} ${hypothesis.cause || ''}`.toLowerCase()
        const fingerprint = (observation.fingerprint || '').toLowerCase()
        const merchantCount = observation.merchant_count || 1
        const riskScore = riskAssessment.score

        // === DECISION TREE ===

        // 1. PLATFORM REGRESSION
        // High risk + system-level errors + multiple merchants = likely platform issue
        if (riskScore >= 7) {
            if (context.includes('500') || context.includes('timeout') || context.includes('crash')) {
                return {
                    type: 'platform_regression',
                    confidence: 0.95,
                    reasoning: `High risk score (${riskScore}) with system-level errors across ${merchantCount} merchant(s)`,
                    suggestedAction: 'create_engineering_incident'
                }
            }

            if (merchantCount > 3 && riskAssessment.urgency === 'immediate') {
                return {
                    type: 'platform_regression',
                    confidence: 0.9,
                    reasoning: `Widespread issue affecting ${merchantCount} merchants with immediate urgency`,
                    suggestedAction: 'create_engineering_incident'
                }
            }
        }

        // 2. CHECKOUT FAILURE - High priority customer-impacting issues
        if (context.includes('checkout') || context.includes('payment') ||
            context.includes('transaction') || fingerprint.includes('checkout')) {
            return {
                type: 'checkout_failure',
                confidence: riskScore >= 5 ? 0.85 : 0.7,
                reasoning: `Checkout/payment issue affecting ${merchantCount} merchant(s) with risk ${riskScore}`,
                suggestedAction: riskScore >= 5 ? 'draft_ticket_reply' : 'send_support_response'
            }
        }

        // 3. AUTH FAILURE - Security sensitive
        if (context.includes('auth') || context.includes('token') ||
            context.includes('credential') || context.includes('login') ||
            fingerprint.includes('auth')) {
            return {
                type: 'auth_failure',
                confidence: 0.8,
                reasoning: `Authentication/authorization issue affecting ${merchantCount} merchant(s)`,
                suggestedAction: 'draft_ticket_reply'
            }
        }

        // 4. WEBHOOK FAILURE - Integration issues
        if (context.includes('webhook') || context.includes('callback') ||
            context.includes('notification') || fingerprint.includes('webhook')) {
            return {
                type: 'webhook_failure',
                confidence: 0.75,
                reasoning: `Webhook/integration issue affecting ${merchantCount} merchant(s)`,
                suggestedAction: 'draft_ticket_reply'
            }
        }

        // 5. RATE LIMIT - Traffic issues
        if (context.includes('rate') || context.includes('limit') ||
            context.includes('throttle') || context.includes('429')) {
            return {
                type: 'rate_limit',
                confidence: 0.8,
                reasoning: `Rate limiting issue affecting ${merchantCount} merchant(s)`,
                suggestedAction: 'draft_ticket_reply'
            }
        }

        // 6. MIGRATION ERROR
        // Multi-merchant + migration context = likely migration issue
        if (observation.migration_stage || context.includes('migration') || context.includes('stage')) {
            if (merchantCount > 1) {
                return {
                    type: 'migration_error',
                    confidence: 0.85,
                    reasoning: `Multiple merchants (${merchantCount}) affected during ${observation.migration_stage || 'migration'}`,
                    suggestedAction: 'email_engineering'
                }
            }

            // Single merchant during migration might be misconfiguration
            if (merchantCount === 1 && riskScore < 5) {
                return {
                    type: 'merchant_misconfiguration',
                    confidence: 0.75,
                    reasoning: 'Single merchant issue during migration, likely configuration related',
                    suggestedAction: 'draft_ticket_reply'
                }
            }

            return {
                type: 'migration_error',
                confidence: 0.7,
                reasoning: `Migration-related issue in ${observation.migration_stage || 'unknown stage'}`,
                suggestedAction: 'email_engineering'
            }
        }

        // 7. DOCUMENTATION GAP
        // Keywords indicating user confusion or API misunderstanding
        if (context.includes('docs') || context.includes('documentation')) {
            return {
                type: 'documentation_gap',
                confidence: 0.7,
                reasoning: 'Issue appears related to documentation or API understanding',
                suggestedAction: 'update_docs'
            }
        }

        if (context.includes('parameter') || context.includes('schema') || context.includes('format')) {
            return {
                type: 'documentation_gap',
                confidence: 0.65,
                reasoning: 'Issue involves API parameters or data format confusion',
                suggestedAction: 'draft_ticket_reply'
            }
        }

        if (context.includes('expected') || context.includes('required') || context.includes('missing field')) {
            return {
                type: 'documentation_gap',
                confidence: 0.6,
                reasoning: 'Issue suggests unclear requirements or expectations',
                suggestedAction: 'draft_ticket_reply'
            }
        }

        // 8. MERCHANT MISCONFIGURATION (Default)
        // Single merchant, configuration keywords, or no other match
        let confidence = 0.5

        if (merchantCount === 1) {
            confidence += 0.15
        }

        if (context.includes('config') || context.includes('setting') || context.includes('key')) {
            confidence += 0.1
        }

        if (observation.historical_pattern === 'new') {
            confidence += 0.05
        }

        // Low risk single merchant issues are likely misconfigurations
        if (riskScore <= 3 && merchantCount === 1) {
            confidence = Math.min(0.9, confidence + 0.2)
        }

        return {
            type: 'merchant_misconfiguration',
            confidence: Math.min(0.95, confidence),
            reasoning: `Isolated issue (${merchantCount} merchant(s), risk ${riskScore}) likely due to configuration`,
            suggestedAction: 'draft_ticket_reply'
        }
    },

    /**
     * Determine the priority for human review queue
     */
    getReviewPriority(decision: Decision, riskScore: number): 'critical' | 'high' | 'normal' | 'low' {
        if (decision.type === 'platform_regression') return 'critical'
        if (riskScore >= 7) return 'critical'
        if (riskScore >= 5) return 'high'
        if (decision.confidence < 0.6) return 'high'
        if (riskScore >= 3) return 'normal'
        return 'low'
    }
}
