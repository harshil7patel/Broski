"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { motion } from "framer-motion"
import toast from "react-hot-toast"
import { Brain, Loader2, CheckCircle, Sparkles, Zap, Shield, FileText, MessageSquare } from "lucide-react"

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
)

const nodes = [
  { x: 20, y: 25, size: 6, delay: 0 },
  { x: 45, y: 15, size: 8, delay: 0.5 },
  { x: 70, y: 30, size: 5, delay: 1 },
  { x: 30, y: 55, size: 7, delay: 1.5 },
  { x: 60, y: 50, size: 6, delay: 0.8 },
  { x: 50, y: 75, size: 9, delay: 0.3 },
  { x: 15, y: 70, size: 5, delay: 1.2 },
  { x: 80, y: 65, size: 6, delay: 0.6 },
  { x: 35, y: 40, size: 10, delay: 0.2 },
  { x: 75, y: 80, size: 5, delay: 1.8 },
]

const connections = [
  [0, 1], [1, 2], [0, 3], [3, 4], [4, 2],
  [3, 5], [5, 6], [4, 7], [0, 8], [8, 4],
  [5, 9], [7, 9], [6, 8],
]

const features = [
  { icon: FileText, title: "Smart Notes", desc: "Capture and organize your thoughts with AI assistance" },
  { icon: MessageSquare, title: "Ask Your Brain", desc: "Query your knowledge base with natural language" },
  { icon: Sparkles, title: "AI Summaries", desc: "Get instant summaries from your notes in any format" },
]

