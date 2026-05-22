'use client'
import { useState, useEffect } from 'react'

interface Props {
  open: boolean
  onClose: () => void
  onSave: (key: string) => void
  existing?: string
}

export function ApiKeyModal({ open, onClose, onSave, existing }: Props) {
  const [val, setVal] = useState(existing || '')

  useEffect(() => { setVal(existing || '') }, [existing, open])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white dark:bg-[#1c1c1a] border border-black/10 dark:border-white/10 rounded-2xl p-7 w-full max-w-md animate-slide-up">
        <h2 className="text-[17px] font-medium mb-2 text-[#1a1917] dark:text-[#e8e6df]">
          Anthropic API Key
        </h2>
        <p className="text-[13px] text-[#6b6960] dark:text-[#a09e96] leading-relaxed mb-4">
          Tool dùng Claude API để phân tích SEO. Key được lưu trong trình duyệt của bạn và chỉ được gửi đến Anthropic — không lưu trên server.
        </p>

        <div className="text-[12px] bg-[#fdf2db] dark:bg-[#2a1d04] text-[#996010] dark:text-[#e8a830] rounded-lg px-3 py-2.5 mb-4 leading-relaxed">
          🔐 Mỗi lần audit tốn khoảng ~$0.003–0.005 (Claude Sonnet). Key chỉ lưu localStorage của trình duyệt bạn.
        </div>

        <input
          type="password"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { onSave(val); onClose() } }}
          placeholder="sk-ant-api03-..."
          className="w-full font-mono text-[13px] px-3 py-2.5 rounded-lg border border-black/15 dark:border-white/15 bg-[#f5f4f1] dark:bg-[#252523] text-[#1a1917] dark:text-[#e8e6df] outline-none focus:border-[#1d5fa8] dark:focus:border-[#5da8f0] mb-3 transition-colors"
          autoFocus
        />
        <p className="text-[12px] text-[#a8a69e] dark:text-[#5a5850] mb-5">
          Chưa có key?{' '}
          <a href="https://console.anthropic.com/keys" target="_blank" rel="noopener noreferrer" className="text-[#1d5fa8] dark:text-[#5da8f0] underline">
            Tạo tại console.anthropic.com
          </a>
        </p>

        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="text-[13px] px-4 py-2 rounded-lg border border-black/15 dark:border-white/15 text-[#6b6960] dark:text-[#a09e96] hover:bg-[#f0efe9] dark:hover:bg-[#252523] transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={() => { if (val.trim()) { onSave(val.trim()); onClose() } }}
            className="text-[13px] px-5 py-2 rounded-lg bg-[#1d5fa8] hover:bg-[#184d8a] text-white font-medium transition-colors"
          >
            Lưu & tiếp tục
          </button>
        </div>
      </div>
    </div>
  )
}
