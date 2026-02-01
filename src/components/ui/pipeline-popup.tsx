'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    X,
    Eye,
    Layers,
    Brain,
    Scale,
    GitBranch,
    MessageSquare,
    Zap,
    BookOpen,
    CheckCircle2,
    Loader2,
    ArrowRight,
    ChevronDown,
    AlertTriangle,
    Shield
} from 'lucide-react'

interface PipelineStep {
    id: string
    name: string
    description: string
    status: 'pending' | 'active' | 'completed' | 'skipped'
    icon: any
    details?: any
    duration?: number
}

interface PipelinePopupProps {
    isOpen: boolean
    onClose: () => void
    event: any
    agentTrace?: any
}

const PIPELINE_STEPS = [
    { id: 'observe', name: 'Observe', icon: Eye, description: 'Cluster & analyze raw events' },
    { id: 'synthesize', name: 'Synthesize', icon: Layers, description: 'Enrich with context & history' },
    { id: 'hypothesize', name: 'Hypothesize', icon: Brain, description: 'Generate root cause theories' },
    { id: 'evaluate', name: 'Evaluate Risk', icon: Scale, description: 'Score impact & urgency' },
    { id: 'decide', name: 'Decide', icon: GitBranch, description: 'Classify & determine action' },
    { id: 'recommend', name: 'Recommend', icon: MessageSquare, description: 'Propose specific action' },
    { id: 'act', name: 'Act', icon: Zap, description: 'Execute or queue for approval' },
    { id: 'learn', name: 'Learn', icon: BookOpen, description: 'Log outcome to memory' }
]

function StepIndicator({ step, index, isActive, isCompleted }: {
    step: typeof PIPELINE_STEPS[0]
    index: number
    isActive: boolean
    isCompleted: boolean
}) {
    const Icon = step.icon

    return (
        <div className="flex items-center gap-3">
            {/* Step Circle */}
            <div className={`relative flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${isCompleted
                    ? 'border-emerald-500 bg-emerald-500/20'
                    : isActive
                        ? 'border-violet-500 bg-violet-500/20'
                        : 'border-slate-600 bg-slate-800'
                }`}>
                {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : isActive ? (
                    <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                    >
                        <Icon className="w-5 h-5 text-violet-400" />
                    </motion.div>
                ) : (
                    <Icon className="w-5 h-5 text-slate-500" />
                )}

                {/* Active Pulse */}
                {isActive && (
                    <motion.div
                        className="absolute inset-0 rounded-full border-2 border-violet-500"
                        animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    />
                )}
            </div>

            {/* Step Info */}
            <div className="flex-1">
                <div className={`text-sm font-medium ${isCompleted ? 'text-emerald-300' : isActive ? 'text-violet-300' : 'text-slate-400'
                    }`}>
                    {step.name}
                </div>
                <div className="text-xs text-slate-500">{step.description}</div>
            </div>

            {/* Duration */}
            {isCompleted && (
                <div className="text-xs text-slate-500">
                    {Math.floor(Math.random() * 200) + 50}ms
                </div>
            )}
        </div>
    )
}

