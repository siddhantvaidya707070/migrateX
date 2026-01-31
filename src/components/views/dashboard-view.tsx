'use client'

import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from "framer-motion"
import { Bot, Activity, CheckCircle2, AlertTriangle, Clock, Zap, Eye, Brain, Shield, FileText, TrendingUp, AlertCircle, RefreshCw, Loader2 } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LineChart, Line, PieChart, Pie, AreaChart, Area } from 'recharts';

import {
    mockAgentMetrics,
    mockRiskDistribution,
    mockClassifications,
    mockEventQueue,
    mockActivityLog,
    mockPerformanceHistory,
    mockSystemHealth,
    mockPendingApprovals
} from '@/lib/mockData';

type TabType = 'overview' | 'activity' | 'approvals';

const tabs = [
    { id: 'overview' as TabType, label: 'Overview', icon: Activity },
    { id: 'activity' as TabType, label: 'Activity', icon: Brain },
    { id: 'approvals' as TabType, label: 'Approvals', icon: Shield },
];

const THINKING_PHRASES = [
    "ObservationEngine clustering similar events...",
    "HypothesisEngine generating root cause analysis...",
    "RiskEngine calculating impact scores...",
    "DecisionEngine evaluating response options...",
    "ActionEngine preparing automated response...",
    "LearningEngine updating knowledge base...",
    "Analyzing multi-merchant patterns...",
    "Cross-referencing historical incidents...",
    "Synthesizing agent recommendations...",
    "Validating confidence thresholds..."
];

