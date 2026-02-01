'use client'

import Link from 'next/link'
import { useState, useRef } from 'react'
import { Settings, Shield, TrendingUp, Scale, Droplet, Network, Zap, Target, ArrowRight, ChevronDown, Plus, Minus, Bot, BarChart3, Bell, Lock, Activity, Database, FileCheck, Globe2 } from 'lucide-react'
import { motion } from 'framer-motion'
import NeuralBackground from '@/components/ui/flow-field-background'
import { SettingsDropdown } from '@/components/layout/settings-dropdown'
import { IntelligenceQueue, type QueueItem } from '@/components/ui/intelligence-queue'
import { BentoGrid } from '@/components/ui/bento-grid'

const navItems = [
  { label: 'Features', href: '#intelligence-queue' },
  { label: 'Services', href: '#services' },
  { label: 'FAQ', href: '#faq' },
]

// Intelligence Queue Items - 20 Financial Intelligence Categories
const intelligenceItems: QueueItem[] = [
  {
    id: '1',
    headline: 'Adaptive Risk Monitoring',
    subtext: 'Real-time portfolio risk assessment',
    detailTitle: 'Adaptive Risk Monitoring System',
    detailContent: 'Continuously monitors portfolio risk metrics in real-time, dynamically adjusting risk thresholds based on market conditions, volatility regimes, and position concentrations. The system automatically escalates alerts when risk levels approach predefined boundaries and suggests protective actions to maintain portfolio stability.'
  },
  {
    id: '2',
    headline: 'Currency Exposure Management',
    subtext: 'FX risk hedging optimization',
    detailTitle: 'Currency Exposure Management',
    detailContent: 'Tracks and manages foreign exchange exposures across all international holdings. Automatically recommends hedging strategies when currency risk exceeds tolerance levels, optimizing hedge ratios to balance cost versus protection. Monitors central bank policy signals and macroeconomic indicators affecting currency valuations.'
  },
  {
    id: '3',
    headline: 'Yield Curve Inversion Detection',
    subtext: 'Fixed income signal analysis',
    detailTitle: 'Yield Curve Inversion Detection',
    detailContent: 'Monitors treasury yield curves across multiple maturities to detect inversions and other anomalies signaling potential economic shifts. Provides duration recommendations and fixed income positioning strategies based on historical patterns following similar curve configurations.'
  },
  {
    id: '4',
    headline: 'Dividend Opportunity Identification',
    subtext: 'Income-generating stock screening',
    detailTitle: 'Dividend Opportunity Identification',
    detailContent: 'Screens for high-quality dividend opportunities using multi-factor analysis including payout ratios, dividend growth history, earnings stability, and valuation metrics. Identifies dividend aristocrats trading below historical norms with sustainable yield premiums above market averages.'
  },
  {
    id: '5',
    headline: 'Options Strategy Optimization',
    subtext: 'Derivative income enhancement',
    detailTitle: 'Options Strategy Optimization',
    detailContent: 'Analyzes implied versus realized volatility across portfolio holdings to identify optimal options strategies. Recommends covered calls, protective puts, and spread strategies to enhance income generation while managing downside risk. Calculates expected returns and break-even points for each strategy.'
  },
  {
    id: '6',
    headline: 'Volatility Threshold Alerts',
    subtext: 'Market regime detection',
    detailTitle: 'Volatility Threshold Alerts',
    detailContent: 'Monitors VIX and individual asset volatilities against configurable thresholds. Triggers alerts when volatility spikes indicate potential market stress, enabling proactive risk reduction. Differentiates between temporary volatility events and sustained regime changes requiring portfolio adjustments.'
  },
  {
    id: '7',
    headline: 'Sector Rotation Analysis',
    subtext: 'Tactical allocation signals',
    detailTitle: 'Sector Rotation Analysis',
    detailContent: 'Tracks relative sector performance and momentum to identify rotation opportunities. Analyzes economic cycle indicators to anticipate sector leadership changes and recommends tactical allocation shifts to capture alpha from sector transitions while managing concentration risk.'
  },
  {
    id: '8',
    headline: 'Liquidity Risk Detection',
    subtext: 'Position exit feasibility analysis',
    detailTitle: 'Liquidity Risk Detection',
    detailContent: 'Evaluates position sizes relative to average daily volumes and bid-ask spreads. Flags illiquid positions that may be difficult to exit during market stress. Recommends position size limits and suggests liquidity buffers to ensure portfolio flexibility during volatile periods.'
  },
  {
    id: '9',
    headline: 'Macro Regime Shift Recognition',
    subtext: 'Economic environment classification',
    detailTitle: 'Macro Regime Shift Recognition',
    detailContent: 'Classifies current macroeconomic environment across dimensions including growth, inflation, and monetary policy. Detects regime transitions and recommends portfolio positioning aligned with historical asset class performance during similar regimes.'
  },
  {
    id: '10',
    headline: 'Correlation Breakdown Analysis',
    subtext: 'Diversification effectiveness monitoring',
    detailTitle: 'Correlation Breakdown Analysis',
    detailContent: 'Monitors rolling correlations between portfolio assets to assess diversification effectiveness. Alerts when correlations spike during market stress, potentially reducing diversification benefits precisely when needed most. Recommends alternative diversifiers with historically stable correlation profiles.'
  },
  {
    id: '11',
    headline: 'Alpha Decay Monitoring',
    subtext: 'Strategy performance degradation tracking',
    detailTitle: 'Alpha Decay Monitoring',
    detailContent: 'Tracks performance attribution to detect when investment strategies show signs of alpha decay. Identifies factors contributing to performance degradation and recommends strategy modifications or replacements before significant value destruction occurs.'
  },
  {
    id: '12',
    headline: 'Dynamic Hedge Adjustment',
    subtext: 'Protective position optimization',
    detailTitle: 'Dynamic Hedge Adjustment',
    detailContent: 'Continuously optimizes hedge ratios based on portfolio composition changes and market conditions. Balances hedge effectiveness against cost, recommending adjustments when protection levels drift from targets or when hedging costs become unfavorable.'
  },
  {
    id: '13',
    headline: 'Probabilistic Risk Scoring',
    subtext: 'Scenario-based risk quantification',
    detailTitle: 'Probabilistic Risk Scoring',
    detailContent: 'Generates probability-weighted risk scores incorporating multiple stress scenarios and tail risk events. Provides intuitive risk dashboards translating complex model outputs into actionable intelligence for portfolio managers.'
  },
  {
    id: '14',
    headline: 'Multi-Factor Signal Confluence',
    subtext: 'Cross-validation of investment signals',
    detailTitle: 'Multi-Factor Signal Confluence',
    detailContent: 'Aggregates signals from multiple independent factors including momentum, value, quality, and sentiment. Identifies high-conviction opportunities where multiple factors align, increasing probability of successful trades while filtering noise from individual factor signals.'
  },
  {
    id: '15',
    headline: 'Real-Time Portfolio Diagnostics',
    subtext: 'Continuous health monitoring',
    detailTitle: 'Real-Time Portfolio Diagnostics',
    detailContent: 'Provides instant visibility into portfolio health metrics including risk exposures, factor loadings, concentration levels, and performance attribution. Enables rapid diagnosis of performance drivers and risk sources for immediate decision-making.'
  },
  {
    id: '16',
    headline: 'Automated Strategy Rebalancing',
    subtext: 'Target allocation maintenance',
    detailTitle: 'Automated Strategy Rebalancing',
    detailContent: 'Automatically triggers rebalancing when portfolio weights drift beyond tolerance bands. Optimizes rebalancing timing to minimize transaction costs while maintaining target exposures. Incorporates tax-loss harvesting opportunities into rebalancing decisions.'
  },
  {
    id: '17',
    headline: 'Execution Slippage Detection',
    subtext: 'Trade cost analysis',
    detailTitle: 'Execution Slippage Detection',
    detailContent: 'Measures execution quality by comparing actual fill prices against benchmark prices. Identifies patterns of excessive slippage indicating potential execution issues or adverse selection. Recommends execution algorithm adjustments to minimize implementation shortfall.'
  },
  {
    id: '18',
    headline: 'Position Sizing Optimization',
    subtext: 'Risk-adjusted allocation',
    detailTitle: 'Position Sizing Optimization',
    detailContent: 'Calculates optimal position sizes based on expected return, volatility, correlation with existing holdings, and portfolio-level risk constraints. Prevents oversized positions that could dominate portfolio performance while ensuring meaningful allocation to high-conviction ideas.'
  },
  {
    id: '19',
    headline: 'Drawdown Risk Control',
    subtext: 'Peak-to-trough loss management',
    detailTitle: 'Drawdown Risk Control',
    detailContent: 'Monitors portfolio drawdowns in real-time and triggers defensive actions when losses approach predefined thresholds. Implements systematic de-risking protocols to prevent catastrophic losses while preserving upside participation when conditions normalize.'
  },
  {
    id: '20',
    headline: 'Continuous Model Validation',
    subtext: 'Ongoing strategy backtesting',
    detailTitle: 'Continuous Model Validation',
    detailContent: 'Continuously validates model assumptions against live market data. Detects when models deviate from expected behavior, triggering review processes before degraded models impact performance. Maintains model confidence scores updated with each new observation.'
  }
]