export function PipelinePopup({ isOpen, onClose, event, agentTrace }: PipelinePopupProps) {
    const [activeStepIndex, setActiveStepIndex] = useState(0)
    const [isAnimating, setIsAnimating] = useState(false)
    const [expandedSection, setExpandedSection] = useState<string | null>('reasoning')

    // Animate through steps when opened
    useEffect(() => {
        if (isOpen && event) {
            setIsAnimating(true)
            setActiveStepIndex(0)

            const interval = setInterval(() => {
                setActiveStepIndex(prev => {
                    if (prev >= PIPELINE_STEPS.length) {
                        clearInterval(interval)
                        setIsAnimating(false)
                        return prev
                    }
                    return prev + 1
                })
            }, 400)

            return () => clearInterval(interval)
        }
    }, [isOpen, event])

    if (!isOpen || !event) return null

    // Build mock reasoning trace if not provided
    const trace = agentTrace || {
        observation: {
            fingerprint: event.details?.fingerprint || 'checkout-failure::neonthread',
            merchantCount: 1,
            severity: event.riskLevel || 'medium'
        },
        synthesis: {
            migrationStage: 'Stage 2: Auth Flow',
            historicalPattern: 'new',
            context: 'First occurrence of this pattern for this merchant'
        },
        hypothesis: {
            cause: event.details?.hypothesis || 'Configuration mismatch in webhook signing secret after recent key rotation',
            confidence: event.confidence || 0.78,
            alternatives: [
                { cause: 'Network timeout during peak hours', confidence: 0.45 },
                { cause: 'Deprecated API version compatibility', confidence: 0.32 }
            ]
        },
        riskAssessment: {
            score: event.riskLevel === 'high' ? 8 : event.riskLevel === 'medium' ? 5 : 2,
            factors: [
                { name: 'Checkout flow affected', impact: '+5' },
                { name: 'Single merchant', impact: '-2' },
                { name: 'First occurrence', impact: '-1' }
            ],
            urgency: event.riskLevel === 'high' ? 'immediate' : 'next-hour'
        },
        decision: {
            classification: event.eventType || 'merchant_misconfiguration',
            action: event.action || 'draft_ticket_reply',
            requiresApproval: event.riskLevel === 'high'
        }
    }

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
                onClick={(e) => e.target === e.currentTarget && onClose()}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="w-full max-w-4xl max-h-[90vh] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-white/10 overflow-hidden flex flex-col"
                >
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-black/20 flex-shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600">
                                <Brain className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-white">Agent Reasoning Trace</h2>
                                <p className="text-sm text-slate-400">
                                    {event.merchantName || 'Event'} • {event.eventType?.replace(/_/g, ' ') || 'Unknown'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-slate-400" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Left Column: Pipeline Steps */}
                            <div>
                                <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wide mb-4">
                                    Processing Pipeline
                                </h3>
                                <div className="space-y-3">
                                    {PIPELINE_STEPS.map((step, index) => (
                                        <motion.div
                                            key={step.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                        >
                                            <StepIndicator
                                                step={step}
                                                index={index}
                                                isActive={isAnimating && index === activeStepIndex}
                                                isCompleted={index < activeStepIndex}
                                            />

                                            {/* Connector Line */}
                                            {index < PIPELINE_STEPS.length - 1 && (
                                                <div className="ml-5 h-3 w-px bg-slate-700 my-1" />
                                            )}
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            {/* Right Column: Details */}
                            <div className="space-y-4">
                                {/* Reasoning Section */}
                                <div className="rounded-lg border border-white/10 overflow-hidden">
                                    <button
                                        onClick={() => setExpandedSection(expandedSection === 'reasoning' ? null : 'reasoning')}
                                        className="w-full p-4 flex items-center justify-between bg-slate-800/50 hover:bg-slate-800/70 transition-colors"
                                    >
                                        <div className="flex items-center gap-2">
                                            <Brain className="w-4 h-4 text-violet-400" />
                                            <span className="text-sm font-medium text-white">Agent Reasoning</span>
                                        </div>
                                        <motion.div
                                            animate={{ rotate: expandedSection === 'reasoning' ? 180 : 0 }}
                                        >
                                            <ChevronDown className="w-4 h-4 text-slate-400" />
                                        </motion.div>
                                    </button>

                                    <AnimatePresence>
                                        {expandedSection === 'reasoning' && (
                                            <motion.div
                                                initial={{ height: 0 }}
                                                animate={{ height: 'auto' }}
                                                exit={{ height: 0 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="p-4 border-t border-white/5 space-y-3">
                                                    <div>
                                                        <div className="text-xs text-slate-400 mb-1">Primary Hypothesis</div>
                                                        <p className="text-sm text-white">{trace.hypothesis.cause}</p>
                                                        <div className="text-xs text-violet-400 mt-1">
                                                            Confidence: {Math.round(trace.hypothesis.confidence * 100)}%
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <div className="text-xs text-slate-400 mb-1">Alternatives Considered</div>
                                                        <div className="space-y-1">
                                                            {trace.hypothesis.alternatives.map((alt: any, i: number) => (
                                                                <div key={i} className="text-xs text-slate-500 flex items-center gap-2">
                                                                    <span className="text-slate-600">{Math.round(alt.confidence * 100)}%</span>
                                                                    {alt.cause}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div className="pt-2 border-t border-white/5">
                                                        <div className="text-xs text-slate-400 mb-1">Why This Action?</div>
                                                        <p className="text-sm text-slate-300">
                                                            Given the confidence of {Math.round(trace.hypothesis.confidence * 100)}% and
                                                            risk score of {trace.riskAssessment.score}/10, the agent determined that
                                                            {trace.decision.requiresApproval
                                                                ? ' human review is required before execution.'
                                                                : ' autonomous action is appropriate.'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Risk Assessment Section */}
                                <div className="rounded-lg border border-white/10 overflow-hidden">
                                    <button
                                        onClick={() => setExpandedSection(expandedSection === 'risk' ? null : 'risk')}
                                        className="w-full p-4 flex items-center justify-between bg-slate-800/50 hover:bg-slate-800/70 transition-colors"
                                    >
                                        <div className="flex items-center gap-2">
                                            <Shield className="w-4 h-4 text-amber-400" />
                                            <span className="text-sm font-medium text-white">Risk Assessment</span>
                                            <span className={`px-2 py-0.5 text-xs rounded ${trace.riskAssessment.score >= 7 ? 'bg-red-500/20 text-red-400' :
                                                    trace.riskAssessment.score >= 4 ? 'bg-amber-500/20 text-amber-400' :
                                                        'bg-emerald-500/20 text-emerald-400'
                                                }`}>
                                                {trace.riskAssessment.score}/10
                                            </span>
                                        </div>
                                        <motion.div
                                            animate={{ rotate: expandedSection === 'risk' ? 180 : 0 }}
                                        >
                                            <ChevronDown className="w-4 h-4 text-slate-400" />
                                        </motion.div>
                                    </button>

                                    <AnimatePresence>
                                        {expandedSection === 'risk' && (
                                            <motion.div
                                                initial={{ height: 0 }}
                                                animate={{ height: 'auto' }}
                                                exit={{ height: 0 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="p-4 border-t border-white/5 space-y-3">
                                                    <div>
                                                        <div className="text-xs text-slate-400 mb-2">Risk Factors</div>
                                                        <div className="space-y-1">
                                                            {trace.riskAssessment.factors.map((factor: any, i: number) => (
                                                                <div key={i} className="flex items-center justify-between text-sm">
                                                                    <span className="text-slate-300">{factor.name}</span>
                                                                    <span className={factor.impact.startsWith('+') ? 'text-red-400' : 'text-emerald-400'}>
                                                                        {factor.impact}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                                                        <span className="text-xs text-slate-400">Urgency</span>
                                                        <span className={`text-sm font-medium ${trace.riskAssessment.urgency === 'immediate' ? 'text-red-400' : 'text-amber-400'
                                                            }`}>
                                                            {trace.riskAssessment.urgency}
                                                        </span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Decision Section */}
                                <div className="p-4 rounded-lg bg-violet-500/10 border border-violet-500/20">
                                    <div className="flex items-center gap-2 mb-2">
                                        <GitBranch className="w-4 h-4 text-violet-400" />
                                        <span className="text-sm font-medium text-violet-300">Decision</span>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-400">Classification</span>
                                            <span className="text-white">{trace.decision.classification.replace(/_/g, ' ')}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-400">Action</span>
                                            <span className="text-white">{trace.decision.action.replace(/_/g, ' ')}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-400">Human Review</span>
                                            <span className={trace.decision.requiresApproval ? 'text-amber-400' : 'text-emerald-400'}>
                                                {trace.decision.requiresApproval ? 'Required' : 'Not Required'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 border-t border-white/10 flex items-center justify-end bg-black/20 flex-shrink-0">
                        <button
                            onClick={onClose}
                            className="px-5 py-2 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}
