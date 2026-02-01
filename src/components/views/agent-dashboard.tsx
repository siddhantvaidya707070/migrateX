'use client'

import React from 'react'
import { DashboardProvider } from '@/components/providers/dashboard-provider'
import { DashboardView } from './dashboard-view'

export function AgentDashboard() {
    return (
        <DashboardProvider>
            <DashboardView />
        </DashboardProvider>
    )
}
