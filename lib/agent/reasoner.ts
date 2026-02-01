import { Mistral } from '@mistralai/mistralai'

const apiKey = process.env.MISTRAL_API_KEY
const client = apiKey ? new Mistral({ apiKey }) : null

// Deterministic hypothesis generator for demo/hackathon mode
function generateDeterministicHypotheses(observation: any) {
    const fingerprint = observation.fingerprint || ''
    const summary = observation.summary || ''

    // Parse error type from fingerprint
    const errorType = fingerprint.split('_')[0] || 'unknown'

    const hypothesisTemplates: Record<string, any[]> = {
        checkout: [
            { cause: 'Payment gateway timeout due to increased latency', confidence: 0.85, assumptions: ['Gateway is operational', 'Network not partitioned'] },
            { cause: 'Invalid API credentials or expired token', confidence: 0.75, assumptions: ['Merchant recently rotated keys', 'No system-wide outage'] },
            { cause: 'Cart session expired before payment completion', confidence: 0.65, assumptions: ['Session timeout is configured', 'User was inactive'] }
        ],
        auth: [
            { cause: 'API key mismatch - credentials were recently rotated', confidence: 0.88, assumptions: ['Key rotation occurred', 'Old key is cached'] },
            { cause: 'OAuth token expired and refresh failed', confidence: 0.72, assumptions: ['Token lifetime exceeded', 'Refresh endpoint accessible'] },
            { cause: 'IP whitelist blocking requests from new deployment', confidence: 0.68, assumptions: ['IP changed', 'Whitelist not updated'] }
        ],
        webhook: [
            { cause: 'Webhook endpoint returning 5xx errors', confidence: 0.82, assumptions: ['Endpoint is deployed', 'Backend is overloaded'] },
            { cause: 'SSL certificate expired on merchant webhook server', confidence: 0.75, assumptions: ['HTTPS required', 'Cert not renewed'] },
            { cause: 'Request payload format changed after API upgrade', confidence: 0.70, assumptions: ['Migration in progress', 'Breaking change introduced'] }
        ],
        rate: [
            { cause: 'Burst traffic exceeded per-merchant rate limits', confidence: 0.90, assumptions: ['Traffic spike occurred', 'Limits not increased'] },
            { cause: 'Retry storm from failed requests amplifying load', confidence: 0.78, assumptions: ['Retries enabled', 'Exponential backoff missing'] }
        ],
        platform: [
            { cause: 'Recent deployment introduced regression in shared service', confidence: 0.85, assumptions: ['Deployment occurred', 'Rollback available'] },
            { cause: 'Database connection pool exhausted under load', confidence: 0.80, assumptions: ['Connection limits reached', 'Pool not auto-scaling'] }
        ],
        migration: [
            { cause: 'Legacy API endpoint being called instead of new version', confidence: 0.82, assumptions: ['Migration incomplete', 'Dual-write enabled'] },
            { cause: 'Data format incompatibility between old and new systems', confidence: 0.75, assumptions: ['Schema changed', 'Transformer missing'] }
        ]
    }

    // Find matching hypotheses
    let hypotheses = hypothesisTemplates.unknown || []
    for (const [key, templates] of Object.entries(hypothesisTemplates)) {
        if (fingerprint.toLowerCase().includes(key) || summary.toLowerCase().includes(key)) {
            hypotheses = templates
            break
        }
    }

    // Default fallback
    if (hypotheses.length === 0) {
        hypotheses = [
            { cause: 'Configuration mismatch detected in merchant integration', confidence: 0.75, assumptions: ['Recent changes made', 'Config not synced'] },
            { cause: 'Transient network issue affecting service communication', confidence: 0.65, assumptions: ['Network healthy', 'Retry would succeed'] }
        ]
    }

    return {
        hypotheses,
        explanation: `Generated ${hypotheses.length} hypotheses based on pattern matching for ${errorType} errors. No AI API key configured - using deterministic fallback.`,
        source: 'deterministic'
    }
}

export const Reasoner = {
    async generateHypotheses(observation: any) {
        // If no API key, use deterministic fallback (hackathon mode)
        if (!apiKey || !client) {
            console.log('[Reasoner] No MISTRAL_API_KEY - using deterministic hypothesis generator')
            return generateDeterministicHypotheses(observation)
        }

        const prompt = `
    You are an expert Reliability Engineer. Analyze this system observation and generate plausible root cause hypotheses.
    
    Observation: ${observation.summary}
    Fingerprint: ${observation.fingerprint}
    Context: Validating checkout flow migration.
    
    Return JSON only:
    {
      "hypotheses": [
        { "cause": "string", "confidence": 0.0-1.0, "assumptions": ["string"] }
      ],
      "explanation": "string"
    }
    `

        try {
            const chatResponse = await client.chat.complete({
                model: 'mistral-small-latest',
                messages: [{ role: 'user', content: prompt }],
                responseFormat: { type: 'json_object' }
            })

            const raw = chatResponse.choices![0].message.content
            return JSON.parse(raw as string)
        } catch (err) {
            console.error("Mistral API Error:", err)
            // Fallback to deterministic on API error
            console.log('[Reasoner] API failed - using deterministic fallback')
            return generateDeterministicHypotheses(observation)
        }
    }
}
