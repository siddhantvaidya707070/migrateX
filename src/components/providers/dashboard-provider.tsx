'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { toast } from 'sonner'

// Types - simplified
export interface SimulationConfig {
    errorTypes: string[]
    riskProfiles: ('low' | 'medium' | 'high')[]
    eventCount: number
    merchantCount: number
}

export interface DashboardStats {
    eventsIngested: number
    observations: number
    decisions: number
    learnings: number
    ticketsDrafted: number
    emailsDrafted: number
    pendingApprovals: number
}

export interface Activity {
    id: string
    type: 'event' | 'decision' | 'action' | 'learning'
    eventType?: string
    merchantId?: string
    merchantName?: string
    riskLevel?: 'low' | 'medium' | 'high'
    confidence?: number
    summary?: string
    details?: any
    timestamp: string
}

export interface AgentLearning {
    id: string
    learningType: 'pattern_detected' | 'classification_made' | 'trend_identified' | 'knowledge_entry'
    title: string
    description: string
    confidence?: number
    relatedEvents?: string[]
    metadata?: any
    createdAt: string
}

export interface Proposal {
    id: string
    actionType: string
    status: string
    payload: any
    createdAt: string
    context: {
        merchantName: string
        merchantId: string
        errorType: string
        riskScore: number
        confidence: number
        summary: string
    }
    artifact?: any
}

interface DashboardContextType {
    // State
    stats: DashboardStats
    activities: Activity[]
    learnings: AgentLearning[]
    proposals: Proposal[]
    currentRunId: string | null
    isLoading: boolean
    isSimulating: boolean
    error: string | null
    selectedEvent: any | null
    simulationProgress: { percentage: number, eventsInjected: number, totalEvents: number, estimatedRemainingMs: number } | null

    // Actions
    startSimulation: (config: SimulationConfig) => Promise<void>
    approveAction: (id: string) => Promise<void>
    rejectAction: (id: string) => Promise<void>
    refreshData: () => Promise<void>
    resetUI: () => void
    setSelectedEvent: (event: any | null) => void
}

const DashboardContext = createContext<DashboardContextType | null>(null)

export function useDashboard() {
    const context = useContext(DashboardContext)
    if (!context) {
        throw new Error('useDashboard must be used within DashboardProvider')
    }
    return context
}

