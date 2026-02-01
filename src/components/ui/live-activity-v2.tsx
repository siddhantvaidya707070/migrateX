'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Activity as ActivityIcon,
    Zap,
    FileQuestion,
    Webhook,
    KeyRound,
    Timer,
    Settings2,
    AlertTriangle,
    ChevronDown,
    ChevronRight,
    Eye,
    Clock,
    Building2,
    Shield,
    Gauge,
    CheckCircle2,
    XCircle,
    Loader2,
    ArrowRight,
    Filter,
    X,
    ChevronUp,
    Mail,
    AlertCircle,
    Users,
    FileText,
    Send,
    Info
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface Activity {
    id: string
    type: 'event' | 'decision' | 'action' | 'approval_created'
    eventType?: string
    merchantId?: string
    merchantName?: string
    riskLevel?: 'low' | 'medium' | 'high'
    confidence?: number
    action?: string
    status?: string
    summary?: string
    details?: any
    timestamp: string
}

interface LiveActivityV2Props {
    activities: Activity[]
    isLoading: boolean
    onEventClick: (event: Activity) => void
}

const ERROR_TYPE_ICONS: Record<string, any> = {
    checkout_failure: { icon: Zap, color: 'text-red-400', bg: 'bg-red-500/10' },
    documentation_gap: { icon: FileQuestion, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    webhook_failure: { icon: Webhook, color: 'text-orange-400', bg: 'bg-orange-500/10' },
    auth_failure: { icon: KeyRound, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    rate_limit: { icon: Timer, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    merchant_misconfig: { icon: Settings2, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    platform_regression: { icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-500/20' },
    migration_error: { icon: ActivityIcon, color: 'text-violet-400', bg: 'bg-violet-500/10' },
    default: { icon: ActivityIcon, color: 'text-slate-400', bg: 'bg-slate-500/10' }
}

const RISK_COLORS: Record<string, { text: string, bg: string, border: string }> = {
    low: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
    medium: { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
    high: { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' }
}

const ITEMS_PER_PAGE = 15

// Generate mock solution based on event type and details
function generateMockSolution(activity: Activity): {
    actions: string[]
    affectedParties: string[]
    preventiveMeasures: string[]
    timeline: string
} {
    const merchantName = activity.merchantName || 'the merchant'
    const eventType = activity.eventType || 'error'

    const solutions: Record<string, any> = {
        auth_failure: {
            actions: [
                `Sending automated alert to ${merchantName}'s integration team about invalid API credentials`,
                `Notifying the security team to review recent authentication patterns`,
                `Dispatching troubleshooting guide to ${merchantName}'s technical contact`
            ],
            affectedParties: [merchantName, 'Security Team', 'Integration Support'],
            preventiveMeasures: [
                'Recommend credential rotation schedule',
                'Enable API key expiration notifications',
                'Set up monitoring for auth failure spikes'
            ],
            timeline: 'Immediate notification, 15-min follow-up'
        },
        checkout_failure: {
            actions: [
                `Alerting ${merchantName}'s operations team about payment processing issues`,
                `Escalating to platform engineering for infrastructure review`,
                `Sending revenue impact estimate to the merchant's account manager`
            ],
            affectedParties: [merchantName, 'Platform Engineering', 'Account Management'],
            preventiveMeasures: [
                'Implement failover payment routing',
                'Add real-time checkout health monitoring',
                'Alert similar merchants in same region'
            ],
            timeline: 'Critical - immediate escalation'
        },
        webhook_failure: {
            actions: [
                `Sending webhook configuration guide to ${merchantName}`,
                `Queueing failed webhook payloads for retry`,
                `Notifying ${merchantName}'s dev team about endpoint issues`
            ],
            affectedParties: [merchantName, 'Developer Relations'],
            preventiveMeasures: [
                'Add webhook endpoint health checks',
                'Implement automatic retry with exponential backoff',
                'Suggest webhook signature verification'
            ],
            timeline: '30-min investigation, 1-hour resolution target'
        },
        rate_limit: {
            actions: [
                `Analyzing ${merchantName}'s API usage patterns`,
                `Sending rate limit optimization recommendations`,
                `Reviewing if tier upgrade is appropriate`
            ],
            affectedParties: [merchantName, 'API Platform Team', 'Sales'],
            preventiveMeasures: [
                'Implement request batching',
                'Add client-side rate limit handling',
                'Set up usage alerts before limits'
            ],
            timeline: '1-hour analysis, same-day recommendations'
        },
        platform_regression: {
            actions: [
                `Creating incident ticket for platform engineering`,
                `Alerting all affected merchants about known issue`,
                `Activating fallback systems where available`
            ],
            affectedParties: ['All affected merchants', 'Platform Engineering', 'On-call Team'],
            preventiveMeasures: [
                'Add canary deployments',
                'Implement feature flags',
                'Enhance pre-production testing'
            ],
            timeline: 'P1 - All hands on deck'
        },
        default: {
            actions: [
                `Analyzing root cause for ${merchantName}'s issue`,
                `Drafting resolution steps for support team`,
                `Preparing follow-up communication`
            ],
            affectedParties: [merchantName, 'Support Team'],
            preventiveMeasures: [
                'Document pattern for future reference',
                'Update knowledge base',
                'Train ML model on this case'
            ],
            timeline: 'Standard SLA - 24 hours'
        }
    }

    return solutions[eventType] || solutions.default
}

// Generate quick insights from activity details
function getQuickInsights(activity: Activity): { label: string, value: string, icon: any }[] {
    const insights = []
    const details = activity.details || {}

    // HTTP Status
    if (details.http_status) {
        insights.push({
            label: 'HTTP Status',
            value: details.http_status.toString(),
            icon: AlertCircle
        })
    }

    // Endpoint
    if (details.endpoint) {
        insights.push({
            label: 'Endpoint',
            value: details.endpoint,
            icon: ArrowRight
        })
    }

    // Error Code
    if (details.error_code) {
        insights.push({
            label: 'Error Code',
            value: details.error_code,
            icon: XCircle
        })
    }

    // Affected Feature
    if (details.affected_feature) {
        insights.push({
            label: 'Feature',
            value: details.affected_feature.replace(/_/g, ' '),
            icon: Settings2
        })
    }

    // Merchant Tier
    if (details.merchant_tier) {
        insights.push({
            label: 'Tier',
            value: details.merchant_tier.toUpperCase(),
            icon: Shield
        })
    }

    return insights.slice(0, 4) // Max 4 insights
}

function ActivityItem({ activity, onExpand, onViewReasoning }: {
    activity: Activity
    onExpand: () => void
    onViewReasoning: () => void
}) {
    const [isExpanded, setIsExpanded] = useState(false)

    const iconConfig = ERROR_TYPE_ICONS[activity.eventType || ''] || ERROR_TYPE_ICONS.default
    const Icon = iconConfig.icon
    const riskColors = activity.riskLevel ? RISK_COLORS[activity.riskLevel] : RISK_COLORS.medium
    const quickInsights = getQuickInsights(activity)
    const solution = generateMockSolution(activity)

    const handleExpand = () => {
        setIsExpanded(!isExpanded)
        if (!isExpanded) {
            onExpand()
        }
    }

    // Calculate confidence display
    const confidencePercent = activity.confidence !== undefined
        ? Math.round(activity.confidence * 100)
        : activity.details?.confidence
            ? Math.round(activity.details.confidence * 100)
            : null

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-lg bg-slate-800/40 border border-white/5 hover:border-violet-500/30 transition-all"
        >
            <div className="flex items-start gap-3">
                {/* Icon */}
                <div className={`p-2 rounded-lg ${iconConfig.bg} flex-shrink-0`}>
                    <Icon className={`w-4 h-4 ${iconConfig.color}`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                        {activity.riskLevel && (
                            <span className={`px-1.5 py-0.5 text-xs font-medium rounded border ${riskColors.text} ${riskColors.bg} ${riskColors.border}`}>
                                {activity.riskLevel.toUpperCase()}
                            </span>
                        )}
                        {activity.eventType && (
                            <span className="text-xs text-slate-400">
                                {activity.eventType.replace(/_/g, ' ')}
                            </span>
                        )}
                        {/* Show confidence in overview */}
                        {confidencePercent !== null && (
                            <span className="text-xs text-cyan-400 flex items-center gap-1">
                                <Gauge className="w-3 h-3" />
                                {confidencePercent}%
                            </span>
                        )}
                        <span className="text-xs text-slate-500">
                            {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                        </span>
                    </div>

                    <p className="text-sm text-white font-medium mb-1">
                        {activity.summary || 'Activity'}
                    </p>

                    {activity.merchantName && (
                        <div className="flex items-center gap-1 text-xs text-slate-400">
                            <Building2 className="w-3 h-3" />
                            {activity.merchantName}
                        </div>
                    )}

                    {/* Quick Insights moved to expanded view only */}
                    {/* Expanded Details - Now shows actual solution info */}
                    <AnimatePresence>
                        {isExpanded && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-3 pt-3 border-t border-white/5 space-y-3"
                            >
                                {/* Quick Insights */}
                                {quickInsights.length > 0 && (
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <Info className="w-3.5 h-3.5 text-blue-400" />
                                            <span className="text-xs font-medium text-white">Quick Insights</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {quickInsights.map((insight, idx) => (
                                                <div key={idx} className="flex items-center gap-1 px-2 py-1 rounded bg-slate-700/50 text-xs">
                                                    <insight.icon className="w-3 h-3 text-slate-400" />
                                                    <span className="text-slate-400">{insight.label}:</span>
                                                    <span className="text-white font-medium">{insight.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Agent Actions */}
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Send className="w-3.5 h-3.5 text-violet-400" />
                                        <span className="text-xs font-medium text-white">Agent Actions</span>
                                    </div>
                                    <ul className="space-y-1">
                                        {solution.actions.map((action, idx) => (
                                            <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                                                <CheckCircle2 className="w-3 h-3 text-emerald-400 mt-0.5 flex-shrink-0" />
                                                {action}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Affected Parties */}
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Users className="w-3.5 h-3.5 text-cyan-400" />
                                        <span className="text-xs font-medium text-white">Notified Parties</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                        {solution.affectedParties.map((party, idx) => (
                                            <span key={idx} className="px-2 py-0.5 text-xs bg-cyan-500/10 text-cyan-300 rounded">
                                                {party}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Timeline */}
                                <div className="flex items-center gap-2">
                                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                                    <span className="text-xs text-slate-400">Timeline:</span>
                                    <span className="text-xs text-amber-300">{solution.timeline}</span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3 mt-2">
                        <button
                            onClick={handleExpand}
                            className="text-xs text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1"
                        >
                            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            {isExpanded ? 'Hide' : 'Show'} Actions
                        </button>
                        <button
                            onClick={onViewReasoning}
                            className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1"
                        >
                            <Eye className="w-3 h-3" />
                            View Full Reasoning
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

export function LiveActivityV2({ activities, isLoading, onEventClick }: LiveActivityV2Props) {
    const [showFilters, setShowFilters] = useState(false)
    const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE)

    // Filter state
    const [filters, setFilters] = useState({
        eventTypes: [] as string[],
        riskLevels: [] as string[]
    })

    // Get unique values for filters
    const uniqueEventTypes = Array.from(new Set(activities.map(a => a.eventType).filter((t): t is string => Boolean(t))))
    const uniqueRiskLevels = ['high', 'medium', 'low']

    // Apply filters
    const filteredActivities = activities.filter(activity => {
        if (filters.eventTypes.length > 0 && !filters.eventTypes.includes(activity.eventType || '')) {
            return false
        }
        if (filters.riskLevels.length > 0 && !filters.riskLevels.includes(activity.riskLevel || '')) {
            return false
        }
        return true
    })

    const visibleActivities = filteredActivities.slice(0, visibleCount)
    const hasMore = visibleCount < filteredActivities.length

    const toggleFilter = (filterType: 'eventTypes' | 'riskLevels', value: string) => {
        setFilters(prev => ({
            ...prev,
            [filterType]: prev[filterType].includes(value)
                ? prev[filterType].filter((v: string) => v !== value)
                : [...prev[filterType], value]
        }))
        setVisibleCount(ITEMS_PER_PAGE)
    }

    const clearFilters = () => {
        setFilters({
            eventTypes: [],
            riskLevels: []
        })
        setVisibleCount(ITEMS_PER_PAGE)
    }

    const hasActiveFilters = filters.eventTypes.length > 0 || filters.riskLevels.length > 0

    if (isLoading && activities.length === 0) {
        return (
            <div className="flex items-center justify-center h-48">
                <Loader2 className="w-6 h-6 animate-spin text-violet-400" />
            </div>
        )
    }

    return (
        <div className="space-y-3">
            {/* Filter Button */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${hasActiveFilters
                        ? 'border-violet-500/30 bg-violet-500/10 text-violet-300'
                        : 'border-white/10 bg-white/5 text-slate-400 hover:text-white hover:border-white/20'
                        }`}
                >
                    <Filter className="w-4 h-4" />
                    Filters
                    {hasActiveFilters && (
                        <span className="px-1.5 py-0.5 text-xs bg-violet-500/20 text-violet-300 rounded">
                            {filters.eventTypes.length + filters.riskLevels.length}
                        </span>
                    )}
                </button>

                {hasActiveFilters && (
                    <button
                        onClick={clearFilters}
                        className="text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-1"
                    >
                        <X className="w-3 h-3" />
                        Clear
                    </button>
                )}
            </div>

            {/* Filter Panel */}
            <AnimatePresence>
                {showFilters && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="p-4 rounded-lg bg-slate-800/40 border border-white/5 space-y-3">
                            {uniqueEventTypes.length > 0 && (
                                <div>
                                    <label className="text-xs font-medium text-white mb-2 block">Error Types</label>
                                    <div className="flex flex-wrap gap-2">
                                        {uniqueEventTypes.map(type => (
                                            <button
                                                key={type}
                                                onClick={() => toggleFilter('eventTypes', type)}
                                                className={`px-2 py-1 text-xs rounded border transition-all ${filters.eventTypes.includes(type)
                                                    ? 'border-violet-500/30 bg-violet-500/10 text-violet-300'
                                                    : 'border-white/10 bg-white/5 text-slate-400 hover:text-white hover:border-white/20'
                                                    }`}
                                            >
                                                {type.replace(/_/g, ' ')}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="text-xs font-medium text-white mb-2 block">Risk Levels</label>
                                <div className="flex flex-wrap gap-2">
                                    {uniqueRiskLevels.map(level => (
                                        <button
                                            key={level}
                                            onClick={() => toggleFilter('riskLevels', level)}
                                            className={`px-2 py-1 text-xs rounded border transition-all ${filters.riskLevels.includes(level)
                                                ? 'border-violet-500/30 bg-violet-500/10 text-violet-300'
                                                : 'border-white/10 bg-white/5 text-slate-400 hover:text-white hover:border-white/20'
                                                }`}
                                        >
                                            {level.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Results Count */}
            <div className="text-xs text-slate-400">
                Showing {visibleActivities.length} of {filteredActivities.length} activities
                {hasActiveFilters && ` (${activities.length} total)`}
            </div>

            {/* Activity List */}
            <div className="space-y-2">
                <AnimatePresence mode="popLayout">
                    {visibleActivities.map((activity) => (
                        <ActivityItem
                            key={activity.id}
                            activity={activity}
                            onExpand={() => { }}
                            onViewReasoning={() => onEventClick(activity)}
                        />
                    ))}
                </AnimatePresence>

                {visibleActivities.length === 0 && (
                    <div className="text-center py-12 text-slate-500">
                        <ActivityIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p className="text-sm">No activities match your filters</p>
                    </div>
                )}
            </div>

            {/* Load More Button */}
            {hasMore && (
                <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => setVisibleCount(prev => prev + ITEMS_PER_PAGE)}
                    className="w-full py-3 px-4 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-300 hover:bg-violet-500/20 hover:border-violet-500/30 transition-all font-medium flex items-center justify-center gap-2"
                >
                    <ChevronDown className="w-4 h-4" />
                    Load More ({filteredActivities.length - visibleCount} remaining)
                </motion.button>
            )}
        </div>
    )
}
