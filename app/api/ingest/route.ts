import { NextRequest, NextResponse } from 'next/server'
import { createAgentClient } from '@/lib/supabase/agent-client'

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()

        // Strict Type Validation
        const { source, payload } = body
        if (!['ticket', 'log', 'webhook', 'migration_state'].includes(source)) {
            return NextResponse.json({ error: 'Invalid source' }, { status: 400 })
        }
        if (!payload) {
            return NextResponse.json({ error: 'Missing payload' }, { status: 400 })
        }

        const supabase = createAgentClient()

        const { data, error } = await supabase
            .from('raw_events')
            .insert({
                source,
                payload,
                processed: false
            })
            .select()
            .single()

        if (error) {
            console.error('Supabase ingest error:', error)
            return NextResponse.json({ error: 'Database error' }, { status: 500 })
        }

        return NextResponse.json({ success: true, id: data.id }, { status: 201 })
    } catch (err) {
        console.error('Ingest API error:', err)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
