'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Activity, BookOpen } from 'lucide-react'
import { LiveActivityV2 } from './live-activity-v2'
import { AgentLogs } from './agent-logs'

interface ActivityTabsProps {
    activities: any[]
    learnings: any[]
    isLoading: boolean
    onEventClick: (event: any) => void
}

export function ActivityTabs({ activities, learnings, isLoading, onEventClick }: ActivityTabsProps) {
    const [activeTab, setActiveTab] = useState<'live' | 'logs'>('live')

    // Use actual learnings count from database - no mock fallback
    const learningsCount = learnings.length

    return (
        <div className="flex flex-col h-full">
            {/* Tab Switcher */}
            <div className="flex items-center gap-1 p-1 bg-slate-800/50 rounded-lg mb-4">
                <button
                    onClick={() => setActiveTab('live')}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md font-medium text-sm transition-all ${activeTab === 'live'
                        ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/20'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                        }`}
                >
                    <Activity className="w-4 h-4" />
                    Live Activity
                    {activities.length > 0 && (
                        <span className={`px-1.5 py-0.5 text-xs rounded-full ${activeTab === 'live' ? 'bg-white/20' : 'bg-violet-500/20 text-violet-400'
                            }`}>
                            {activities.length}
                        </span>
                    )}
                </button>

                <button
                    onClick={() => setActiveTab('logs')}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md font-medium text-sm transition-all ${activeTab === 'logs'
                        ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/20'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                        }`}
                >
                    <BookOpen className="w-4 h-4" />
                    Agent Logs
                    {learningsCount > 0 && (
                        <span className={`px-1.5 py-0.5 text-xs rounded-full ${activeTab === 'logs' ? 'bg-white/20' : 'bg-emerald-500/20 text-emerald-400'
                            }`}>
                            {learningsCount}
                        </span>
                    )}
                </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 min-h-0 overflow-hidden">
                <AnimatePresence mode="wait">
                    {activeTab === 'live' && (
                        <motion.div
                            key="live"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            className="h-full"
                        >
                            <LiveActivityV2
                                activities={activities}
                                isLoading={isLoading}
                                onEventClick={onEventClick}
                            />
                        </motion.div>
                    )}

                    {activeTab === 'logs' && (
                        <motion.div
                            key="logs"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="h-full"
                        >
                            <AgentLogs
                                learnings={learnings}
                                isLoading={isLoading}
                                activities={activities}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