export function DashboardView() {
    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [isProcessing, setIsProcessing] = useState(false);
    const [thinkingMessage, setThinkingMessage] = useState("");
    const usedPhrases = useRef<Set<string>>(new Set());
    const [lastRefresh, setLastRefresh] = useState(new Date());

    // Simulate agent processing
    const triggerAgentLoop = () => {
        setIsProcessing(true);
        usedPhrases.current.clear();
        setTimeout(() => {
            setIsProcessing(false);
            setLastRefresh(new Date());
        }, 5000);
    };

    // Thinking Message Cycler
    useEffect(() => {
        if (!isProcessing) return;

        const cycleMessage = () => {
            const available = THINKING_PHRASES.filter(p => !usedPhrases.current.has(p));
            if (available.length === 0) {
                usedPhrases.current.clear();
                return;
            }
            const next = available[Math.floor(Math.random() * available.length)];
            usedPhrases.current.add(next);
            setThinkingMessage(next);
        };

        cycleMessage();
        const interval = setInterval(cycleMessage, 1500);
        return () => clearInterval(interval);
    }, [isProcessing]);

    return (
        <div className="space-y-6">
            {/* Main Dashboard Content */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-7xl mx-auto"
            >
                {/* Header & Controls */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 mt-6 px-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">Self-Healing Support Agent</h1>
                        <p className="text-muted-foreground mt-1">Autonomous Signal Processing & Decision Engine</p>
                    </div>

                    <div className="flex gap-4 items-center">
                        {/* Trigger Agent Button */}
                        <button
                            onClick={triggerAgentLoop}
                            disabled={isProcessing}
                            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-full font-medium hover:scale-105 transition-all shadow-lg shadow-primary/25 disabled:opacity-50"
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <Zap className="w-4 h-4" />
                                    Run Agent Loop
                                </>
                            )}
                        </button>

                        {/* Tab Navigation */}
                        <div className="flex items-center bg-secondary/50 rounded-xl p-1">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`relative flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${activeTab === tab.id
                                        ? 'text-primary-foreground'
                                        : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                >
                                    {activeTab === tab.id && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute inset-0 bg-primary rounded-lg"
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}
                                    <tab.icon className="w-4 h-4 relative z-10" />
                                    <span className="relative z-10 hidden sm:inline">{tab.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Processing Status Bar */}
                <AnimatePresence>
                    {isProcessing && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mx-4 mb-6"
                        >
                            <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 flex items-center justify-center gap-3">
                                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                                <span className="text-primary font-medium">{thinkingMessage}</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Tab Content */}
                <AnimatePresence mode="wait">
                    {activeTab === 'overview' && (
                        <motion.div
                            key="overview"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-6 px-4"
                        >
                            {/* Top Metrics Row */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <MetricCard
                                    label="Cases Processed"
                                    value={mockAgentMetrics.totalCasesProcessed.toLocaleString()}
                                    sub={`+${mockAgentMetrics.todayProcessed} today`}
                                    icon={CheckCircle2}
                                    positive
                                />
                                <MetricCard
                                    label="Auto-Resolve Rate"
                                    value={`${mockAgentMetrics.autoResolveRate}%`}
                                    sub="Target: 85%"
                                    icon={Zap}
                                    positive
                                />
                                <MetricCard
                                    label="Avg Resolution"
                                    value={mockAgentMetrics.avgResolutionTime}
                                    sub="Down from 6.1 mins"
                                    icon={Clock}
                                    positive
                                />
                                <MetricCard
                                    label="Queue Depth"
                                    value={mockAgentMetrics.queuedCases.toString()}
                                    sub={`${mockAgentMetrics.activeAgents} agents active`}
                                    icon={Activity}
                                    positive={mockAgentMetrics.queuedCases < 20}
                                />
                            </div>

                            {/* Charts Row */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Performance Chart */}
                                <div className="lg:col-span-2 glass-panel p-6 rounded-[24px]">
                                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                        <TrendingUp className="w-5 h-5 text-primary" />
                                        Agent Performance (24h)
                                    </h3>
                                    <div className="h-[300px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={mockPerformanceHistory}>
                                                <defs>
                                                    <linearGradient id="colorCases" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.3} />
                                                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: 'hsl(var(--background))',
                                                        borderRadius: '12px',
                                                        border: '1px solid hsl(var(--border))',
                                                    }}
                                                />
                                                <Area type="monotone" dataKey="casesHandled" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorCases)" strokeWidth={2} />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Risk Distribution */}
                                <div className="glass-panel p-6 rounded-[24px]">
                                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                        <AlertTriangle className="w-5 h-5 text-primary" />
                                        Risk Distribution
                                    </h3>
                                    <div className="h-[200px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={mockRiskDistribution}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={50}
                                                    outerRadius={80}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                >
                                                    {mockRiskDistribution.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="space-y-2 mt-4">
                                        {mockRiskDistribution.map((item) => (
                                            <div key={item.name} className="flex items-center justify-between text-sm">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                                    <span className="text-muted-foreground">{item.name}</span>
                                                </div>
                                                <span className="font-medium">{item.value}%</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Classifications */}
                            <div className="glass-panel p-6 rounded-[24px]">
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <Brain className="w-5 h-5 text-primary" />
                                    Classification Breakdown
                                </h3>
                                <div className="h-[250px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={mockClassifications} layout="vertical">
                                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" opacity={0.3} />
                                            <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                                            <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} width={120} />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: 'hsl(var(--background))',
                                                    borderRadius: '12px',
                                                    border: '1px solid hsl(var(--border))',
                                                }}
                                            />
                                            <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'activity' && (
                        <motion.div
                            key="activity"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="space-y-6 px-4"
                        >
                            {/* Event Queue */}
                            <div className="glass-panel p-6 rounded-[24px]">
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-primary" />
                                    Event Queue
                                </h3>
                                <div className="space-y-3">
                                    {mockEventQueue.map((event) => (
                                        <motion.div
                                            key={event.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl border border-border/50"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-2 h-2 rounded-full ${event.priority === 'high' ? 'bg-red-500' :
                                                        event.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                                                    }`} />
                                                <div>
                                                    <p className="font-medium">{event.type.replace('_', ' ')}</p>
                                                    <p className="text-sm text-muted-foreground">{event.merchant}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${event.status === 'processing' ? 'bg-primary/20 text-primary' :
                                                        event.status === 'queued' ? 'bg-yellow-500/20 text-yellow-500' :
                                                            'bg-green-500/20 text-green-500'
                                                    }`}>
                                                    {event.status}
                                                </span>
                                                <span className="text-sm text-muted-foreground">{event.time}</span>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            {/* Activity Log */}
                            <div className="glass-panel p-6 rounded-[24px]">
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-primary" />
                                    Agent Activity Log
                                </h3>
                                <div className="space-y-4">
                                    {mockActivityLog.map((log, idx) => (
                                        <motion.div
                                            key={log.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            className="flex items-start gap-4 p-4 bg-secondary/20 rounded-xl"
                                        >
                                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                                                <Bot className="w-5 h-5 text-primary" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <p className="font-medium">{log.action}</p>
                                                    <span className="text-sm text-muted-foreground">{log.timestamp}</span>
                                                </div>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    <span className="text-primary">{log.agent}</span> → {log.target}
                                                </p>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <div className="h-1.5 w-24 bg-secondary rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-primary rounded-full"
                                                            style={{ width: `${log.confidence * 100}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-xs text-muted-foreground">{(log.confidence * 100).toFixed(0)}% confidence</span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'approvals' && (
                        <motion.div
                            key="approvals"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="space-y-6 px-4"
                        >
                            {/* Pending Approvals */}
                            <div className="glass-panel p-6 rounded-[24px]">
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <Shield className="w-5 h-5 text-primary" />
                                    Pending Human Approvals
                                </h3>
                                {mockPendingApprovals.length === 0 ? (
                                    <div className="text-center py-12 text-muted-foreground">
                                        <CheckCircle2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                        <p>No pending approvals</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {mockPendingApprovals.map((approval) => (
                                            <motion.div
                                                key={approval.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="p-6 bg-secondary/30 rounded-xl border border-border/50"
                                            >
                                                <div className="flex items-start justify-between mb-4">
                                                    <div>
                                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${approval.type === 'engineering_escalation'
                                                                ? 'bg-red-500/20 text-red-500'
                                                                : 'bg-blue-500/20 text-blue-500'
                                                            }`}>
                                                            {approval.type.replace('_', ' ')}
                                                        </span>
                                                        <h4 className="font-semibold mt-3">{approval.summary}</h4>
                                                    </div>
                                                    <span className="text-sm text-muted-foreground">{approval.createdAt}</span>
                                                </div>

                                                <div className="grid grid-cols-3 gap-4 mb-4">
                                                    <div className="text-center p-3 bg-background/50 rounded-lg">
                                                        <p className="text-2xl font-bold text-primary">{approval.riskScore}/10</p>
                                                        <p className="text-xs text-muted-foreground">Risk Score</p>
                                                    </div>
                                                    <div className="text-center p-3 bg-background/50 rounded-lg">
                                                        <p className="text-2xl font-bold">{(approval.confidence * 100).toFixed(0)}%</p>
                                                        <p className="text-xs text-muted-foreground">Confidence</p>
                                                    </div>
                                                    <div className="text-center p-3 bg-background/50 rounded-lg">
                                                        <p className="text-2xl font-bold">{approval.affectedMerchants}</p>
                                                        <p className="text-xs text-muted-foreground">Merchants</p>
                                                    </div>
                                                </div>

                                                <div className="flex gap-3">
                                                    <button className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity">
                                                        Approve
                                                    </button>
                                                    <button className="flex-1 py-2.5 bg-secondary text-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors">
                                                        Reject
                                                    </button>
                                                    <button className="px-4 py-2.5 border border-border rounded-lg text-muted-foreground hover:text-foreground transition-colors">
                                                        Details
                                                    </button>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* System Health */}
                            <div className="glass-panel p-6 rounded-[24px]">
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-primary" />
                                    System Health
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                    <HealthMetric label="Agent Uptime" value={`${mockSystemHealth.agentUptime}%`} good />
                                    <HealthMetric label="DB Latency" value={`${mockSystemHealth.databaseLatency}ms`} good />
                                    <HealthMetric label="API Response" value={`${mockSystemHealth.apiResponseTime}ms`} good />
                                    <HealthMetric label="Queue Depth" value={mockSystemHealth.queueDepth.toString()} good={mockSystemHealth.queueDepth < 20} />
                                    <HealthMetric label="Error Rate" value={`${mockSystemHealth.errorRate}%`} good={mockSystemHealth.errorRate < 1} />
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    )
}

function MetricCard({ label, value, sub, icon: Icon, positive }: { label: string; value: string; sub: string; icon: any; positive?: boolean }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel p-5 rounded-[20px] relative overflow-hidden group hover:border-primary/20 transition-colors"
        >
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                <Icon className="w-10 h-10" />
            </div>
            <p className="text-sm text-muted-foreground font-medium mb-1">{label}</p>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            <div className="flex items-center gap-2 mt-1">
                <span className={`w-1.5 h-1.5 rounded-full ${positive ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-xs text-muted-foreground">{sub}</span>
            </div>
        </motion.div>
    )
}

function HealthMetric({ label, value, good }: { label: string; value: string; good: boolean }) {
    return (
        <div className="text-center p-4 bg-secondary/30 rounded-xl">
            <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${good ? 'bg-green-500' : 'bg-red-500'}`} />
            <p className="text-lg font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
        </div>
    )
}
