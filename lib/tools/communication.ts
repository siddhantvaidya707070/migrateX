/**
 * Communication Tools Layer
 * Handles all external communication actions for the agent
 * 
 * Per spec: These are real interfaces but may mock actual sending
 * if external API keys are not configured
 */

export interface EmailResult {
    success: boolean
    tool: string
    messageId?: string
    error?: string
}

export interface TicketResult {
    success: boolean
    tool: string
    ticketId?: string
    draftId?: string
    error?: string
}

export const CommunicationTools = {
    /**
     * Send internal email alert to team
     * Used for: Platform regressions, high-risk alerts
     */
    async sendInternalEmail(
        to: string,
        subject: string,
        body: string,
        meta: {
            confidence?: number
            risk?: number
            observationId?: string
            classification?: string
        }
    ): Promise<EmailResult> {
        const timestamp = new Date().toISOString()

        // Build structured email body
        const fullBody = `
=== SELF-HEALING AGENT ALERT ===
Time: ${timestamp}
Classification: ${meta.classification || 'Unknown'}
Confidence: ${(meta.confidence || 0) * 100}%
Risk Score: ${meta.risk || 'N/A'}/10
Observation ID: ${meta.observationId || 'N/A'}

--- Details ---
${body}

--- Action Required ---
Please review and take appropriate action.

[This is an automated message from the Self-Healing Support Agent]
        `.trim()

        // In production, integrate with SendGrid/SES
        // For now, log and simulate success
        console.log(`[EMAIL] To: ${to}`)
        console.log(`[EMAIL] Subject: ${subject}`)
        console.log(`[EMAIL] Body Preview: ${body.substring(0, 100)}...`)

        // Mock email sending - replace with real integration
        const mockEmailId = `email_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

        return {
            success: true,
            tool: 'email_internal',
            messageId: mockEmailId
        }
    },

    /**
     * Draft a support ticket response (requires human approval)
     * Used for: merchant_misconfiguration, documentation_gap
     */
    async draftTicketResponse(
        ticketId: string,
        message: string,
        meta: {
            confidence?: number
            hypothesisCause?: string
            observationId?: string
        }
    ): Promise<TicketResult> {
        const draftId = `draft_${Date.now()}_${ticketId}`

        // Build structured response
        const structuredMessage = `
--- Agent-Generated Draft ---
Ticket: ${ticketId}
Confidence: ${(meta.confidence || 0) * 100}%
Based on: ${meta.hypothesisCause || 'Pattern analysis'}

${message}

---
[Draft requires human approval before sending]
        `.trim()

        console.log(`[ZENDESK-DRAFT] Ticket: ${ticketId}`)
        console.log(`[ZENDESK-DRAFT] Message: ${message.substring(0, 100)}...`)

        // In production, create a draft in Zendesk
        return {
            success: true,
            tool: 'draft_ticket',
            ticketId,
            draftId
        }
    },

    /**
     * Automatically send support response (NO human approval needed)
     * ONLY for: Low Risk + High Confidence + merchant_misconfiguration
     * 
     * This is the spec's auto-send capability
     */
    async sendSupportResponse(
        ticketId: string,
        message: string,
        meta: {
            confidence: number
            risk: number
            observationId?: string
        }
    ): Promise<TicketResult> {
        // SAFETY CHECK: Only auto-send for low risk, high confidence
        if (meta.risk > 3) {
            console.error(`[SAFETY] Blocked auto-send: Risk ${meta.risk} > 3`)
            return {
                success: false,
                tool: 'send_support_response',
                error: 'Risk too high for auto-send'
            }
        }

        if (meta.confidence < 0.9) {
            console.error(`[SAFETY] Blocked auto-send: Confidence ${meta.confidence} < 0.9`)
            return {
                success: false,
                tool: 'send_support_response',
                error: 'Confidence too low for auto-send'
            }
        }

        console.log(`[ZENDESK-SEND] Auto-sending to ticket: ${ticketId}`)
        console.log(`[ZENDESK-SEND] Risk: ${meta.risk}, Confidence: ${meta.confidence}`)
        console.log(`[ZENDESK-SEND] Message: ${message.substring(0, 100)}...`)

        // In production, send via Zendesk API
        return {
            success: true,
            tool: 'send_support_response',
            ticketId
        }
    },

    /**
     * Send email specifically to engineering team
     * Used for: Migration errors, escalations
     */
    async emailEngineering(
        subject: string,
        body: string,
        meta: {
            risk: number
            observationId?: string
            fingerprint?: string
        }
    ): Promise<EmailResult> {
        const engineeringEmail = process.env.ENGINEERING_EMAIL || 'engineering@example.com'

        const fullSubject = meta.risk >= 7
            ? `[CRITICAL] ${subject}`
            : `[ALERT] ${subject}`

        return this.sendInternalEmail(
            engineeringEmail,
            fullSubject,
            body,
            {
                risk: meta.risk,
                observationId: meta.observationId,
                classification: 'escalated_to_engineering'
            }
        )
    }
}
