"use client"
import { useState, useRef, useEffect } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { motion, AnimatePresence } from "framer-motion"
import { Brain, Send, Loader2, User, Sparkles, Zap, MessageSquare } from "lucide-react"
import { AIChatMessage } from "@/types"

export default function AskAI() {
  const [messages, setMessages] = useState<AIChatMessage[]>([])
  const [input, setInput]       = useState("")
  const [loading, setLoading]   = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }) }, [messages])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || loading) return

    const question = input.trim()
    setInput("")
    const userMsg: AIChatMessage = { role: "user", content: question, timestamp: new Date().toISOString() }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    try {
      const res = await fetch("/api/ai/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      })
      const data = await res.json()
      const aiMsg: AIChatMessage = {
        role: "assistant",
        content: data.answer ?? data.error ?? "An error occurred.",
        timestamp: new Date().toISOString(),
      }
      setMessages(prev => [...prev, aiMsg])
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Network error. Make sure Ollama is running (`ollama serve`).", timestamp: new Date().toISOString() }])
    } finally {
      setLoading(false)
    }
  }

  const suggestions = [
    "Summarize my latest notes",
    "What are the key points from my notes?",
    "Find connections between my notes",
    "What topics do I write about most?",
  ]

  return (
    <div className="flex flex-col h-full relative">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="orb orb-purple absolute top-[-200px] right-[-100px] animate-orb-float opacity-50" />
        <div className="dot-grid absolute inset-0 opacity-30" />
      </div>

      {/* Header */}
      <div className="px-6 py-4 border-b border-border glass-sidebar relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500/20 to-brand-400/10 border border-accent-400/15 flex items-center justify-center glow-purple">
            <Brain className="w-5 h-5 text-accent-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-text-1">Ask Broski</h2>
              <span className="px-2 py-0.5 rounded-md bg-accent-500/12 text-accent-400 text-[10px] font-bold uppercase tracking-wider border border-accent-400/10">
                Ollama
              </span>
            </div>
            <p className="text-xs text-text-3">Answers come only from your saved notes</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5 relative z-10">
        <AnimatePresence>
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center justify-center h-full text-center gap-5"
            >
              <motion.div
                className="w-24 h-24 rounded-3xl bg-accent-400/8 border border-accent-400/10 flex items-center justify-center glow-purple"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <Brain className="w-12 h-12 text-accent-400 opacity-70" />
              </motion.div>
              <div>
                <h3 className="text-xl font-bold text-text-1 mb-2">Your AI Assistant</h3>
                <p className="text-text-2 text-sm max-w-sm leading-relaxed">
                  Ask anything about your notes. I&apos;ll search through your knowledge base to find the answer.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center mt-2 max-w-lg">
                {suggestions.map((s, i) => (
                  <motion.button key={s} onClick={() => setInput(s)}
                    className="text-xs px-4 py-2.5 rounded-xl glass border border-brand-400/10 text-text-2 font-medium hover:border-brand-400/25 hover:text-brand-400 transition-all duration-200"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Sparkles className="w-3 h-3 inline mr-1.5 text-brand-400" />{s}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "assistant" && (
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-500/20 to-brand-400/10 border border-accent-400/15 flex items-center justify-center shrink-0 mt-0.5">
                <Brain className="w-4 h-4 text-accent-400" />
              </div>
            )}
            <div className={`max-w-[75%] rounded-2xl px-5 py-3.5 text-sm ${
              msg.role === "user"
                ? "bg-gradient-to-r from-brand-400/15 to-brand-400/8 text-text-1 border border-brand-400/10"
                : "glass border border-surface-700 text-text-1"
            }`}>
              {msg.role === "assistant"
                ? <div className="prose-brain"><ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown></div>
                : msg.content
              }
            </div>
            {msg.role === "user" && (
              <div className="w-9 h-9 rounded-xl bg-surface-800 border border-surface-700 flex items-center justify-center shrink-0 mt-0.5">
                <User className="w-4 h-4 text-text-2" />
              </div>
            )}
          </motion.div>
        ))}

        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-500/20 to-brand-400/10 border border-accent-400/15 flex items-center justify-center shrink-0">
              <Brain className="w-4 h-4 text-accent-400" />
            </div>
            <div className="glass rounded-2xl px-5 py-4 flex items-center gap-3 border border-surface-700">
              <div className="flex gap-1.5">
                {[0, 1, 2].map(i => (
                  <motion.div key={i} className="w-2.5 h-2.5 rounded-full bg-accent-400"
                    animate={{ scale: [0.6, 1, 0.6], opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" }}
                  />
                ))}
              </div>
              <span className="text-xs text-text-3 font-medium">Thinking…</span>
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-6 py-4 border-t border-border glass-sidebar relative z-10">
        <form onSubmit={handleSend} className="flex items-center gap-3">
          <div className="flex-1 relative">
            <input
              value={input} onChange={e => setInput(e.target.value)}
              placeholder="Ask anything from your notes…"
              className="w-full bg-surface-800 border border-border hover:border-text-3 rounded-xl px-5 py-3.5 pr-12 text-sm text-text-1 placeholder:text-text-3 focus:outline-none input-glow transition-all duration-200"
            />
            <MessageSquare className="w-4 h-4 text-text-3 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          <motion.button type="submit" disabled={!input.trim() || loading}
            className="w-12 h-12 rounded-xl btn-gradient flex items-center justify-center transition-all disabled:opacity-30 disabled:hover:shadow-none"
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
          >
            <Send className="w-4 h-4" />
          </motion.button>
        </form>
      </div>
    </div>
  )
}
