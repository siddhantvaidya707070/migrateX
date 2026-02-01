'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    X,
    Zap,
    FileText,
    Shuffle,
    AlertTriangle,
    AlertCircle,
    CheckCircle,
    Gauge,
    Users,
    Clock,
    Bot,
    ArrowRight,
    ArrowLeft,
    Play
} from 'lucide-react'
import { Button } from '@/components/ui/button'

// Legacy simulation config (for backward compatibility)
interface LegacySimulationConfig {
    scenario: 'checkout_failure' | 'doc_gap' | 'mixed'
    risk_profile: 'low' | 'medium' | 'high'
    event_count: number
    merchant_count: number
    timing: 'burst' | 'spaced'
    auto_trigger_agent: boolean
}

interface SimulationModalProps {
    isOpen: boolean
    onClose: () => void
    onStart: (config: LegacySimulationConfig) => void
    isLoading?: boolean
}

const SCENARIOS = [
    {
        id: 'checkout_failure' as const,
        name: 'Checkout Failures',
        description: 'Simulate payment/checkout errors across merchants',
        icon: Zap,
        color: 'from-red-500 to-orange-500',
        badge: 'HIGH IMPACT'
    },
    {
        id: 'doc_gap' as const,
        name: 'Documentation Gaps',
        description: 'API confusion and support tickets about docs',
        icon: FileText,
        color: 'from-blue-500 to-cyan-500',
        badge: 'LOW RISK'
    },
    {
        id: 'mixed' as const,
        name: 'Mixed Scenario',
        description: 'Combination of different signal types',
        icon: Shuffle,
        color: 'from-purple-500 to-pink-500',
        badge: 'RECOMMENDED'
    }
]

const RISK_PROFILES = [
    {
        id: 'low' as const,
        name: 'Low Risk',
        description: 'Routine issues, obvious resolution',
        icon: CheckCircle,
        color: 'text-green-500'
    },
    {
        id: 'medium' as const,
        name: 'Medium Risk',
        description: 'Ambiguous cases needing reasoning',
        icon: AlertCircle,
        color: 'text-yellow-500'
    },
    {
        id: 'high' as const,
        name: 'High Risk',
        description: 'Critical issues requiring prioritization',
        icon: AlertTriangle,
        color: 'text-red-500'
    }
]

const EVENT_COUNTS = [10, 30, 50]
const MERCHANT_COUNTS = [1, 3, 5]

