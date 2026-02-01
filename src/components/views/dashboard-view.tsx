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
// GOLD THEME COLORS
// ============================================
const goldTheme = {
    primary: '#C9A24D',
    primaryLight: '#E6C97A',
    primaryDark: '#9E7C32',
    background: '#0F0F0F',
    surface: '#1A1A1A',
}

// ============================================
// PREMIUM STAT CARD COMPONENT - GOLD THEME
// ============================================

interface StatCardProps {
    label: string
    value: string | number
    subValue?: string
    icon: any
    color: 'gold' | 'emerald' | 'amber' | 'red' | 'blue' | 'cyan'
    pulse?: boolean
}

function StatCard({ label, value, subValue, icon: Icon, color, pulse }: StatCardProps) {
    const colorConfig = {
        gold: {
            gradient: 'from-[#C9A24D]/20 via-[#E6C97A]/15 to-[#9E7C32]/10',
            border: 'border-[#C9A24D]/30',
            iconBg: 'bg-[#C9A24D]/20',
            iconColor: 'text-[#E6C97A]',
            glow: 'shadow-[#C9A24D]/20'
        },
        emerald: {
            // Gold background with green icon for Tickets Drafted
            gradient: 'from-[#C9A24D]/20 via-[#E6C97A]/15 to-[#9E7C32]/10',
            border: 'border-[#C9A24D]/30',
            iconBg: 'bg-emerald-500/20',
            iconColor: 'text-emerald-400',
            glow: 'shadow-[#C9A24D]/20'
        },
        amber: {
            gradient: 'from-[#C9A24D]/20 via-[#E6C97A]/15 to-[#9E7C32]/10',
            border: 'border-[#C9A24D]/30',
            iconBg: 'bg-[#C9A24D]/20',
            iconColor: 'text-[#E6C97A]',
            glow: 'shadow-[#C9A24D]/20'
        },
        red: {
            // Gold background with red icon for Emails Drafted
            gradient: 'from-[#C9A24D]/20 via-[#E6C97A]/15 to-[#9E7C32]/10',
            border: 'border-[#C9A24D]/30',
            iconBg: 'bg-red-500/20',
            iconColor: 'text-red-400',
            glow: 'shadow-[#C9A24D]/20'
        },
        blue: {
            gradient: 'from-[#9E7C32]/20 via-[#C9A24D]/15 to-[#E6C97A]/10',
            border: 'border-[#C9A24D]/30',
            iconBg: 'bg-[#C9A24D]/20',
            iconColor: 'text-[#E6C97A]',
            glow: 'shadow-[#C9A24D]/20'
        },
        cyan: {
            gradient: 'from-[#E6C97A]/20 via-[#C9A24D]/15 to-[#9E7C32]/10',
            border: 'border-[#C9A24D]/30',
            iconBg: 'bg-[#C9A24D]/20',
            iconColor: 'text-[#E6C97A]',
            glow: 'shadow-[#C9A24D]/20'
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

            <div className="relative z-10 flex flex-col items-center justify-center text-center h-full py-2">
                <div className={`
                    relative p-3 rounded-xl ${config.iconBg} mb-4
                    ${pulse ? 'animate-pulse' : ''}
                `}>
                    <Icon className={`w-6 h-6 ${config.iconColor}`} />
                    {pulse && (
                        <div className={`absolute inset-0 rounded-xl ${config.iconBg} animate-ping`} />
                    )}
                </div>

                <p className="text-3xl font-bold text-[#F5F5F5] tracking-tight mb-2">
                    {typeof value === 'number' ? value.toLocaleString() : value}
                </p>
                <p className="text-xs font-semibold text-[#8A8A8A] uppercase tracking-widest">
                    {label}
                </p>

                {subValue && (
                    <p className="text-xs text-[#8A8A8A] mt-1.5 truncate">
                        {subValue}
                    </p>
                )}
            </div>
        </motion.div>
    )
}

// ============================================
// AGENT STATUS CARD - GOLD THEME
// ============================================

function AgentStatusCard() {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#C9A24D]/10 via-[#E6C97A]/5 to-[#9E7C32]/10 border border-[#C9A24D]/30 p-6 backdrop-blur-xl"
        >
            {/* Ambient glow */}
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-[#C9A24D]/20 rounded-full blur-3xl" />

            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-5">
                    <div className="relative">
                        <div className="w-3.5 h-3.5 rounded-full bg-[#E6C97A] shadow-lg shadow-[#C9A24D]/50" />
                        <div className="absolute inset-0 w-3.5 h-3.5 rounded-full bg-[#E6C97A] animate-ping opacity-75" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-[#F5F5F5] tracking-wide">Agent Status</h3>
                        <p className="text-xs text-[#E6C97A] font-medium">Active & Processing</p>
                    </div>
                </div>

                <div className="space-y-3">
                    {[
                        { label: 'Uptime', value: '99.9%', color: 'text-[#F5F5F5]' },
                        { label: 'Avg Latency', value: '~150ms', color: 'text-[#F5F5F5]' },
                        { label: 'Accuracy', value: '94.2%', color: 'text-[#E6C97A]' },
                        { label: 'Auto-resolved', value: '78%', color: 'text-[#E6C97A]' }
                    ].map((stat) => (
                        <div key={stat.label} className="flex items-center justify-between text-sm">
                            <span className="text-[#8A8A8A]">{stat.label}</span>
                            <span className={`font-semibold ${stat.color}`}>{stat.value}</span>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    )
}

// ============================================
// QUICK ACTIONS BAR - GOLD THEME
// ============================================

function QuickActionsBar({ stats, learningsCount }: { stats: any; learningsCount: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 py-3 px-5 rounded-xl bg-[#1A1A1A]/50 border border-[#C9A24D]/10 backdrop-blur-sm"
        >
            <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#E6C97A]" />
                <span className="text-sm text-[#CFCFCF]">
                    <span className="font-semibold text-[#F5F5F5]">{stats.ticketsDrafted || 0}</span> tickets drafted
                </span>
            </div>
            <div className="w-px h-4 bg-[#C9A24D]/20" />
            <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#C9A24D]" />
                <span className="text-sm text-[#CFCFCF]">
                    <span className="font-semibold text-[#F5F5F5]">{stats.emailsDrafted || 0}</span> emails drafted
                </span>
            </div>
            <div className="w-px h-4 bg-[#C9A24D]/20" />
            <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#9E7C32]" />
                <span className="text-sm text-[#CFCFCF]">
                    <span className="font-semibold text-[#F5F5F5]">{learningsCount}</span> learnings
                </span>
            </div>
        </motion.div>
    )
}

// ============================================
// MAIN DASHBOARD VIEW - GOLD THEME
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
        <div className="min-h-screen bg-black">
            {/* Background gradient effects - GOLD THEME */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#C9A24D]/5 rounded-full blur-[128px]" />
                <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-[#9E7C32]/5 rounded-full blur-[128px]" />
            </div>

            <div className="relative z-10 max-w-[1600px] mx-auto px-6 py-8">
                {/* Header - GOLD THEME */}
                <motion.header
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10"
                >
                    <div className="flex items-center gap-4">
                        <motion.div
                            whileHover={{ scale: 1.05, rotate: 5 }}
                            className="p-3.5 rounded-2xl bg-gradient-to-br from-[#9E7C32] to-[#C9A24D] shadow-xl shadow-[#C9A24D]/30"
                        >
                            <Bot className="w-7 h-7 text-black" />
                        </motion.div>
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-bold text-[#F5F5F5] tracking-tight">
                                Self-Healing Support Agent
                            </h1>
                            <p className="text-[#8A8A8A] text-sm mt-0.5">
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
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1A1A1A]/80 hover:bg-[#2A2A2A]/80 border border-[#C9A24D]/10 text-[#8A8A8A] hover:text-[#F5F5F5] transition-all disabled:opacity-50"
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
                            className="p-2.5 rounded-xl bg-[#1A1A1A]/80 hover:bg-[#2A2A2A]/80 border border-[#C9A24D]/10 text-[#8A8A8A] hover:text-[#F5F5F5] transition-all disabled:opacity-50"
                        >
                            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                        </motion.button>

                        {/* Start Simulation Button - GOLD GRADIENT */}
                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => setShowSimulationModal(true)}
                            disabled={isSimulating}
                            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#9E7C32] via-[#C9A24D] to-[#E6C97A] hover:shadow-lg hover:shadow-[#C9A24D]/30 text-black font-semibold rounded-xl transition-all disabled:opacity-50"
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
                    <QuickActionsBar stats={stats} learningsCount={learnings.length} />
                </div>

                {/* Stats Grid - 4 columns - GOLD THEME */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
                >
                    <StatCard
                        label="Events Ingested"
                        value={stats.eventsIngested}
                        icon={Zap}
                        color="gold"
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
                </motion.div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Activity Feed (takes 2 columns) */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="lg:col-span-2 rounded-2xl bg-[#0F0F0F]/50 border border-[#C9A24D]/10 p-6 backdrop-blur-xl"
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
                        {/* Pending Approvals - GOLD THEME */}
                        <div className="rounded-2xl bg-[#0F0F0F]/50 border border-[#C9A24D]/10 p-6 backdrop-blur-xl">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="p-2 rounded-lg bg-[#C9A24D]/20">
                                    <Shield className="w-5 h-5 text-[#E6C97A]" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-[#F5F5F5]">Pending Approvals</h2>
                                    <p className="text-xs text-[#8A8A8A]">Human-in-the-loop review queue</p>
                                </div>
                                {proposals.length > 0 && (
                                    <span className="ml-auto px-2.5 py-1 rounded-full bg-[#C9A24D]/20 text-[#E6C97A] text-xs font-bold">
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
