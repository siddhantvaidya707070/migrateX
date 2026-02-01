'use client'

import { ReactNode } from 'react'
// Temporarily disabled Lenis smooth scroll to fix loading loop
// import Lenis from 'lenis'

export function SmoothScroll({ children }: { children: ReactNode }) {
  // Smooth scroll temporarily disabled to fix loading issues
  // useEffect(() => {
  //   const lenis = new Lenis({
  //     duration: 1.2,
  //     easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  //   })

  //   function raf(time: number) {
  //     lenis.raf(time)
  //     requestAnimationFrame(raf)
  //   }

  //   requestAnimationFrame(raf)

  //   return () => {
  //     lenis.destroy()
  //   }
  // }, [])

  return <>{children}</>
}
