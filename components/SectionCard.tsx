'use client'
import { useState } from 'react'
import { Section, AiCheckResult } from '@/lib/data'
import { CheckItemRow } from './CheckItemRow'

interface Props {
  section: Section
  state: Record<string, boolean>
  aiResults: Record<string, AiCheckResult>
  isScanning: boolean
  filter: string
  onToggle: (sid: number, i: number) => void
  defaultOpen?: boolean
}

export function SectionCard({ section: s, state, aiResults, isScanning, filter, onToggle, defaultOpen }: Props) {
  const [open, setOpen] = useState(defaultOpen ?? false)

  const getStatus = (i: number) => {
    if (state[`${s.id}_${i}`]) return 'pass'
    const item = s.items[i]
    if (item.auto && item.key && aiResults[item.key]) return aiResults[item.key].status
    return 'manual'
  }

  const visItems = s.items
    .map((item, i) => ({ item, i, st: getStatus(i) }))
    .filter(({ st }) => {
      if (filter === 'pass') return st === 'pass'
      if (filter === 'fail') return st === 'fail'
      if (filter === 'warn') return st === 'warn'
      if (filter === 'manual') return st === 'manual'
      return true
    })

  if (filter !== 'all' && visItems.length === 0) return null

  const doneCount = s.items.filter((_, i) => state[`${s.id}_${i}`]).length
  const allDone = doneCount === s.items.length

  return (
    <div className="bg-white dark:bg-[#1c1c1a] border border-black/[0.08] dark:border-white/[0.08] rounded-2xl overflow-hidden animate-slide-up">
      <button
        className="w-full flex items-center gap-3 px-5 py-3.5 text-left hover:bg-[#f5f4f1] dark:hover:bg-[#252523] transition-colors"
        onClick={() => setOpen(!open)}
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center text-[15px] flex-shrink-0"
          style={{ background: s.bg, color: s.color }}
        >
          {s.icon}
        </div>
        <span className="flex-1 text-[14px] font-medium text-[#1a1917] dark:text-[#e8e6df]">
          {s.id}. {s.title}
        </span>
        <span className={`font-mono text-[11px] font-medium px-2.5 py-1 rounded-full border whitespace-nowrap transition-all ${
          allDone
            ? 'bg-[#e6f4ec] dark:bg-[#0a2e1a] text-[#1a7a4a] dark:text-[#4dbb7a] border-transparent'
            : 'bg-[#f0efe9] dark:bg-[#252523] text-[#a8a69e] dark:text-[#5a5850] border-black/[0.06] dark:border-white/[0.06]'
        }`}>
          {doneCount}/{s.items.length}
        </span>
        <svg
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          className={`w-4 h-4 text-[#a8a69e] dark:text-[#5a5850] flex-shrink-0 transition-transform ${open ? 'rotate-90' : ''}`}
        >
          <polyline points="9,18 15,12 9,6" />
        </svg>
      </button>

      {open && (
        <div className="border-t border-black/[0.06] dark:border-white/[0.06]">
          <p className="text-[13px] text-[#6b6960] dark:text-[#a09e96] leading-relaxed px-5 py-3 bg-[#f5f4f1] dark:bg-[#252523] border-b border-black/[0.06] dark:border-white/[0.06]">
            {s.desc}
          </p>
          <div className="px-5 pt-1 pb-3">
            {visItems.map(({ item, i }) => (
              <CheckItemRow
                key={i}
                item={item}
                checked={!!state[`${s.id}_${i}`]}
                aiResult={item.auto && item.key ? aiResults[item.key] : undefined}
                isScanning={isScanning}
                onToggle={() => onToggle(s.id, i)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
