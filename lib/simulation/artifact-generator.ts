/**
 * Artifact Generator - Creates unique email, ticket, and chatbot content
 * 
 * Every artifact is dynamically generated with:
 * - Unique phrasing (same structure, different words)
 * - Contextual details from the observation/decision
 * - Realistic operational tone
 * - Varied urgency and formality
 */

import { Merchant } from './merchant-pool'

export type ArtifactType = 'internal_email' | 'ticket_reply' | 'chatbot_response' | 'merchant_notice'
export type RecipientType = 'support' | 'engineering' | 'ops' | 'merchant' | 'leadership'
export type UrgencyLevel = 'low' | 'normal' | 'high' | 'critical'

export interface ArtifactContext {
    merchant: Merchant
    errorType: string
    summary: string
    hypothesis: string
    confidence: number
    riskScore: number
    affectedCount: number
    recommendation: string
    fingerprint?: string
    observationId?: string
}

export interface GeneratedArtifact {
    type: ArtifactType
    subject: string
    body: string
    recipientType: RecipientType
    recipientName: string
    recipientEmail: string
    senderName: string
    urgency: UrgencyLevel
    metadata: Record<string, any>
}

// ============================================
// VARIATION POOLS FOR UNIQUE CONTENT
// ============================================

const GREETINGS = {
    formal: ['Dear', 'Hello', 'Good morning,', 'Good afternoon,'],
    casual: ['Hi', 'Hey', 'Hi there,'],
    team: ['Hi team,', 'Team,', 'All,', 'Hey everyone,']
}

const OPENING_PHRASES = [
    "I wanted to flag",
    "We've identified",
    "I'm reaching out regarding",
    "This is to inform you about",
    "Bringing to your attention",
    "Heads up on",
    "Quick update regarding",
    "Following up on",
    "I need to escalate",
    "Alerting you to"
]

const IMPACT_PHRASES = [
    "This is currently affecting",
    "We're seeing impact on",
    "This has resulted in",
    "The issue is causing",
    "We've observed",
    "This is blocking",
    "There's been degradation in"
]

const RECOMMENDATION_INTROS = [
    "Based on our analysis, we recommend",
    "Our system suggests",
    "The recommended action is to",
    "We advise",
    "The best course of action would be to",
    "Consider",
    "We should"
]

const CLOSINGS = {
    urgent: [
        "Please prioritize this.",
        "Immediate attention required.",
        "Let's sync ASAP.",
        "Standing by for your response.",
        "Time-sensitive — please respond when you can."
    ],
    normal: [
        "Let me know if you have questions.",
        "Happy to discuss further.",
        "Feel free to reach out if needed.",
        "Thanks for looking into this.",
        "Appreciate your attention to this."
    ],
    casual: [
        "Thanks!",
        "Cheers,",
        "Best,",
        "Talk soon,",
        "Thanks again,"
    ]
}

const CONFIDENCE_DESCRIPTIONS = [
    (c: number) => c >= 0.9 ? "We're highly confident" : c >= 0.7 ? "We believe" : c >= 0.5 ? "It appears that" : "We suspect",
    (c: number) => c >= 0.9 ? "Our analysis strongly indicates" : c >= 0.7 ? "Analysis suggests" : "Initial findings point to"
]

const TEAM_NAMES = {
    engineering: ['Platform Team', 'Payments Engineering', 'Infrastructure', 'Core Systems', 'API Team'],
    support: ['Support Team', 'Customer Success', 'Merchant Support', 'Partner Support'],
    ops: ['Operations', 'Site Reliability', 'Production Support', 'Incident Response'],
    leadership: ['Leadership', 'Management', 'Exec Team']
}

const SENDER_NAMES = [
    'Support Agent',
    'Platform Monitor',
    'Incident Bot',
    'System Alert',
    'Auto-Responder'
]

// ============================================
// HELPER FUNCTIONS
// ============================================

function pick<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)]
}

function getUrgency(riskScore: number): UrgencyLevel {
    if (riskScore >= 8) return 'critical'
    if (riskScore >= 6) return 'high'
    if (riskScore >= 3) return 'normal'
    return 'low'
}

function formatRiskBadge(score: number): string {
    if (score >= 8) return '🔴 CRITICAL'
    if (score >= 6) return '🟠 HIGH'
    if (score >= 3) return '🟡 MEDIUM'
    return '🟢 LOW'
}

