import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { cn } from '@/lib/utils'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'Prompt Genome Engine — Decompose, Score, Mutate, Evolve',
  description: 'Decompose LLM prompts into functional genes, score each independently, and apply targeted mutations backed by research. By EpicWise.',
  openGraph: {
    title: 'Prompt Genome Engine — Decompose, Score, Mutate, Evolve',
    description: 'Decompose LLM prompts into functional genes, score each independently, and apply targeted mutations backed by research.',
    siteName: 'Prompt Genome Engine',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Prompt Genome Engine — Decompose, Score, Mutate, Evolve',
    description: 'Decompose LLM prompts into functional genes, score each independently, and apply targeted mutations backed by research.',
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
