"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import {
    Settings,
    Palette,
    User,
    FileText,
    HelpCircle,
    ChevronRight,
    Layout,
    RefreshCw,
    Trash2,
    Download,
    MessageSquare,
    Info,
    Check,
    Phone,
    Mail,
    X
} from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

const sections = [
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'account', label: 'Account Preferences', icon: User },
    { id: 'reports', label: 'Reports & Data', icon: FileText },
    { id: 'support', label: 'Support & About', icon: HelpCircle },
]

const themes = [
    { id: 'theme-blacked', label: 'Classic Blacked', description: 'Very dark background, gold accents.' },
    { id: 'theme-stoned', label: 'Stoned Grey', description: 'Neutral grey backgrounds, low eye strain.' },
    { id: 'theme-light-pro', label: 'Light (Professional)', description: 'Light background, dark text, muted gold.' },
    { id: 'theme-midnight', label: 'Midnight Gold', description: 'Deep gold-tinted backgrounds and surfaces.' },
    { id: 'theme-slate', label: 'Slate Blue', description: 'Blue-grey background tones with gold accents.' },
]

export function SettingsDialog({ trigger }: { trigger: React.ReactNode }) {
    const [activeSection, setActiveSection] = React.useState('appearance')
    const { theme, setTheme } = useTheme()
    const [open, setOpen] = React.useState(false)
    const [showContactSupport, setShowContactSupport] = React.useState(false)

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger}
            </DialogTrigger>
            <DialogContent className="max-w-[800px] h-[600px] p-0 gap-0 overflow-hidden bg-[#0F0F0F] border border-[#C9A24D]/20">
                <div className="flex h-full">
                    {/* Sidebar - Solid background */}
                    <div className="w-[240px] border-r border-[#C9A24D]/20 bg-[#1A1A1A] p-4 pt-6">
                        <div className="flex items-center gap-2 px-3 mb-6">
                            <Settings className="w-5 h-5 text-[#C9A24D]" />
                            <span className="font-semibold text-[#F5F5F5]">Settings</span>
                        </div>
                        <nav className="space-y-1">
                            {sections.map((section) => (
                                <button
                                    key={section.id}
                                    onClick={() => {
                                        setActiveSection(section.id)
                                        setShowContactSupport(false)
                                    }}
                                    className={cn(
                                        "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                                        activeSection === section.id
                                            ? "bg-gradient-to-r from-[#9E7C32] to-[#C9A24D] text-black"
                                            : "text-[#8A8A8A] hover:bg-[#2A2A2A] hover:text-[#F5F5F5]"
                                    )}
                                >
                                    <section.icon className="w-4 h-4" />
                                    {section.label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Content - Solid background */}
                    <div className="flex-1 flex flex-col min-w-0 bg-[#0F0F0F]">
                        <DialogHeader className="p-6 border-b border-[#C9A24D]/20">
                            <DialogTitle className="text-[#F5F5F5]">
                                {showContactSupport ? 'Contact Support' : sections.find(s => s.id === activeSection)?.label}
                            </DialogTitle>
                        </DialogHeader>

                        <div className="flex-1 overflow-y-auto p-6 scroll-area-custom">
                            {activeSection === 'appearance' && !showContactSupport && (
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-sm font-medium text-[#F5F5F5] mb-4">Themes</h3>
                                        <div className="grid gap-3">
                                            {themes.map((t) => (
                                                <button
                                                    key={t.id}
                                                    onClick={() => setTheme(t.id)}
                                                    className={cn(
                                                        "flex items-center justify-between p-4 rounded-xl border transition-all text-left",
                                                        (theme === t.id || (t.id === 'theme-blacked' && theme === 'dark'))
                                                            ? "bg-[#C9A24D]/10 border-[#C9A24D]"
                                                            : "bg-[#1A1A1A] border-[#2A2A2A] hover:border-[#C9A24D]/50"
                                                    )}
                                                >
                                                    <div className="space-y-1">
                                                        <p className="text-sm font-medium text-[#F5F5F5]">{t.label}</p>
                                                        <p className="text-xs text-[#8A8A8A]">{t.description}</p>
                                                    </div>
                                                    {(theme === t.id || (t.id === 'theme-blacked' && theme === 'dark')) && (
                                                        <Check className="w-4 h-4 text-[#C9A24D]" />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeSection === 'account' && !showContactSupport && (
                                <div className="space-y-4">
                                    <SettingsItem icon={Layout} label="Default Account View" />
                                    <SettingsItem icon={Layout} label="Dashboard Preferences" />
                                    <SettingsItem icon={RefreshCw} label="Reset Preferences" variant="destructive" />
                                    <SettingsItem icon={Trash2} label="Clear Cached Data" variant="destructive" />
                                </div>
                            )}

                            {activeSection === 'reports' && !showContactSupport && (
                                <div className="space-y-4">
                                    <SettingsItem icon={Download} label="Export Data" />
                                    <SettingsItem icon={FileText} label="Statements" />
                                    <SettingsItem icon={FileText} label="Tax Reports" />
                                </div>
                            )}

                            {activeSection === 'support' && !showContactSupport && (
                                <div className="space-y-4">
                                    <div
                                        onClick={() => setShowContactSupport(true)}
                                        className="flex items-center justify-between p-4 rounded-xl bg-[#1A1A1A] border border-[#2A2A2A] hover:border-[#C9A24D]/50 transition-all cursor-pointer group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#C9A24D]/10 text-[#C9A24D]">
                                                <MessageSquare className="w-4 h-4" />
                                            </div>
                                            <span className="text-sm font-medium text-[#F5F5F5]">Contact Support</span>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-[#8A8A8A] group-hover:text-[#F5F5F5] transition-all" />
                                    </div>
                                    <SettingsItem icon={FileText} label="Legal Information" />
                                    <SettingsItem icon={Info} label="App Information" badge="v1.0.4" />
                                </div>
                            )}

                            {/* Contact Support Panel */}
                            {showContactSupport && (
                                <div className="space-y-6">
                                    <button
                                        onClick={() => setShowContactSupport(false)}
                                        className="flex items-center gap-2 text-sm text-[#8A8A8A] hover:text-[#F5F5F5] transition-colors"
                                    >
                                        <ChevronRight className="w-4 h-4 rotate-180" />
                                        Back to Support
                                    </button>

                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold text-[#F5F5F5]">Get in Touch</h3>
                                        <p className="text-sm text-[#8A8A8A]">
                                            Our support team is available to help you with any questions or issues.
                                        </p>

                                        {/* Phone Numbers */}
                                        <div className="p-4 rounded-xl bg-[#1A1A1A] border border-[#2A2A2A] space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[#C9A24D]/10">
                                                    <Phone className="w-5 h-5 text-[#C9A24D]" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-[#F5F5F5]">Phone Support</p>
                                                    <p className="text-xs text-[#8A8A8A]">Available Mon-Fri, 9AM - 6PM IST</p>
                                                </div>
                                            </div>

                                            <div className="space-y-2 pl-[52px]">
                                                <a
                                                    href="tel:8369245842"
                                                    className="flex items-center gap-2 p-3 rounded-lg bg-[#0F0F0F] border border-[#2A2A2A] hover:border-[#C9A24D]/50 transition-all group"
                                                >
                                                    <span className="text-[#E6C97A] font-mono text-sm">+91 8369245842</span>
                                                </a>
                                                <a
                                                    href="tel:9324317147"
                                                    className="flex items-center gap-2 p-3 rounded-lg bg-[#0F0F0F] border border-[#2A2A2A] hover:border-[#C9A24D]/50 transition-all group"
                                                >
                                                    <span className="text-[#E6C97A] font-mono text-sm">+91 9324317147</span>
                                                </a>
                                            </div>
                                        </div>

                                        {/* Email */}
                                        <div className="p-4 rounded-xl bg-[#1A1A1A] border border-[#2A2A2A] space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[#C9A24D]/10">
                                                    <Mail className="w-5 h-5 text-[#C9A24D]" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-[#F5F5F5]">Email Support</p>
                                                    <p className="text-xs text-[#8A8A8A]">We typically respond within 24 hours</p>
                                                </div>
                                            </div>

                                            <div className="pl-[52px]">
                                                <a
                                                    href="mailto:gaarth.godbole.07@gmail.com"
                                                    className="flex items-center gap-2 p-3 rounded-lg bg-[#0F0F0F] border border-[#2A2A2A] hover:border-[#C9A24D]/50 transition-all group"
                                                >
                                                    <span className="text-[#E6C97A] text-sm">gaarth.godbole.07@gmail.com</span>
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

function SettingsItem({
    icon: Icon,
    label,
    badge,
    toggle,
    variant = 'default'
}: {
    icon: any,
    label: string,
    badge?: string,
    toggle?: boolean,
    variant?: 'default' | 'destructive'
}) {
    return (
        <div className="flex items-center justify-between p-4 rounded-xl bg-[#1A1A1A] border border-[#2A2A2A] hover:border-[#C9A24D]/50 transition-all cursor-pointer group">
            <div className="flex items-center gap-3">
                <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center",
                    variant === 'destructive' ? "bg-red-500/10 text-red-400" : "bg-[#C9A24D]/10 text-[#C9A24D]"
                )}>
                    <Icon className="w-4 h-4" />
                </div>
                <span className={cn(
                    "text-sm font-medium",
                    variant === 'destructive' ? "text-red-400" : "text-[#F5F5F5]"
                )}>{label}</span>
            </div>
            <div className="flex items-center gap-2">
                {badge && <span className="text-xs px-2 py-1 rounded-full bg-[#2A2A2A] text-[#8A8A8A]">{badge}</span>}
                {toggle ? (
                    <div className="w-8 h-4 rounded-full bg-[#2A2A2A] relative transition-colors group-hover:bg-[#C9A24D]/20">
                        <div className="absolute left-1 top-1 w-2 h-2 rounded-full bg-[#8A8A8A]" />
                    </div>
                ) : (
                    <ChevronRight className="w-4 h-4 text-[#8A8A8A] group-hover:text-[#F5F5F5] transition-all" />
                )}
            </div>
        </div>
    )
}
