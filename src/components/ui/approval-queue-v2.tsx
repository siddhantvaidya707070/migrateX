'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Mail,
    MessageSquare,
    Bot,
    Bell,
    ChevronRight,
    Clock,
    Building2,
    Shield,
    Gauge,
    Loader2,
    Inbox,
    AlertTriangle
} from 'lucide-react'
import { ArtifactModal } from './artifact-modal'
import { formatDistanceToNow } from 'date-fns'

interface Proposal {
    id: string
    actionType: string
    status: string
    payload: any
    createdAt: string
    artifact?: {
        id: string
        type: 'internal_email' | 'ticket_reply' | 'chatbot_response' | 'merchant_notice'
        subject: string
        body: string
        recipientType: string
        recipientName: string
        recipientEmail: string
        senderName: string
        urgency: string
        metadata: any
    }
    context: {
        merchantName: string
        merchantId: string
        errorType: string
        riskScore: number
        confidence: number
        summary: string
    }
}

interface ApprovalQueueV2Props {
    proposals: Proposal[]
    isLoading: boolean
    onApprove: (id: string) => Promise<void>
    onReject: (id: string) => Promise<void>
    activities?: any[] // Activities to generate mock proposals from
}

const ACTION_TYPE_CONFIG: Record<string, { icon: any, color: string, bg: string, label: string }> = {
    internal_email: { icon: Mail, color: 'text-blue-400', bg: 'bg-blue-500/10', label: 'Email' },
    email_engineering: { icon: Mail, color: 'text-blue-400', bg: 'bg-blue-500/10', label: 'Eng Email' },
    ticket_reply: { icon: MessageSquare, color: 'text-green-400', bg: 'bg-green-500/10', label: 'Ticket' },
    draft_ticket_reply: { icon: MessageSquare, color: 'text-green-400', bg: 'bg-green-500/10', label: 'Ticket' },
    chatbot_response: { icon: Bot, color: 'text-purple-400', bg: 'bg-purple-500/10', label: 'Chat' },
    merchant_notice: { icon: Bell, color: 'text-amber-400', bg: 'bg-amber-500/10', label: 'Notice' },
    send_support_response: { icon: MessageSquare, color: 'text-cyan-400', bg: 'bg-cyan-500/10', label: 'Support' },
    alert_merchant: { icon: Bell, color: 'text-amber-400', bg: 'bg-amber-500/10', label: 'Alert' },
    escalate: { icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10', label: 'Escalate' },
    default: { icon: Mail, color: 'text-slate-400', bg: 'bg-slate-500/10', label: 'Action' }
}

// Generate mock proposals from high-risk activities
function generateMockProposals(activities: any[]): Proposal[] {
    if (!activities || activities.length === 0) return []

    const highRiskActivities = activities.filter(a =>
        a.riskLevel === 'high' ||
        (a.details?.riskScore && a.details.riskScore >= 7)
    )

    return highRiskActivities.map((activity, idx) => {
        const eventType = activity.eventType || 'unknown'
        const merchantName = activity.merchantName || 'Unknown Merchant'

        // Determine action type based on event
        const actionType = eventType.includes('auth') ? 'email_engineering' :
            eventType.includes('checkout') ? 'escalate' :
                eventType.includes('webhook') ? 'merchant_notice' :
                    'internal_email'

        // Generate appropriate mock artifact
        const mockArtifact = {
            id: `artifact-${activity.id || idx}`,
            type: actionType === 'escalate' ? 'internal_email' as const : 'merchant_notice' as const,
            subject: getSubjectForEvent(eventType, merchantName),
            body: getBodyForEvent(eventType, merchantName, activity.summary),
            recipientType: actionType === 'escalate' ? 'Engineering Team' : 'Merchant',
            recipientName: actionType === 'escalate' ? 'On-Call Engineering' : merchantName,
            recipientEmail: actionType === 'escalate' ? 'oncall@platform.com' : `support@${merchantName.toLowerCase().replace(/\s+/g, '')}.com`,
            senderName: 'Support Agent AI',
            urgency: 'high',
            metadata: { eventId: activity.id, eventType }
        }

        return {
            id: `mock-proposal-${activity.id || idx}`,
            actionType,
            status: 'pending_approval',
            payload: activity.details || {},
            createdAt: activity.timestamp || new Date().toISOString(),
            artifact: mockArtifact,
            context: {
                merchantName,
                merchantId: activity.merchantId || '',
                errorType: eventType,
                riskScore: activity.details?.riskScore || 8,
                confidence: activity.confidence || 0.85,
                summary: activity.summary || `High-risk ${eventType.replace(/_/g, ' ')} detected`
            }
        }
    })
}

function getSubjectForEvent(eventType: string, merchantName: string): string {
    const subjects: Record<string, string> = {
        auth_failure: `[URGENT] Authentication Issues for ${merchantName}`,
        checkout_failure: `[CRITICAL] Checkout Processing Failures - ${merchantName}`,
        webhook_failure: `Webhook Endpoint Issues - ${merchantName}`,
        rate_limit: `Rate Limit Threshold Exceeded - ${merchantName}`,
        platform_regression: `[P1] Platform Regression Affecting ${merchantName}`
    }
    return subjects[eventType] || `Action Required: ${eventType.replace(/_/g, ' ')} - ${merchantName}`
}

function getBodyForEvent(eventType: string, merchantName: string, summary: string): string {
    const bodies: Record<string, string> = {
        auth_failure: `Hi ${merchantName} Team,

We've detected multiple authentication failures on your integration. Our automated systems identified an issue with your API credentials.

**Issue Summary:**
${summary || 'Invalid API key or expired credentials detected.'}

**Recommended Actions:**
1. Verify your API key is correctly configured
2. Check if credentials have been rotated recently
3. Ensure proper key permissions are set

Our engineering team has been alerted and is standing by to assist if needed.

Best regards,
Platform Support AI`,

        checkout_failure: `CRITICAL ALERT

Merchant: ${merchantName}
Issue: ${summary || 'Checkout processing failures detected'}

This workflow requires immediate human review before proceeding with:
- Customer communication
- Engineering escalation
- Revenue impact assessment

Waiting for approval to proceed.`,

        webhook_failure: `Hello ${merchantName},

We've noticed some webhook delivery issues with your configured endpoints.

**Details:**
${summary || 'Multiple webhook deliveries have failed to your endpoint.'}

**Suggested Steps:**
- Verify your endpoint is accessible
- Check endpoint response times
- Review recent infrastructure changes

Let us know if you need assistance troubleshooting.

Best,
Platform Support`,

        rate_limit: `Hi ${merchantName} Team,

Your API usage has exceeded the rate limits for your current tier.

${summary || 'Multiple requests were throttled.'}

Consider implementing request batching or contact sales for tier upgrade options.

Support Team`,

        platform_regression: `[P1 INCIDENT ALERT]

A platform regression has been detected affecting ${merchantName}.

${summary || 'Service degradation detected.'}

Engineering has been notified. Human approval required for customer communication.

- Incident Commander notified
- Monitoring dashboards activated
- Customer communication draft ready for review`
    }

    return bodies[eventType] || `Action required for ${merchantName}:\n\n${summary || 'Review pending action.'}`
}

function ApprovalCard({ proposal, onClick }: { proposal: Proposal, onClick: () => void }) {
    const typeConfig = ACTION_TYPE_CONFIG[proposal.actionType] || ACTION_TYPE_CONFIG.default
    const Icon = typeConfig.icon

    const riskColor = proposal.context.riskScore >= 7 ? 'text-red-400 bg-red-500/10' :
        proposal.context.riskScore >= 4 ? 'text-amber-400 bg-amber-500/10' :
            'text-emerald-400 bg-emerald-500/10'

    return (
        <motion.button
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -100 }}
            onClick={onClick}
            className="w-full p-4 rounded-lg bg-slate-800/40 border border-white/5 hover:border-violet-500/30 hover:bg-slate-800/60 transition-all text-left group"
        >
            <div className="flex items-start gap-3">
                {/* Icon */}
                <div className={`p-2 rounded-lg ${typeConfig.bg} flex-shrink-0`}>
                    <Icon className={`w-4 h-4 ${typeConfig.color}`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`px-1.5 py-0.5 text-xs font-medium rounded ${typeConfig.bg} ${typeConfig.color}`}>
                            {typeConfig.label}
                        </span>
                        <span className={`px-1.5 py-0.5 text-xs font-medium rounded ${riskColor}`}>
                            Risk {proposal.context.riskScore}/10
                        </span>
                        <span className="text-xs text-slate-500">
                            {formatDistanceToNow(new Date(proposal.createdAt), { addSuffix: true })}
                        </span>
                    </div>

                    <h4 className="text-sm font-medium text-white mb-1 truncate">
                        {proposal.artifact?.subject || `${proposal.actionType.replace(/_/g, ' ')} for ${proposal.context.merchantName}`}
                    </h4>

                    <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            {proposal.context.merchantName}
                        </span>
                        <span className="flex items-center gap-1">
                            <Gauge className="w-3 h-3" />
                            {Math.round(proposal.context.confidence * 100)}%
                        </span>
                    </div>
                </div>

                {/* Arrow */}
                <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-violet-400 transition-colors flex-shrink-0" />
            </div>
        </motion.button>
    )
}

