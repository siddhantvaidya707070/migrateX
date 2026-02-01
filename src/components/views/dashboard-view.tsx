'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Bot,
    Zap,
    Eye,
    Brain,
    Shield,
    RefreshCw,
    RotateCcw,
    Loader2,
    XCircle,
    Play,
    Sparkles,
    Activity,
    CheckCircle2,
    MessageSquare,
    Mail,
    FileText,
    TrendingUp,
    AlertTriangle
} from 'lucide-react'

// Components
import { useDashboard } from '../providers/dashboard-provider'
import { SimulationModalV2, SimulationConfig } from '../ui/simulation-modal-v2'
import { ActivityTabs } from '../ui/activity-tabs'
import { ApprovalQueueV2 } from '../ui/approval-queue-v2'
import { PipelinePopup } from '../ui/pipeline-popup'

// ============================================
// PREMIUM STAT CARD COMPONENT
// ============================================

interface StatCardProps {
    label: string
    value: string | number
    subValue?: string
    icon: any
    color: 'violet' | 'emerald' | 'amber' | 'red' | 'blue' | 'cyan'
    pulse?: boolean
}

function StatCard({ label, value, subValue, icon: Icon, color, pulse }: StatCardProps) {
    const colorConfig = {
        violet: {
            gradient: 'from-violet-500/20 via-purple-500/15 to-fuchsia-500/10',
            border: 'border-violet-500/30',
            iconBg: 'bg-violet-500/20',
            iconColor: 'text-violet-400',
            glow: 'shadow-violet-500/20'
        },
        emerald: {
            gradient: 'from-emerald-500/20 via-green-500/15 to-teal-500/10',
            border: 'border-emerald-500/30',
            iconBg: 'bg-emerald-500/20',
            iconColor: 'text-emerald-400',
            glow: 'shadow-emerald-500/20'
        },
        amber: {
            gradient: 'from-amber-500/20 via-yellow-500/15 to-orange-500/10',
            border: 'border-amber-500/30',
            iconBg: 'bg-amber-500/20',
            iconColor: 'text-amber-400',
            glow: 'shadow-amber-500/20'
        },
        red: {
            gradient: 'from-red-500/20 via-rose-500/15 to-pink-500/10',
            border: 'border-red-500/30',
            iconBg: 'bg-red-500/20',
            iconColor: 'text-red-400',
            glow: 'shadow-red-500/20'
        },
        blue: {
            gradient: 'from-blue-500/20 via-cyan-500/15 to-sky-500/10',
            border: 'border-blue-500/30',
            iconBg: 'bg-blue-500/20',
            iconColor: 'text-blue-400',
            glow: 'shadow-blue-500/20'
        },
        cyan: {
            gradient: 'from-cyan-500/20 via-teal-500/15 to-emerald-500/10',
            border: 'border-cyan-500/30',
            iconBg: 'bg-cyan-500/20',
            iconColor: 'text-cyan-400',
            glow: 'shadow-cyan-500/20'
        }
    }

    const config = colorConfig[color]

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02, y: -2 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className={`
                relative overflow-hidden
                p-5 rounded-2xl
                bg-gradient-to-br ${config.gradient}
                border ${config.border}
                backdrop-blur-xl
                shadow-xl ${config.glow}
                group cursor-default
            `}
        >
            {/* Ambient glow effect */}
            <div className={`
                absolute -top-12 -right-12 w-32 h-32
                bg-gradient-to-br ${config.gradient}
                rounded-full blur-3xl opacity-50
                group-hover:opacity-75 transition-opacity duration-500
            `} />

            <div className="relative z-10 flex items-start justify-between">
                <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
                        {label}
                    </p>
                    <p className="text-3xl font-bold text-white tracking-tight">
                        {typeof value === 'number' ? value.toLocaleString() : value}
                    </p>
                    {subValue && (
                        <p className="text-xs text-slate-400 mt-1.5 truncate">
                            {subValue}
                        </p>
                    )}
                </div>
                <div className={`
                    relative p-3 rounded-xl ${config.iconBg}
                    ${pulse ? 'animate-pulse' : ''}
                `}>
                    <Icon className={`w-5 h-5 ${config.iconColor}`} />
                    {pulse && (
                        <div className={`absolute inset-0 rounded-xl ${config.iconBg} animate-ping`} />
                    )}
                </div>
            </div>
        </motion.div>
    )
}