function formatConfidence(confidence: number): string {
    return `${Math.round(confidence * 100)}%`
}

// ============================================
// INTERNAL EMAIL GENERATOR
// ============================================

export function generateInternalEmail(
    context: ArtifactContext,
    recipientType: 'engineering' | 'support' | 'ops' | 'leadership' = 'engineering'
): GeneratedArtifact {
    const urgency = getUrgency(context.riskScore)
    const teamName = pick(TEAM_NAMES[recipientType])
    const confidenceDesc = pick(CONFIDENCE_DESCRIPTIONS)(context.confidence)

    // Build unique subject
    const subjectPrefix = urgency === 'critical' ? '[URGENT] ' : urgency === 'high' ? '[Action Required] ' : ''
    const subject = `${subjectPrefix}${context.errorType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} - ${context.merchant.name}`

    // Build unique body
    const greeting = urgency === 'critical' ? 'Team,' : pick(GREETINGS.team)
    const opening = pick(OPENING_PHRASES)
    const impactPhrase = pick(IMPACT_PHRASES)
    const recIntro = pick(RECOMMENDATION_INTROS)
    const closing = urgency === 'critical' ? pick(CLOSINGS.urgent) : pick(CLOSINGS.normal)

    const body = `${greeting}

${opening} an issue affecting **${context.merchant.name}** (${context.merchant.industry}).

**Summary:**
${context.summary}

**Impact:**
${impactPhrase} ${context.affectedCount} ${context.affectedCount === 1 ? 'merchant' : 'merchants'}.
- Merchant tier: ${context.merchant.size}
- Monthly volume: ${context.merchant.monthlyVolume}
- Integration: ${context.merchant.integrationAge} (${context.merchant.apiVersion})

**Analysis:**
${confidenceDesc} the root cause is: ${context.hypothesis}

**Risk Assessment:**
- Score: ${context.riskScore}/10 ${formatRiskBadge(context.riskScore)}
- Confidence: ${formatConfidence(context.confidence)}

**Recommendation:**
${recIntro} ${context.recommendation}.

**Reference:**
- Observation ID: ${context.observationId || 'N/A'}
- Fingerprint: ${context.fingerprint || 'N/A'}
- Contact: ${context.merchant.contactName} <${context.merchant.contactEmail}>

${closing}

— ${pick(SENDER_NAMES)}`

    return {
        type: 'internal_email',
        subject,
        body,
        recipientType,
        recipientName: teamName,
        recipientEmail: `${recipientType}@internal.example.com`,
        senderName: pick(SENDER_NAMES),
        urgency,
        metadata: {
            merchantId: context.merchant.id,
            errorType: context.errorType,
            riskScore: context.riskScore,
            observationId: context.observationId
        }
    }
}

// ============================================
// TICKET REPLY GENERATOR
// ============================================

const TICKET_OPENINGS = [
    (name: string) => `Hi ${name},`,
    (name: string) => `Hello ${name},`,
    (name: string) => `Dear ${name},`,
    (name: string) => `Thanks for reaching out, ${name}.`,
    (name: string) => `Appreciate you contacting us, ${name}.`
]

const TICKET_ACKNOWLEDGMENTS = [
    "Thank you for reporting this issue.",
    "We appreciate you bringing this to our attention.",
    "Thanks for the detailed report.",
    "We've looked into the issue you reported.",
    "We understand this is impacting your business."
]

const RESOLUTION_INTROS = [
    "Based on our investigation,",
    "After reviewing your account,",
    "Our team has identified that",
    "Looking at the details,",
    "Upon analysis,"
]

