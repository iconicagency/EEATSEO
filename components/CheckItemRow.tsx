'use client'
import { CheckItem as CheckItemType, AiCheckResult } from '@/lib/data'

interface Props {
  item: CheckItemType
  checked: boolean
  aiResult?: AiCheckResult
  isScanning: boolean
  onToggle: () => void
}

export function CheckItemRow({ item, checked, aiResult, isScanning, onToggle }: Props) {
  const status = checked
    ? 'pass'
    : aiResult
    ? aiResult.status
    : 'manual'

  const checkClass = (() => {
    if (isScanning && item.auto) return 'border-[#1d5fa8] animate-pulse-opacity bg-white dark:bg-[#1c1c1a]'
    if (status === 'pass') return 'bg-[#e6f4ec] dark:bg-[#0a2e1a] border-[#1a7a4a] dark:border-[#4dbb7a]'
    if (status === 'fail') return 'bg-[#fce8e8] dark:bg-[#2e0f0f] border-[#b83030] dark:border-[#e06060]'
    if (status === 'warn') return 'bg-[#fdf2db] dark:bg-[#2a1d04] border-[#996010] dark:border-[#e8a830]'
    return 'border-black/20 dark:border-white/20 bg-white dark:bg-[#1c1c1a]'
  })()

  const noteClass = (() => {
    if (status === 'pass') return 'bg-[#e6f4ec] dark:bg-[#0a2e1a] text-[#1a7a4a] dark:text-[#4dbb7a]'
    if (status === 'fail') return 'bg-[#fce8e8] dark:bg-[#2e0f0f] text-[#b83030] dark:text-[#e06060]'
    return 'bg-[#fdf2db] dark:bg-[#2a1d04] text-[#996010] dark:text-[#e8a830]'
  })()

  const checkmark = (() => {
    if (isScanning && item.auto) return null
    if (status === 'pass') return (
      <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" className="w-2.5 h-2.5 text-[#1a7a4a] dark:text-[#4dbb7a]">
        <polyline points="1,6 4.5,9.5 11,2" />
      </svg>
    )
    if (status === 'fail') return <span className="text-[9px] font-bold text-[#b83030] dark:text-[#e06060]">✕</span>
    if (status === 'warn') return <span className="text-[10px] font-bold text-[#996010] dark:text-[#e8a830]">!</span>
    return null
  })()

  return (
    <div
      className="flex items-start gap-3 py-2.5 border-b border-black/[0.06] dark:border-white/[0.06] last:border-0 cursor-pointer group"
      onClick={onToggle}
    >
      <div
        className={`w-[19px] h-[19px] rounded-[5px] border-[1.5px] flex-shrink-0 mt-0.5 flex items-center justify-center transition-all ${checkClass}`}
      >
        {checkmark}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-[13.5px] leading-relaxed transition-colors ${
          status === 'pass'
            ? 'text-[#a8a69e] dark:text-[#5a5850] line-through'
            : 'text-[#6b6960] dark:text-[#a09e96] group-hover:text-[#1a1917] dark:group-hover:text-[#e8e6df]'
        }`}>
          {item.t}
          {!item.auto && (
            <span className="inline-block font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#f0efe9] dark:bg-[#252523] text-[#a8a69e] dark:text-[#5a5850] ml-2 align-middle">
              manual
            </span>
          )}
        </p>
        {aiResult?.note && (
          <p className={`text-[12px] mt-1 px-2 py-1 rounded leading-relaxed ${noteClass}`}>
            {aiResult.note}
          </p>
        )}
      </div>
    </div>
  )
}
