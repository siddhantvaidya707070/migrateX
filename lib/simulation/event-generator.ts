/**
 * Event Generator - Creates unique, contextual, plausible events
 * 
 * Each event is dynamically generated with:
 * - Unique error messages (no duplicates)
 * - Contextual merchant details
 * - Realistic technical specifics
 * - Time-aware context
 */

import { Merchant, getRandomMerchants, getWeightedMerchant } from './merchant-pool'

export type ErrorType =
    | 'checkout_failure'
    | 'documentation_gap'
    | 'webhook_failure'
    | 'auth_failure'
    | 'rate_limit'
    | 'merchant_misconfig'
    | 'platform_regression'

export interface GeneratedEvent {
    id: string
    type: ErrorType
    merchant: Merchant
    timestamp: string
    fingerprint: string
    summary: string
    details: {
        errorCode: string
        errorMessage: string
        endpoint: string
        httpStatus: number
        requestId: string
        userAgent?: string
        ipAddress?: string
        affectedFeature: string
        stackHint?: string
    }
    context: {
        peakHours: boolean
        maintenanceWindow: boolean
        recentDeploy: boolean
        merchantTier: string
    }
    metadata: Record<string, any>
}

// ============================================
// ERROR VARIATION POOLS
// ============================================

const CHECKOUT_ERRORS = {
    messages: [
        (m: Merchant) => `Payment authorization timed out after 30s for ${m.name}'s checkout flow`,
        (m: Merchant) => `Card network unreachable during ${m.name} transaction processing`,
        (m: Merchant) => `3DS verification expired before customer completion at ${m.name}`,
        (m: Merchant) => `Insufficient funds response not properly handled for ${m.name} cart`,
        (m: Merchant) => `Idempotency key collision detected in ${m.name}'s retry logic`,
        (m: Merchant) => `Currency conversion failed mid-transaction for ${m.name} (${m.monthlyVolume} volume)`,
        (m: Merchant) => `Payment intent stuck in 'processing' state for ${m.name} order`,
        (m: Merchant) => `Webhook confirmation not received within SLA for ${m.name}`,
        (m: Merchant) => `Partial capture rejected by issuer for ${m.name}'s split payment`,
        (m: Merchant) => `Session token expired during ${m.name}'s multi-step checkout`,
        (m: Merchant) => `Apple Pay domain verification failing for ${m.name}'s mobile checkout`,
        (m: Merchant) => `Stripe.js failed to load on ${m.name}'s payment page (CSP issue)`,
        (m: Merchant) => `PaymentElement mount error in ${m.name}'s React component`,
        (m: Merchant) => `Klarna BNPL flow returning unexpected redirect for ${m.name}`,
        (m: Merchant) => `Affirm pre-qualification silently failing for ${m.name} customers`,
        (m: Merchant) => `Google Pay button not rendering on ${m.name}'s mobile site`,
        (m: Merchant) => `Link wallet authentication loop detected at ${m.name}`,
        (m: Merchant) => `ACH mandate collection timing out for ${m.name}'s subscription`,
        (m: Merchant) => `SEPA direct debit mandate rejected for ${m.name} EU customers`,
        (m: Merchant) => `Boleto generation failing for ${m.name}'s Brazil expansion`
    ],
    codes: ['PMT001', 'PMT002', 'PMT003', 'PMT004', 'PMT005', 'AUTH_TIMEOUT', 'CARD_DECLINED', 'NETWORK_ERR', '3DS_FAIL', 'INTENT_STUCK'],
    endpoints: ['/v1/payment_intents', '/v1/checkout/sessions', '/v1/charges', '/v1/payment_methods', '/v1/setup_intents'],
    statuses: [400, 402, 408, 500, 502, 503, 504]
}

