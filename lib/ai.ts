import { Note } from "@/types"

// ── Helpers ──────────────────────────────────────────────────────────────────
function buildNotesContext(notes: Note[], maxChars = 12000): string {
  let ctx = ""
  for (const n of notes) {
    const snippet = `--- NOTE: "${n.title}" ---\n${n.content}\n\n`
    if (ctx.length + snippet.length > maxChars) {
      const remaining = maxChars - ctx.length - 100
      if (remaining > 200) {
        ctx += `--- NOTE: "${n.title}" ---\n${n.content.substring(0, remaining)}…\n\n`
      }
      break
    }
    ctx += snippet
  }
  return ctx
}

const OLLAMA_BASE = () => process.env.OLLAMA_BASE_URL || "http://localhost:11434"
const OLLAMA_MODEL = () => process.env.OLLAMA_MODEL || "llama3"

// Timeout wrapper — aborts request after given ms
function fetchWithTimeout(url: string, options: RequestInit, timeoutMs = 120000) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(timer))
}

// ── Summarize a single note via Ollama ───────────────────────────────────────
export async function summarizeOllama(
  note: Note,
  type: "2-mark" | "5-mark" | "10-mark"
): Promise<string> {
  const wordLimits = { "2-mark": 60, "5-mark": 150, "10-mark": 300 }
  const limit = wordLimits[type]

  // Truncate content to prevent huge prompts exceeding VRAM
  const content = note.content.length > 8000 ? note.content.substring(0, 8000) + "…" : note.content

  const res = await fetchWithTimeout(`${OLLAMA_BASE()}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: OLLAMA_MODEL(),
      prompt: `Summarize the following note in approximately ${limit} words for a ${type} exam answer.\nBe concise and structured. Use bullet points.\n\nNOTE TITLE: ${note.title}\nNOTE CONTENT:\n${content}`,
      stream: false,
      options: {
        num_ctx: 4096,        // Optimize VRAM usage for RTX 4060
        num_predict: 1024,    // Allow longer, smarter responses
        temperature: 0.4,     // Balanced creativity/focus
      },
    }),
  }, 120000)

  if (!res.ok) {
    const errText = await res.text().catch(() => "Unknown error")
    throw new Error(`Ollama error (${res.status}): ${errText}`)
  }

  const data = await res.json()
  return data.response
}

// ── Ask AI a question from notes context via Ollama ──────────────────────────
export async function askOllama(question: string, notes: Note[]): Promise<string> {
  // Allow up to 12,000 characters to fit well within a 4096 token context window
  const context = buildNotesContext(notes, 12000)

  const res = await fetchWithTimeout(`${OLLAMA_BASE()}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: OLLAMA_MODEL(),
      prompt: `You are Broski, an intelligent, highly capable second brain assistant. 
First, try to answer the user's question clearly and comprehensively using the notes provided below. 
If the notes do not contain the answer, you should answer using your own extensive general knowledge, but kindly mention that you are answering from your general knowledge since it wasn't found in their notes.

NOTES:
${context}

Question: ${question}
Answer:`,
      stream: false,
      options: {
        num_ctx: 4096,        // Optimize VRAM usage for RTX 4060
        num_predict: 1024,    // Allow longer, smarter responses
        temperature: 0.4,
      },
    }),
  }, 120000)

  if (!res.ok) {
    const errText = await res.text().catch(() => "Unknown error")
    throw new Error(`Ollama error (${res.status}): ${errText}`)
  }

  const data = await res.json()
  return data.response
}
