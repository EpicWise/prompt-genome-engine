'use client'

const STEPS = [
  {
    number: '01',
    title: 'Decompose',
    description: 'Break your prompt into 9 functional genes — Role, Task, Context, Taxonomy, Format, Examples, Reasoning, Constraints, Guardrails.',
    icon: (
      <svg viewBox="0 0 40 40" className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="4" y="4" width="14" height="14" rx="3" className="text-emerald-500" />
        <rect x="22" y="4" width="14" height="14" rx="3" className="text-amber-500" />
        <rect x="4" y="22" width="14" height="14" rx="3" className="text-blue-500" />
        <rect x="22" y="22" width="14" height="14" rx="3" className="text-rose-500" />
      </svg>
    ),
    color: 'from-emerald-500/10 to-emerald-500/5',
    borderColor: 'border-emerald-500/20',
    accent: 'text-emerald-600',
  },
  {
    number: '02',
    title: 'Score',
    description: 'Each gene is scored 1-5 independently. See exactly which region is strong and which is dragging your prompt down.',
    icon: (
      <svg viewBox="0 0 40 40" className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="20" cy="20" r="15" className="text-muted-foreground/30" />
        <path d="M20 5 A15 15 0 1 1 5 20" className="text-amber-500" strokeLinecap="round" />
        <text x="20" y="24" textAnchor="middle" fontSize="12" fontWeight="700" fill="currentColor" className="text-amber-600" stroke="none">4.2</text>
      </svg>
    ),
    color: 'from-amber-500/10 to-amber-500/5',
    borderColor: 'border-amber-500/20',
    accent: 'text-amber-600',
  },
  {
    number: '03',
    title: 'Mutate',
    description: 'Apply surgical, research-backed mutations to the weakest gene. Not a rewrite — a targeted fix with cited evidence.',
    icon: (
      <svg viewBox="0 0 40 40" className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M8 30 L16 18 L24 22 L32 10" className="text-blue-500" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="16" cy="18" r="2.5" className="text-rose-500" fill="currentColor" stroke="none" />
        <path d="M16 18 L16 12 L22 12" className="text-rose-500" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    color: 'from-blue-500/10 to-blue-500/5',
    borderColor: 'border-blue-500/20',
    accent: 'text-blue-600',
  },
  {
    number: '04',
    title: 'Evolve',
    description: 'Track gene health over time. Your prompt becomes a living artifact that gets better with every iteration.',
    icon: (
      <svg viewBox="0 0 40 40" className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M6 32 Q14 28 16 20 Q18 12 26 10 Q30 8 34 8" className="text-violet-500" strokeLinecap="round" />
        <polygon points="31,4 36,8 31,12" className="text-violet-500" fill="currentColor" stroke="none" />
      </svg>
    ),
    color: 'from-violet-500/10 to-violet-500/5',
    borderColor: 'border-violet-500/20',
    accent: 'text-violet-600',
  },
]

const GENE_PREVIEW = [
  { name: 'Role', score: 4, color: '#16a34a' },
  { name: 'Task', score: 5, color: '#16a34a' },
  { name: 'Context', score: 3, color: '#ca8a04' },
  { name: 'Examples', score: 1, color: '#dc2626' },
  { name: 'Format', score: 5, color: '#16a34a' },
  { name: 'Reasoning', score: 4, color: '#16a34a' },
  { name: 'Constraints', score: 2, color: '#ea580c' },
]

export function GenomeHero() {
  return (
    <div className="space-y-8">
      {/* Headline */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border text-xs text-muted-foreground mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Novel primitive — no other tool does this
        </div>
        <h2 className="text-3xl font-bold tracking-tight">
          Decompose. Score. Mutate.{' '}
          <span className="bg-gradient-to-r from-emerald-600 via-blue-600 to-violet-600 bg-clip-text text-transparent">
            Evolve.
          </span>
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto text-sm leading-relaxed">
          Every prompt is a genome. The Prompt Genome Engine breaks it into functional genes,
          scores each independently, and suggests targeted mutations backed by research.
        </p>
      </div>

      {/* 4 Step Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {STEPS.map((step) => (
          <div
            key={step.number}
            className={`relative rounded-xl border ${step.borderColor} bg-gradient-to-b ${step.color} p-4 space-y-3 transition-all hover:scale-[1.02] hover:shadow-sm`}
          >
            <div className="flex items-center justify-between">
              {step.icon}
              <span className={`text-[10px] font-mono font-bold ${step.accent} opacity-60`}>
                {step.number}
              </span>
            </div>
            <h3 className={`text-base font-semibold ${step.accent}`}>{step.title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {step.description}
            </p>
          </div>
        ))}
      </div>

      {/* Genome Preview Strip */}
      <div className="relative rounded-xl border border-border bg-card p-4 space-y-3 overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Example: What a genome looks like
          </span>
          <span className="text-xs text-muted-foreground">
            7 genes detected · 2 need improvement
          </span>
        </div>

        {/* Animated gene bar */}
        <div className="grid h-11 rounded-lg overflow-hidden" style={{ gridTemplateColumns: `repeat(${GENE_PREVIEW.length}, 1fr)` }}>
          {GENE_PREVIEW.map((gene, i) => (
            <div
              key={gene.name}
              className="flex items-center justify-center text-xs font-medium text-white transition-all"
              style={{
                backgroundColor: gene.color,
                animationDelay: `${i * 100}ms`,
              }}
            >
              {gene.name}
              <span className="ml-1 text-white/70 text-[10px]">{gene.score}/5</span>
            </div>
          ))}
        </div>

        {/* Annotation arrow pointing to weakest */}
        <div className="flex items-start gap-2 text-xs">
          <div className="flex items-center gap-1.5 bg-red-50 text-red-700 px-2.5 py-1.5 rounded-md border border-red-200">
            <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8 2 L8 10 M5 7 L8 10 L11 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span><strong>Examples</strong> gene missing — add 2-3 boundary examples for +15-25% accuracy</span>
          </div>
          <div className="flex items-center gap-1.5 bg-orange-50 text-orange-700 px-2.5 py-1.5 rounded-md border border-orange-200">
            <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8 2 L8 10 M5 7 L8 10 L11 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span><strong>Constraints</strong> gene weak — specify behavioral boundaries</span>
          </div>
        </div>

        {/* Subtle background decoration */}
        <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-gradient-to-br from-emerald-500/5 to-violet-500/5 blur-2xl pointer-events-none" />
      </div>
    </div>
  )
}