const DOC_GAP_ERRORS = {
    messages: [
        (m: Merchant) => `${m.contactName} from ${m.name} confused about expand[] parameter behavior`,
        (m: Merchant) => `${m.name} dev team asking why metadata field is silently truncated at 500 chars`,
        (m: Merchant) => `Webhook signing secret rotation process unclear to ${m.name} engineering`,
        (m: Merchant) => `${m.name} unable to find documentation for ${m.apiVersion} versioning behavior`,
        (m: Merchant) => `Error response structure differs from docs according to ${m.name}`,
        (m: Merchant) => `${m.contactName} reports pagination cursor expiration not documented`,
        (m: Merchant) => `${m.name} confused about idempotency key scope across API versions`,
        (m: Merchant) => `Rate limit headers undocumented for ${m.name}'s integration`,
        (m: Merchant) => `${m.name} unable to find test mode vs live mode behavioral differences`,
        (m: Merchant) => `Webhook event ordering guarantees unclear to ${m.name}`,
        (m: Merchant) => `${m.name} asking about deprecated field migration timeline`,
        (m: Merchant) => `Connect platform documentation missing for ${m.name}'s marketplace setup`,
        (m: Merchant) => `${m.contactName} confused about destination vs on_behalf_of semantics`,
        (m: Merchant) => `Billing portal customization options not documented for ${m.name}`,
        (m: Merchant) => `${m.name} unable to find radar rule testing documentation`
    ],
    codes: ['DOC001', 'DOC002', 'DOC003', 'UNCLEAR_SPEC', 'MISSING_EXAMPLE', 'STALE_DOCS'],
    endpoints: ['/docs/api', '/docs/webhooks', '/docs/connect', '/docs/billing', '/docs/radar'],
    statuses: [200, 400, 422]
}

const WEBHOOK_ERRORS = {
    messages: [
        (m: Merchant) => `Webhook endpoint at ${m.name} returning 502 for payment_intent.succeeded`,
        (m: Merchant) => `${m.name}'s webhook handler timing out after 10s consistently`,
        (m: Merchant) => `Signature verification failing for ${m.name} (clock skew suspected)`,
        (m: Merchant) => `${m.name} endpoint SSL certificate expired, webhooks failing`,
        (m: Merchant) => `Duplicate webhook events being processed by ${m.name}'s system`,
        (m: Merchant) => `${m.name} webhook endpoint returning 200 but not processing events`,
        (m: Merchant) => `Event ordering causing race conditions in ${m.name}'s fulfillment`,
        (m: Merchant) => `${m.name}'s webhook queue backed up, 500+ events pending`,
        (m: Merchant) => `Checkout.session.completed not firing for ${m.name}'s hosted pages`,
        (m: Merchant) => `${m.name} receiving customer.created but not subscription.created`,
        (m: Merchant) => `Invoice.paid webhook delayed 45+ minutes for ${m.name}`,
        (m: Merchant) => `${m.name}'s firewall blocking webhook IPs after security update`,
        (m: Merchant) => `Test mode webhooks working but live mode failing for ${m.name}`,
        (m: Merchant) => `${m.name} endpoint returning HTML error page instead of JSON`,
        (m: Merchant) => `Webhook retry exhausted for ${m.name}, events dropped`
    ],
    codes: ['WH001', 'WH002', 'WH003', 'SIG_MISMATCH', 'ENDPOINT_ERROR', 'TIMEOUT', 'SSL_ERR'],
    endpoints: ['/webhooks', '/api/stripe-webhook', '/stripe/events', '/payment-notifications'],
    statuses: [408, 500, 502, 503, 504, 521, 522]
}

const AUTH_ERRORS = {
    messages: [
        (m: Merchant) => `${m.name}'s API key rejected with 'Invalid API Key provided' error`,
        (m: Merchant) => `Restricted key missing required permission for ${m.name}'s operation`,
        (m: Merchant) => `${m.name} accidentally using test key in production environment`,
        (m: Merchant) => `OAuth token expired for ${m.name}'s Connect integration`,
        (m: Merchant) => `${m.contactName} reports API key rotation broke their integration`,
        (m: Merchant) => `${m.name}'s service account permissions insufficient for bulk operations`,
        (m: Merchant) => `Cross-account access attempt detected from ${m.name}'s infrastructure`,
        (m: Merchant) => `${m.name} calling with deleted/revoked API key (key_xxx...xxx)`,
        (m: Merchant) => `Bearer token missing from ${m.name}'s webhook verification call`,
        (m: Merchant) => `${m.name}'s key has account-level restrictions preventing operation`
    ],
    codes: ['AUTH001', 'AUTH002', 'AUTH003', 'KEY_INVALID', 'KEY_EXPIRED', 'PERM_DENIED', 'TOKEN_EXPIRED'],
    endpoints: ['/v1/account', '/v1/customers', '/v1/subscriptions', '/oauth/token', '/v1/connect/accounts'],
    statuses: [401, 403]
}

