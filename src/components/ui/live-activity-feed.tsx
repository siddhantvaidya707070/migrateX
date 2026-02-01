'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Activity as ActivityIcon,
    Zap,
    CheckCircle2,
    AlertTriangle,
    Brain,
    Eye,
    Scale,
    MessageSquare,
    Clock
} from 'lucide-react'

// Define Activity interface locally to avoid import issues
interface Activity {
    id?: string
    type: string
    step?: string
    event_type?: string
    classification?: string
    confidence?: number
    merchant_id?: string
    risk?: { score?: number } | null
    details?: any
    timestamp: string
}

interface LiveActivityFeedProps {
    activities: Activity[]
    isProcessing: boolean
}

const getActivityIcon = (type: string, step?: string) => {
    if (type === 'agent_step') {
        switch (step) {
            case 'Observe': return Eye
            case 'Synthesize': return Brain
            case 'Evaluate Risk': return Scale
            case 'Act': return Zap
            default: return Brain
        }
    }
    if (type === 'event_ingested' || type === 'event') return ActivityIcon
    if (type === 'decision_made' || type === 'decision') return CheckCircle2
    return ActivityIcon
}

const getActivityColor = (type: string, classification?: string, risk?: any) => {
    if (type === 'decision_made' || type === 'decision') {
        if (classification?.includes('platform') || risk?.score >= 7) return 'border-red-500/50 bg-red-500/10'
        if (classification?.includes('migration')) return 'border-orange-500/50 bg-orange-500/10'
        return 'border-green-500/50 bg-green-500/10'
    }
    if (type === 'agent_step') return 'border-primary/50 bg-primary/10'
    return 'border-border bg-muted/50'
}

const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const then = new Date(timestamp)
    const diff = Math.floor((now.getTime() - then.getTime()) / 1000)

    if (diff < 60) return 'just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
}

export function LiveActivityFeed({ activities, isProcessing }: LiveActivityFeedProps) {
    // Take last 15 activities
    const displayActivities = activities.slice(0, 15)

    return (
        <div className="glass-panel rounded-2xl p-6 border border-border/50">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <ActivityIcon className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold">Live Activity</h3>
                </div>
                {isProcessing && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-2"
                    >
                        <motion.div
                            className="w-2 h-2 rounded-full bg-green-500"
                            animate={{ opacity: [1, 0.3, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                        />
                        <span className="text-xs text-green-500">Live</span>
                    </motion.div>
                )}
            </div>

            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                <AnimatePresence mode="popLayout">
                    {displayActivities.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-sm text-muted-foreground text-center py-8"
                        >
                            No activity yet. Start a simulation to see events.
                        </motion.div>
                    ) : (
                        displayActivities.map((activity, idx) => {
                            const Icon = getActivityIcon(activity.type, activity.step)
                            const colorClass = getActivityColor(activity.type, activity.classification, activity.risk)

                            return (
                                <motion.div
                                    key={`${activity.timestamp}-${idx}`}
                                    initial={{ opacity: 0, x: -20, height: 0 }}
                                    animate={{ opacity: 1, x: 0, height: 'auto' }}
                                    exit={{ opacity: 0, x: 20, height: 0 }}
                                    transition={{ duration: 0.2, delay: idx * 0.03 }}
                                    className={`flex items-start gap-3 p-3 rounded-xl border ${colorClass} transition-all hover:brightness-110`}
                                >
                                    <div className="w-8 h-8 rounded-lg bg-background/50 flex items-center justify-center flex-shrink-0">
                                        <Icon className="w-4 h-4" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            {activity.type === 'agent_step' && (
                                                <span className="font-medium text-sm">
                                                    {activity.step}
                                                </span>
                                            )}

                                            {(activity.type === 'event_ingested' || activity.type === 'event') && (
                                                <>
                                                    <span className="font-medium text-sm">
                                                        Event Ingested
                                                    </span>
                                                    <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                                                        {activity.event_type?.replace(/_/g, ' ') || 'signal'}
                                                    </span>
                                                </>
                                            )}

                                            {(activity.type === 'decision_made' || activity.type === 'decision') && (
                                                <>
                                                    <span className="font-medium text-sm">
                                                        Decision Made
                                                    </span>
                                                    <span className={`text-xs px-2 py-0.5 rounded-full ${activity.classification?.includes('platform')
                                                        ? 'bg-red-500/20 text-red-400'
                                                        : activity.classification?.includes('migration')
                                                            ? 'bg-orange-500/20 text-orange-400'
                                                            : 'bg-green-500/20 text-green-400'
                                                        }`}>
                                                        {activity.classification?.replace(/_/g, ' ') || 'classified'}
                                                    </span>
                                                </>
                                            )}
                                        </div>

                                        <div className="mt-1 text-xs text-muted-foreground truncate">
                                            {activity.type === 'agent_step' && activity.details && (
                                                <span>{JSON.stringify(activity.details).slice(0, 60)}...</span>
                                            )}
                                            {(activity.type === 'event_ingested' || activity.type === 'event') && activity.merchant_id && (
                                                <span>Merchant: {activity.merchant_id.slice(0, 20)}</span>
                                            )}
                                            {(activity.type === 'decision_made' || activity.type === 'decision') && activity.confidence && (
                                                <span>Confidence: {(activity.confidence * 100).toFixed(0)}%</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
                                        <Clock className="w-3 h-3" />
                                        {formatTimeAgo(activity.timestamp)}
                                    </div>
                                </motion.div>
                            )
                        })
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