export default function SignupPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace("/dashboard")
      else setChecking(false)
    })
  }, [supabase, router])

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErrorMsg(null)
    try {
      const { data, error } = await supabase.auth.signUp({
        email, password,
        options: { data: { full_name: name } },
      })
      if (error) {
        setErrorMsg(error.message)
        toast.error(error.message)
        setLoading(false)
        return
      }
      if (data.session) {
        toast.success("Account created!")
        router.replace("/dashboard")
      } else {
        setDone(true)
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred")
      toast.error(err.message || "An unexpected error occurred")
      setLoading(false)
    }
  }

  async function handleGoogleSignIn() {
    setLoading(true)
    setErrorMsg(null)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) {
        setErrorMsg(error.message)
        toast.error(error.message)
        setLoading(false)
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred")
      toast.error(err.message || "An unexpected error occurred")
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-surface-950 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-brand-400 animate-spin" />
      </div>
    )
  }

  if (done) return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center p-4 relative">
      <div className="orb orb-cyan absolute top-[-100px] right-[-100px] animate-orb-float" />
      <motion.div
        className="glass rounded-3xl p-8 max-w-md w-full text-center border-glow"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="w-16 h-16 rounded-2xl bg-brand-400/10 border border-brand-400/20 flex items-center justify-center mx-auto mb-4 glow-brand">
          <CheckCircle className="w-8 h-8 text-brand-400" />
        </div>
        <h2 className="text-xl font-bold text-text-1 mb-2">Check your email</h2>
        <p className="text-text-2 text-sm mb-4">We sent a confirmation link to <strong className="text-text-1">{email}</strong>.</p>
        <p className="text-text-3 text-xs mb-4">
          <strong>Dev tip:</strong> Disable email confirmation in Supabase → Auth → Providers → Email.
        </p>
        <Link href="/login" className="text-brand-400 hover:text-brand-300 text-sm font-medium transition-colors">
          ← Back to login
        </Link>
      </motion.div>
    </div>
  )

  return (
    <div className="min-h-screen bg-surface-950 flex">
      {/* LEFT — Brand Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center">
        <div className="orb orb-cyan absolute top-[-100px] right-[-100px] animate-orb-float" />
        <div className="orb orb-purple absolute bottom-[-50px] left-[-50px] animate-orb-float-2" />
        <div className="dot-grid absolute inset-0" />

        <div className="absolute inset-0">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            {connections.map(([a, b], i) => (
              <motion.line
                key={i}
                x1={`${nodes[a].x}%`} y1={`${nodes[a].y}%`}
                x2={`${nodes[b].x}%`} y2={`${nodes[b].y}%`}
                stroke="rgba(0, 245, 212, 0.12)"
                strokeWidth="0.2"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 2, delay: 0.5 + i * 0.1 }}
                className="animate-line"
              />
            ))}
          </svg>
          {nodes.map((node, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full animate-node"
              style={{
                left: `${node.x}%`, top: `${node.y}%`,
                width: node.size, height: node.size,
                background: i % 3 === 0 ? "rgba(0, 245, 212, 0.4)" : i % 3 === 1 ? "rgba(139, 92, 246, 0.35)" : "rgba(0, 245, 212, 0.2)",
                boxShadow: i % 3 === 0 ? "0 0 15px rgba(0, 245, 212, 0.3)" : "0 0 15px rgba(139, 92, 246, 0.2)",
                animationDelay: `${node.delay}s`,
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: node.delay }}
            />
          ))}
        </div>

        <div className="relative z-10 px-12 max-w-lg">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-brand-400/10 border border-brand-400/20 flex items-center justify-center glow-brand pulse-ring">
                <Brain className="w-7 h-7 text-brand-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold gradient-text">Broski</h1>
                <p className="text-sm text-text-2">Powered by Ollama</p>
              </div>
            </div>
            <p className="text-xl text-text-1 font-semibold mb-2">Your intelligent knowledge base</p>
            <p className="text-text-2 mb-10 leading-relaxed">
              Store your thoughts, notes, and documents — then ask AI to find patterns,
              generate summaries, and unlock insights from your personal knowledge.
            </p>
            <div className="space-y-5">
              {features.map((f, i) => (
                <motion.div key={f.title} className="flex items-start gap-4"
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.15 }}>
                  <div className="w-10 h-10 rounded-xl bg-brand-400/10 border border-brand-400/10 flex items-center justify-center shrink-0">
                    <f.icon className="w-5 h-5 text-brand-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-1">{f.title}</p>
                    <p className="text-xs text-text-2">{f.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* RIGHT — Signup Form */}
      <div className="flex-1 flex items-center justify-center p-6 relative">
        <div className="lg:hidden orb orb-cyan absolute top-[-100px] right-[-100px] animate-orb-float" />
        <div className="lg:hidden orb orb-purple absolute bottom-[-50px] left-[-50px] animate-orb-float-2" />

        <div className="w-full max-w-md relative z-10">
          <motion.div className="flex items-center gap-3 mb-8 lg:hidden justify-center"
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="w-12 h-12 rounded-2xl bg-brand-400/10 border border-brand-400/20 flex items-center justify-center glow-brand pulse-ring">
              <Brain className="w-6 h-6 text-brand-400" />
            </div>
            <div>
              <span className="text-2xl font-bold gradient-text">Broski</span>
              <p className="text-xs text-text-2">Powered by Ollama</p>
            </div>
          </motion.div>

          <motion.div className="glass rounded-3xl p-8 border-glow"
            initial={{ opacity: 0, y: 20, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}>
            <h1 className="text-2xl font-bold text-text-1 mb-1">Create account</h1>
            <p className="text-text-2 text-sm mb-6">Start building your second brain today</p>

            {errorMsg && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl mb-6">
                {errorMsg}
              </motion.div>
            )}

            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="block text-sm text-text-2 mb-1.5 font-medium">Full name</label>
                <input type="text" required value={name} onChange={e => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full bg-surface-800 border border-border hover:border-text-3 rounded-xl px-4 py-3 text-text-1 placeholder:text-text-3 focus:outline-none input-glow transition-all duration-200" />
              </div>
              <div>
                <label className="block text-sm text-text-2 mb-1.5 font-medium">Email</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-surface-800 border border-border hover:border-text-3 rounded-xl px-4 py-3 text-text-1 placeholder:text-text-3 focus:outline-none input-glow transition-all duration-200" />
              </div>
              <div>
                <label className="block text-sm text-text-2 mb-1.5 font-medium">Password</label>
                <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="w-full bg-surface-800 border border-border hover:border-text-3 rounded-xl px-4 py-3 text-text-1 placeholder:text-text-3 focus:outline-none input-glow transition-all duration-200" />
              </div>
              <motion.button type="submit" disabled={loading} whileTap={{ scale: 0.98 }}
                className="w-full btn-gradient py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60 text-sm">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating…</> : <><Sparkles className="w-4 h-4" /> Create account</>}
              </motion.button>
            </form>

            <div className="mt-6 flex items-center justify-between">
              <hr className="w-full border-surface-700" />
              <span className="px-3 text-sm text-text-3 whitespace-nowrap">Or continue with</span>
              <hr className="w-full border-surface-700" />
            </div>

            <div className="mt-4">
              <button type="button" onClick={handleGoogleSignIn} disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-surface-800 hover:bg-surface-700 border border-border hover:border-text-3 text-text-1 font-medium py-3 rounded-xl transition-all duration-200 disabled:opacity-60">
                <GoogleIcon />
                Sign in with Google
              </button>
            </div>

            <p className="text-center text-text-2 text-sm mt-6">
              Already have an account?{" "}
              <Link href="/login" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">Sign in →</Link>
            </p>
          </motion.div>

          <motion.div className="flex justify-center gap-6 mt-8 text-xs text-text-3"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
            <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-brand-400" /> Secure</span>
            <span className="flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-accent-400" /> AI-Powered</span>
            <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-brand-400" /> Local AI</span>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