const RATE_LIMIT_ERRORS = {
    messages: [
        (m: Merchant) => `${m.name} hitting rate limit during flash sale event (${m.monthlyVolume} account)`,
        (m: Merchant) => `Bulk customer import from ${m.name} triggering backoff requirements`,
        (m: Merchant) => `${m.name}'s retry logic not respecting Retry-After header`,
        (m: Merchant) => `Concurrent requests from ${m.name} exceeding per-second limit`,
        (m: Merchant) => `${m.name}'s webhook handler making too many verification calls`,
        (m: Merchant) => `Search API rate limit exceeded by ${m.name}'s reporting dashboard`,
        (m: Merchant) => `${m.name} batch operations triggering global rate limiter`,
        (m: Merchant) => `List endpoints pagination causing rate limit for ${m.name}`,
        (m: Merchant) => `${m.name}'s monitoring system polling too frequently`,
        (m: Merchant) => `Subscription billing run for ${m.name} hitting transaction limits`
    ],
    codes: ['RATE001', 'RATE002', 'RATE003', 'TOO_MANY_REQUESTS', 'QUOTA_EXCEEDED'],
    endpoints: ['/v1/customers', '/v1/subscriptions', '/v1/invoices/search', '/v1/charges', '/v1/payment_intents'],
    statuses: [429]
}

const MISCONFIG_ERRORS = {
    messages: [
        (m: Merchant) => `${m.name} webhook endpoint URL includes localhost reference`,
        (m: Merchant) => `Statement descriptor exceeds 22 char limit for ${m.name}`,
        (m: Merchant) => `${m.name}'s Stripe.js using deprecated initialization pattern`,
        (m: Merchant) => `Currency mismatch between ${m.name}'s frontend and backend`,
        (m: Merchant) => `${m.name} missing required metadata fields for compliance`,
        (m: Merchant) => `Webhook events filtering misconfigured for ${m.name}'s endpoint`,
        (m: Merchant) => `${m.name}'s subscription schedule using invalid billing_cycle_anchor`,
        (m: Merchant) => `Customer portal redirect URL invalid for ${m.name}`,
        (m: Merchant) => `${m.name} passing deprecated parameter 'source' instead of 'payment_method'`,
        (m: Merchant) => `Tax ID collection enabled but form not rendered for ${m.name}`,
        (m: Merchant) => `${m.name}'s trial period exceeds plan maximum (730 days)`,
        (m: Merchant) => `Metered billing quantity negative for ${m.name}'s usage record`,
        (m: Merchant) => `${m.name} creating customers without email, breaking receipts`,
        (m: Merchant) => `Shipping address schema invalid for ${m.name}'s checkout`,
        (m: Merchant) => `${m.name}'s Elements styling causing z-index collision`
    ],
    codes: ['CFG001', 'CFG002', 'CFG003', 'INVALID_PARAM', 'DEPRECATED', 'SCHEMA_ERR'],
    endpoints: ['/v1/checkout/sessions', '/v1/subscriptions', '/v1/invoices', '/v1/customers', '/v1/prices'],
    statuses: [400, 422]
}

