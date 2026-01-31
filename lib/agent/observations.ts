import { createAgentClient } from '@/lib/supabase/agent-client'

export const ObservationEngine = {
    // 1. Fetch unprocessed events
    // 2. Cluster them by fingerprint
    // 3. Create or Update Observations
    async processNewEvents() {
        const supabase = createAgentClient()

        // Fetch unprocessed
        const { data: events, error } = await supabase
            .from('raw_events')
            .select('*')
            .eq('processed', false)
            .limit(50) // Batch size

        if (error || !events?.length) return { processed: 0 }

        const clusters = new Map<string, typeof events>()

        // Cluster Logic
        for (const event of events) {
            const fingerprint = this.generateFingerprint(event)
            if (!clusters.has(fingerprint)) {
                clusters.set(fingerprint, [])
            }
            clusters.get(fingerprint)!.push(event)
        }

        // Persist Observations
        for (const [fingerprint, clusterEvents] of clusters.entries()) {
            // Check if active observation exists
            const { data: existingObs } = await supabase
                .from('observations')
                .select('*')
                .eq('fingerprint', fingerprint)
                .eq('status', 'active')
                .single()

            if (existingObs) {
                // Update existing
                const { error: updateError } = await supabase.from('observations').update({
                    last_seen: new Date().toISOString(),
                    merchant_count: existingObs.merchant_count + 1, // Simplified count logic
                    // event_count: existingObs.event_count + clusterEvents.length,
                    metadata: { ...existingObs.metadata, recent_samples: clusterEvents.map(e => e.id) }
                }).eq('id', existingObs.id)

                if (updateError) {
                    console.error('Observation Update Error:', updateError)
                    throw new Error(`Failed to update observation: ${updateError.message}`)
                }
            } else {
                // Create new
                const { error: insertError } = await supabase.from('observations').insert({
                    fingerprint,
                    summary: `Detected pattern: ${fingerprint}`,
                    merchant_count: 1,
                    // event_count: clusterEvents.length,
                    first_seen: new Date().toISOString(),
                    last_seen: new Date().toISOString(),
                    status: 'active',
                    metadata: { samples: clusterEvents.map(e => e.id) }
                })

                if (insertError) {
                    console.error('Observation Insert Error:', insertError)
                    throw new Error(`Failed to insert observation: ${insertError.message}`)
                }
            }

            // Mark events as processed
            const { error: processedError } = await supabase
                .from('raw_events')
                .update({ processed: true })
                .in('id', clusterEvents.map(e => e.id))

            if (processedError) console.error('Error marking events processed:', processedError)
        }

        return { processed: events.length, clusters: clusters.size }
    },

    generateFingerprint(event: any) {
        const p = event.payload
        // Heuristics for fingerprinting
        if (p.error_code) return `${event.source}:${p.error_code}`
        if (p.event) return `${event.source}:${p.event}` // Webhook event
        if (p.msg) return `${event.source}:${p.msg}` // Logs
        if (p.error) return `${event.source}:${p.error}`
        return `${event.source}:generic`
    }
}
