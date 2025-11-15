"use client"

import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { useState } from "react"

interface HeroWelcomeProps {
  onGetStarted: () => void
}

export default function HeroWelcome({ onGetStarted }: HeroWelcomeProps) {
  const [isAnimating, setIsAnimating] = useState(false)
  const [isHover, setIsHover] = useState(false)
  const [isCollapsing, setIsCollapsing] = useState(false)

  const handleGetStartedClick = () => {
    if (isAnimating || isCollapsing) return
    setIsAnimating(true)

    // Start the collapse animation
    setTimeout(() => {
      setIsCollapsing(true)
      setIsAnimating(false)

      // After the collapse finishes, call onGetStarted
      setTimeout(() => {
        onGetStarted()
      }, 800) // delay matches collapse animation
    }, 400)
  }

  return (
    <AnimatePresence>
      {!isCollapsing && (
        <motion.div
          key="hero"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{
            opacity: 0,
            scale: 0.7,
            y: 200, // move downward like collapsing
            transition: { duration: 0.8, ease: "easeInOut" },
          }}
          transition={{ duration: 0.8 }}
          className="relative w-full min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#ddfef8] px-4 sm:px-6 md:px-8"
        >
          {/* Background shapes */}
          <div className="absolute top-0 right-0 w-[80%] sm:w-[70%] h-[60%] sm:h-[70%] bg-[#ace6f2] rotate-[10deg] translate-x-1/4 -translate-y-1/4 rounded-tr-[3rem] sm:rounded-tr-[4rem]" />
          <div className="absolute bottom-0 left-0 w-[70%] sm:w-[60%] h-[50%] sm:h-[60%] bg-[#86d6e6] opacity-90 -rotate-[15deg] -translate-x-1/3 translate-y-1/4 rounded-tl-[3rem] sm:rounded-tl-[4rem]" />

          {/* Content */}
          <div className="relative z-10 w-full max-w-md sm:max-w-lg md:max-w-2xl text-center space-y-10 sm:space-y-12">
            {/* Logo */}
            <motion.div
              initial={{ scale: 0, rotate: -180, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 100, damping: 15 }}
              className="flex justify-center"
            >
              <img 
                src="/kivo-logo.png" 
                alt="Kivo Logo" 
                className="w-28 h-28 sm:w-24 sm:h-24 object-contain drop-shadow-2xl"
              />
            </motion.div>

            {/* Heading */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#0093af] leading-tight">
                Kivo Smart Wallet
              </h1>
            </motion.div>

            {/* Get Started Button */}
            <motion.button
              onClick={handleGetStartedClick}
              onHoverStart={() => setIsHover(true)}
              onHoverEnd={() => setIsHover(false)}
              className={`relative mx-auto flex items-center justify-center gap-10 sm:gap-16 md:gap-20 pr-5 rounded-full font-semibold overflow-hidden
                bg-[#0093af] text-white transition-all group duration-300 shadow-lg 
                ${isHover ? "scale-105 shadow-2xl" : ""}`}
            >
              {/* Sliding overlay */}
              <motion.div
                className="absolute top-0 left-0 w-full h-full bg-white/20 rounded-full"
                initial={{ x: "-100%" }}
                animate={{ x: isAnimating ? "100%" : "-100%" }}
                transition={{ type: "tween", duration: 0.6 }}
              />

              {/* Arrow Icon */}
              <motion.span
                className="relative z-10 py-5 px-6 sm:py-6 sm:px-8 flex items-center justify-center group-hover:translate-x-6 duration-300 ease-in-out rounded-full bg-white text-[#0093af]"
                animate={{ x: isAnimating ? 200 : 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                <ArrowRight size={22} />
              </motion.span>

              {/* Text */}
              <span className="relative z-10 text-lg sm:text-xl font-semibold text-center">
                Get Started
              </span>
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