export function ApprovalQueueV2({ proposals, isLoading, onApprove, onReject, activities = [] }: ApprovalQueueV2Props) {
    const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null)
    const [isProcessing, setIsProcessing] = useState(false)

    const handleApprove = async (id: string) => {
        setIsProcessing(true)
        try {
            await onApprove(id)
            setSelectedProposal(null)
        } finally {
            setIsProcessing(false)
        }
    }

    const handleReject = async (id: string) => {
        setIsProcessing(true)
        try {
            await onReject(id)
            setSelectedProposal(null)
        } finally {
            setIsProcessing(false)
        }
    }

    // Filter for pending approval proposals only
    const realPendingProposals = proposals.filter(p => p.status === 'pending_approval' || p.status === 'pending')

    // If no real pending proposals, generate mock ones from high-risk activities
    const pendingProposals = realPendingProposals.length > 0
        ? realPendingProposals
        : generateMockProposals(activities)

    if (isLoading && pendingProposals.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-48 text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin mb-2" />
                <p className="text-sm">Loading approvals...</p>
            </div>
        )
    }

    if (pendingProposals.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-48 text-slate-400 text-center">
                <div className="p-4 rounded-full bg-slate-800/50 mb-3">
                    <Inbox className="w-6 h-6" />
                </div>
                <p className="font-medium text-white mb-1">No Pending Approvals</p>
                <p className="text-sm text-slate-500">High-risk actions will appear here for review.</p>
            </div>
        )
    }

    return (
        <>
            <div className="space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-400" />
                        <span className="text-sm font-medium text-white">
                            {pendingProposals.length} Pending Approval{pendingProposals.length > 1 ? 's' : ''}
                        </span>
                    </div>
                </div>

                {/* Cards */}
                <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar pr-1">
                    <AnimatePresence mode="popLayout">
                        {pendingProposals.map((proposal) => (
                            <ApprovalCard
                                key={proposal.id}
                                proposal={proposal}
                                onClick={() => setSelectedProposal(proposal)}
                            />
                        ))}
                    </AnimatePresence>
                </div>
            </div>

            {/* Artifact Modal */}
            <ArtifactModal
                isOpen={!!selectedProposal}
                onClose={() => setSelectedProposal(null)}
                proposal={selectedProposal}
                onApprove={handleApprove}
                onReject={handleReject}
                isProcessing={isProcessing}
            />
        </>
    )
}
