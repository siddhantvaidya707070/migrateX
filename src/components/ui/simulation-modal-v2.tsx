'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    X,
    Play,
    Zap,
    ShieldAlert,
    FileQuestion,
    Webhook,
    KeyRound,
    Timer,
    Settings2,
    AlertTriangle,
    TrendingUp,
    Boxes,
    Flame,
    Check,
    ChevronRight,
    Info
} from 'lucide-react'

export interface SimulationConfig {
    errorTypes: string[]
    riskProfiles: ('low' | 'medium' | 'high')[]
    eventCount: number
    merchantCount: number
}

interface SimulationModalV2Props {
    isOpen: boolean
    onClose: () => void
    onStart: (config: SimulationConfig) => void
}

// HARD LIMITS - DO NOT CHANGE
const MAX_MERCHANTS = 10
const MAX_EVENTS = 50

// Error type definitions
const ERROR_TYPES = [
    { id: 'checkout_failure', label: 'Checkout Failures', icon: Zap, color: 'text-red-400', description: 'Payment processing errors' },
    { id: 'documentation_gap', label: 'Documentation Gaps', icon: FileQuestion, color: 'text-amber-400', description: 'API confusion issues' },
    { id: 'webhook_failure', label: 'Webhook Failures', icon: Webhook, color: 'text-orange-400', description: 'Delivery & signature issues' },
    { id: 'auth_failure', label: 'Auth Failures', icon: KeyRound, color: 'text-[#E6C97A]', description: 'API key & token errors' },
    { id: 'rate_limit', label: 'Rate Limits', icon: Timer, color: 'text-blue-400', description: 'Throttling & backoff issues' },
    { id: 'merchant_misconfig', label: 'Misconfigurations', icon: Settings2, color: 'text-cyan-400', description: 'Setup & config errors' },
    { id: 'platform_regression', label: 'Platform Issues', icon: AlertTriangle, color: 'text-rose-500', description: 'System-wide regressions' }
]

const RISK_LEVELS = [
    { id: 'low', label: 'Low Risk', color: 'bg-emerald-500', description: 'Minor issues, routine handling' },
    { id: 'medium', label: 'Medium Risk', color: 'bg-amber-500', description: 'Moderate impact, some urgency' },
    { id: 'high', label: 'High Risk', color: 'bg-red-500', description: 'Critical issues, immediate attention' }
]