// Services - 4 Premium Boxes with Bento Background
const services = [
  { icon: <Database className="w-4 h-4 text-[#C9A24D]" />, title: 'Intelligent System Migration', description: 'Seamlessly transfers complex systems and data with context-aware decision making. The agent understands dependencies, preserves integrity, and adapts strategies in real-time to ensure zero-downtime transitions.', colSpan: 2, hasPersistentHover: true },
  { icon: <Network className="w-4 h-4 text-[#9E7C32]" />, title: 'Agent-Based Workflow Orchestration', description: 'Coordinates intricate multi-step processes with autonomous task management. Intelligently routes, prioritizes, and executes workflows while maintaining awareness of system state and constraints.' },
  { icon: <Shield className="w-4 h-4 text-[#E6C97A]" />, title: 'Automated Risk Assessment', description: 'Proactively identifies vulnerabilities, evaluates potential impacts, and implements safeguards. Continuously learns from patterns to anticipate issues before they escalate into critical failures.', colSpan: 2 },
  { icon: <Target className="w-4 h-4 text-[#C9A24D]" />, title: 'Adaptive Strategy Optimization', description: 'Dynamically refines operational strategies based on real-time feedback and environmental changes. Self-adjusts parameters to maximize efficiency while respecting defined boundaries and constraints.' },
]

