'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
    X,
    Mail,
    MessageSquare,
    Bell,
    Bot,
    Edit3,
    Check,
    XCircle,
    AlertTriangle,
    User,
    AtSign,
    FileText,
    Loader2
} from 'lucide-react'

interface Artifact {
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

interface Proposal {
    id: string
    actionType: string
    status: string
    artifact?: Artifact
    context: {
        merchantName: string
        errorType: string
        riskScore: number
        confidence: number
        summary: string
    }
}

interface ArtifactModalProps {
    isOpen: boolean
    onClose: () => void
    proposal: Proposal | null
    onApprove: (id: string) => void
    onReject: (id: string) => void
    isProcessing: boolean
}

const ARTIFACT_TYPE_CONFIG: Record<string, { icon: any, color: string, label: string }> = {
    internal_email: { icon: Mail, color: '#3b82f6', label: 'Internal Email' },
    email_engineering: { icon: Mail, color: '#3b82f6', label: 'Engineering Email' },
    ticket_reply: { icon: MessageSquare, color: '#22c55e', label: 'Ticket Reply' },
    chatbot_response: { icon: Bot, color: '#a855f7', label: 'Chatbot Response' },
    merchant_notice: { icon: Bell, color: '#f59e0b', label: 'Merchant Notice' },
    escalate: { icon: AlertTriangle, color: '#ef4444', label: 'Escalation' },
    alert_merchant: { icon: Bell, color: '#f59e0b', label: 'Merchant Alert' }
}

export function ArtifactModal({ isOpen, onClose, proposal, onApprove, onReject, isProcessing }: ArtifactModalProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [editedBody, setEditedBody] = useState('')
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        return () => setMounted(false)
    }, [])

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => {
            document.body.style.overflow = ''
        }
    }, [isOpen])

    if (!mounted || !isOpen || !proposal) return null

    const artifact = proposal.artifact
    const typeConfig = ARTIFACT_TYPE_CONFIG[proposal.actionType] || ARTIFACT_TYPE_CONFIG[artifact?.type || 'internal_email'] || ARTIFACT_TYPE_CONFIG.internal_email
    const Icon = typeConfig.icon

    const handleStartEdit = () => {
        setEditedBody(artifact?.body || '')
        setIsEditing(true)
    }

    const riskColor = proposal.context.riskScore >= 7 ? '#f87171' :
        proposal.context.riskScore >= 4 ? '#fbbf24' : '#34d399'

    const modalContent = (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* BACKDROP */}
                    <motion.div
                        key="backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            backgroundColor: 'rgba(0, 0, 0, 0.85)',
                            backdropFilter: 'blur(4px)',
                            zIndex: 9998,
                            cursor: 'pointer'
                        }}
                    />

                    {/* MODAL - Compact and centered */}
                    <div
                        style={{
                            position: 'fixed',
                            inset: 0,
                            zIndex: 9999,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '24px',
                            pointerEvents: 'none'
                        }}
                    >
                        <motion.div
                            key="modal"
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            transition={{ duration: 0.15 }}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                width: '100%',
                                maxWidth: '560px',
                                maxHeight: 'calc(100vh - 80px)',
                                backgroundColor: '#0f172a',
                                borderRadius: '12px',
                                border: '1px solid rgba(255,255,255,0.1)',
                                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
                                display: 'flex',
                                flexDirection: 'column',
                                overflow: 'hidden',
                                pointerEvents: 'auto'
                            }}
                        >
                            {/* Header - Compact */}
                            <div style={{
                                padding: '16px 20px',
                                borderBottom: '1px solid rgba(255,255,255,0.1)',
                                background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '8px',
                                        background: typeConfig.color,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <Icon style={{ width: 18, height: 18, color: 'white' }} />
                                    </div>
                                    <div>
                                        <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'white', margin: 0 }}>{typeConfig.label}</h2>
                                        <span style={{ fontSize: '11px', color: '#64748b' }}>Pending Approval</span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{
                                        padding: '4px 8px',
                                        fontSize: '10px',
                                        fontWeight: 600,
                                        color: '#22d3ee',
                                        background: 'rgba(34, 211, 238, 0.1)',
                                        borderRadius: '4px',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em'
                                    }}>
                                        Simulated
                                    </span>
                                    <button
                                        onClick={onClose}
                                        style={{
                                            width: '28px',
                                            height: '28px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            background: 'rgba(255,255,255,0.05)',
                                            border: 'none',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            color: '#64748b'
                                        }}
                                    >
                                        <X style={{ width: 16, height: 16 }} />
                                    </button>
                                </div>
                            </div>

                            {/* Quick Stats Row */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(4, 1fr)',
                                gap: '1px',
                                background: 'rgba(255,255,255,0.05)'
                            }}>
                                {[
                                    { label: 'Merchant', value: proposal.context.merchantName },
                                    { label: 'Issue', value: proposal.context.errorType.replace(/_/g, ' ') },
                                    { label: 'Risk', value: `${proposal.context.riskScore}/10`, color: riskColor },
                                    { label: 'Confidence', value: `${Math.round(proposal.context.confidence * 100)}%` }
                                ].map((item, i) => (
                                    <div key={i} style={{
                                        padding: '10px 12px',
                                        background: '#0f172a',
                                        textAlign: 'center'
                                    }}>
                                        <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '2px', textTransform: 'uppercase' }}>{item.label}</div>
                                        <div style={{
                                            fontSize: '13px',
                                            fontWeight: 600,
                                            color: item.color || 'white',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                            textTransform: item.label === 'Issue' ? 'capitalize' : 'none'
                                        }}>
                                            {item.value}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Content - Scrollable */}
                            <div style={{
                                flex: 1,
                                overflowY: 'auto',
                                padding: '16px 20px'
                            }}>
                                {/* Trigger Summary */}
                                <div style={{ marginBottom: '14px' }}>
                                    <div style={{ fontSize: '10px', fontWeight: 600, color: '#64748b', marginBottom: '4px', textTransform: 'uppercase' }}>
                                        Trigger
                                    </div>
                                    <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: 1.5, margin: 0 }}>
                                        {proposal.context.summary}
                                    </p>
                                </div>

                                {/* Email Content */}
                                {artifact && (
                                    <>
                                        {/* To/From compact */}
                                        <div style={{ display: 'flex', gap: '16px', marginBottom: '12px' }}>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '2px' }}>To</div>
                                                <div style={{ fontSize: '12px', color: 'white' }}>{artifact.recipientName}</div>
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '2px' }}>From</div>
                                                <div style={{ fontSize: '12px', color: 'white' }}>{artifact.senderName}</div>
                                            </div>
                                        </div>

                                        {/* Subject */}
                                        {artifact.subject && (
                                            <div style={{ marginBottom: '12px' }}>
                                                <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '2px' }}>Subject</div>
                                                <div style={{ fontSize: '13px', color: 'white', fontWeight: 500 }}>{artifact.subject}</div>
                                            </div>
                                        )}

                                        {/* Message Body */}
                                        <div style={{
                                            padding: '12px',
                                            background: 'rgba(30, 41, 59, 0.5)',
                                            borderRadius: '8px',
                                            border: '1px solid rgba(255,255,255,0.05)',
                                            maxHeight: '140px',
                                            overflowY: 'auto'
                                        }}>
                                            {isEditing ? (
                                                <textarea
                                                    value={editedBody}
                                                    onChange={(e) => setEditedBody(e.target.value)}
                                                    style={{
                                                        width: '100%',
                                                        minHeight: '100px',
                                                        padding: '8px',
                                                        background: '#0f172a',
                                                        border: '1px solid rgba(255,255,255,0.1)',
                                                        borderRadius: '6px',
                                                        color: 'white',
                                                        fontSize: '12px',
                                                        resize: 'vertical',
                                                        outline: 'none'
                                                    }}
                                                />
                                            ) : (
                                                <pre style={{
                                                    whiteSpace: 'pre-wrap',
                                                    fontFamily: 'inherit',
                                                    fontSize: '12px',
                                                    color: '#cbd5e1',
                                                    lineHeight: 1.5,
                                                    margin: 0
                                                }}>
                                                    {artifact.body}
                                                </pre>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Footer - Action Buttons */}
                            <div style={{
                                padding: '14px 20px',
                                borderTop: '1px solid rgba(255,255,255,0.1)',
                                background: 'rgba(30, 41, 59, 0.3)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                            }}>
                                {/* Edit */}
                                <button
                                    onClick={isEditing ? () => setIsEditing(false) : handleStartEdit}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        padding: '8px 14px',
                                        fontSize: '13px',
                                        color: '#94a3b8',
                                        background: 'transparent',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '6px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <Edit3 style={{ width: 14, height: 14 }} />
                                    {isEditing ? 'Done' : 'Edit'}
                                </button>

                                {/* Main Actions */}
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button
                                        onClick={() => onReject(proposal.id)}
                                        disabled={isProcessing}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            padding: '10px 18px',
                                            fontSize: '13px',
                                            fontWeight: 600,
                                            color: '#f87171',
                                            background: 'rgba(248, 113, 113, 0.1)',
                                            border: '1px solid rgba(248, 113, 113, 0.3)',
                                            borderRadius: '8px',
                                            cursor: isProcessing ? 'not-allowed' : 'pointer',
                                            opacity: isProcessing ? 0.5 : 1
                                        }}
                                    >
                                        <XCircle style={{ width: 16, height: 16 }} />
                                        Reject
                                    </button>

                                    <button
                                        onClick={() => onApprove(proposal.id)}
                                        disabled={isProcessing}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            padding: '10px 20px',
                                            fontSize: '13px',
                                            fontWeight: 600,
                                            color: 'white',
                                            background: 'linear-gradient(135deg, #10b981, #22c55e)',
                                            border: 'none',
                                            borderRadius: '8px',
                                            boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
                                            cursor: isProcessing ? 'not-allowed' : 'pointer',
                                            opacity: isProcessing ? 0.5 : 1
                                        }}
                                    >
                                        {isProcessing ? (
                                            <>
                                                <Loader2 style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} />
                                                Processing
                                            </>
                                        ) : (
                                            <>
                                                <Check style={{ width: 16, height: 16 }} />
                                                Approve
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    )

    return createPortal(modalContent, document.body)
}
