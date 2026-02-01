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

// Intelligence Queue Items - 12 UNIQUE ITEMS with fresh original content
const intelligenceItems: QueueItem[] = [
  {
    id: '1',
    headline: 'Sector Rotation Signal Detected',
    subtext: 'Healthcare outperforming technology',
    detailTitle: 'Strategic Sector Rotation Opportunity',
    detailContent: 'Advanced pattern recognition algorithms have identified a significant sector rotation signal. Healthcare equities are demonstrating 18% stronger momentum compared to technology over the trailing 30-day period. Our Growth Agent recommends a tactical 12% reallocation from tech-heavy positions into healthcare leaders, particularly in medical devices and pharmaceuticals. This shift could capture an additional 4-6% alpha while maintaining overall portfolio volatility within target parameters.'
  },
  {
    id: '2',
    headline: 'Currency Hedge Adjustment Required',
    subtext: 'EUR exposure above threshold',
    detailTitle: 'Foreign Exchange Risk Mitigation',
    detailContent: 'The Risk Assessment Agent has flagged elevated currency exposure in your international holdings. Current EUR-denominated assets represent 27% of total portfolio value, exceeding your 20% guideline by 7 percentage points. Recent ECB policy signals suggest potential depreciation pressure. Recommendation: Deploy currency hedging instruments to neutralize 50-75% of excess EUR exposure, estimated cost 0.8% annually versus potential downside protection of 5-8%.'
  },
  {
    id: '3',
    headline: 'Fixed Income Yield Curve Inversion',
    subtext: 'Duration strategy update needed',
    detailTitle: 'Bond Portfolio Duration Optimization',
    detailContent: 'Treasury yield curve has inverted with 2-year yields exceeding 10-year by 45 basis points. Historical analysis shows this configuration persists 6-9 months before reversal. The Liquidity Agent recommends shortening average duration from 7.2 years to 4.5 years in your fixed income allocation. This defensive positioning protects against potential mark-to-market losses while maintaining income generation. Execute gradually over 6-week period to minimize transaction costs.'
  },
  {
    id: '4',
    headline: 'Dividend Aristocrat Opportunity',
    subtext: '3 undervalued targets identified',
    detailTitle: 'High-Quality Dividend Investment Signal',
    detailContent: 'Quantitative screening has identified three S&P Dividend Aristocrats trading below historical valuation norms. Companies with 25+ year dividend growth records currently offering yields 2.3% above market average while trading at P/E ratios 15% below their 10-year means. These positions offer defensive characteristics with upside potential. Consensus Engine validates allocation of 8% portfolio value distributed equally across the three candidates.'
  },
  {
    id: '5',
    headline: 'Options Strategy Optimization',
    subtext: 'Covered call premium enhancement',
    detailTitle: 'Derivative Income Strategy Refinement',
    detailContent: 'Volatility analysis indicates favorable conditions for systematic covered call writing on existing equity positions. Implied volatility currently 25% above realized volatility across your top 10 holdings. Implementation of monthly at-the-money covered calls could generate annualized premium income of 4.2-5.8% while limiting upside to strike price plus premium. Risk-adjusted return improvement estimated at 180 basis points with protection against drawdowns up to 5%.'
  },
  {
    id: '6',
    headline: 'Tax-Loss Harvesting Window',
    subtext: '$18.4K potential offset identified',
    detailTitle: 'Year-End Tax Optimization Strategy ',
    detailContent: 'Portfolio analysis has identified 7 positions with unrealized losses totaling $18,400 that qualify for tax-loss harvesting without violating wash-sale rules. Realized losses can offset capital gains from profitable sales earlier this year. Immediate execution recommended before year-end. The Compliance Agent has verified parallel replacement positions maintaining similar factor exposures, ensuring portfolio objectives remain unchanged while capturing tax benefit worth approximately $4,600 at assumed 25% marginal rate.'
  },
  {
    id: '7',
    headline: 'Emerging Market Debt Spread Widening',
    subtext: 'Entry point approaching target',
    detailTitle: 'EM Fixed Income Allocation Opportunity',
    detailContent: 'Spread over US Treasuries for investment-grade emerging market sovereigns has widened to 285 basis points, approaching your buy threshold of 300bp. Historical analysis shows mean reversion typically occurs within 90-120 days of reaching this level. Growth Agent recommends preparing 5% allocation to diversified EM debt fund focusing on Asia-Pacific issuers with strong fundamentals. Continue monitoring spread progression; execute when differential reaches 300bp or broader market stress subsides.'
  },
  {
    id: '8',
    headline: 'Real Estate Correlation Breakdown',
    subtext: 'Portfolio diversification enhanced',
    detailTitle: 'REIT Allocation Benefits Analysis',
    detailContent: 'Statistical correlation between REIT sector and broad equity indices has declined to 0.42, well below the 10-year average of 0.68. This decorrelation creates enhanced diversification opportunity. Current portfolio lacks real estate exposure despite attractive fundamentals: REITs yielding 5.2% with projected cash flow growth of 6-8% annually. Risk-return optimization suggests 7% allocation to diversified REIT portfolio, split 60% commercial/40% residential, would reduce overall portfolio volatility by 12% while maintaining expected returns.'
  },
  {
    id: '9',
    headline: 'Insider Transaction Cluster',
    subtext: 'Executive buying in 3 holdings',
    detailTitle: 'Corporate Insider Activity Monitoring',
    detailContent: 'Advanced sentiment analysis has detected cluster of open-market purchases by C-suite executives across three portfolio holdings in past 14 days. Total insider buying: $8.7M across 12 transactions with zero offsetting sales. Historical data shows similar patterns preceded average price appreciation of 11-15% over subsequent 6 months. These organic buying signals validate current position sizing. Maintain holdings, consider 15% position size increase if stock prices remain within 5% of current levels over next 30 days.'
  },
  {
    id: '10',
    headline: 'Factor Exposure Drift Detected',
    subtext: 'Value tilt weakening',
    detailTitle: 'Portfolio Factor Rebalancing Required',
    detailContent: 'Systematic factor analysis reveals drift from target exposures. Value factor loading has declined from target 0.85 to current 0.62 due to price appreciation in growth-oriented holdings. Quality and momentum factors remain within tolerance bands. Recommendation: Reallocate 9% from high-momentum growth positions into deep value opportunities to restore factor balance.This rebalancing better positions portfolio for potential growth-to-value rotation indicated by macro leading indicators.'
  },
  {
    id: '11',
    headline: 'Credit Spread Compression Alert',
    subtext: 'Investment grade vs high yield',
    detailTitle: 'Fixed Income Credit Risk Assessment',
    detailContent: 'High-yield bond spreads over investment-grade have compressed to 210 basis points, approaching historical tights. This configuration suggests limited compensation for incremental credit risk. Your current allocation includes 15% high-yield exposure generating additional 2.1% yield but with 3.5x higher default risk. Liquidity Agent recommends reducing high-yield allocation to 8-10%, rotating proceeds into shorter-duration investment-grade corporate bonds. This defensive move protects against potential spread widening that historically occurs at these tight levels.'
  },
  {
    id: '12',
    headline: 'Alternative Investment Rebalancing',
    subtext: 'Private equity commitments',
    detailTitle: 'Illiquid Asset Allocation Management',
    detailContent: 'Private equity commitments drawn during Q4 have increased illiquid allocation to 23% of portfolio value, exceeding 20% target. Distribution pace from mature funds insufficient to offset capital calls from  new vintage year commitments. Recommend temporarily reducing new PE commitments by 40% until liquid/illiquid balance restored through distributions. Alternative: liquidate $125K in public equity to restore target allocation immediately, opportunity cost estimated at 2.8% annually versus maintaining overweight position.'
  }
]

