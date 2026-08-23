import type { Metadata } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import { Toaster } from "react-hot-toast"
import "../styles/globals.css"

const inter = Inter({ variable: "--font-geist-sans", subsets: ["latin"] })
const jetbrains = JetBrains_Mono({ variable: "--font-geist-mono", subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Broski — Your Intelligent AI Second Brain",
  description: "Store notes, ask AI questions, and generate summaries powered by your personal knowledge base.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${jetbrains.variable} antialiased`}>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "var(--surface-1)",
              color: "var(--text-1)",
              border: "1px solid var(--border)",
              backdropFilter: "blur(20px)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
            },
            success: {
              iconTheme: { primary: "var(--brand)", secondary: "var(--surface-bg)" },
            },
            error: {
              iconTheme: { primary: "#ef4444", secondary: "var(--surface-bg)" },
            },
          }}
        />
        {children}
      </body>
    </html>
  )
}
