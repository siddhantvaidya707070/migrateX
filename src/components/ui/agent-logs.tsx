'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Brain,
    Lightbulb,
    BookOpen,
    Database,
    TrendingUp,
    Sparkles,
    AlertCircle,
    CheckCircle2,
    Loader2,
    ChevronDown,
    ChevronUp,
    Code,
    Shield,
    Zap
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface AgentLearning {
    id: string
    learningType: 'pattern_detected' | 'classification_made' | 'doc_update_suggested' | 'knowledge_entry' | 'trend_identified'
    title: string
    description: string
    confidence?: number
    relatedEvents?: string[]
    metadata?: any
    createdAt: string
}

interface AgentLogsProps {
    learnings: AgentLearning[]
    isLoading: boolean
    activities?: any[] // Allow passing activities to generate learnings from
}

const LEARNING_TYPE_CONFIG: Record<string, { icon: any, color: string, bg: string, label: string }> = {
    pattern_detected: { icon: Sparkles, color: 'text-violet-400', bg: 'bg-violet-500/10', label: 'Pattern Detected' },
    classification_made: { icon: Brain, color: 'text-blue-400', bg: 'bg-blue-500/10', label: 'Classification Made' },
    doc_update_suggested: { icon: BookOpen, color: 'text-amber-400', bg: 'bg-amber-500/10', label: 'Doc Update Suggested' },
    knowledge_entry: { icon: Database, color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Knowledge Entry' },
    trend_identified: { icon: TrendingUp, color: 'text-cyan-400', bg: 'bg-cyan-500/10', label: 'Trend Identified' }
}

// Generate mock learnings from activities when no database entries exist
export function generateMockLearnings(activities: any[]): AgentLearning[] {
    if (!activities || activities.length === 0) return []

    const learnings: AgentLearning[] = []
    const eventTypeCounts: Record<string, number> = {}
    const riskLevelCounts: Record<string, number> = {}

    // Count patterns
    activities.forEach(a => {
        if (a.eventType) {
            eventTypeCounts[a.eventType] = (eventTypeCounts[a.eventType] || 0) + 1
        }
        if (a.riskLevel) {
            riskLevelCounts[a.riskLevel] = (riskLevelCounts[a.riskLevel] || 0) + 1
        }
    })

    // Generate pattern learnings
    Object.entries(eventTypeCounts).forEach(([type, count]) => {
        if (count >= 2) {
            learnings.push({
                id: `mock-pattern-${type}`,
                learningType: 'pattern_detected',
                title: `Recurring ${type.replace(/_/g, ' ')} Pattern`,
                description: `Detected ${count} instances of ${type.replace(/_/g, ' ')} across multiple merchants. This pattern suggests systematic integration issues.`,
                confidence: Math.min(0.95, 0.5 + count * 0.1),
                relatedEvents: activities.filter(a => a.eventType === type).slice(0, 3).map(a => a.id),
                metadata: { patternType: type, occurrences: count },
                createdAt: new Date().toISOString()
            })
        }
    })

    // Generate classification learnings (sample from recent activities)
    activities.slice(0, 5).forEach((activity, idx) => {
        learnings.push({
            id: `mock-class-${activity.id || idx}`,
            learningType: 'classification_made',
            title: `Classified: ${(activity.eventType || 'Unknown').replace(/_/g, ' ')}`,
            description: `Event from ${activity.merchantName || 'Unknown Merchant'} classified with ${activity.riskLevel || 'medium'} risk level. ${activity.summary || ''}`,
            confidence: activity.confidence || 0.75,
            relatedEvents: [activity.id],
            metadata: {
                classification: activity.eventType,
                riskLevel: activity.riskLevel,
                merchantName: activity.merchantName
            },
            createdAt: activity.timestamp || new Date().toISOString()
        })
    })

    // Generate trend learnings from risk distribution
    if (riskLevelCounts.high >= 3) {
        learnings.push({
            id: 'mock-trend-high-risk',
            learningType: 'trend_identified',
            title: 'High-Risk Event Surge',
            description: `Identified ${riskLevelCounts.high} high-risk events. This may indicate a platform-wide issue requiring immediate attention.`,
            confidence: 0.9,
            metadata: { riskDistribution: riskLevelCounts },
            createdAt: new Date().toISOString()
        })
    }

    // Generate knowledge entry
    if (activities.length >= 10) {
        learnings.push({
            id: 'mock-knowledge-1',
            learningType: 'knowledge_entry',
            title: 'Session Knowledge Captured',
            description: `Processed ${activities.length} events across ${Object.keys(eventTypeCounts).length} error types. Institutional memory updated with new patterns and resolutions.`,
            confidence: 0.85,
            metadata: { eventTypes: Object.keys(eventTypeCounts), totalEvents: activities.length },
            createdAt: new Date().toISOString()
        })
    }

    return learnings.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
}

function LearningItem({ learning }: { learning: AgentLearning }) {
    const [showRaw, setShowRaw] = useState(false)
    const config = LEARNING_TYPE_CONFIG[learning.learningType] || LEARNING_TYPE_CONFIG.knowledge_entry
    const Icon = config.icon

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-lg bg-slate-800/40 border border-white/5 hover:border-white/10 transition-colors"
        >
            <div className="flex items-start gap-3">
                {/* Icon */}
                <div className={`p-2 rounded-lg ${config.bg} flex-shrink-0`}>
                    <Icon className={`w-4 h-4 ${config.color}`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    {/* Type Badge */}
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`text-xs font-medium ${config.color}`}>
                            {config.label}
                        </span>
                        {learning.confidence && (
                            <span className="text-xs text-slate-500">
                                • {Math.round(learning.confidence * 100)}% confidence
                            </span>
                        )}
                    </div>

                    {/* Title */}
                    <h4 className="text-sm font-medium text-white mb-1">
                        {learning.title}
                    </h4>

                    {/* Description */}
                    <p className="text-sm text-slate-400 leading-relaxed">
                        {learning.description}
                    </p>

                    {/* Related Events */}
                    {learning.relatedEvents && learning.relatedEvents.length > 0 && (
                        <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                            <AlertCircle className="w-3 h-3" />
                            References {learning.relatedEvents.length} event{learning.relatedEvents.length > 1 ? 's' : ''}
                        </div>
                    )}

                    {/* Metadata/Raw Data Toggle */}
                    {learning.metadata && (
                        <div className="mt-2">
                            <button
                                onClick={() => setShowRaw(!showRaw)}
                                className="text-xs text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1"
                            >
                                <Code className="w-3 h-3" />
                                {showRaw ? 'Hide' : 'View'} Raw Data
                                {showRaw ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            </button>

                            <AnimatePresence>
                                {showRaw && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mt-2 overflow-hidden"
                                    >
                                        <pre className="p-2 rounded bg-slate-900/50 text-xs text-slate-400 font-mono overflow-x-auto">
                                            {JSON.stringify(learning.metadata, null, 2)}
                                        </pre>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}

                    {/* Timestamp */}
                    <div className="mt-2 text-xs text-slate-500">
                        {formatDistanceToNow(new Date(learning.createdAt), { addSuffix: true })}
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

export function AgentLogs({ learnings, isLoading, activities = [] }: AgentLogsProps) {
    // Only use real database learnings - no mock data anymore
    const displayLearnings = learnings

    if (isLoading && displayLearnings.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin mb-2" />
                <p className="text-sm">Loading agent logs...</p>
            </div>
        )
    }

    if (displayLearnings.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 px-4 text-center">
                <div className="p-4 rounded-full bg-slate-800/50 mb-3">
                    <Brain className="w-8 h-8" />
                </div>
                <p className="font-medium text-white mb-1">No Agent Learnings Yet</p>
                <p className="text-sm">Run a simulation to see the agent learn and classify events here.</p>

                <div className="mt-6 grid grid-cols-2 gap-3 w-full max-w-sm">
                    <div className="p-3 rounded-lg bg-slate-800/30 border border-white/5 text-left">
                        <Sparkles className="w-4 h-4 text-violet-400 mb-1" />
                        <p className="text-xs text-white font-medium">Pattern Detection</p>
                        <p className="text-xs text-slate-500 mt-0.5">Recurring issues</p>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-800/30 border border-white/5 text-left">
                        <Brain className="w-4 h-4 text-blue-400 mb-1" />
                        <p className="text-xs text-white font-medium">Classifications</p>
                        <p className="text-xs text-slate-500 mt-0.5">Issue categorization</p>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-800/30 border border-white/5 text-left">
                        <BookOpen className="w-4 h-4 text-amber-400 mb-1" />
                        <p className="text-xs text-white font-medium">Doc Updates</p>
                        <p className="text-xs text-slate-500 mt-0.5">Suggested improvements</p>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-800/30 border border-white/5 text-left">
                        <Database className="w-4 h-4 text-emerald-400 mb-1" />
                        <p className="text-xs text-white font-medium">Knowledge Base</p>
                        <p className="text-xs text-slate-500 mt-0.5">Stored insights</p>
                    </div>
                </div>
            </div>
        )
    }

    // Count by type for summary
    const typeCounts = displayLearnings.reduce((acc, l) => {
        acc[l.learningType] = (acc[l.learningType] || 0) + 1
        return acc
    }, {} as Record<string, number>)

    return (
        <div className="h-full overflow-y-auto custom-scrollbar pr-1 space-y-3">
            {/* Summary Header */}
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span className="text-sm font-medium text-emerald-300">
                            {displayLearnings.length} learning{displayLearnings.length > 1 ? 's' : ''} recorded
                        </span>
                    </div>
                    <span className="text-xs text-emerald-400/70">
                        Institutional memory growing
                    </span>
                </div>

                {/* Type breakdown */}
                <div className="flex flex-wrap gap-2">
                    {Object.entries(typeCounts).map(([type, count]) => {
                        const cfg = LEARNING_TYPE_CONFIG[type]
                        return cfg ? (
                            <span key={type} className={`px-2 py-0.5 text-xs rounded ${cfg.bg} ${cfg.color}`}>
                                {count} {cfg.label.toLowerCase()}
                            </span>
                        ) : null
                    })}
                </div>
            </div>

            <AnimatePresence mode="popLayout">
                {displayLearnings.map((learning) => (
                    <LearningItem key={learning.id} learning={learning} />
                ))}
            </AnimatePresence>
        </div>
    )
}
