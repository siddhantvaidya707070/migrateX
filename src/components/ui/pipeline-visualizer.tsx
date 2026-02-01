'use client'

import React from 'react'
import { motion } from 'framer-motion'
import {
    Eye,
    Brain,
    Lightbulb,
    Scale,
    CheckSquare,
    MessageSquare,
    Zap,
    GraduationCap,
    Loader2
} from 'lucide-react'

// Define AgentStep locally to avoid import issues
type AgentStep = 'observe' | 'synthesize' | 'hypothesize' | 'evaluate' | 'decide' | 'recommend' | 'act' | 'learn' | null

interface PipelineVisualizerProps {
    currentStep: AgentStep
    isProcessing: boolean
}

const PIPELINE_STEPS: { id: NonNullable<AgentStep>; label: string; icon: any; description: string }[] = [
    { id: 'observe', label: 'Observe', icon: Eye, description: 'Clustering raw signals' },
    { id: 'synthesize', label: 'Synthesize', icon: Brain, description: 'Enriching with context' },
    { id: 'hypothesize', label: 'Hypothesize', icon: Lightbulb, description: 'Generating root causes' },
    { id: 'evaluate', label: 'Evaluate', icon: Scale, description: 'Calculating risk score' },
    { id: 'decide', label: 'Decide', icon: CheckSquare, description: 'Classifying issue type' },
    { id: 'recommend', label: 'Recommend', icon: MessageSquare, description: 'Proposing action' },
    { id: 'act', label: 'Act', icon: Zap, description: 'Executing response' },
    { id: 'learn', label: 'Learn', icon: GraduationCap, description: 'Updating knowledge' }
]

export function PipelineVisualizer({ currentStep, isProcessing }: PipelineVisualizerProps) {
    const currentIndex = currentStep ? PIPELINE_STEPS.findIndex(s => s.id === currentStep) : -1

    return (
        <div className="glass-panel rounded-2xl p-6 border border-border/50">
            <div className="flex items-center gap-2 mb-6">
                <Brain className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Agent Pipeline</h3>
                {isProcessing && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="ml-auto flex items-center gap-2 text-xs text-primary bg-primary/10 px-3 py-1 rounded-full"
                    >
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Processing
                    </motion.div>
                )}
            </div>

            <div className="relative">
                {/* Connection Lines */}
                <div className="absolute top-5 left-0 right-0 h-0.5 bg-border/50" />
                <motion.div
                    className="absolute top-5 left-0 h-0.5 bg-gradient-to-r from-primary to-purple-500"
                    initial={{ width: '0%' }}
                    animate={{ width: currentIndex >= 0 ? `${((currentIndex + 1) / PIPELINE_STEPS.length) * 100}%` : '0%' }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                />

                {/* Steps */}
                <div className="relative flex justify-between">
                    {PIPELINE_STEPS.map((step, idx) => {
                        const Icon = step.icon
                        const isComplete = currentIndex > idx
                        const isActive = currentIndex === idx
                        const isPending = currentIndex < idx

                        return (
                            <div key={step.id} className="flex flex-col items-center group">
                                {/* Step Circle */}
                                <motion.div
                                    className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${isComplete
                                        ? 'bg-gradient-to-br from-primary to-purple-500 text-white shadow-lg shadow-primary/30'
                                        : isActive
                                            ? 'bg-primary/20 text-primary ring-2 ring-primary ring-offset-2 ring-offset-background'
                                            : 'bg-muted text-muted-foreground'
                                        }`}
                                    initial={false}
                                    animate={isActive ? { scale: [1, 1.1, 1] } : { scale: 1 }}
                                    transition={{ duration: 0.5, repeat: isActive ? Infinity : 0, repeatDelay: 1 }}
                                >
                                    {isActive && isProcessing ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Icon className="w-4 h-4" />
                                    )}

                                    {/* Active Pulse */}
                                    {isActive && isProcessing && (
                                        <motion.div
                                            className="absolute inset-0 rounded-full bg-primary"
                                            initial={{ opacity: 0.3, scale: 1 }}
                                            animate={{ opacity: 0, scale: 1.8 }}
                                            transition={{ duration: 1.5, repeat: Infinity }}
                                        />
                                    )}
                                </motion.div>

                                {/* Label */}
                                <span className={`mt-2 text-xs font-medium transition-colors ${isActive ? 'text-primary' : isComplete ? 'text-foreground' : 'text-muted-foreground'
                                    }`}>
                                    {step.label}
                                </span>

                                {/* Tooltip on hover */}
                                <div className="absolute top-12 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                    <div className="mt-2 px-3 py-1.5 bg-popover text-popover-foreground text-xs rounded-lg shadow-lg border border-border whitespace-nowrap">
                                        {step.description}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Current Step Detail */}
            {currentStep && isProcessing && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-4 bg-primary/5 rounded-xl border border-primary/20"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                            {(() => {
                                const ActiveIcon = PIPELINE_STEPS.find(s => s.id === currentStep)?.icon || Brain
                                return <ActiveIcon className="w-4 h-4 text-primary" />
                            })()}
                        </div>
                        <div>
                            <div className="font-medium text-sm">
                                {PIPELINE_STEPS.find(s => s.id === currentStep)?.label || currentStep}
                            </div>
                            <div className="text-xs text-muted-foreground">
                                {PIPELINE_STEPS.find(s => s.id === currentStep)?.description || 'Processing...'}
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    )
}
