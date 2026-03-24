import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { cn } from '@/lib/utils'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'PromptLint — Lint your LLM prompts',
  description: 'Score your prompt across 7 dimensions, get actionable feedback, and generate an improved version. By EpicWise.',
  openGraph: {
    title: 'PromptLint — Lint your LLM prompts',
    description: 'Score your prompt across 7 dimensions, get actionable feedback, and generate an improved version.',
    url: 'https://promptlint.vercel.app',
    siteName: 'PromptLint',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PromptLint — Lint your LLM prompts',
    description: 'Score your prompt across 7 dimensions, get actionable feedback, and generate an improved version.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={cn('font-sans', inter.variable)}>
      <body className="antialiased">{children}</body>
    </html>
  )
}
