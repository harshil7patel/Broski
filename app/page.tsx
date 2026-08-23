"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { motion } from "framer-motion"
import { Brain } from "lucide-react"

export default function Home() {
  const router = useRouter()
  const supabase = createClient()
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace("/dashboard")
      } else {
        router.replace("/login")
      }
      setChecked(true)
    })
  }, [supabase, router])

  return (
    <div className="min-h-screen bg-surface-950 flex flex-col items-center justify-center gap-4 relative overflow-hidden">
      <div className="orb orb-cyan absolute top-[-200px] right-[-100px] animate-orb-float" />
      <div className="orb orb-purple absolute bottom-[-150px] left-[-100px] animate-orb-float-2" />
      <motion.div
        className="w-16 h-16 rounded-2xl bg-brand-400/10 border border-brand-400/20 flex items-center justify-center glow-brand"
        animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <Brain className="w-8 h-8 text-brand-400" />
      </motion.div>
      <p className="text-text-2 text-sm animate-pulse font-medium">Loading Broski…</p>
    </div>
  )
}