const faqs = [
  {
    question: 'What problem does migrateX solve?',
    answer: 'migrateX addresses the complexity of modern portfolio management by deploying autonomous AI agents that continuously monitor, analyze, and optimize investment decisions. Traditional approaches require constant human oversight and often miss fleeting opportunities or emerging risks. Our multi-agent system provides 24/7 intelligent surveillance, proactive risk mitigation, and dynamic strategy execution—solving the scalability and consistency challenges that limit human portfolio managers.'
  },
  {
    question: 'How does the system manage risk?',
    answer: 'Risk management is embedded at every layer of migrateX. Our Risk Agent continuously monitors portfolio exposures, correlation breakdowns, and volatility regimes. When thresholds are breached, the system automatically triggers defensive protocols—reducing position sizes, implementing hedges, or shifting to cash. Probabilistic risk scoring quantifies tail risks, while drawdown controls prevent catastrophic losses. All actions are logged and auditable, ensuring transparent risk governance.'
  },
  {
    question: 'How does migrateX integrate with existing systems?',
    answer: 'migrateX is designed for seamless integration with existing investment infrastructure. Our platform connects via secure APIs to major brokerage platforms, custodians, and market data providers. We support standard protocols including FIX for trade execution and REST/GraphQL for data synchronization. Implementation typically takes 2-4 weeks, with dedicated integration specialists ensuring minimal disruption to existing workflows while preserving data integrity throughout the migration process.'
  },
  {
    question: 'How does the system ensure reliability in production?',
    answer: 'Production reliability is paramount at migrateX. Our infrastructure runs on distributed cloud architecture with automatic failover across multiple availability zones. All critical systems have redundant backups with sub-second recovery times. We maintain 99.99% uptime SLAs with comprehensive monitoring that detects and resolves issues before they impact operations. Regular disaster recovery drills and continuous model validation ensure the system performs consistently under all market conditions.'
  },
  {
    question: 'Is the decision logic explainable?',
    answer: 'Absolutely. Every decision made by migrateX agents is fully explainable and auditable. Each recommendation includes detailed reasoning—the signals detected, factors weighted, and alternatives considered. Our explainability layer translates complex model outputs into human-readable narratives, enabling portfolio managers to understand exactly why actions were taken. This transparency is essential for regulatory compliance and builds trust in autonomous decision-making.'
  },
  {
    question: 'What safeguards prevent cascading failures?',
    answer: 'migrateX employs multiple layers of protection against cascading failures. Circuit breakers automatically halt trading when anomalous patterns are detected. Each agent operates in isolated containers, preventing single-point failures from propagating. The Consensus Engine requires multi-agent agreement before execution, filtering out erratic individual signals. Position limits, velocity constraints, and kill switches provide additional safety nets. All safeguards are tested extensively through simulation before deployment.'
  }
]

