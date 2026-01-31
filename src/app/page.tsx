'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Bot, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function Home() {
  // For now, show a simple landing that links to dashboard
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-8 p-8"
      >
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
            <Bot className="w-10 h-10 text-primary" />
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Self-Healing Support Agent
          </h1>
          <p className="text-xl text-muted-foreground max-w-lg mx-auto">
            Autonomous Signal Processing & Decision Engine for production support systems
          </p>
        </div>

        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-full font-medium text-lg hover:scale-105 transition-all shadow-lg shadow-primary/25"
        >
          Open Dashboard
          <ArrowRight className="w-5 h-5" />
        </Link>

        <div className="text-sm text-muted-foreground/60 pt-8">
          <p>Powered by multi-agent architecture</p>
        </div>
      </motion.div>
    </div>
  )
}
