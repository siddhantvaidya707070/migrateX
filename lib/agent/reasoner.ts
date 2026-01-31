import { Mistral } from '@mistralai/mistralai'

const apiKey = process.env.MISTRAL_API_KEY
const client = new Mistral({ apiKey: apiKey })

export const Reasoner = {
    async generateHypotheses(observation: any) {
        if (!apiKey) {
            console.warn("Skipping AI Reasoner: No API Key")
            return null
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
            return null
        }
    }
}
