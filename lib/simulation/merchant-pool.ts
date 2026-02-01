/**
 * Merchant Pool - 50+ Unique Merchants with Creative Names
 * 
 * Each merchant has distinct characteristics affecting simulation behavior:
 * - Industry vertical
 * - Size tier
 * - Integration age
 * - Common failure patterns
 * - API version preferences
 */

export interface Merchant {
    id: string
    name: string
    industry: string
    size: 'startup' | 'smb' | 'mid-market' | 'enterprise'
    integrationAge: 'new' | 'established' | 'legacy'
    apiVersion: string
    webhookConfig: {
        enabled: boolean
        version: string
        retryPolicy: 'none' | 'basic' | 'exponential'
    }
    commonIssues: string[]
    contactName: string
    contactEmail: string
    timezone: string
    monthlyVolume: string
}

// Creative merchant names organized by industry
const MERCHANTS: Merchant[] = [
    // E-COMMERCE (15 merchants)
    {
        id: 'mrc_neonthread',
        name: 'NeonThread',
        industry: 'Fashion E-commerce',
        size: 'mid-market',
        integrationAge: 'established',
        apiVersion: 'v3.2',
        webhookConfig: { enabled: true, version: 'v2', retryPolicy: 'exponential' },
        commonIssues: ['checkout_timeout', 'inventory_sync'],
        contactName: 'Maya Chen',
        contactEmail: 'maya@neonthread.io',
        timezone: 'America/Los_Angeles',
        monthlyVolume: '$2.4M'
    },
    {
        id: 'mrc_velvetcart',
        name: 'VelvetCart',
        industry: 'Luxury Goods',
        size: 'enterprise',
        integrationAge: 'legacy',
        apiVersion: 'v2.8',
        webhookConfig: { enabled: true, version: 'v1', retryPolicy: 'basic' },
        commonIssues: ['high_value_auth', 'fraud_flags'],
        contactName: 'Alessandro Romano',
        contactEmail: 'a.romano@velvetcart.com',
        timezone: 'Europe/Rome',
        monthlyVolume: '$18M'
    },
    {
        id: 'mrc_pixelpantry',
        name: 'PixelPantry',
        industry: 'Digital Downloads',
        size: 'startup',
        integrationAge: 'new',
        apiVersion: 'v3.4',
        webhookConfig: { enabled: true, version: 'v2', retryPolicy: 'exponential' },
        commonIssues: ['webhook_delivery', 'idempotency'],
        contactName: 'Jordan Rivera',
        contactEmail: 'jordan@pixelpantry.co',
        timezone: 'America/New_York',
        monthlyVolume: '$89K'
    },
    {
        id: 'mrc_sunforgehome',
        name: 'SunForge Home',
        industry: 'Home & Garden',
        size: 'smb',
        integrationAge: 'established',
        apiVersion: 'v3.1',
        webhookConfig: { enabled: false, version: 'v1', retryPolicy: 'none' },
        commonIssues: ['shipping_calc', 'tax_calculation'],
        contactName: 'Patricia Nguyen',
        contactEmail: 'patricia@sunforgehome.com',
        timezone: 'America/Chicago',
        monthlyVolume: '$340K'
    },
    {
        id: 'mrc_cobaltgear',
        name: 'CobaltGear',
        industry: 'Sports Equipment',
        size: 'mid-market',
        integrationAge: 'established',
        apiVersion: 'v3.2',
        webhookConfig: { enabled: true, version: 'v2', retryPolicy: 'basic' },
        commonIssues: ['inventory_oversell', 'refund_timing'],
        contactName: 'Marcus Thompson',
        contactEmail: 'marcus.t@cobaltgear.io',
        timezone: 'America/Denver',
        monthlyVolume: '$1.8M'
    },
    {
        id: 'mrc_emberlux',
        name: 'EmberLux',
        industry: 'Jewelry',
        size: 'smb',
        integrationAge: 'new',
        apiVersion: 'v3.4',
        webhookConfig: { enabled: true, version: 'v2', retryPolicy: 'exponential' },
        commonIssues: ['3ds_auth', 'high_value_decline'],
        contactName: 'Sofia Martinez',
        contactEmail: 'sofia@emberlux.co',
        timezone: 'America/Los_Angeles',
        monthlyVolume: '$520K'
    },
    {
        id: 'mrc_frostbyte',
        name: 'FrostByte Electronics',
        industry: 'Consumer Electronics',
        size: 'enterprise',
        integrationAge: 'established',
        apiVersion: 'v3.0',
        webhookConfig: { enabled: true, version: 'v2', retryPolicy: 'exponential' },
        commonIssues: ['large_cart_timeout', 'partial_capture'],
        contactName: 'Daniel Kim',
        contactEmail: 'd.kim@frostbyte.tech',
        timezone: 'Asia/Seoul',
        monthlyVolume: '$12M'
    },
    {
        id: 'mrc_willowmade',
        name: 'WillowMade',
        industry: 'Handmade Crafts',
        size: 'startup',
        integrationAge: 'new',
        apiVersion: 'v3.4',
        webhookConfig: { enabled: false, version: 'v2', retryPolicy: 'none' },
        commonIssues: ['webhook_missing', 'api_key_rotation'],
        contactName: 'Emma Brooks',
        contactEmail: 'emma@willowmade.shop',
        timezone: 'Europe/London',
        monthlyVolume: '$45K'
    },
    {
        id: 'mrc_vantablack',
        name: 'VantaBlack Streetwear',
        industry: 'Urban Fashion',
        size: 'mid-market',
        integrationAge: 'established',
        apiVersion: 'v3.2',
        webhookConfig: { enabled: true, version: 'v2', retryPolicy: 'basic' },
        commonIssues: ['high_traffic_spikes', 'rate_limits'],
        contactName: 'Jaylen Washington',
        contactEmail: 'jay@vantablackwear.com',
        timezone: 'America/New_York',
        monthlyVolume: '$3.2M'
    },
    {
        id: 'mrc_terracove',
        name: 'TerraCove Outdoors',
        industry: 'Outdoor Gear',
        size: 'smb',
        integrationAge: 'established',
        apiVersion: 'v3.1',
        webhookConfig: { enabled: true, version: 'v1', retryPolicy: 'basic' },
        commonIssues: ['seasonal_traffic', 'preorder_flow'],
        contactName: 'Hannah Miller',
        contactEmail: 'hannah@terracove.co',
        timezone: 'America/Denver',
        monthlyVolume: '$890K'
    },
    {
        id: 'mrc_chromawheel',
        name: 'ChromaWheel',
        industry: 'Art Supplies',
        size: 'smb',
        integrationAge: 'new',
        apiVersion: 'v3.3',
        webhookConfig: { enabled: true, version: 'v2', retryPolicy: 'exponential' },
        commonIssues: ['subscription_billing', 'recurring_auth'],
        contactName: 'Oliver Patel',
        contactEmail: 'oliver@chromawheel.art',
        timezone: 'Europe/London',
        monthlyVolume: '$280K'
    },
    {
        id: 'mrc_ironpetal',
        name: 'IronPetal',
        industry: 'Fitness & Wellness',
        size: 'mid-market',
        integrationAge: 'established',
        apiVersion: 'v3.2',
        webhookConfig: { enabled: true, version: 'v2', retryPolicy: 'exponential' },
        commonIssues: ['membership_renewal', 'prorated_refunds'],
        contactName: 'Tessa Gonzalez',
        contactEmail: 'tessa@ironpetal.fit',
        timezone: 'America/Los_Angeles',
        monthlyVolume: '$1.5M'
    },
    {
        id: 'mrc_starlumentech',
        name: 'StarLumen Tech',
        industry: 'Smart Home Devices',
        size: 'startup',
        integrationAge: 'new',
        apiVersion: 'v3.4',
        webhookConfig: { enabled: true, version: 'v2', retryPolicy: 'exponential' },
        commonIssues: ['currency_conversion', 'intl_shipping'],
        contactName: 'Aiden Zhao',
        contactEmail: 'aiden@starlumen.io',
        timezone: 'Asia/Singapore',
        monthlyVolume: '$120K'
    },
    {
        id: 'mrc_petalpress',
        name: 'PetalPress',
        industry: 'Print-on-Demand',
        size: 'smb',
        integrationAge: 'established',
        apiVersion: 'v3.1',
        webhookConfig: { enabled: true, version: 'v2', retryPolicy: 'basic' },
        commonIssues: ['custom_metadata', 'order_callback'],
        contactName: 'Clara Jensen',
        contactEmail: 'clara@petalpress.shop',
        timezone: 'Europe/Copenhagen',
        monthlyVolume: '$410K'
    },
    {
        id: 'mrc_quartzlane',
        name: 'QuartzLane Watches',
        industry: 'Luxury Watches',
        size: 'mid-market',
        integrationAge: 'legacy',
        apiVersion: 'v2.9',
        webhookConfig: { enabled: true, version: 'v1', retryPolicy: 'basic' },
        commonIssues: ['fraud_review_queue', 'manual_capture'],
        contactName: 'James Whitmore',
        contactEmail: 'j.whitmore@quartzlane.com',
        timezone: 'Europe/Zurich',
        monthlyVolume: '$4.8M'
    },

    // SAAS & SOFTWARE (12 merchants)
    {
        id: 'mrc_syntaxcloud',
        name: 'SyntaxCloud',
        industry: 'Developer Tools',
        size: 'startup',
        integrationAge: 'new',
        apiVersion: 'v3.4',
        webhookConfig: { enabled: true, version: 'v2', retryPolicy: 'exponential' },
        commonIssues: ['seat_based_billing', 'usage_metering'],
        contactName: 'Noah Fischer',
        contactEmail: 'noah@syntaxcloud.dev',
        timezone: 'America/San_Francisco',
        monthlyVolume: '$67K'
    },
    {
        id: 'mrc_helixops',
        name: 'HelixOps',
        industry: 'DevOps Platform',
        size: 'mid-market',
        integrationAge: 'established',
        apiVersion: 'v3.2',
        webhookConfig: { enabled: true, version: 'v2', retryPolicy: 'exponential' },
        commonIssues: ['enterprise_invoicing', 'po_numbers'],
        contactName: 'Rachel Park',
        contactEmail: 'rachel@helixops.io',
        timezone: 'America/New_York',
        monthlyVolume: '$890K'
    },
    {
        id: 'mrc_datasynth',
        name: 'DataSynth AI',
        industry: 'AI/ML Platform',
        size: 'startup',
        integrationAge: 'new',
        apiVersion: 'v3.4',
        webhookConfig: { enabled: true, version: 'v2', retryPolicy: 'exponential' },
        commonIssues: ['gpu_credit_billing', 'prepaid_exhaustion'],
        contactName: 'Vikram Sharma',
        contactEmail: 'vikram@datasynth.ai',
        timezone: 'Asia/Bangalore',
        monthlyVolume: '$230K'
    },
    {
        id: 'mrc_formflux',
        name: 'FormFlux',
        industry: 'Form Builder SaaS',
        size: 'smb',
        integrationAge: 'established',
        apiVersion: 'v3.2',
        webhookConfig: { enabled: true, version: 'v2', retryPolicy: 'basic' },
        commonIssues: ['plan_upgrade_proration', 'team_billing'],
        contactName: 'Lily Anderson',
        contactEmail: 'lily@formflux.app',
        timezone: 'America/Chicago',
        monthlyVolume: '$340K'
    },
    {
        id: 'mrc_canvascraft',
        name: 'CanvasCraft Pro',
        industry: 'Design Software',
        size: 'enterprise',
        integrationAge: 'established',
        apiVersion: 'v3.1',
        webhookConfig: { enabled: true, version: 'v2', retryPolicy: 'exponential' },
        commonIssues: ['license_activation', 'offline_auth'],
        contactName: 'Ethan Moore',
        contactEmail: 'e.moore@canvascraft.com',
        timezone: 'Europe/Berlin',
        monthlyVolume: '$5.6M'
    },
    {
        id: 'mrc_signalhq',
        name: 'SignalHQ',
        industry: 'Business Intelligence',
        size: 'mid-market',
        integrationAge: 'established',
        apiVersion: 'v3.2',
        webhookConfig: { enabled: true, version: 'v2', retryPolicy: 'exponential' },
        commonIssues: ['data_retention_billing', 'overage_charges'],
        contactName: 'Natalie Wong',
        contactEmail: 'natalie@signalhq.io',
        timezone: 'Asia/Hong_Kong',
        monthlyVolume: '$1.2M'
    },
    {
        id: 'mrc_orbitalcrm',
        name: 'OrbitalCRM',
        industry: 'CRM Platform',
        size: 'enterprise',
        integrationAge: 'legacy',
        apiVersion: 'v2.7',
        webhookConfig: { enabled: true, version: 'v1', retryPolicy: 'basic' },
        commonIssues: ['legacy_migration', 'contract_renewal'],
        contactName: 'William Hayes',
        contactEmail: 'w.hayes@orbitalcrm.com',
        timezone: 'America/New_York',
        monthlyVolume: '$8.4M'
    },
    {
        id: 'mrc_flowstatehr',
        name: 'FlowState HR',
        industry: 'HR Software',
        size: 'smb',
        integrationAge: 'new',
        apiVersion: 'v3.4',
        webhookConfig: { enabled: true, version: 'v2', retryPolicy: 'exponential' },
        commonIssues: ['per_employee_billing', 'payroll_integration'],
        contactName: 'Amanda Chen',
        contactEmail: 'amanda@flowstatehr.com',
        timezone: 'America/Los_Angeles',
        monthlyVolume: '$180K'
    },
    {
        id: 'mrc_vaultedge',
        name: 'VaultEdge Security',
        industry: 'Cybersecurity',
        size: 'mid-market',
        integrationAge: 'established',
        apiVersion: 'v3.2',
        webhookConfig: { enabled: true, version: 'v2', retryPolicy: 'exponential' },
        commonIssues: ['compliance_billing', 'audit_logs'],
        contactName: 'Kyle Richardson',
        contactEmail: 'kyle@vaultedge.io',
        timezone: 'America/Denver',
        monthlyVolume: '$2.1M'
    },
    {
        id: 'mrc_pulseio',
        name: 'Pulse.io',
        industry: 'Analytics Platform',
        size: 'startup',
        integrationAge: 'new',
        apiVersion: 'v3.4',
        webhookConfig: { enabled: true, version: 'v2', retryPolicy: 'exponential' },
        commonIssues: ['event_based_pricing', 'volume_discounts'],
        contactName: 'Zoe Martin',
        contactEmail: 'zoe@pulse.io',
        timezone: 'Europe/London',
        monthlyVolume: '$95K'
    },
    {
        id: 'mrc_taskflow',
        name: 'TaskFlow',
        industry: 'Project Management',
        size: 'smb',
        integrationAge: 'established',
        apiVersion: 'v3.1',
        webhookConfig: { enabled: true, version: 'v2', retryPolicy: 'basic' },
        commonIssues: ['workspace_billing', 'guest_access'],
        contactName: 'Ryan Collins',
        contactEmail: 'ryan@taskflow.app',
        timezone: 'America/Chicago',
        monthlyVolume: '$450K'
    },
    {
        id: 'mrc_codecatalyst',
        name: 'CodeCatalyst',
        industry: 'IDE Cloud',
        size: 'mid-market',
        integrationAge: 'new',
        apiVersion: 'v3.4',
        webhookConfig: { enabled: true, version: 'v2', retryPolicy: 'exponential' },
        commonIssues: ['compute_billing', 'workspace_timeout'],
        contactName: 'Isaac Lee',
        contactEmail: 'isaac@codecatalyst.dev',
        timezone: 'Asia/Tokyo',
        monthlyVolume: '$780K'
    },

    // FINTECH & PAYMENTS (8 merchants)
    {
        id: 'mrc_swiftledger',
        name: 'SwiftLedger',
        industry: 'Accounting Software',
        size: 'mid-market',
        integrationAge: 'established',
        apiVersion: 'v3.2',
        webhookConfig: { enabled: true, version: 'v2', retryPolicy: 'exponential' },
        commonIssues: ['bank_sync', 'reconciliation'],
        contactName: 'Benjamin Scott',
        contactEmail: 'ben@swiftledger.com',
        timezone: 'America/New_York',
        monthlyVolume: '$1.4M'
    },
    {
        id: 'mrc_coinvault',
        name: 'CoinVault',
        industry: 'Crypto Exchange',
        size: 'enterprise',
        integrationAge: 'established',
        apiVersion: 'v3.2',
        webhookConfig: { enabled: true, version: 'v2', retryPolicy: 'exponential' },
        commonIssues: ['kyc_verification', 'withdrawal_limits'],
        contactName: 'Alex Nakamura',
        contactEmail: 'alex@coinvault.io',
        timezone: 'Asia/Singapore',
        monthlyVolume: '$45M'
    },
    {
        id: 'mrc_clearpath',
        name: 'ClearPath Lending',
        industry: 'Online Lending',
        size: 'mid-market',
        integrationAge: 'established',
        apiVersion: 'v3.1',
        webhookConfig: { enabled: true, version: 'v2', retryPolicy: 'exponential' },
        commonIssues: ['disbursement_timing', 'repayment_webhooks'],
        contactName: 'Michelle Davis',
        contactEmail: 'm.davis@clearpathfin.com',
        timezone: 'America/Chicago',
        monthlyVolume: '$8.2M'
    },
    {
        id: 'mrc_pennywise',
        name: 'PennyWise',
        industry: 'Personal Finance App',
        size: 'startup',
        integrationAge: 'new',
        apiVersion: 'v3.4',
        webhookConfig: { enabled: true, version: 'v2', retryPolicy: 'exponential' },
        commonIssues: ['plaid_integration', 'account_linking'],
        contactName: 'Tyler Green',
        contactEmail: 'tyler@pennywiseapp.com',
        timezone: 'America/Los_Angeles',
        monthlyVolume: '$56K'
    },
    {
        id: 'mrc_invoicejet',
        name: 'InvoiceJet',
        industry: 'Invoicing Platform',
        size: 'smb',
        integrationAge: 'established',
        apiVersion: 'v3.2',
        webhookConfig: { enabled: true, version: 'v2', retryPolicy: 'basic' },
        commonIssues: ['payment_links', 'reminder_scheduling'],
        contactName: 'Grace Kim',
        contactEmail: 'grace@invoicejet.io',
        timezone: 'America/New_York',
        monthlyVolume: '$320K'
    },
    {
        id: 'mrc_wealthnest',
        name: 'WealthNest',
        industry: 'Robo-Advisor',
        size: 'mid-market',
        integrationAge: 'established',
        apiVersion: 'v3.2',
        webhookConfig: { enabled: true, version: 'v2', retryPolicy: 'exponential' },
        commonIssues: ['ach_timing', 'fractional_shares'],
        contactName: 'David Okonkwo',
        contactEmail: 'david@wealthnest.com',
        timezone: 'America/New_York',
        monthlyVolume: '$2.8M'
    },
    {
        id: 'mrc_paypylon',
        name: 'PayPylon',
        industry: 'B2B Payments',
        size: 'enterprise',
        integrationAge: 'legacy',
        apiVersion: 'v2.8',
        webhookConfig: { enabled: true, version: 'v1', retryPolicy: 'basic' },
        commonIssues: ['wire_transfers', 'fx_rates'],
        contactName: 'Steven Clarke',
        contactEmail: 's.clarke@paypylon.com',
        timezone: 'Europe/London',
        monthlyVolume: '$34M'
    },
    {
        id: 'mrc_splitify',
        name: 'Splitify',
        industry: 'Expense Splitting',
        size: 'startup',
        integrationAge: 'new',
        apiVersion: 'v3.4',
        webhookConfig: { enabled: true, version: 'v2', retryPolicy: 'exponential' },
        commonIssues: ['p2p_transfers', 'group_billing'],
        contactName: 'Nina Rodriguez',
        contactEmail: 'nina@splitify.app',
        timezone: 'America/Chicago',
        monthlyVolume: '$78K'
    },

    // HEALTHCARE & WELLNESS (5 merchants)
    {
        id: 'mrc_mediflow',
        name: 'MediFlow',
        industry: 'Telehealth Platform',
        size: 'mid-market',
        integrationAge: 'established',
        apiVersion: 'v3.2',
        webhookConfig: { enabled: true, version: 'v2', retryPolicy: 'exponential' },
        commonIssues: ['hipaa_compliance', 'copay_collection'],
        contactName: 'Dr. Sarah Mitchell',
        contactEmail: 's.mitchell@mediflow.health',
        timezone: 'America/New_York',
        monthlyVolume: '$1.9M'
    },
    {
        id: 'mrc_vitaledge',
        name: 'VitalEdge',
        industry: 'Fitness Tracking',
        size: 'smb',
        integrationAge: 'new',
        apiVersion: 'v3.4',
        webhookConfig: { enabled: true, version: 'v2', retryPolicy: 'exponential' },
        commonIssues: ['subscription_pausing', 'family_plans'],
        contactName: 'Chris Palmer',
        contactEmail: 'chris@vitaledge.fit',
        timezone: 'America/Los_Angeles',
        monthlyVolume: '$210K'
    },
    {
        id: 'mrc_mindspace',
        name: 'MindSpace',
        industry: 'Mental Health App',
        size: 'startup',
        integrationAge: 'new',
        apiVersion: 'v3.4',
        webhookConfig: { enabled: true, version: 'v2', retryPolicy: 'exponential' },
        commonIssues: ['therapist_payouts', 'session_credits'],
        contactName: 'Dr. Emily Wright',
        contactEmail: 'emily@mindspace.care',
        timezone: 'Europe/London',
        monthlyVolume: '$145K'
    },
    {
        id: 'mrc_pharmahub',
        name: 'PharmaHub',
        industry: 'Online Pharmacy',
        size: 'enterprise',
        integrationAge: 'established',
        apiVersion: 'v3.1',
        webhookConfig: { enabled: true, version: 'v2', retryPolicy: 'exponential' },
        commonIssues: ['insurance_integration', 'prescription_auth'],
        contactName: 'Michael Foster',
        contactEmail: 'm.foster@pharmahub.com',
        timezone: 'America/Chicago',
        monthlyVolume: '$12M'
    },
    {
        id: 'mrc_zenithwellness',
        name: 'Zenith Wellness',
        industry: 'Spa & Wellness Booking',
        size: 'smb',
        integrationAge: 'established',
        apiVersion: 'v3.2',
        webhookConfig: { enabled: true, version: 'v2', retryPolicy: 'basic' },
        commonIssues: ['appointment_deposits', 'no_show_fees'],
        contactName: 'Isabella Chen',
        contactEmail: 'isabella@zenithwellness.com',
        timezone: 'America/Los_Angeles',
        monthlyVolume: '$380K'
    },

    // GAMING & ENTERTAINMENT (5 merchants)
    {
        id: 'mrc_pixelrealm',
        name: 'PixelRealm Games',
        industry: 'Mobile Gaming',
        size: 'mid-market',
        integrationAge: 'established',
        apiVersion: 'v3.2',
        webhookConfig: { enabled: true, version: 'v2', retryPolicy: 'exponential' },
        commonIssues: ['iap_validation', 'virtual_currency'],
        contactName: 'Kevin Zhang',
        contactEmail: 'kevin@pixelrealm.gg',
        timezone: 'Asia/Shanghai',
        monthlyVolume: '$4.2M'
    },
    {
        id: 'mrc_streamforge',
        name: 'StreamForge',
        industry: 'Streaming Platform',
        size: 'startup',
        integrationAge: 'new',
        apiVersion: 'v3.4',
        webhookConfig: { enabled: true, version: 'v2', retryPolicy: 'exponential' },
        commonIssues: ['creator_payouts', 'tip_processing'],
        contactName: 'Jake Morrison',
        contactEmail: 'jake@streamforge.tv',
        timezone: 'America/Los_Angeles',
        monthlyVolume: '$890K'
    },
    {
        id: 'mrc_questbound',
        name: 'QuestBound',
        industry: 'MMO Gaming',
        size: 'enterprise',
        integrationAge: 'established',
        apiVersion: 'v3.1',
        webhookConfig: { enabled: true, version: 'v2', retryPolicy: 'exponential' },
        commonIssues: ['subscription_fraud', 'chargeback_abuse'],
        contactName: 'Andrew Larsson',
        contactEmail: 'a.larsson@questbound.com',
        timezone: 'Europe/Stockholm',
        monthlyVolume: '$9.5M'
    },
    {
        id: 'mrc_ticketblitz',
        name: 'TicketBlitz',
        industry: 'Event Ticketing',
        size: 'mid-market',
        integrationAge: 'established',
        apiVersion: 'v3.2',
        webhookConfig: { enabled: true, version: 'v2', retryPolicy: 'exponential' },
        commonIssues: ['refund_policies', 'transfer_fees'],
        contactName: 'Rachel Adams',
        contactEmail: 'rachel@ticketblitz.com',
        timezone: 'America/New_York',
        monthlyVolume: '$3.1M'
    },
    {
        id: 'mrc_arcadestack',
        name: 'ArcadeStack',
        industry: 'Retro Gaming',
        size: 'startup',
        integrationAge: 'new',
        apiVersion: 'v3.4',
        webhookConfig: { enabled: true, version: 'v2', retryPolicy: 'exponential' },
        commonIssues: ['token_purchases', 'leaderboard_prizes'],
        contactName: 'Danny Brooks',
        contactEmail: 'danny@arcadestack.io',
        timezone: 'America/Chicago',
        monthlyVolume: '$52K'
    },

    // FOOD & HOSPITALITY (5 merchants)
    {
        id: 'mrc_tastehaven',
        name: 'TasteHaven',
        industry: 'Restaurant Delivery',
        size: 'mid-market',
        integrationAge: 'established',
        apiVersion: 'v3.2',
        webhookConfig: { enabled: true, version: 'v2', retryPolicy: 'exponential' },
        commonIssues: ['tip_distribution', 'driver_payouts'],
        contactName: 'Maria Santos',
        contactEmail: 'maria@tastehaven.co',
        timezone: 'America/New_York',
        monthlyVolume: '$2.3M'
    },
    {
        id: 'mrc_brewcraft',
        name: 'BrewCraft',
        industry: 'Craft Beverages',
        size: 'smb',
        integrationAge: 'new',
        apiVersion: 'v3.4',
        webhookConfig: { enabled: true, version: 'v2', retryPolicy: 'basic' },
        commonIssues: ['age_verification', 'shipping_restrictions'],
        contactName: 'Tom Sullivan',
        contactEmail: 'tom@brewcraft.beer',
        timezone: 'America/Denver',
        monthlyVolume: '$420K'
    },
    {
        id: 'mrc_cloudkitchen',
        name: 'CloudKitchen Pro',
        industry: 'Ghost Kitchen Platform',
        size: 'startup',
        integrationAge: 'new',
        apiVersion: 'v3.4',
        webhookConfig: { enabled: true, version: 'v2', retryPolicy: 'exponential' },
        commonIssues: ['multi_brand_routing', 'commission_splits'],
        contactName: 'Lisa Chen',
        contactEmail: 'lisa@cloudkitchenpro.com',
        timezone: 'America/Los_Angeles',
        monthlyVolume: '$180K'
    },
    {
        id: 'mrc_reservenow',
        name: 'ReserveNow',
        industry: 'Restaurant Reservations',
        size: 'smb',
        integrationAge: 'established',
        apiVersion: 'v3.2',
        webhookConfig: { enabled: true, version: 'v2', retryPolicy: 'basic' },
        commonIssues: ['deposit_holds', 'cancellation_fees'],
        contactName: 'Pierre Dubois',
        contactEmail: 'pierre@reservenow.app',
        timezone: 'Europe/Paris',
        monthlyVolume: '$290K'
    },
    {
        id: 'mrc_hotelzen',
        name: 'HotelZen',
        industry: 'Boutique Hotels',
        size: 'mid-market',
        integrationAge: 'established',
        apiVersion: 'v3.1',
        webhookConfig: { enabled: true, version: 'v2', retryPolicy: 'exponential' },
        commonIssues: ['prepaid_bookings', 'incidentals_auth'],
        contactName: 'Victoria Stone',
        contactEmail: 'v.stone@hotelzen.com',
        timezone: 'America/New_York',
        monthlyVolume: '$1.8M'
    }
]

