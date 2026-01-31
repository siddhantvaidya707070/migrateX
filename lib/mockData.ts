/**
 * Mock Data for UI Components
 * Replaces external API calls with static demonstration data
 * Semantically rewritten for Agent/Support system context
 */

// Agent performance data (replaces market/portfolio data)
export const mockAgentMetrics = {
    totalCasesProcessed: 1247,
    avgResolutionTime: '4.2 mins',
    autoResolveRate: 87.3,
    activeAgents: 4,
    queuedCases: 12,
    todayProcessed: 156,
    weeklyTrend: [
        { day: 'Mon', cases: 143, resolved: 128 },
        { day: 'Tue', cases: 167, resolved: 151 },
        { day: 'Wed', cases: 189, resolved: 175 },
        { day: 'Thu', cases: 134, resolved: 129 },
        { day: 'Fri', cases: 156, resolved: 148 },
        { day: 'Sat', cases: 89, resolved: 85 },
        { day: 'Sun', cases: 72, resolved: 71 },
    ]
};

// Risk distribution (replaces asset allocation)
export const mockRiskDistribution = [
    { name: 'High Risk', value: 45, color: '#ef4444', description: 'Critical issues requiring immediate attention' },
    { name: 'Medium Risk', value: 32, color: '#f59e0b', description: 'Issues requiring review within 24h' },
    { name: 'Low Risk', value: 23, color: '#22c55e', description: 'Auto-resolved or informational' },
];

// Classification breakdown (replaces portfolio sectors)
export const mockClassifications = [
    { name: 'Migration Errors', count: 34, percentage: 27.2, trend: 'up' },
    { name: 'Documentation Gaps', count: 28, percentage: 22.4, trend: 'stable' },
    { name: 'Platform Regression', count: 21, percentage: 16.8, trend: 'down' },
    { name: 'Merchant Config', count: 19, percentage: 15.2, trend: 'up' },
    { name: 'API Errors', count: 15, percentage: 12.0, trend: 'stable' },
    { name: 'Other', count: 8, percentage: 6.4, trend: 'down' },
];

// Event queue (replaces economic calendar)
export const mockEventQueue = [
    { id: 1, type: 'checkout_failure', merchant: 'TechCorp', priority: 'high', status: 'processing', time: '2 min ago' },
    { id: 2, type: 'webhook_failure', merchant: 'ShopMax', priority: 'medium', status: 'queued', time: '5 min ago' },
    { id: 3, type: 'api_error', merchant: 'RetailPro', priority: 'low', status: 'resolved', time: '12 min ago' },
    { id: 4, type: 'support_ticket', merchant: 'GlobalShop', priority: 'medium', status: 'processing', time: '18 min ago' },
    { id: 5, type: 'migration_error', merchant: 'EcoStore', priority: 'high', status: 'queued', time: '23 min ago' },
];

// Agent activity log (replaces news feed)
export const mockActivityLog = [
    {
        id: 1,
        action: 'Auto-resolved checkout failure',
        agent: 'ObservationEngine',
        target: 'TechCorp - Error 402',
        timestamp: '2 min ago',
        confidence: 0.94
    },
    {
        id: 2,
        action: 'Escalated to engineering team',
        agent: 'ActionEngine',
        target: 'ShopMax - Database timeout',
        timestamp: '8 min ago',
        confidence: 0.89
    },
    {
        id: 3,
        action: 'Generated documentation update',
        agent: 'LearningEngine',
        target: 'Webhook setup guide',
        timestamp: '15 min ago',
        confidence: 0.92
    },
    {
        id: 4,
        action: 'Identified pattern cluster',
        agent: 'HypothesisEngine',
        target: '12 related API errors',
        timestamp: '22 min ago',
        confidence: 0.87
    },
];

// Performance over time (replaces stock chart data)
export const mockPerformanceHistory = [
    { time: '00:00', casesHandled: 12, avgResponseTime: 3.2, autoResolveRate: 85 },
    { time: '04:00', casesHandled: 8, avgResponseTime: 2.8, autoResolveRate: 88 },
    { time: '08:00', casesHandled: 34, avgResponseTime: 4.1, autoResolveRate: 82 },
    { time: '12:00', casesHandled: 45, avgResponseTime: 4.8, autoResolveRate: 79 },
    { time: '16:00', casesHandled: 38, avgResponseTime: 3.9, autoResolveRate: 84 },
    { time: '20:00', casesHandled: 19, avgResponseTime: 3.1, autoResolveRate: 91 },
];

// System health (replaces market indices)
export const mockSystemHealth = {
    agentUptime: 99.97,
    databaseLatency: 12,
    apiResponseTime: 45,
    queueDepth: 12,
    errorRate: 0.3,
};

// Current decisions awaiting approval
export const mockPendingApprovals = [
    {
        id: 'dec_001',
        type: 'engineering_escalation',
        summary: 'Escalate checkout regression to engineering',
        riskScore: 9,
        confidence: 0.92,
        affectedMerchants: 5,
        createdAt: '3 min ago'
    },
    {
        id: 'dec_002',
        type: 'doc_update',
        summary: 'Update webhook documentation with error codes',
        riskScore: 3,
        confidence: 0.88,
        affectedMerchants: 1,
        createdAt: '15 min ago'
    },
];

// Investment/Capital input mock (for survey modal)
export const mockCapitalRanges = {
    min: 1000,
    max: 100000,
    default: 10000,
    currency: 'USD'
};

// Projections mock data
export const mockProjections = {
    expectedResolutionRate: 92,
    estimatedCostSavings: 45000,
    timeToValue: '2 weeks',
    roiEstimate: '340%'
};