const RESOLUTION_STEPS_TEMPLATES = {
    checkout_failure: [
        "1. Clear your browser cache and retry the transaction",
        "2. Verify your API keys are correctly configured in your dashboard",
        "3. Ensure your Stripe.js version is up to date",
        "4. Check that your webhook endpoint is responding correctly"
    ],
    documentation_gap: [
        "1. We've updated our documentation to clarify this behavior",
        "2. Please refer to the updated guide at docs.stripe.com/[section]",
        "3. Our team will reach out with additional examples",
        "4. Let us know if further clarification is needed"
    ],
    webhook_failure: [
        "1. Verify your webhook signing secret matches your dashboard",
        "2. Ensure your endpoint returns 200 OK promptly",
        "3. Check for clock skew on your server (±5 min tolerance)",
        "4. Confirm your firewall allows Stripe webhook IPs"
    ],
    auth_failure: [
        "1. Regenerate your API keys from the dashboard",
        "2. Verify you're using the correct key (test vs live)",
        "3. Check that restricted keys have required permissions",
        "4. Update your environment variables and redeploy"
    ],
    rate_limit: [
        "1. Implement exponential backoff in your retry logic",
        "2. Batch operations where possible to reduce API calls",
        "3. Cache responses that don't change frequently",
        "4. Contact us about rate limit increases if needed"
    ],
    merchant_misconfig: [
        "1. Review your integration settings in the dashboard",
        "2. Verify parameter formats match our API specification",
        "3. Test changes in test mode before going live",
        "4. Reach out if you need help with configuration"
    ],
    platform_regression: [
        "1. Our team is actively investigating this issue",
        "2. We'll provide updates on status.stripe.com",
        "3. No action required from your side at this time",
        "4. We'll notify you once the issue is resolved"
    ]
}

const TICKET_CLOSINGS = [
    "Let us know if you have any other questions.",
    "We're here to help if you need anything else.",
    "Don't hesitate to reach out if issues persist.",
    "We appreciate your patience while we resolved this.",
    "Thanks for being a valued partner."
]

export function generateTicketReply(
    context: ArtifactContext,
    ticketId?: string
): GeneratedArtifact {
    const opening = pick(TICKET_OPENINGS)(context.merchant.contactName.split(' ')[0])
    const acknowledgment = pick(TICKET_ACKNOWLEDGMENTS)
    const resolutionIntro = pick(RESOLUTION_INTROS)

    // Get appropriate resolution steps
    const errorKey = context.errorType as keyof typeof RESOLUTION_STEPS_TEMPLATES
    const steps = RESOLUTION_STEPS_TEMPLATES[errorKey] || RESOLUTION_STEPS_TEMPLATES.checkout_failure

    // Randomly select 2-3 steps to vary content
    const selectedSteps = [...steps].sort(() => Math.random() - 0.5).slice(0, 2 + Math.floor(Math.random() * 2))

    const closing = pick(TICKET_CLOSINGS)

    const body = `${opening}

${acknowledgment}

${resolutionIntro} this appears to be related to: **${context.hypothesis}**

**What we found:**
${context.summary}

**Recommended Steps:**
${selectedSteps.map((s, i) => `${i + 1}. ${s.replace(/^\d+\.\s*/, '')}`).join('\n')}

${context.riskScore >= 6 ? `\n**Priority Note:** Given the impact level, our team will follow up proactively to ensure resolution.\n` : ''}

${closing}

Best regards,
Support Team

---
*Ticket ID: ${ticketId || 'TKT-' + Math.random().toString(36).substring(2, 8).toUpperCase()}*
*Reference: ${context.fingerprint || 'N/A'}*`

    return {
        type: 'ticket_reply',
        subject: `Re: ${context.errorType.replace(/_/g, ' ')} - Case Update`,
        body,
        recipientType: 'merchant',
        recipientName: context.merchant.contactName,
        recipientEmail: context.merchant.contactEmail,
        senderName: 'Support Team',
        urgency: getUrgency(context.riskScore),
        metadata: {
            ticketId,
            merchantId: context.merchant.id,
            errorType: context.errorType
        }
    }
}

// ============================================
// CHATBOT RESPONSE GENERATOR
// ============================================

const CHATBOT_GREETINGS = [
    "Hi there! 👋",
    "Hello!",
    "Hey there!",
    "Hi! Thanks for reaching out.",
    "Hello! I'm here to help."
]

const CHATBOT_TRANSITIONS = [
    "I've looked into this and here's what I found:",
    "Let me explain what's happening:",
    "Here's what I've discovered:",
    "Based on my analysis:",
    "I think I can help with this:"
]

const CHATBOT_HELPS = [
    "Need more help? I'm here!",
    "👆 Try these steps and let me know!",
    "Should I connect you with a human agent?",
    "Does this help? Let me know if you have questions!",
    "I can escalate this if you'd like."
]