// Services - 4 Premium Boxes with Bento Background
const services = [
  { icon: <Shield className="w-4 h-4 text-[#C9A24D]" />, title: 'Threat Detection & Mitigation', description: 'Continuously monitors portfolio for emerging risks including volatility spikes, concentration issues, and correlation breakdowns before they impact returns.', colSpan: 2, hasPersistentHover: true },
  { icon: <TrendingUp className="w-4 h-4 text-[#9E7C32]" />, title: 'Alpha Generation Engine', description: 'Identifies market inefficiencies and opportunities across global markets using machine learning models trained on decades of price action and fundamental data.' },
  { icon: <Network className="w-4 h-4 text-[#E6C97A]" />, title: 'Multi-Agent Decision Framework', description: 'Specialized AI agents debate investment decisions from different perspectives before reaching consensus, reducing single-point-of-failure risks.', colSpan: 2 },
  { icon: <Bot className="w-4 h-4 text-[#C9A24D]" />, title: 'Dynamic Portfolio Rebalancing', description: 'Automatically adjusts allocations to maintain target weights, harvest tax losses, and capitalize on valuation dislocations across asset classes.' },
]

const faqs = [
  {
    question: 'What makes migrateX different from traditional robo-advisors?',
    answer: 'Traditional robo-advisors use simple rules-based rebalancing, while migrateX employs a sophisticated multi-agent AI architecture. Our system features four specialized agents (Risk, Growth, Compliance, Liquidity) that independently analyze markets and collaborate through a consensus engine. This approach captures nuanced opportunities and risks that single-model systems miss, resulting in superior risk-adjusted returns.'
  },
  {
    question: 'How does the consensus mechanism prevent AI hallucinations or errors?',
    answer: 'Our multi-agent architecture is specifically designed to prevent single-point failures. Each agent operates independently with different training data and objectives. The Consensus Engine only executes decisions when multiple agents agree, requiring verification from at least three of four specialized agents. This creates a checks-and-balances system where no single AI model can make unchecked decisions, dramatically reducing error rates compared to single-agent systems.'
  },
  {
    question: 'What is the typical timeline for seeing measurable performance improvements?',
    answer: 'Initial portfolio analysis and optimization recommendations appear within 24-48 hours of account connection. However, meaningful performance attribution typically becomes evident after 90-120 days as our agents collect behavioral data specific to your portfolio and  market positioning. Most clients observe statistically significant alpha generation (outperformance vs benchmarks) after two full quarters, with compounding benefits increasing over longer time horizons.'
  },
  {
    question: 'How do you ensure data security with multiple AI agents accessing my portfolio?',
    answer: 'We implement bank-level security with end-to-end encryption, zero-knowledge architecture, and distributed data processing. Each AI agent operates in an isolated container with restricted access permissions. Your portfolio data is sharded across secure databases with no single access point containing complete information. All inter-agent communication is encrypted, and we maintain SOC 2 Type II certification with annual third-party security audits.'
  },
  {
    question: 'Can I override agent recommendations or set custom constraints?',
    answer: 'Absolutely. migrateX operates in collaborative mode where you maintain full control. You can set hard constraints (never sell positions, avoid specific sectors, maintain minimum cash levels) that agents must respect. You can also configure "approval required" thresholds for trades above certain sizes. The system learns from your overrides, gradually aligning its recommendations with your demonstrated preferences while still highlighting situations where constraints may limit optimal outcomes.'
  },
  {
    question: 'What happens during extreme market volatility or flash crashes?',
    answer: 'Our Real-time Processing Agent monitors market microstructure continuously and activates enhanced protocols during volatility spikes. Circuit breakers automatically pause non-essential trading when volatility exceeds 3 standard deviations. The Risk Agent shifts to defensive positioning, increasing cash allocations and hedging strategies. All agents prioritize capital preservation over return optimization during crisis periods, with automatic reversion to normal mode once market conditions stabilize.'
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
                href="#"
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
                href="#"
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
            <h2 className="text-4xl md:text-5xl font-bold text-[#F5F5F5] mb-6">Multi-Agent Intelligence Platform</h2>
            <p className="text-lg text-[#CFCFCF] max-w-3xl mx-auto">
              Comprehensive AI-powered portfolio management solutions driven by specialized agent collaboration
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
