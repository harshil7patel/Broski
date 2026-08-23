"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { createClient } from "@/lib/supabase/client"
import { Note } from "@/types"
import { cn, truncate, formatDate } from "@/lib/utils"
import {
  Brain, Plus, Search, Pin, Trash2,
  LayoutDashboard, MessageSquare, LogOut, ChevronLeft, ChevronRight, FileUp
} from "lucide-react"
import toast from "react-hot-toast"
import PdfUpload from "@/components/notes/PdfUpload"

interface SidebarProps {
  notes: Note[]
  activeNoteId?: string
  onNewNote: () => void
  onDeleteNote: (id: string) => void
  onTogglePin: (note: Note) => void
  searchQuery: string
  onSearch: (q: string) => void
}

export default function Sidebar({
  notes, activeNoteId, onNewNote, onDeleteNote, onTogglePin, searchQuery, onSearch,
}: SidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const [collapsed, setCollapsed] = useState(false)
  const [hoverId, setHoverId] = useState<string | null>(null)
  const [showPdfUpload, setShowPdfUpload] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [searchFocused, setSearchFocused] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })
  }, [supabase])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push("/login")
  }

  function handlePdfUploaded(noteId: string) {
    setShowPdfUpload(false)
    router.push(`/notes/${noteId}`)
    router.refresh()
  }

  const pinnedNotes = notes.filter(n => n.is_pinned)
  const otherNotes  = notes.filter(n => !n.is_pinned)

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, active: pathname === "/dashboard" && !pathname.includes("ai") },
    { href: "/dashboard?tab=ai", label: "Ask AI", icon: MessageSquare, active: pathname.includes("ai") },
  ]

  if (collapsed) return (
    <motion.aside
      initial={{ width: 256 }}
      animate={{ width: 64 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="glass-sidebar border-r border-border flex flex-col items-center py-4 gap-3"
    >
      <div className="w-9 h-9 rounded-xl bg-brand-400/10 border border-brand-400/15 flex items-center justify-center glow-brand">
        <Brain className="w-4 h-4 text-brand-400" />
      </div>
      <button onClick={() => setCollapsed(false)} className="p-2 rounded-lg hover:bg-surface-700 text-text-3 transition-colors">
        <ChevronRight className="w-4 h-4" />
      </button>

      <div className="w-8 h-[1px] bg-border" />

      {navItems.map(item => (
        <Link key={item.href} href={item.href}
          className={cn("p-2.5 rounded-xl transition-all duration-200",
            item.active ? "bg-brand-400/10 text-brand-400 shadow-lg shadow-brand-400/5" : "text-text-3 hover:bg-surface-700 hover:text-text-2"
          )}>
          <item.icon className="w-4 h-4" />
        </Link>
      ))}

      <div className="w-8 h-[1px] bg-border" />

      <motion.button onClick={onNewNote}
        className="p-2.5 rounded-xl bg-brand-400/10 text-brand-400 hover:bg-brand-400/20 transition-colors"
        animate={{ boxShadow: ["0 0 0 0 rgba(0,245,212,0)", "0 0 0 6px rgba(0,245,212,0.1)", "0 0 0 0 rgba(0,245,212,0)"] }}
        transition={{ duration: 2.5, repeat: Infinity }}>
        <Plus className="w-4 h-4" />
      </motion.button>

      <div className="flex-1" />

      {user && (
        <div className="w-9 h-9 rounded-full bg-brand-400/10 border border-brand-400/15 flex items-center justify-center shrink-0 overflow-hidden relative">
          {user.user_metadata?.avatar_url ? (
            <img src={user.user_metadata.avatar_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-brand-400 font-semibold text-xs">
              {user.email?.[0].toUpperCase() || "U"}
            </span>
          )}
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-surface-900" />
        </div>
      )}
      <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-surface-700 text-text-3 hover:text-red-400 transition-colors" title="Sign out">
        <LogOut className="w-4 h-4" />
      </button>
    </motion.aside>
  )

  return (
    <>
      <motion.aside
        initial={{ width: 64 }}
        animate={{ width: 272 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="w-[272px] glass-sidebar border-r border-border flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-400/10 border border-brand-400/15 flex items-center justify-center glow-brand">
              <Brain className="w-4 h-4 text-brand-400" />
            </div>
            <span className="font-bold text-text-1 text-sm gradient-text">Broski</span>
          </div>
          <button onClick={() => setCollapsed(true)} className="p-1.5 rounded-lg hover:bg-surface-700 text-text-3 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="px-2 py-3 border-b border-border space-y-1">
          {navItems.map(item => (
            <Link key={item.href} href={item.href} className={cn(
              "flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 relative",
              item.active
                ? "bg-brand-400/10 text-brand-400 shadow-lg shadow-brand-400/5 font-medium"
                : "text-text-2 hover:bg-surface-700/60 hover:text-text-1"
            )}>
              {item.active && (
                <motion.div layoutId="sidebar-active"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-brand-400 rounded-full"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <item.icon className="w-4 h-4" />
              {item.label}
              {item.label === "Ask AI" && (
                <span className="ml-auto px-1.5 py-0.5 rounded-md bg-accent-500/15 text-accent-400 text-[10px] font-semibold">AI</span>
              )}
            </Link>
          ))}
        </nav>

        {/* Search */}
        <div className="px-3 py-2 border-b border-border">
          <motion.div
            className={cn(
              "flex items-center gap-2 rounded-xl px-3 py-2.5 transition-all duration-300 border",
              searchFocused
                ? "bg-surface-800/80 border-brand-400/30 shadow-lg shadow-brand-400/5"
                : "bg-surface-800/40 border-transparent"
            )}
          >
            <Search className={cn("w-3.5 h-3.5 shrink-0 transition-colors", searchFocused ? "text-brand-400" : "text-text-3")} />
            <input
              value={searchQuery} onChange={e => onSearch(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder="Search notes…"
              className="bg-transparent text-xs text-text-1 placeholder:text-text-3 w-full focus:outline-none"
            />
          </motion.div>
        </div>

        {/* New Note + PDF Upload */}
        <div className="px-3 py-2.5 space-y-1.5">
          <motion.button onClick={onNewNote}
            className="w-full flex items-center gap-2 btn-gradient rounded-xl px-3 py-2.5 text-sm font-semibold"
            whileTap={{ scale: 0.98 }}
            animate={{ boxShadow: ["0 0 0 0 rgba(0,245,212,0)", "0 0 0 6px rgba(0,245,212,0.08)", "0 0 0 0 rgba(0,245,212,0)"] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Plus className="w-4 h-4" /> New Note
          </motion.button>
          <button onClick={() => setShowPdfUpload(true)}
            className="w-full flex items-center gap-2 bg-surface-800/40 hover:bg-surface-700/60 text-text-2 hover:text-text-1 rounded-xl px-3 py-2 text-sm transition-all duration-200 border border-transparent hover:border-border">
            <FileUp className="w-4 h-4" /> Import PDF
          </button>
        </div>

        {/* Notes list */}
        <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-0.5">
          {pinnedNotes.length > 0 && (
            <>
              <p className="px-3 py-2 text-[10px] text-text-3 font-semibold uppercase tracking-widest">Pinned</p>
              {pinnedNotes.map((note, i) => (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <NoteItem note={note} active={note.id === activeNoteId}
                    hovered={hoverId === note.id} onHover={setHoverId}
                    onDelete={onDeleteNote} onPin={onTogglePin} />
                </motion.div>
              ))}
            </>
          )}
          {otherNotes.length > 0 && (
            <>
              <p className="px-3 py-2 text-[10px] text-text-3 font-semibold uppercase tracking-widest mt-2">Notes</p>
              {otherNotes.map((note, i) => (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <NoteItem note={note} active={note.id === activeNoteId}
                    hovered={hoverId === note.id} onHover={setHoverId}
                    onDelete={onDeleteNote} onPin={onTogglePin} />
                </motion.div>
              ))}
            </>
          )}
          {notes.length === 0 && (
            <div className="text-center py-8">
              <div className="w-10 h-10 rounded-xl bg-surface-800 flex items-center justify-center mx-auto mb-3">
                <FileUp className="w-5 h-5 text-text-3" />
              </div>
              <p className="text-text-3 text-xs">No notes yet</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border px-3 py-3 space-y-2">
          {user && (
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-surface-800/30 border border-surface-700/50">
              <div className="w-9 h-9 rounded-full bg-brand-400/10 border border-brand-400/15 flex items-center justify-center shrink-0 overflow-hidden relative">
                {user.user_metadata?.avatar_url ? (
                  <img src={user.user_metadata.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-brand-400 font-semibold text-xs">
                    {user.email?.[0].toUpperCase() || "U"}
                  </span>
                )}
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-surface-900" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-1 truncate">
                  {user.user_metadata?.full_name || user.email}
                </p>
                <p className="text-[11px] text-text-3 truncate">{user.email}</p>
              </div>
            </div>
          )}
          <button onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-text-2 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200">
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </motion.aside>

      {/* PDF Upload Modal */}
      {showPdfUpload && (
        <PdfUpload onUploaded={handlePdfUploaded} onClose={() => setShowPdfUpload(false)} />
      )}
    </>
  )
}

function NoteItem({ note, active, hovered, onHover, onDelete, onPin }:
  { note: Note; active: boolean; hovered: boolean; onHover: (id: string | null) => void;
    onDelete: (id: string) => void; onPin: (note: Note) => void }) {

  const tagColors = ["text-brand-400", "text-accent-400", "text-blue-400", "text-amber-400", "text-pink-400"]

  return (
    <Link href={`/notes/${note.id}`}
      onMouseEnter={() => onHover(note.id)} onMouseLeave={() => onHover(null)}
      className={cn(
        "block px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
        active
          ? "bg-brand-400/8 border border-brand-400/10 text-text-1 shadow-sm shadow-brand-400/5"
          : "hover:bg-surface-700/40 text-text-2 border border-transparent"
      )}>
      {active && (
        <motion.div layoutId="note-active"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 bg-brand-400 rounded-full"
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      )}
      <div className="flex items-start justify-between gap-1">
        <p className="text-xs font-medium text-text-1 truncate flex-1 flex items-center gap-1.5">
          {note.is_pinned && <span className="w-1.5 h-1.5 rounded-full bg-brand-400 shrink-0" />}
          {note.tags?.[0] && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${tagColors[note.tags[0].length % tagColors.length]} bg-current`} />}
          {truncate(note.title || "Untitled", 24)}
        </p>
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-0.5 shrink-0"
            >
              <button onClick={e => { e.preventDefault(); onPin(note) }}
                className="p-1 rounded-lg hover:bg-surface-600 text-text-3 hover:text-brand-400 transition-colors">
                <Pin className="w-3 h-3" />
              </button>
              <button onClick={e => { e.preventDefault(); onDelete(note.id) }}
                className="p-1 rounded-lg hover:bg-surface-600 text-text-3 hover:text-red-400 transition-colors">
                <Trash2 className="w-3 h-3" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <p className="text-[11px] text-text-3 mt-0.5">{formatDate(note.updated_at)}</p>
    </Link>
  )
}