const PLATFORM_ERRORS = {
    messages: [
        (m: Merchant) => `API latency spike affecting all ${m.size} tier merchants including ${m.name}`,
        (m: Merchant) => `Checkout session creation returning 503 for ${m.name} (and others)`,
        (m: Merchant) => `Payment intent confirmation hanging for multiple merchants (${m.name} reported first)`,
        (m: Merchant) => `Webhook delivery delayed 30+ minutes affecting ${m.name} operations`,
        (m: Merchant) => `Dashboard not loading balance for ${m.name} and similar accounts`,
        (m: Merchant) => `Invoice PDF generation timing out systemwide (${m.name} escalated)`,
        (m: Merchant) => `Search API returning stale results post-migration (${m.name} noticed)`,
        (m: Merchant) => `Connect payout timing changed unexpectedly for ${m.name}'s platform`,
        (m: Merchant) => `3DS authentication provider returning errors for ${m.name} region`,
        (m: Merchant) => `Radar rules not evaluating correctly post-deploy (${m.name} flagged)`,
        (m: Merchant) => `Customer portal error 500 affecting all merchants in ${m.timezone}`,
        (m: Merchant) => `Billing meter events not recording for ${m.name} and others`,
        (m: Merchant) => `Identity verification flow broken after API update (${m.name} blocked)`,
        (m: Merchant) => `Terminal reader pairing failing for ${m.name}'s POS rollout`,
        (m: Merchant) => `Tax calculation service returning 504 (reported by ${m.name})`
    ],
    codes: ['SYS001', 'SYS002', 'SYS003', 'PLATFORM_ERR', 'SERVICE_DEGRADED', 'INCIDENT'],
    endpoints: ['/v1/charges', '/v1/payment_intents', '/v1/checkout/sessions', '/v1/invoices', '/v1/radar/rules'],
    statuses: [500, 502, 503, 504, 520, 521, 522]
}

// ============================================
// UNIQUE CONTENT GENERATORS
// ============================================

const TECHNICAL_CONTEXTS = [
    'during peak traffic window',
    'after recent infrastructure update',
    'following migration to v3 API',
    'since enabling strong customer authentication',
    'after switching to Stripe Billing',
    'post Connect account onboarding',
    'during subscription renewal cycle',
    'after enabling fraud radar',
    'since updating webhook version',
    'following Stripe.js upgrade'
]

const IMPACT_DESCRIPTIONS = [
    'affecting checkout conversion',
    'blocking new customer signups',
    'preventing subscription renewals',
    'causing cart abandonment',
    'triggering customer complaints',
    'impacting revenue recognition',
    'degrading customer experience',
    'causing reconciliation issues',
    'blocking payouts to connected accounts',
    'preventing order fulfillment'
]

const USER_AGENTS = [
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_2) Safari/17.2',
    'Mozilla/5.0 (Linux; Android 14) Chrome/120.0.0.0 Mobile',
    'StripeAPI/v1 node/20.10.0',
    'StripeAPI/v1 python/3.12.0',
    'StripeAPI/v1 ruby/3.3.0',
    'StripeAPI/v1 go/1.21.5',
    'Postman/10.21.0'
]

// ============================================
// GENERATOR FUNCTIONS
// ============================================

function generateRequestId(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
    let id = 'req_'
    for (let i = 0; i < 24; i++) {
        id += chars[Math.floor(Math.random() * chars.length)]
    }
    return id
}

