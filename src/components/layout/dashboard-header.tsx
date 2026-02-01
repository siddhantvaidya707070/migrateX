'use client'

import Link from "next/link"
import { ArrowLeft, Bot } from "lucide-react"
import { useState, useRef } from "react"
import { SettingsDropdown } from "@/components/layout/settings-dropdown"
import { cn } from "@/lib/utils"

export function DashboardHeader() {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false)
    const settingsTriggerRef = useRef<HTMLButtonElement>(null)

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-[#C9A24D]/20">
            <div className="max-w-[1920px] mx-auto px-6 h-16 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-[#8A8A8A] hover:text-[#F5F5F5] transition-colors group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm font-medium">Back to Home</span>
                    </Link>
                    <div className="h-4 w-px bg-[#C9A24D]/20 mx-2" />
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg overflow-hidden bg-gradient-to-br from-[#9E7C32] to-[#C9A24D] flex items-center justify-center shadow-lg shadow-[#C9A24D]/20">
                            <Bot className="w-5 h-5 text-black" />
                        </div>
                        <span className="font-semibold tracking-tight text-[#F5F5F5]">Agent Dashboard</span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative">
                        <button
                            ref={settingsTriggerRef}
                            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                            className={cn(
                                "flex items-center gap-2 px-3 py-1.5 rounded-full transition-all border border-transparent",
                                isSettingsOpen ? "bg-[#1A1A1A] text-[#F5F5F5] border-[#C9A24D]/20" : "hover:bg-[#1A1A1A]/50 text-[#8A8A8A] hover:text-[#F5F5F5]"
                            )}
                        >
                            <div className="w-6 h-6 rounded-full bg-[#C9A24D]/20 flex items-center justify-center">
                                <Bot className="w-4 h-4 text-[#E6C97A]" />
                            </div>
                            <span className="text-sm font-medium">Settings</span>
                        </button>

                        <SettingsDropdown
                            isOpen={isSettingsOpen}
                            onClose={() => setIsSettingsOpen(false)}
                            triggerRef={settingsTriggerRef}
                            defaultSection="account"
                        />
                    </div>
                </div>
            </div>
        </header>
    )
}
