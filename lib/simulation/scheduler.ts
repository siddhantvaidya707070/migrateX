/**
 * Simulation Scheduler - Manages time-distributed event injection
 * 
 * For "spread" simulations:
 * - Divides events into batches
 * - Schedules injection over time
 * - Creates realistic "live" feel
 */

export interface ScheduleConfig {
    runId: string
    totalEvents: number
    distribution: 'burst' | 'spread'
    durationSeconds: number
    batchCount?: number
}

export interface ScheduleBatch {
    batchIndex: number
    eventCount: number
    delayMs: number
    injectedAt?: string
    status: 'pending' | 'injected' | 'failed'
}

export interface SimulationSchedule {
    id: string
    runId: string
    config: ScheduleConfig
    batches: ScheduleBatch[]
    totalEvents: number
    eventsInjected: number
    distribution: 'burst' | 'spread'
    durationSeconds: number
    nextBatchIndex: number
    status: 'pending' | 'active' | 'completed' | 'cancelled'
    startedAt: string
    completedAt?: string
    createdAt: string
}

/**
 * Create a schedule for event injection
 */
export function createSchedule(config: ScheduleConfig): SimulationSchedule {
    const batchCount = config.batchCount || (config.distribution === 'burst' ? 1 : 5)
    const batches: ScheduleBatch[] = []

    if (config.distribution === 'burst') {
        // All events in one batch, no delay
        batches.push({
            batchIndex: 0,
            eventCount: config.totalEvents,
            delayMs: 0,
            status: 'pending'
        })
    } else {
        // Distribute events across batches with increasing intervals
        const baseInterval = (config.durationSeconds * 1000) / batchCount
        let remainingEvents = config.totalEvents

        // Distribution pattern: 15%, 20%, 25%, 20%, 20%
        const distribution = [0.15, 0.2, 0.25, 0.2, 0.2]

        for (let i = 0; i < batchCount; i++) {
            const fraction = distribution[i] || (1 / batchCount)
            const eventCount = i === batchCount - 1
                ? remainingEvents
                : Math.max(1, Math.floor(config.totalEvents * fraction))

            remainingEvents -= eventCount

            batches.push({
                batchIndex: i,
                eventCount,
                delayMs: i * baseInterval,
                status: 'pending'
            })
        }
    }

    return {
        id: crypto.randomUUID(),
        runId: config.runId,
        config,
        batches,
        totalEvents: config.totalEvents,
        eventsInjected: 0,
        distribution: config.distribution,
        durationSeconds: config.durationSeconds,
        nextBatchIndex: 0,
        status: 'pending',
        startedAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
    }
}

/**
 * Get the next batch to inject
 */
export function getNextBatch(schedule: SimulationSchedule): ScheduleBatch | null {
    if (schedule.status === 'completed' || schedule.status === 'cancelled') {
        return null
    }

    const pendingBatches = schedule.batches.filter(b => b.status === 'pending')
    if (pendingBatches.length === 0) {
        return null
    }

    // Check if enough time has passed for the next batch
    const startTime = new Date(schedule.startedAt).getTime()
    const now = Date.now()
    const elapsed = now - startTime

    const nextBatch = pendingBatches[0]
    if (elapsed >= nextBatch.delayMs) {
        return nextBatch
    }

    return null
}

/**
 * Mark a batch as injected
 */
export function markBatchInjected(
    schedule: SimulationSchedule,
    batchIndex: number
): SimulationSchedule {
    const updatedBatches = schedule.batches.map(b =>
        b.batchIndex === batchIndex
            ? { ...b, status: 'injected' as const, injectedAt: new Date().toISOString() }
            : b
    )

    const injectedCount = updatedBatches
        .filter(b => b.status === 'injected')
        .reduce((sum, b) => sum + b.eventCount, 0)

    const allInjected = updatedBatches.every(b => b.status === 'injected')

    return {
        ...schedule,
        batches: updatedBatches,
        eventsInjected: injectedCount,
        nextBatchIndex: batchIndex + 1,
        status: allInjected ? 'completed' : 'active',
        completedAt: allInjected ? new Date().toISOString() : undefined
    }
}

/**
 * Calculate progress percentage
 */
export function getScheduleProgress(schedule: SimulationSchedule): {
    percentage: number
    eventsInjected: number
    totalEvents: number
    batchesComplete: number
    totalBatches: number
    estimatedRemainingMs: number
} {
    const batchesComplete = schedule.batches.filter(b => b.status === 'injected').length
    const totalBatches = schedule.batches.length
    const percentage = Math.round((schedule.eventsInjected / schedule.totalEvents) * 100)

    const pendingBatches = schedule.batches.filter(b => b.status === 'pending')
    const maxDelay = pendingBatches.length > 0
        ? Math.max(...pendingBatches.map(b => b.delayMs))
        : 0

    const elapsed = Date.now() - new Date(schedule.startedAt).getTime()
    const estimatedRemainingMs = Math.max(0, maxDelay - elapsed)

    return {
        percentage,
        eventsInjected: schedule.eventsInjected,
        totalEvents: schedule.totalEvents,
        batchesComplete,
        totalBatches,
        estimatedRemainingMs
    }
}

/**
 * Calculate next injection time
 */
export function getNextInjectionTime(schedule: SimulationSchedule): number | null {
    if (schedule.status === 'completed' || schedule.status === 'cancelled') {
        return null
    }

    const pendingBatches = schedule.batches.filter(b => b.status === 'pending')
    if (pendingBatches.length === 0) {
        return null
    }

    const startTime = new Date(schedule.startedAt).getTime()
    const nextBatch = pendingBatches[0]
    const nextTime = startTime + nextBatch.delayMs

    return Math.max(0, nextTime - Date.now())
}

/**
 * Serialize schedule for database storage
 */
export function serializeForDB(schedule: SimulationSchedule) {
    return {
        run_id: schedule.runId,
        config: schedule.config,
        total_events: schedule.totalEvents,
        events_injected: schedule.eventsInjected,
        distribution: schedule.distribution,
        duration_seconds: schedule.durationSeconds,
        batches: schedule.batches,
        next_batch_index: schedule.nextBatchIndex,
        status: schedule.status,
        started_at: schedule.startedAt,
        completed_at: schedule.completedAt
    }
}

/**
 * Deserialize schedule from database
 */
export function deserializeFromDB(data: any): SimulationSchedule {
    return {
        id: data.id,
        runId: data.run_id,
        config: data.config,
        batches: data.batches,
        totalEvents: data.total_events,
        eventsInjected: data.events_injected,
        distribution: data.distribution,
        durationSeconds: data.duration_seconds,
        nextBatchIndex: data.next_batch_index,
        status: data.status,
        startedAt: data.started_at,
        completedAt: data.completed_at,
        createdAt: data.created_at
    }
}