// ============================================
// AGENT STATUS CARD
// ============================================

function AgentStatusCard() {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500/10 via-green-500/5 to-teal-500/10 border border-emerald-500/30 p-6 backdrop-blur-xl"
        >
            {/* Ambient glow */}
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl" />

            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-5">
                    <div className="relative">
                        <div className="w-3.5 h-3.5 rounded-full bg-emerald-400 shadow-lg shadow-emerald-500/50" />
                        <div className="absolute inset-0 w-3.5 h-3.5 rounded-full bg-emerald-400 animate-ping opacity-75" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white tracking-wide">Agent Status</h3>
                        <p className="text-xs text-emerald-400 font-medium">Active & Processing</p>
                    </div>
                </div>

                <div className="space-y-3">
                    {[
                        { label: 'Uptime', value: '99.9%', color: 'text-white' },
                        { label: 'Avg Latency', value: '~150ms', color: 'text-white' },
                        { label: 'Accuracy', value: '94.2%', color: 'text-emerald-400' },
                        { label: 'Auto-resolved', value: '78%', color: 'text-emerald-400' }
                    ].map((stat) => (
                        <div key={stat.label} className="flex items-center justify-between text-sm">
                            <span className="text-slate-400">{stat.label}</span>
                            <span className={`font-semibold ${stat.color}`}>{stat.value}</span>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    )
}

// ============================================
// QUICK ACTIONS BAR
// ============================================

function QuickActionsBar({ stats }: { stats: any }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 py-3 px-5 rounded-xl bg-slate-800/50 border border-white/5 backdrop-blur-sm"
        >
            <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-violet-400" />
                <span className="text-sm text-slate-300">
                    <span className="font-semibold text-white">{stats.ticketsDrafted || 0}</span> tickets drafted
                </span>
            </div>
            <div className="w-px h-4 bg-white/10" />
            <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-slate-300">
                    <span className="font-semibold text-white">{stats.emailsDrafted || 0}</span> emails drafted
                </span>
            </div>
            <div className="w-px h-4 bg-white/10" />
            <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span className="text-sm text-slate-300">
                    <span className="font-semibold text-white">{stats.learningsCount || 0}</span> learnings
                </span>
            </div>
        </motion.div>
    )
}

// ============================================
// MAIN DASHBOARD VIEW
// ============================================

export function DashboardView() {
    const {
        isSimulating,
        stats,
        activities,
        learnings,
        proposals,
        isLoading,
        error,
        selectedEvent,
        startSimulation,
        approveAction,
        rejectAction,
        refreshData,
        resetUI,
        setSelectedEvent
    } = useDashboard()

    const [showSimulationModal, setShowSimulationModal] = useState(false)
    const [showPipelinePopup, setShowPipelinePopup] = useState(false)

    const handleStartSimulation = async (config: SimulationConfig) => {
        await startSimulation(config)
    }

    const handleEventClick = (event: any) => {
        setSelectedEvent(event)
        setShowPipelinePopup(true)
    }

    return (
        <div className="min-h-screen bg-[#0a0a0f]">
            {/* Background gradient effects */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[128px]" />
                <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[128px]" />
            </div>

            <div className="relative z-10 max-w-[1600px] mx-auto px-6 py-8">
                {/* Header */}
                <motion.header
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10"
                >
                    <div className="flex items-center gap-4">
                        <motion.div
                            whileHover={{ scale: 1.05, rotate: 5 }}
                            className="p-3.5 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-xl shadow-violet-500/30"
                        >
                            <Bot className="w-7 h-7 text-white" />
                        </motion.div>
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
                                Self-Healing Support Agent
                            </h1>
                            <p className="text-slate-400 text-sm mt-0.5">
                                Autonomous Signal Processing & Decision Engine
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Reset Button */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => resetUI()}
                            disabled={isSimulating}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-white/5 text-slate-400 hover:text-white transition-all disabled:opacity-50"
                        >
                            <RotateCcw className="w-4 h-4" />
                            <span className="text-sm font-medium">Reset</span>
                        </motion.button>

                        {/* Refresh Button */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => refreshData()}
                            disabled={isLoading}
                            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-white/5 text-slate-400 hover:text-white transition-all disabled:opacity-50"
                        >
                            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                        </motion.button>

                        {/* Start Simulation Button */}
                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => setShowSimulationModal(true)}
                            disabled={isSimulating}
                            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold rounded-xl shadow-lg shadow-violet-500/30 transition-all disabled:opacity-50"
                        >
                            {isSimulating ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Simulating...</span>
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-4 h-4" />
                                    <span>Run Simulation</span>
                                </>
                            )}
                        </motion.button>
                    </div>
                </motion.header>

                {/* Error Banner */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: 'auto' }}
                            exit={{ opacity: 0, y: -10, height: 0 }}
                            className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3"
                        >
                            <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                            <span className="text-red-300 text-sm">{error}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Quick Actions Bar */}
                <div className="mb-8">
                    <QuickActionsBar stats={stats} />
                </div>

                {/* Stats Grid - 6 columns */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8"
                >
                    <StatCard
                        label="Events Ingested"
                        value={stats.eventsIngested}
                        icon={Zap}
                        color="violet"
                        pulse={isSimulating}
                    />
                    <StatCard
                        label="Observations"
                        value={stats.observations}
                        icon={Eye}
                        color="blue"
                    />
                    <StatCard
                        label="Decisions"
                        value={stats.decisions}
                        icon={Brain}
                        color="cyan"
                    />
                    <StatCard
                        label="Pending"
                        value={stats.pendingApprovals}
                        icon={Shield}
                        color="amber"
                        pulse={stats.pendingApprovals > 0}
                    />
                    <StatCard
                        label="Tickets Drafted"
                        value={stats.ticketsDrafted || 0}
                        icon={MessageSquare}
                        color="emerald"
                    />
                    <StatCard
                        label="Emails Drafted"
                        value={stats.emailsDrafted || 0}
                        icon={Mail}
                        color="red"
                    />
                </motion.div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Activity Feed (takes 2 columns) */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="lg:col-span-2 rounded-2xl bg-slate-900/50 border border-white/5 p-6 backdrop-blur-xl"
                    >
                        <ActivityTabs
                            activities={activities}
                            learnings={learnings}
                            isLoading={isLoading}
                            onEventClick={handleEventClick}
                        />
                    </motion.div>

                    {/* Right Column: Approvals + Status */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="space-y-6"
                    >
                        {/* Pending Approvals */}
                        <div className="rounded-2xl bg-slate-900/50 border border-white/5 p-6 backdrop-blur-xl">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="p-2 rounded-lg bg-amber-500/20">
                                    <Shield className="w-5 h-5 text-amber-400" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-white">Pending Approvals</h2>
                                    <p className="text-xs text-slate-400">Human-in-the-loop review queue</p>
                                </div>
                                {proposals.length > 0 && (
                                    <span className="ml-auto px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold">
                                        {proposals.length}
                                    </span>
                                )}
                            </div>
                            <ApprovalQueueV2
                                proposals={proposals}
                                isLoading={isLoading}
                                onApprove={approveAction}
                                onReject={rejectAction}
                                activities={activities}
                            />
                        </div>

                        {/* Agent Status */}
                        <AgentStatusCard />
                    </motion.div>
                </div>
            </div>

            {/* Simulation Modal */}
            <SimulationModalV2
                isOpen={showSimulationModal}
                onClose={() => setShowSimulationModal(false)}
                onStart={handleStartSimulation}
            />

            {/* Pipeline Popup */}
            <PipelinePopup
                isOpen={showPipelinePopup}
                onClose={() => {
                    setShowPipelinePopup(false)
                    setSelectedEvent(null)
                }}
                event={selectedEvent}
            />
        </div>
    )
}