/**
 * Get all merchants
 */
export function getAllMerchants(): Merchant[] {
    return MERCHANTS
}

/**
 * Get a random subset of merchants
 */
export function getRandomMerchants(count: number): Merchant[] {
    const shuffled = [...MERCHANTS].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, Math.min(count, MERCHANTS.length))
}

/**
 * Get merchant by ID
 */
export function getMerchantById(id: string): Merchant | undefined {
    return MERCHANTS.find(m => m.id === id)
}

/**
 * Get merchants by size tier
 */
export function getMerchantsBySize(size: Merchant['size']): Merchant[] {
    return MERCHANTS.filter(m => m.size === size)
}

/**
 * Get merchants by industry
 */
export function getMerchantsByIndustry(industryKeyword: string): Merchant[] {
    return MERCHANTS.filter(m =>
        m.industry.toLowerCase().includes(industryKeyword.toLowerCase())
    )
}

/**
 * Get merchants with specific integration age (for migration scenarios)
 */
export function getMerchantsByIntegrationAge(age: Merchant['integrationAge']): Merchant[] {
    return MERCHANTS.filter(m => m.integrationAge === age)
}

/**
 * Get a weighted random merchant (enterprise more likely for high-risk)
 */
export function getWeightedMerchant(riskProfile: 'low' | 'medium' | 'high'): Merchant {
    let pool: Merchant[]

    switch (riskProfile) {
        case 'high':
            // Prefer enterprise and mid-market
            pool = MERCHANTS.filter(m => m.size === 'enterprise' || m.size === 'mid-market')
            break
        case 'medium':
            // Prefer mid-market and SMB
            pool = MERCHANTS.filter(m => m.size === 'mid-market' || m.size === 'smb')
            break
        case 'low':
            // Prefer startups and SMB
            pool = MERCHANTS.filter(m => m.size === 'startup' || m.size === 'smb')
            break
        default:
            pool = MERCHANTS
    }

    return pool[Math.floor(Math.random() * pool.length)]
}

export const MERCHANT_COUNT = MERCHANTS.length