export function SimulationModalV2({ isOpen, onClose, onStart }: SimulationModalV2Props) {
    const [currentStep, setCurrentStep] = useState(1)
    const [config, setConfig] = useState<SimulationConfig>({
        errorTypes: ['checkout_failure'],
        riskProfiles: ['medium'],
        eventCount: 25,
        merchantCount: 5
    })

    // Reset on open
    useEffect(() => {
        if (isOpen) {
            setCurrentStep(1)
        }
    }, [isOpen])

    const toggleErrorType = (typeId: string) => {
        setConfig(prev => ({
            ...prev,
            errorTypes: prev.errorTypes.includes(typeId)
                ? prev.errorTypes.filter(t => t !== typeId)
                : [...prev.errorTypes, typeId]
        }))
    }

    const toggleRiskProfile = (risk: 'low' | 'medium' | 'high') => {
        setConfig(prev => ({
            ...prev,
            riskProfiles: prev.riskProfiles.includes(risk)
                ? prev.riskProfiles.filter(r => r !== risk)
                : [...prev.riskProfiles, risk]
        }))
    }

    const handleStart = () => {
        // Validate and enforce limits
        const finalConfig: SimulationConfig = {
            errorTypes: config.errorTypes.length === 0 ? ['checkout_failure'] : config.errorTypes,
            riskProfiles: (config.riskProfiles.length === 0 ? ['medium'] : config.riskProfiles) as ('low' | 'medium' | 'high')[],
            eventCount: Math.min(config.eventCount, MAX_EVENTS),
            merchantCount: Math.min(config.merchantCount, MAX_MERCHANTS)
        }
        onStart(finalConfig)
        onClose()
    }

    const canProceed = () => {
        if (currentStep === 1) return config.errorTypes.length > 0
        if (currentStep === 2) return config.riskProfiles.length > 0
        return true
    }

    if (!isOpen) return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                onClick={(e) => e.target === e.currentTarget && onClose()}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="w-full max-w-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-white/10 overflow-hidden"
                >
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-black/20">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-[#9E7C32] to-[#C9A24D]">
                                <Flame className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-white">Configure Simulation</h2>
                                <p className="text-sm text-slate-400">Step {currentStep} of 3</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-slate-400" />
                        </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-1 bg-slate-800">
                        <motion.div
                            className="h-full bg-gradient-to-r from-[#9E7C32] to-[#C9A24D]"
                            initial={{ width: '0%' }}
                            animate={{ width: `${(currentStep / 3) * 100}%` }}
                        />
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        <AnimatePresence mode="wait">
                            {/* Step 1: Error Types */}
                            {currentStep === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-4"
                                >
                                    <div>
                                        <h3 className="text-lg font-medium text-white mb-1">Select Error Types</h3>
                                        <p className="text-sm text-slate-400">Choose one or more error types to simulate.</p>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {ERROR_TYPES.map((type) => {
                                            const Icon = type.icon
                                            const isSelected = config.errorTypes.includes(type.id)

                                            return (
                                                <button
                                                    key={type.id}
                                                    onClick={() => toggleErrorType(type.id)}
                                                    className={`p-4 rounded-lg border-2 transition-all duration-200 text-left group ${isSelected
                                                        ? 'border-[#C9A24D] bg-[#C9A24D]/10'
                                                        : 'border-white/10 hover:border-white/20 bg-white/5'
                                                        }`}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div className={`p-2 rounded-lg ${isSelected ? 'bg-[#C9A24D]/20' : 'bg-white/10 group-hover:bg-white/15'}`}>
                                                            <Icon className={`w-4 h-4 ${isSelected ? 'text-[#E6C97A]' : type.color}`} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <span className={`font-medium ${isSelected ? 'text-[#E6C97A]' : 'text-white'}`}>
                                                                    {type.label}
                                                                </span>
                                                                {isSelected && (
                                                                    <Check className="w-4 h-4 text-[#E6C97A]" />
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-slate-400 mt-0.5">{type.description}</p>
                                                        </div>
                                                    </div>
                                                </button>
                                            )
                                        })}
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 2: Risk Profiles */}
                            {currentStep === 2 && (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-4"
                                >
                                    <div>
                                        <h3 className="text-lg font-medium text-white mb-1">Select Risk Levels</h3>
                                        <p className="text-sm text-slate-400">Choose the severity of issues to simulate.</p>
                                    </div>

                                    <div className="space-y-3">
                                        {RISK_LEVELS.map((risk) => {
                                            const isSelected = config.riskProfiles.includes(risk.id as any)

                                            return (
                                                <button
                                                    key={risk.id}
                                                    onClick={() => toggleRiskProfile(risk.id as any)}
                                                    className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left ${isSelected
                                                        ? 'border-[#C9A24D] bg-[#C9A24D]/10'
                                                        : 'border-white/10 hover:border-white/20 bg-white/5'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-3 h-3 rounded-full ${risk.color}`} />
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className={`font-medium ${isSelected ? 'text-[#E6C97A]' : 'text-white'}`}>
                                                                    {risk.label}
                                                                </span>
                                                                {isSelected && <Check className="w-4 h-4 text-[#E6C97A]" />}
                                                            </div>
                                                            <p className="text-sm text-slate-400">{risk.description}</p>
                                                        </div>
                                                    </div>
                                                </button>
                                            )
                                        })}
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 3: Scale (Events + Merchants) */}
                            {currentStep === 3 && (
                                <motion.div
                                    key="step3"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-5"
                                >
                                    <div>
                                        <h3 className="text-lg font-medium text-white mb-1">Configure Scale</h3>
                                        <p className="text-sm text-slate-400">Set the number of events and merchants.</p>
                                    </div>

                                    {/* Limits notice */}
                                    <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
                                        <Info className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                                        <div className="text-sm text-amber-200">
                                            <strong>Note:</strong> All simulation events are injected simultaneously. Time-based spreading is disabled.
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        {/* Event Count Slider */}
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <label className="text-sm font-medium text-white flex items-center gap-2">
                                                    <TrendingUp className="w-4 h-4 text-[#E6C97A]" />
                                                    Events
                                                </label>
                                                <span className="text-lg font-bold text-[#E6C97A]">{config.eventCount}</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="5"
                                                max={MAX_EVENTS}
                                                step="1"
                                                value={config.eventCount}
                                                onChange={(e) => setConfig(prev => ({ ...prev, eventCount: parseInt(e.target.value) }))}
                                                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#C9A24D]"
                                            />
                                            <div className="flex justify-between text-xs text-slate-500 mt-1">
                                                <span>5</span>
                                                <span>{MAX_EVENTS} max</span>
                                            </div>
                                        </div>

                                        {/* Merchant Count Slider */}
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <label className="text-sm font-medium text-white flex items-center gap-2">
                                                    <Boxes className="w-4 h-4 text-cyan-400" />
                                                    Merchants
                                                </label>
                                                <span className="text-lg font-bold text-cyan-400">{config.merchantCount}</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="1"
                                                max={MAX_MERCHANTS}
                                                step="1"
                                                value={config.merchantCount}
                                                onChange={(e) => setConfig(prev => ({ ...prev, merchantCount: parseInt(e.target.value) }))}
                                                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                                            />
                                            <div className="flex justify-between text-xs text-slate-500 mt-1">
                                                <span>1</span>
                                                <span>{MAX_MERCHANTS} max</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Summary */}
                                    <div className="p-4 rounded-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-white/10">
                                        <h4 className="text-sm font-medium text-slate-300 mb-3">Simulation Summary</h4>
                                        <div className="grid grid-cols-2 gap-4 text-center">
                                            <div>
                                                <div className="text-2xl font-bold text-[#E6C97A]">{config.eventCount}</div>
                                                <div className="text-xs text-slate-400">Events</div>
                                            </div>
                                            <div>
                                                <div className="text-2xl font-bold text-cyan-400">{config.merchantCount}</div>
                                                <div className="text-xs text-slate-400">Merchants</div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between bg-black/20">
                        <button
                            onClick={() => setCurrentStep(s => Math.max(1, s - 1))}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${currentStep === 1
                                ? 'opacity-0 pointer-events-none'
                                : 'text-slate-300 hover:text-white hover:bg-white/10'
                                }`}
                        >
                            Back
                        </button>

                        {currentStep < 3 ? (
                            <button
                                onClick={() => setCurrentStep(s => s + 1)}
                                disabled={!canProceed()}
                                className={`px-5 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${canProceed()
                                    ? 'bg-gradient-to-r from-[#9E7C32] to-[#C9A24D] text-white hover:from-[#C9A24D] hover:to-[#E6C97A]'
                                    : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                                    }`}
                            >
                                Continue
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        ) : (
                            <button
                                onClick={handleStart}
                                className="px-5 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-green-600 text-white hover:from-emerald-500 hover:to-green-500 transition-all"
                            >
                                <Play className="w-4 h-4" />
                                Run Simulation
                            </button>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}
