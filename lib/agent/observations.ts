import { createAgentClient } from '@/lib/supabase/agent-client'

export interface SynthesizedObservation {
    id: string
    fingerprint: string
    summary: string
    merchant_count: number
    first_seen: string
    last_seen: string
    status: string
    metadata: any
    // Synthesized context
    migration_stage: string | null
    historical_pattern: 'new' | 'recurring' | 'escalating'
    time_since_first: number // hours
    affected_merchants: string[]
}

export const ObservationEngine = {
    /**
     * Step 1: OBSERVE - Fetch unprocessed events, cluster them by fingerprint
     */
    async processNewEvents() {
        const supabase = createAgentClient()

        // Fetch unprocessed events
        const { data: events, error } = await supabase
            .from('raw_events')
            .select('*')
            .eq('processed', false)
            .order('created_at', { ascending: true })
            .limit(50)

        if (error) {
            console.error('Error fetching raw_events:', error)
            throw new Error(`Failed to fetch events: ${error.message}`)
        }

        if (!events?.length) return { processed: 0, clusters: 0 }

        const clusters = new Map<string, typeof events>()

        // Cluster by fingerprint
        // WHY: We prefer the fingerprint stored in raw_event (from ingestion/simulation)
        // because it was carefully generated to enable proper clustering.
        // Only generate a new fingerprint if none exists (legacy events).
        for (const event of events) {
            // Use stored fingerprint if available, otherwise generate
            const fingerprint = event.fingerprint || this.generateFingerprint(event)
            if (!clusters.has(fingerprint)) {
                clusters.set(fingerprint, [])
            }
            clusters.get(fingerprint)!.push(event)
        }

        // Persist Observations
        for (const [fingerprint, clusterEvents] of clusters.entries()) {
            const { data: existingObs } = await supabase
                .from('observations')
                .select('*')
                .eq('fingerprint', fingerprint)
                .eq('status', 'active')
                .single()

            // Extract unique merchant IDs from events
            const merchantIds = [...new Set(
                clusterEvents
                    .map(e => e.payload?.merchant_id || e.payload?.merchantId)
                    .filter(Boolean)
            )]

            if (existingObs) {
                // Update existing observation
                const updatedMerchants = [
                    ...(existingObs.metadata?.affected_merchants || []),
                    ...merchantIds
                ]
                const uniqueMerchants = [...new Set(updatedMerchants)]

                const { error: updateError } = await supabase.from('observations').update({
                    last_seen: new Date().toISOString(),
                    merchant_count: uniqueMerchants.length || existingObs.merchant_count + 1,
                    status: 'active', // Reactivate so agent loop reprocesses
                    metadata: {
                        ...existingObs.metadata,
                        affected_merchants: uniqueMerchants,
                        recent_samples: clusterEvents.map(e => e.id),
                        event_count: (existingObs.metadata?.event_count || 1) + clusterEvents.length
                    }
                }).eq('id', existingObs.id)

                if (updateError) {
                    console.error('Observation Update Error:', updateError)
                    throw new Error(`Failed to update observation: ${updateError.message}`)
                }
            } else {
                // Create new observation
                const { error: insertError } = await supabase.from('observations').insert({
                    fingerprint,
                    summary: this.generateSummary(fingerprint, clusterEvents),
                    merchant_count: merchantIds.length || 1,
                    first_seen: new Date().toISOString(),
                    last_seen: new Date().toISOString(),
                    status: 'active',
                    metadata: {
                        affected_merchants: merchantIds,
                        samples: clusterEvents.map(e => e.id),
                        event_count: clusterEvents.length,
                        source_types: [...new Set(clusterEvents.map(e => e.source))]
                    }
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

            if (processedError) {
                console.error('Error marking events processed:', processedError)
            }
        }

        return { processed: events.length, clusters: clusters.size }
    },

    /**
     * Step 2: SYNTHESIZE - Enrich observation with migration context and history
     */
    async synthesize(observation: any): Promise<SynthesizedObservation> {
        const supabase = createAgentClient()

        // Calculate time since first seen
        const firstSeen = new Date(observation.first_seen)
        const now = new Date()
        const timeSinceFirstHours = (now.getTime() - firstSeen.getTime()) / (1000 * 60 * 60)

        // Determine historical pattern
        let historicalPattern: 'new' | 'recurring' | 'escalating' = 'new'

        // Check for similar past observations (resolved ones)
        const { data: pastObs } = await supabase
            .from('observations')
            .select('*')
            .eq('fingerprint', observation.fingerprint)
            .eq('status', 'resolved')
            .order('last_seen', { ascending: false })
            .limit(5)

        if (pastObs && pastObs.length > 0) {
            historicalPattern = 'recurring'

            // Check if this is escalating (more events than last time)
            const lastEventCount = pastObs[0]?.metadata?.event_count || 1
            const currentEventCount = observation.metadata?.event_count || 1
            if (currentEventCount > lastEventCount * 1.5) {
                historicalPattern = 'escalating'
            }
        }

        // Infer migration stage from fingerprint/payload
        let migrationStage: string | null = null
        const fp = observation.fingerprint.toLowerCase()
        const summary = (observation.summary || '').toLowerCase()

        if (fp.includes('checkout') || summary.includes('checkout')) {
            migrationStage = 'checkout_migration'
        } else if (fp.includes('webhook') || summary.includes('webhook')) {
            migrationStage = 'webhook_integration'
        } else if (fp.includes('auth') || summary.includes('token')) {
            migrationStage = 'authentication'
        }

        return {
            ...observation,
            migration_stage: migrationStage,
            historical_pattern: historicalPattern,
            time_since_first: Math.round(timeSinceFirstHours * 100) / 100,
            affected_merchants: observation.metadata?.affected_merchants || []
        }
    },

    /**
     * Generate a smart fingerprint from event payload
     */
    generateFingerprint(event: any): string {
        const p = event.payload || {}
        const source = event.source

        // Priority-based fingerprinting
        if (p.error_code) return `${source}:error:${p.error_code}`
        if (p.event) return `${source}:event:${p.event}`
        if (p.error) return `${source}:error:${p.error}`
        if (p.msg) return `${source}:msg:${this.normalizeMessage(p.msg)}`
        if (p.type) return `${source}:type:${p.type}`
        if (p.reason) return `${source}:reason:${p.reason}`

        return `${source}:unclassified`
    },

    /**
     * Normalize log messages for consistent fingerprinting
     */
    normalizeMessage(msg: string): string {
        return msg
            .toLowerCase()
            .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, 'UUID')
            .replace(/\d{4}-\d{2}-\d{2}/g, 'DATE')
            .replace(/\d+\.\d+\.\d+\.\d+/g, 'IP')
            .replace(/\d+/g, 'N')
            .trim()
            .slice(0, 50)
    },

    /**
     * Generate human-readable summary
     */
    generateSummary(fingerprint: string, events: any[]): string {
        const [source, type, detail] = fingerprint.split(':')
        const count = events.length

        if (type === 'error') {
            return `Detected ${count} error event(s) with code "${detail}" from ${source} source`
        }
        if (type === 'event') {
            return `Detected ${count} "${detail}" event(s) from ${source} source`
        }
        return `Detected pattern: ${fingerprint} (${count} events)`
    }
}