export function generateChatbotResponse(
    context: ArtifactContext
): GeneratedArtifact {
    const greeting = pick(CHATBOT_GREETINGS)
    const transition = pick(CHATBOT_TRANSITIONS)
    const help = pick(CHATBOT_HELPS)

    // Shorter, more conversational format
    const errorKey = context.errorType as keyof typeof RESOLUTION_STEPS_TEMPLATES
    const steps = RESOLUTION_STEPS_TEMPLATES[errorKey] || RESOLUTION_STEPS_TEMPLATES.checkout_failure
    const quickTips = steps.slice(0, 2).map(s => `• ${s.replace(/^\d+\.\s*/, '')}`)

    const body = `${greeting}

${transition}

**Issue:** ${context.hypothesis}

**Quick Tips:**
${quickTips.join('\n')}

${context.riskScore >= 6 ? '⚠️ This seems urgent — I\'ll flag this for priority review.' : ''}

${help}`

    return {
        type: 'chatbot_response',
        subject: 'Chat Support Response',
        body,
        recipientType: 'merchant',
        recipientName: context.merchant.contactName,
        recipientEmail: context.merchant.contactEmail,
        senderName: 'Support Bot',
        urgency: getUrgency(context.riskScore),
        metadata: {
            sessionId: 'chat_' + Math.random().toString(36).substring(2, 10),
            merchantId: context.merchant.id
        }
    }
}

// ============================================
// MERCHANT NOTICE GENERATOR
// ============================================

const NOTICE_SUBJECTS = [
    (type: string) => `Action Required: ${type.replace(/_/g, ' ')} affecting your account`,
    (type: string) => `Important: Update regarding your integration`,
    (type: string) => `Notice: ${type.replace(/_/g, ' ')} detected`,
    (type: string) => `Update: We've identified an issue with your account`
]

export function generateMerchantNotice(
    context: ArtifactContext
): GeneratedArtifact {
    const subjectTemplate = pick(NOTICE_SUBJECTS)

    const body = `Dear ${context.merchant.contactName},

We've detected an issue with your ${context.merchant.name} integration that may be affecting your customers.

**What we found:**
${context.summary}

**What this means:**
${context.hypothesis}

**What you should do:**
${context.recommendation}

**Details:**
- Impact Level: ${formatRiskBadge(context.riskScore)}
- Affected Area: ${context.errorType.replace(/_/g, ' ')}
- Reference: ${context.fingerprint || 'N/A'}

If you have questions or need assistance, our support team is ready to help. You can reply to this notice or reach us at support@example.com.

Thank you for your attention to this matter.

Best regards,
The Platform Team

---
*This is an automated notice from our monitoring system.*
*Merchant: ${context.merchant.name} (${context.merchant.id})*`

    return {
        type: 'merchant_notice',
        subject: subjectTemplate(context.errorType),
        body,
        recipientType: 'merchant',
        recipientName: context.merchant.contactName,
        recipientEmail: context.merchant.contactEmail,
        senderName: 'Platform Notifications',
        urgency: getUrgency(context.riskScore),
        metadata: {
            merchantId: context.merchant.id,
            errorType: context.errorType,
            noticeType: 'incident_alert'
        }
    }
}

// ============================================
// UNIFIED GENERATOR
// ============================================

export function generateArtifact(
    type: ArtifactType,
    context: ArtifactContext
): GeneratedArtifact {
    switch (type) {
        case 'internal_email':
            return generateInternalEmail(context)
        case 'ticket_reply':
            return generateTicketReply(context)
        case 'chatbot_response':
            return generateChatbotResponse(context)
        case 'merchant_notice':
            return generateMerchantNotice(context)
        default:
            return generateInternalEmail(context)
    }
}

/**
 * Generate artifact for database insertion
 */
export function generateArtifactForDB(
    type: ArtifactType,
    context: ArtifactContext,
    proposalId?: string
) {
    const artifact = generateArtifact(type, context)

    return {
        proposal_id: proposalId,
        artifact_type: artifact.type,
        subject: artifact.subject,
        body: artifact.body,
        recipient_type: artifact.recipientType,
        recipient_name: artifact.recipientName,
        recipient_email: artifact.recipientEmail,
        sender_name: artifact.senderName,
        urgency: artifact.urgency,
        metadata: artifact.metadata
    }
}
