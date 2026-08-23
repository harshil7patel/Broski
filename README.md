# 🧠 Broski — AI Second Brain & Knowledge Base

A sleek, AI-powered note-taking and knowledge base application where you can capture thoughts, organize notes with tags, upload PDFs, generate exam-style summaries (2-mark, 5-mark, 10-mark), and ask AI questions directly from your own personal knowledge base.

---

## 🚀 Features

- 📝 **Rich Note Editor**: Markdown support, auto-save (debounced), word count, and timestamps.
- 💬 **Ask Broski (AI Assistant)**: Ask questions and get answers synthesized directly from your personal notes context.
- ⚡ **Structured Summaries**: One-click generation of 2-mark (quick recap), 5-mark (concept overview), and 10-mark (comprehensive breakdown) exam summaries.
- 📄 **PDF Text Extraction**: Upload PDF documents directly to convert them into searchable notes.
- 🔐 **Authentication**: User registration and login powered by Supabase Auth with Row Level Security (RLS).
- 🏷️ **Tagging & Organization**: Pin notes, search through titles and content, and organize with custom tags.
- 📤 **Export Notes**: Export notes to Markdown (`.md`) or Plain Text (`.txt`) at any time.
- 🎨 **Modern Dark Aesthetics**: Custom glassmorphism design, glowing accents, fluid animations with Framer Motion, and responsive layout.

---

## ⚡ Quick Start

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/harshil7patel/Broski.git broski
cd broski
npm install
```

### 2. Configure Environment Variables
Copy the `.env.example` file to create `.env.local`:
```bash
cp .env.example .env.local
```

Fill in your configuration keys in `.env.local`:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Ollama / Local AI
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3
```

---

## 🗄️ Supabase Setup

1. Create a project at [supabase.com](https://supabase.com).
2. Go to the **SQL Editor** in your Supabase dashboard and run the schema script located in [`supabase-schema.sql`](supabase-schema.sql).
3. Under **Authentication** &rarr; **Providers**, ensure the **Email** provider is enabled.
4. Copy your **Project URL** and **anon key** from **Project Settings** &rarr; **API**, and add them to `.env.local`.

---

## 🤖 AI Setup (Ollama)

Broski uses **Ollama** for local, private AI inference with no external API charges:

1. Download and install [Ollama](https://ollama.ai).
2. Pull the default model:
   ```bash
   ollama pull llama3
   ```
3. Start the Ollama service:
   ```bash
   ollama serve
   ```
4. Verify your `OLLAMA_BASE_URL` in `.env.local` points to `http://localhost:11434`.

---

## 🛠️ Development & Build

Run the local development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

To create a production build:
```bash
npm run build
npm run start
```

---

## 📁 Project Structure

```
broski/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx         # Login page
│   │   └── signup/page.tsx        # Signup page
│   ├── api/
│   │   ├── ai/
│   │   │   ├── ask/route.ts       # AI Q&A route
│   │   │   └── summarize/route.ts # AI summary route
│   │   ├── auth/                  # Auth endpoints
│   │   └── notes/                 # Note CRUD & upload endpoints
│   ├── dashboard/page.tsx         # Main dashboard
│   ├── notes/[id]/page.tsx        # Note editor page
│   └── layout.tsx                 # Root layout & global metadata
├── components/
│   ├── ai/
│   │   ├── AskAI.tsx              # AI Q&A assistant interface
│   │   └── SummaryPanel.tsx       # 2/5/10-mark summary generator
│   ├── layout/
│   │   └── Sidebar.tsx            # Navigation sidebar
│   └── notes/
│       ├── ExportNote.tsx         # Note export modal
│       ├── NoteEditor.tsx         # Markdown note editor
│       └── PdfUpload.tsx          # PDF upload handler
├── lib/
│   ├── ai.ts                      # Ollama AI integration & prompt orchestration
│   ├── supabase/                  # Browser & server Supabase clients
│   └── utils.ts                   # Formatting & utility functions
├── supabase-schema.sql            # Database schema & RLS policies
├── .env.example                   # Template environment variables
└── README.md
```

---

## 🔒 Security & Privacy Notes

- Notes are protected using Supabase **Row Level Security (RLS)** — users can only access their own notes.
- Keep all `.env.local` files secret and never commit private keys (such as `service_role` keys) to public repositories.
