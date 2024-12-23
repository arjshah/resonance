'use client'

import { motion, AnimatePresence } from "framer-motion"
import { usePathname, useSearchParams } from "next/navigation"
import { ReactNode, useEffect, useState } from "react"

interface PageTransitionProps {
  children: ReactNode
  className?: string
}

export function PageTransition({ children, className }: PageTransitionProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(false)
    
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 350) // Slightly longer delay for smoother transition
    
    return () => clearTimeout(timer)
  }, [pathname, searchParams])

  return (
    <div className={className}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={pathname + searchParams?.toString()}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ 
            duration: 0.3,
            ease: [0.4, 0, 0.2, 1] // Use cubic bezier for smoother easing
          }}
        >
          {isVisible ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }} // Reduced y distance for subtler movement
              animate={{ 
                opacity: 1, 
                y: 0,
                transition: {
                  duration: 0.4,
                  ease: [0.0, 0.0, 0.2, 1] // Custom easing for smooth entry
                }
              }}
            >
              {children}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: 1,
                transition: {
                  duration: 0.3,
                  ease: "easeOut"
                }
              }}
              className="space-y-4"
            >
              <div className="h-8 bg-stone-100 dark:bg-stone-800 rounded-lg w-[200px] animate-pulse" />
              <div className="h-[400px] bg-stone-100 dark:bg-stone-800 rounded-lg animate-pulse" />
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}