"use client"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Download, FileText, FileCode, X } from "lucide-react"
import { Note } from "@/types"

interface ExportNoteProps {
  note: Note
  onClose: () => void
}

const FORMATS = [
  { key: "md", label: "Markdown", ext: ".md", icon: FileCode, desc: "With formatting" },
  { key: "txt", label: "Plain Text", ext: ".txt", icon: FileText, desc: "Raw text only" },
] as const

type FormatKey = typeof FORMATS[number]["key"]

export default function ExportNote({ note, onClose }: ExportNoteProps) {
  const [format, setFormat] = useState<FormatKey>("md")

  function buildContent(): string {
    if (format === "md") {
      let md = `# ${note.title}\n\n`
      if (note.tags?.length) md += `**Tags:** ${note.tags.join(", ")}\n\n`
      md += `---\n\n`
      md += note.content
      md += `\n\n---\n*Exported from Broski on ${new Date().toLocaleDateString()}*\n`
      return md
    }
    let txt = `${note.title}\n${"=".repeat(note.title.length)}\n\n`
    if (note.tags?.length) txt += `Tags: ${note.tags.join(", ")}\n\n`
    txt += note.content
    return txt
  }

  function handleExport() {
    const content = buildContent()
    const fmt = FORMATS.find(f => f.key === format)!
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    
    // Safely generate a filename
    let safeTitle = "note"
    if (note && typeof note.title === "string") {
      const sanitized = note.title.replace(/[^a-zA-Z0-9 -]/g, "").trim()
      if (sanitized) safeTitle = sanitized
    }
    const finalName = `${safeTitle}${fmt.ext}`

    a.style.display = "none"
    a.href = url
    a.download = finalName
    a.setAttribute("download", finalName)
    
    document.body.appendChild(a)
    a.click()
    
    setTimeout(() => {
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }, 100)
    
    onClose()
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="glass rounded-2xl p-6 w-full max-w-sm mx-4 border-glow"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-brand-400/10 border border-brand-400/15 flex items-center justify-center">
                <Download className="w-4 h-4 text-brand-400" />
              </div>
              <h3 className="text-sm font-bold text-text-1">Export Note</h3>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-700 text-text-3 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Format options */}
          <div className="space-y-2 mb-5">
            {FORMATS.map(f => (
              <motion.button
                key={f.key}
                onClick={() => setFormat(f.key)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 text-left border ${
                  format === f.key
                    ? "bg-brand-400/8 border-brand-400/20 text-text-1 shadow-lg shadow-brand-400/5"
                    : "bg-surface-800/40 border-transparent text-text-2 hover:bg-surface-700/60"
                }`}
                whileTap={{ scale: 0.98 }}
              >
                <f.icon className={`w-4 h-4 ${format === f.key ? "text-brand-400" : "text-text-3"}`} />
                <div>
                  <p className="text-sm font-semibold">{f.label}</p>
                  <p className="text-xs text-text-3">{f.desc}</p>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Export button */}
          <motion.button
            onClick={handleExport}
            className="w-full flex items-center justify-center gap-2 btn-gradient py-3 rounded-xl text-sm font-bold"
            whileTap={{ scale: 0.98 }}
          >
            <Download className="w-4 h-4" />
            Export as {FORMATS.find(f => f.key === format)?.label}
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