function generateIP(): string {
    const ranges = [
        () => `${Math.floor(Math.random() * 200) + 10}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        () => `2001:db8:${Math.floor(Math.random() * 9999)}::${Math.floor(Math.random() * 9999)}`
    ]
    return ranges[Math.floor(Math.random() * ranges.length)]()
}

function getErrorPools(type: ErrorType) {
    switch (type) {
        case 'checkout_failure': return CHECKOUT_ERRORS
        case 'documentation_gap': return DOC_GAP_ERRORS
        case 'webhook_failure': return WEBHOOK_ERRORS
        case 'auth_failure': return AUTH_ERRORS
        case 'rate_limit': return RATE_LIMIT_ERRORS
        case 'merchant_misconfig': return MISCONFIG_ERRORS
        case 'platform_regression': return PLATFORM_ERRORS
        default: return CHECKOUT_ERRORS
    }
}

function generateFingerprint(type: ErrorType, merchant: Merchant): string {
    const components = [
        type.replace(/_/g, '-'),
        merchant.industry.toLowerCase().replace(/\s+/g, '-').substring(0, 15),
        merchant.apiVersion.replace('.', ''),
        Date.now().toString(36).substring(-4)
    ]
    return components.join('::')
}

// ============================================
// MAIN GENERATOR
// ============================================

export function generateEvent(
    type: ErrorType,
    riskProfile: 'low' | 'medium' | 'high',
    merchant?: Merchant
): GeneratedEvent {
    const selectedMerchant = merchant || getWeightedMerchant(riskProfile)
    const pool = getErrorPools(type)

    // Get unique message (not used before in this session ideally)
    const messageFn = pool.messages[Math.floor(Math.random() * pool.messages.length)]
    const message = messageFn(selectedMerchant)

    // Add contextual flavor
    const technicalContext = TECHNICAL_CONTEXTS[Math.floor(Math.random() * TECHNICAL_CONTEXTS.length)]
    const impact = IMPACT_DESCRIPTIONS[Math.floor(Math.random() * IMPACT_DESCRIPTIONS.length)]

    const event: GeneratedEvent = {
        id: crypto.randomUUID(),
        type,
        merchant: selectedMerchant,
        timestamp: new Date().toISOString(),
        fingerprint: generateFingerprint(type, selectedMerchant),
        summary: `${message} ${technicalContext}`,
        details: {
            errorCode: pool.codes[Math.floor(Math.random() * pool.codes.length)],
            errorMessage: message,
            endpoint: pool.endpoints[Math.floor(Math.random() * pool.endpoints.length)],
            httpStatus: pool.statuses[Math.floor(Math.random() * pool.statuses.length)],
            requestId: generateRequestId(),
            userAgent: USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)],
            ipAddress: generateIP(),
            affectedFeature: type.replace(/_/g, ' '),
            stackHint: type === 'platform_regression' ? 'payment-service:checkout-handler:L847' : undefined
        },
        context: {
            peakHours: Math.random() > 0.6,
            maintenanceWindow: Math.random() > 0.9,
            recentDeploy: Math.random() > 0.7,
            merchantTier: selectedMerchant.size
        },
        metadata: {
            industy: selectedMerchant.industry,
            integrationAge: selectedMerchant.integrationAge,
            apiVersion: selectedMerchant.apiVersion,
            webhookEnabled: selectedMerchant.webhookConfig.enabled,
            impact,
            contactEmail: selectedMerchant.contactEmail
        }
    }

    return event
}

/**
 * Generate a batch of unique events
 */
export function generateEventBatch(
    types: ErrorType[],
    riskProfiles: ('low' | 'medium' | 'high')[],
    count: number,
    merchantCount: number
): GeneratedEvent[] {
    const merchants = getRandomMerchants(merchantCount)
    const events: GeneratedEvent[] = []

    for (let i = 0; i < count; i++) {
        const type = types[Math.floor(Math.random() * types.length)]
        const risk = riskProfiles[Math.floor(Math.random() * riskProfiles.length)]
        const merchant = merchants[Math.floor(Math.random() * merchants.length)]

        events.push(generateEvent(type, risk, merchant))
    }

    return events
}

/**
 * Generate events for database insertion
 */
export function generateEventsForDB(
    types: ErrorType[],
    riskProfiles: ('low' | 'medium' | 'high')[],
    count: number,
    merchantCount: number,
    runId: string
) {
    const events = generateEventBatch(types, riskProfiles, count, merchantCount)

    return events.map(e => ({
        event_type: e.type,
        raw_data: {
            message: e.details.errorMessage,
            code: e.details.errorCode,
            endpoint: e.details.endpoint,
            http_status: e.details.httpStatus,
            request_id: e.details.requestId,
            user_agent: e.details.userAgent,
            ip_address: e.details.ipAddress,
            context: e.context
        },
        source: 'simulation',
        merchant_id: e.merchant.id,
        metadata: e.metadata,
        simulation_run_id: runId,
        fingerprint_hint: e.fingerprint,
        processed: false
    }))
}
