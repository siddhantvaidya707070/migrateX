'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Shield,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Clock,
    MessageSquare,
    Mail,
    FileText,
    Zap,
    Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'

// Define locally to avoid circular dependencies
interface ActionProposal {
    id: string
    action_type: string
    status: string
    payload: any
    created_at: string
}

interface ApprovalQueueProps {
    proposals: ActionProposal[]
    onApprove: (id: string, notes?: string) => Promise<boolean>
    onReject: (id: string, notes?: string) => Promise<boolean>
}

const ACTION_ICONS: Record<string, any> = {
    email_support: Mail,
    email_engineering: Mail,
    draft_ticket_reply: MessageSquare,
    auto_reply_ticket: MessageSquare,
    update_docs: FileText
}

const ACTION_LABELS: Record<string, string> = {
    email_support: 'Email Support Team',
    email_engineering: 'Escalate to Engineering',
    draft_ticket_reply: 'Draft Ticket Reply',
    auto_reply_ticket: 'Auto-Reply Ticket',
    update_docs: 'Update Documentation'
}

export function ApprovalQueue({ proposals, onApprove, onReject }: ApprovalQueueProps) {
    const [processingId, setProcessingId] = useState<string | null>(null)
    const [expandedId, setExpandedId] = useState<string | null>(null)

    const handleApprove = async (id: string) => {
        setProcessingId(id)
        await onApprove(id)
        setProcessingId(null)
    }

    const handleReject = async (id: string) => {
        setProcessingId(id)
        await onReject(id)
        setProcessingId(null)
    }

    return (
        <div className="glass-panel rounded-2xl p-6 border border-border/50">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold">Pending Approvals</h3>
                    {proposals.length > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500 text-xs font-medium">
                            {proposals.length}
                        </span>
                    )}
                </div>
            </div>

            <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                    {proposals.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center justify-center py-8 text-muted-foreground"
                        >
                            <CheckCircle className="w-12 h-12 mb-3 opacity-30" />
                            <p className="text-sm">All clear! No pending approvals.</p>
                        </motion.div>
                    ) : (
                        proposals.map((proposal, idx) => {
                            const Icon = ACTION_ICONS[proposal.action_type] || Zap
                            const label = ACTION_LABELS[proposal.action_type] || proposal.action_type
                            const isExpanded = expandedId === proposal.id
                            const isProcessing = processingId === proposal.id

                            return (
                                <motion.div
                                    key={proposal.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -100 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="border border-amber-500/30 bg-amber-500/5 rounded-xl overflow-hidden"
                                >
                                    <div
                                        className="p-4 cursor-pointer hover:bg-amber-500/10 transition-colors"
                                        onClick={() => setExpandedId(isExpanded ? null : proposal.id)}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                                                <Icon className="w-5 h-5 text-amber-500" />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="font-medium text-sm">{label}</span>
                                                    {proposal.payload?.merchant_name && (
                                                        <span className="px-2 py-0.5 rounded bg-violet-500/20 text-violet-400 text-xs font-medium">
                                                            {proposal.payload.merchant_name}
                                                        </span>
                                                    )}
                                                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                                        <Clock className="w-3 h-3" />
                                                        {new Date(proposal.created_at).toLocaleTimeString()}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-1 truncate">
                                                    {proposal.payload?.error_message || proposal.payload?.subject || 'Review required'}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        handleReject(proposal.id)
                                                    }}
                                                    disabled={isProcessing}
                                                    className="h-8 px-3 text-red-500 hover:text-red-400 hover:bg-red-500/10"
                                                >
                                                    {isProcessing ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <XCircle className="w-4 h-4" />
                                                    )}
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        handleApprove(proposal.id)
                                                    }}
                                                    disabled={isProcessing}
                                                    className="h-8 px-3 bg-green-500 hover:bg-green-600"
                                                >
                                                    {isProcessing ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <>
                                                            <CheckCircle className="w-4 h-4 mr-1" />
                                                            Approve
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Expanded Details */}
                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="border-t border-amber-500/20"
                                            >
                                                <div className="p-4 bg-background/50">
                                                    <h4 className="text-xs font-medium text-muted-foreground mb-2">Proposed Action Details</h4>
                                                    <pre className="text-xs bg-muted p-3 rounded-lg overflow-auto max-h-40">
                                                        {JSON.stringify(proposal.payload, null, 2)}
                                                    </pre>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            )
                        })
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