export function SimulationModal({ isOpen, onClose, onStart, isLoading }: SimulationModalProps) {
    const [step, setStep] = useState(1)
    const [config, setConfig] = useState<Partial<LegacySimulationConfig>>({
        scenario: 'mixed',
        risk_profile: 'high',
        event_count: 30,
        merchant_count: 5,
        timing: 'burst',
        auto_trigger_agent: true
    })

    const canProceed = () => {
        if (step === 1) return !!config.scenario
        if (step === 2) return !!config.risk_profile
        if (step === 3) return !!config.event_count && !!config.merchant_count
        return true
    }

    const handleStart = () => {
        onStart(config as LegacySimulationConfig)
    }

    const handleClose = () => {
        setStep(1)
        onClose()
    }

    if (!isOpen) return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={handleClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="bg-card border border-border rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-border">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                                <Bot className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold">Start Simulation</h2>
                                <p className="text-sm text-muted-foreground">Step {step} of 3</p>
                            </div>
                        </div>
                        <button
                            onClick={handleClose}
                            className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-1 bg-muted">
                        <motion.div
                            className="h-full bg-primary"
                            initial={{ width: '33%' }}
                            animate={{ width: `${(step / 3) * 100}%` }}
                            transition={{ duration: 0.3 }}
                        />
                    </div>

                    {/* Content */}
                    <div className="p-6 min-h-[320px]">
                        <AnimatePresence mode="wait">
                            {step === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-4"
                                >
                                    <div>
                                        <h3 className="text-lg font-medium mb-2">Choose Scenario</h3>
                                        <p className="text-sm text-muted-foreground">What type of signals should the agent process?</p>
                                    </div>

                                    <div className="grid gap-3">
                                        {SCENARIOS.map(scenario => {
                                            const Icon = scenario.icon
                                            const isSelected = config.scenario === scenario.id
                                            return (
                                                <motion.button
                                                    key={scenario.id}
                                                    onClick={() => setConfig(c => ({ ...c, scenario: scenario.id }))}
                                                    className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${isSelected
                                                        ? 'border-primary bg-primary/10'
                                                        : 'border-border hover:border-primary/50 hover:bg-muted/50'
                                                        }`}
                                                    whileHover={{ scale: 1.01 }}
                                                    whileTap={{ scale: 0.99 }}
                                                >
                                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${scenario.color} flex items-center justify-center`}>
                                                        <Icon className="w-6 h-6 text-white" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium">{scenario.name}</span>
                                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary font-medium">
                                                                {scenario.badge}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-muted-foreground">{scenario.description}</p>
                                                    </div>
                                                    {isSelected && (
                                                        <CheckCircle className="w-5 h-5 text-primary" />
                                                    )}
                                                </motion.button>
                                            )
                                        })}
                                    </div>
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-4"
                                >
                                    <div>
                                        <h3 className="text-lg font-medium mb-2">Risk Profile</h3>
                                        <p className="text-sm text-muted-foreground">How complex should the issues be?</p>
                                    </div>

                                    <div className="grid gap-3">
                                        {RISK_PROFILES.map(profile => {
                                            const Icon = profile.icon
                                            const isSelected = config.risk_profile === profile.id
                                            return (
                                                <motion.button
                                                    key={profile.id}
                                                    onClick={() => setConfig(c => ({ ...c, risk_profile: profile.id }))}
                                                    className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${isSelected
                                                        ? 'border-primary bg-primary/10'
                                                        : 'border-border hover:border-primary/50 hover:bg-muted/50'
                                                        }`}
                                                    whileHover={{ scale: 1.01 }}
                                                    whileTap={{ scale: 0.99 }}
                                                >
                                                    <Icon className={`w-8 h-8 ${profile.color}`} />
                                                    <div className="flex-1">
                                                        <span className="font-medium">{profile.name}</span>
                                                        <p className="text-sm text-muted-foreground">{profile.description}</p>
                                                    </div>
                                                    {isSelected && (
                                                        <CheckCircle className="w-5 h-5 text-primary" />
                                                    )}
                                                </motion.button>
                                            )
                                        })}
                                    </div>
                                </motion.div>
                            )}

                            {step === 3 && (
                                <motion.div
                                    key="step3"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <div>
                                        <h3 className="text-lg font-medium mb-2">Intensity Settings</h3>
                                        <p className="text-sm text-muted-foreground">Configure simulation volume and timing</p>
                                    </div>

                                    {/* Event Count */}
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <Gauge className="w-4 h-4 text-muted-foreground" />
                                            <span className="text-sm font-medium">Number of Events</span>
                                        </div>
                                        <div className="flex gap-2">
                                            {EVENT_COUNTS.map(count => (
                                                <button
                                                    key={count}
                                                    onClick={() => setConfig(c => ({ ...c, event_count: count }))}
                                                    className={`flex-1 py-3 px-4 rounded-xl border-2 font-medium transition-all ${config.event_count === count
                                                        ? 'border-primary bg-primary/10 text-primary'
                                                        : 'border-border hover:border-primary/50'
                                                        }`}
                                                >
                                                    {count}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Merchant Count */}
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <Users className="w-4 h-4 text-muted-foreground" />
                                            <span className="text-sm font-medium">Merchants Affected</span>
                                        </div>
                                        <div className="flex gap-2">
                                            {MERCHANT_COUNTS.map(count => (
                                                <button
                                                    key={count}
                                                    onClick={() => setConfig(c => ({ ...c, merchant_count: count }))}
                                                    className={`flex-1 py-3 px-4 rounded-xl border-2 font-medium transition-all ${config.merchant_count === count
                                                        ? 'border-primary bg-primary/10 text-primary'
                                                        : 'border-border hover:border-primary/50'
                                                        }`}
                                                >
                                                    {count}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Timing */}
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-muted-foreground" />
                                            <span className="text-sm font-medium">Event Timing</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setConfig(c => ({ ...c, timing: 'burst' }))}
                                                className={`flex-1 py-3 px-4 rounded-xl border-2 font-medium transition-all ${config.timing === 'burst'
                                                    ? 'border-primary bg-primary/10 text-primary'
                                                    : 'border-border hover:border-primary/50'
                                                    }`}
                                            >
                                                <span className="block">Burst</span>
                                                <span className="text-xs text-muted-foreground">All at once</span>
                                            </button>
                                            <button
                                                onClick={() => setConfig(c => ({ ...c, timing: 'spaced' }))}
                                                className={`flex-1 py-3 px-4 rounded-xl border-2 font-medium transition-all ${config.timing === 'spaced'
                                                    ? 'border-primary bg-primary/10 text-primary'
                                                    : 'border-border hover:border-primary/50'
                                                    }`}
                                            >
                                                <span className="block">Spaced</span>
                                                <span className="text-xs text-muted-foreground">Over 15 mins</span>
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between p-6 border-t border-border bg-muted/30">
                        <Button
                            variant="ghost"
                            onClick={() => step > 1 ? setStep(s => s - 1) : handleClose()}
                            className="gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            {step > 1 ? 'Back' : 'Cancel'}
                        </Button>

                        {step < 3 ? (
                            <Button
                                onClick={() => setStep(s => s + 1)}
                                disabled={!canProceed()}
                                className="gap-2"
                            >
                                Next
                                <ArrowRight className="w-4 h-4" />
                            </Button>
                        ) : (
                            <Button
                                onClick={handleStart}
                                disabled={isLoading || !canProceed()}
                                className="gap-2 bg-gradient-to-r from-primary to-purple-500 hover:opacity-90"
                            >
                                {isLoading ? (
                                    <>
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                        >
                                            <Bot className="w-4 h-4" />
                                        </motion.div>
                                        Starting...
                                    </>
                                ) : (
                                    <>
                                        <Play className="w-4 h-4" />
                                        Start Simulation
                                    </>
                                )}
                            </Button>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}