export function DashboardProvider({ children }: { children: React.ReactNode }) {
    // Core state - all derived from database
    const [stats, setStats] = useState<DashboardStats>({
        eventsIngested: 0,
        observations: 0,
        decisions: 0,
        learnings: 0,
        ticketsDrafted: 0,
        emailsDrafted: 0,
        pendingApprovals: 0
    })
    const [activities, setActivities] = useState<Activity[]>([])
    const [learnings, setLearnings] = useState<AgentLearning[]>([])
    const [proposals, setProposals] = useState<Proposal[]>([])
    const [currentRunId, setCurrentRunId] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSimulating, setIsSimulating] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [selectedEvent, setSelectedEvent] = useState<any | null>(null)
    const [simulationProgress, setSimulationProgress] = useState<{ percentage: number, eventsInjected: number, totalEvents: number, estimatedRemainingMs: number } | null>(null)

    // Reset UI clears local state but preserves database learnings
    const resetUI = useCallback(() => {
        setCurrentRunId(null)
        setError(null)
        setSelectedEvent(null)
        setSimulationProgress(null)
        refreshData()
    }, [])

    // Fetch stats from database - THE SINGLE SOURCE OF TRUTH
    const fetchStats = useCallback(async (runId?: string | null) => {
        try {
            const url = runId
                ? `/api/dashboard/stats?run_id=${runId}`
                : '/api/dashboard/stats'

            const res = await fetch(url, { cache: 'no-store' })
            if (!res.ok) throw new Error('Failed to fetch stats')

            const data = await res.json()

            // ALL stats come from database
            setStats({
                eventsIngested: data.eventsIngested || 0,
                observations: data.observations || 0,
                decisions: data.decisions || 0,
                learnings: data.learningsCount || 0,
                ticketsDrafted: data.ticketsDrafted || 0,
                emailsDrafted: data.emailsDrafted || 0,
                pendingApprovals: data.pendingApprovals || 0
            })
        } catch (err) {
            console.error('Failed to fetch stats:', err)
        }
    }, [])

    // Fetch activity feed from database
    const fetchActivity = useCallback(async (runId?: string | null) => {
        try {
            const url = runId
                ? `/api/dashboard/activity?run_id=${runId}`
                : '/api/dashboard/activity'

            const res = await fetch(url, { cache: 'no-store' })
            if (!res.ok) throw new Error('Failed to fetch activity')

            const data = await res.json()

            setActivities(data.activities || [])
            setLearnings(data.learnings || [])
            setProposals(data.proposals || [])
        } catch (err) {
            console.error('Failed to fetch activity:', err)
        }
    }, [])

    // Combined refresh - fetches everything from DB
    const refreshData = useCallback(async () => {
        await Promise.all([
            fetchStats(currentRunId),
            fetchActivity(currentRunId)
        ])
    }, [currentRunId, fetchStats, fetchActivity])

    // Initial load
    useEffect(() => {
        const init = async () => {
            setIsLoading(true)
            await refreshData()
            setIsLoading(false)
        }
        init()
    }, []) // Only run once on mount

    // START SIMULATION - immediate, no polling, no spreading
    const startSimulation = useCallback(async (config: SimulationConfig) => {
        setIsSimulating(true)

        try {
            toast.info('Starting simulation...', { id: 'sim-start' })

            const res = await fetch('/api/dashboard/simulate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config)
            })

            if (!res.ok) {
                const error = await res.json()
                throw new Error(error.error || 'Simulation failed')
            }

            const data = await res.json()

            if (data.success) {
                setCurrentRunId(data.runId)

                toast.success(`Simulation complete`, {
                    id: 'sim-start',
                    description: `${data.eventsGenerated} events injected for ${data.merchantsAffected} merchants`
                })

                // Refresh data immediately to show new counts
                await Promise.all([
                    fetchStats(data.runId),
                    fetchActivity(data.runId)
                ])
            } else {
                throw new Error(data.error || 'Unknown error')
            }
        } catch (err: any) {
            console.error('Simulation error:', err)
            toast.error('Simulation failed', {
                id: 'sim-start',
                description: err.message
            })
        } finally {
            setIsSimulating(false)
        }
    }, [fetchStats, fetchActivity])

    // Approve action
    const approveAction = useCallback(async (id: string) => {
        try {
            const res = await fetch(`/api/dashboard/approve/${id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ decision: 'approve' })
            })

            if (!res.ok) {
                const error = await res.json()
                throw new Error(error.error || 'Approval failed')
            }

            toast.success('Action approved')

            // Refresh to get updated counts
            await refreshData()
        } catch (err: any) {
            console.error('Approval error:', err)
            toast.error('Approval failed', { description: err.message })
        }
    }, [refreshData])

    // Reject action
    const rejectAction = useCallback(async (id: string) => {
        try {
            const res = await fetch(`/api/dashboard/approve/${id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ decision: 'reject' })
            })

            if (!res.ok) {
                const error = await res.json()
                throw new Error(error.error || 'Rejection failed')
            }

            toast.success('Action rejected')

            // Refresh to get updated counts
            await refreshData()
        } catch (err: any) {
            console.error('Rejection error:', err)
            toast.error('Rejection failed', { description: err.message })
        }
    }, [refreshData])

    return (
        <DashboardContext.Provider
            value={{
                stats,
                activities,
                learnings,
                proposals,
                currentRunId,
                isLoading,
                isSimulating,
                error,
                selectedEvent,
                simulationProgress,
                startSimulation,
                approveAction,
                rejectAction,
                refreshData,
                resetUI,
                setSelectedEvent
            }}
        >
            {children}
        </DashboardContext.Provider>
    )
}
