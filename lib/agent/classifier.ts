export const Classifier = {
    classify(observation: any, hypothesis: any, risk: number): { type: string; confidence: number } {
        const context = (observation.summary + hypothesis.cause).toLowerCase()

        // Deterministic Rules
        if (risk >= 7 && (context.includes('500') || context.includes('timeout'))) {
            return { type: 'platform_regression', confidence: 0.95 }
        }

        if (context.includes('migration') || context.includes('stage')) {
            // If single merchant, maybe misconfig?
            if (observation.merchant_count === 1) {
                return { type: 'merchant_misconfiguration', confidence: 0.7 }
            }
            return { type: 'migration_error', confidence: 0.8 }
        }

        if (context.includes('docs') || context.includes('parameter') || context.includes('schema')) {
            return { type: 'documentation_gap', confidence: 0.6 }
        }

        // Default
        return { type: 'merchant_misconfiguration', confidence: 0.5 }
    }
}