// SVG animated paths component - ALWAYS VISIBLE
function FloatingPaths({ position }: { position: number }) {
  const paths = Array.from({ length: 36 }, (_, i) => ({
    id: i,
    d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${380 - i * 5 * position
      } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${152 - i * 5 * position
      } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${684 - i * 5 * position
      } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
    width: 0.5 + i * 0.03,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none transition-opacity duration-500">
      <svg
        className="w-full h-full text-white"
        viewBox="0 0 696 316"
        fill="none"
      >
        <title>Background Paths</title>
        {paths.map((path) => (
          <motion.path
            key={path.id}
            d={path.d}
            stroke="currentColor"
            strokeWidth={path.width}
            strokeOpacity={0.05 + path.id * 0.01}
            initial={{ pathLength: 0.3, opacity: 0.6 }}
            animate={{
              pathLength: 1,
              opacity: [0.2, 0.4, 0.2],
              pathOffset: [0, 1, 0],
            }}
            transition={{
              duration: 20 + Math.random() * 10,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </svg>
    </div>
  );
}

export default function Home() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const settingsTriggerRef = useRef<HTMLButtonElement>(null)

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className="relative w-full bg-black scroll-smooth">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-transparent">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="flex items-center gap-1">
                <span className="text-xl font-bold tracking-tight text-[#F5F5F5]">migrate</span>
                <span className="text-xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#C9A24D] to-[#E6C97A] italic">X</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => scrollToSection(item.href)}
                  className="text-sm font-medium text-gray-300 hover:text-white transition-colors relative group cursor-pointer"
                >
                  {item.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-[#C9A24D] transition-all group-hover:w-full" />
                </button>
              ))}
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="hidden md:inline-flex px-6 py-2.5 text-sm font-semibold text-[#0F0F0F] bg-gradient-to-r from-[#9E7C32] via-[#C9A24D] to-[#E6C97A] rounded-full hover:shadow-lg hover:shadow-[#C9A24D]/30 transition-all duration-300 hover:scale-105"
              >
                Get Started
              </Link>

              {/* Settings Button */}
              <div className="relative">
                <button
                  ref={settingsTriggerRef}
                  onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                  className="p-2.5 text-gray-300 hover:text-white hover:bg-white/10 rounded-full transition-all backdrop-blur-sm"
                  aria-label="Settings"
                >
                  <Settings size={20} />
                </button>

                <SettingsDropdown
                  isOpen={isSettingsOpen}
                  onClose={() => setIsSettingsOpen(false)}
                  triggerRef={settingsTriggerRef}
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen w-full overflow-hidden">
        {/* Neural Background */}
        <div className="absolute inset-0 z-0">
          <NeuralBackground
            color="#C9A24D"
            trailOpacity={0.08}
            particleCount={800}
            speed={0.6}
          />
        </div>

        {/* Gradient Overlays */}
        <div className="absolute inset-0 z-[1] bg-gradient-to-b from-transparent via-black/20 to-black" />
        <div className="absolute inset-0 z-[2] bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />

        {/* Hero Content */}
        <main className="relative z-10 flex min-h-screen items-center justify-center px-6 pt-20">
          <div className="mx-auto max-w-5xl text-center">
            {/* Badge */}


            {/* Main Heading */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="space-y-6 mb-8"
            >
              <h1 className="text-5xl md:text-7xl font-light tracking-tight leading-tight">
                <span className="text-7xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#9E7C32] via-[#C9A24D] to-[#E6C97A]">
                  migrateX
                </span>
                <br />
                <span className="text-white">Self-Healing Support Agent</span>
              </h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed font-light"
              >
                migrateX leverages multi-agent AI systems to optimize your
                portfolio, reduce risk, and drive intelligent investment decisions at scale.
              </motion.p>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link
                href="/dashboard"
                className="px-8 py-4 text-base font-semibold text-[#0F0F0F] bg-gradient-to-r from-[#9E7C32] via-[#C9A24D] to-[#E6C97A] rounded-full hover:shadow-2xl hover:shadow-[#C9A24D]/30 transition-all duration-300 hover:scale-105 whitespace-nowrap"
              >
                Start Managing
              </Link>
              <button
                onClick={() => scrollToSection('#intelligence-queue')}
                className="px-8 py-4 text-base font-semibold text-[#F5F5F5] bg-[#C9A24D]/5 border border-[#C9A24D]/20 rounded-full hover:bg-[#C9A24D]/10 transition-all duration-300 backdrop-blur-sm whitespace-nowrap"
              >
                Learn More
              </button>
            </motion.div>

            {/* Scroll Indicator */}
            <motion.button
              onClick={() => scrollToSection('#intelligence-queue')}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6, repeat: Infinity, repeatType: "reverse" }}
              className="mt-20"
            >
              <ChevronDown className="mx-auto w-6 h-6 text-[#E6C97A]" />
            </motion.button>
          </div>
        </main>
      </section>

      {/* Separator Section */}
      <section className="relative py-20 bg-[#0F0F0F] border-y border-[#C9A24D]/10">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <p className="text-sm text-[#8A8A8A] mb-8 uppercase tracking-widest">
            Trusted by leading corporations worldwide
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-8">
            {['Vernal', 'Stripe', 'Notion', 'Linear'].map((company) => (
              <div key={company} className="text-[#CFCFCF] text-lg font-medium tracking-wide hover:text-[#E6C97A] transition-colors cursor-default">
                {company}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Intelligence Queue Section - Full Width */}
      <IntelligenceQueue items={intelligenceItems} />

      {/* Services Section with BentoGrid */}
      <section id="services" className="relative py-32 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-[#E6C97A] mb-4 uppercase tracking-wider">SERVICES</p>
            <h2 className="text-4xl md:text-5xl font-bold text-[#F5F5F5] mb-6">Semi-Autonomous Intelligent Agent</h2>
            <p className="text-lg text-[#CFCFCF] max-w-3xl mx-auto">
              A context-aware, self-optimizing agent that thinks ahead, adapts in real-time, and executes with precision
            </p>
          </div>

          {/* Bento Grid with 4 service boxes */}
          <BentoGrid items={services} />
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="relative py-32 px-6 bg-[#0F0F0F]">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-[#E6C97A] mb-4 uppercase tracking-wider">FAQ</p>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="border border-white/10 rounded-2xl overflow-hidden bg-white/5 backdrop-blur-sm"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-white/5 transition-colors"
                >
                  <span className="text-lg font-semibold text-white pr-8">{faq.question}</span>
                  {openFaq === index ? (
                    <Minus className="w-5 h-5 text-[#E6C97A] flex-shrink-0" />
                  ) : (
                    <Plus className="w-5 h-5 text-[#8A8A8A] flex-shrink-0" />
                  )}
                </button>

                {openFaq === index && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 text-gray-400 leading-relaxed">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 px-6 bg-[#0F0F0F]">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="group relative p-12 md:p-16 bg-black border border-[#C9A24D]/20 rounded-3xl overflow-hidden text-center"
          >
            {/* Gold Paths Effect - Always Visible */}
            <FloatingPaths position={1} />
            <FloatingPaths position={-1} />

            <div className="absolute inset-0 bg-gradient-to-br from-[#C9A24D]/5 to-[#9E7C32]/5" />

            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold text-[#F5F5F5] mb-4">
                Ready to Transform Your Portfolio?
              </h2>
              <p className="text-lg text-[#CFCFCF] mb-8">
                Start managing your wealth with AI-powered intelligence today. No credit card required.
              </p>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-8 py-4 text-base font-semibold text-[#0F0F0F] bg-gradient-to-r from-[#9E7C32] via-[#C9A24D] to-[#E6C97A] rounded-full hover:shadow-2xl hover:shadow-[#C9A24D]/30 transition-all duration-300 hover:scale-105"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-16 px-6 bg-black border-t border-white/10">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-1 mb-4">
                <span className="text-xl font-bold tracking-tight text-white">migrate</span>
                <span className="text-xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#C9A24D] to-[#E6C97A] italic">X</span>
              </div>
              <p className="text-sm text-gray-400">
                AI-powered portfolio management solutions for modern investors.
              </p>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-3">
                {['Features', 'Services', 'FAQ'].map((item) => (
                  <li key={item}>
                    <button onClick={() => scrollToSection(`#${item === 'Features' ? 'intelligence-queue' : item.toLowerCase()}`)} className="text-sm text-gray-400 hover:text-white transition-colors">
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-3">
                {['About', 'Blog', 'Careers'].map((item) => (
                  <li key={item}>
                    <Link href="#" className="text-sm text-gray-400 hover:text-white transition-colors">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-3">
                {['Privacy', 'Terms'].map((item) => (
                  <li key={item}>
                    <Link href="#" className="text-sm text-gray-400 hover:text-white transition-colors">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 text-center text-sm text-gray-400">
            © {new Date().getFullYear()} migrateX. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
