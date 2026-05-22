'use client'
import { useState, useEffect, useCallback } from 'react'
import { SECTIONS, TOTAL, AuditResult, AiCheckResult } from '@/lib/data'
import { ApiKeyModal } from '@/components/ApiKeyModal'
import { SectionCard } from '@/components/SectionCard'

type Filter = 'all' | 'pass' | 'warn' | 'fail' | 'manual'
type StatusType = 'idle' | 'scanning' | 'ok' | 'error'

const STORE_KEY = 'seo_eeat_next_v1'
const API_KEY_STORE = 'anthropic_api_key'

function useLocalStorage<T>(key: string, init: T) {
  const [val, setVal] = useState<T>(init)
  useEffect(() => {
    try { const s = localStorage.getItem(key); if (s) setVal(JSON.parse(s)) } catch {}
  }, [key])
  const set = useCallback((v: T | ((prev: T) => T)) => {
    setVal(prev => {
      const next = typeof v === 'function' ? (v as (p: T) => T)(prev) : v
      try { localStorage.setItem(key, JSON.stringify(next)) } catch {}
      return next
    })
  }, [key])
  return [val, set] as const
}

export default function Home() {
  const [apiKey, setApiKey] = useLocalStorage<string>(API_KEY_STORE, '')
  const [showModal, setShowModal] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [url, setUrl] = useState('')
  const [state, setState] = useLocalStorage<Record<string, boolean>>(`${STORE_KEY}_state`, {})
  const [aiResults, setAiResults] = useLocalStorage<Record<string, AiCheckResult>>(`${STORE_KEY}_ai`, {})
  const [auditMeta, setAuditMeta] = useLocalStorage<{ summary: string; top_issues: string[]; top_strengths: string[] } | null>(`${STORE_KEY}_meta`, null)
  const [status, setStatus] = useState<StatusType>('idle')
  const [statusMsg, setStatusMsg] = useState('Nhập URL và nhấn "Kiểm tra". Cần API key để chạy phân tích AI.')
  const [filter, setFilter] = useState<Filter>('all')
  const [isScanning, setIsScanning] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    setDarkMode(mq.matches)
    const handler = (e: MediaQueryListEvent) => setDarkMode(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
  }, [darkMode])

  useEffect(() => {
    const key = localStorage.getItem(API_KEY_STORE)
    if (!key) setTimeout(() => setShowModal(true), 800)
  }, [])

  const getItemStatus = useCallback((sid: number, i: number) => {
    if (state[`${sid}_${i}`]) return 'pass'
    const item = SECTIONS.find(s => s.id === sid)?.items[i]
    if (item?.auto && item.key && aiResults[item.key]) return aiResults[item.key].status
    return 'manual'
  }, [state, aiResults])

  const stats = {
    pass: SECTIONS.reduce((a, s) => a + s.items.filter((_, i) => state[`${s.id}_${i}`]).length, 0),
    warn: Object.values(aiResults).filter(v => v.status === 'warn').length,
    fail: Object.values(aiResults).filter(v => v.status === 'fail').length,
    pct: 0,
  }
  stats.pct = TOTAL ? Math.round(stats.pass / TOTAL * 100) : 0

  async function startAudit() {
    if (!url.trim()) { alert('Vui lòng nhập URL'); return }
    if (!/^https?:\/\//i.test(url)) { alert('URL phải bắt đầu bằng https://'); return }
    const key = localStorage.getItem(API_KEY_STORE)
    if (!key) { setShowModal(true); return }

    setIsScanning(true)
    setState({})
    setAiResults({})
    setAuditMeta(null)
    setStatus('scanning')
    setStatusMsg(`Đang fetch HTML từ ${new URL(url).hostname}...`)

    try {
      setStatusMsg('Claude AI đang phân tích 29 tiêu chí SEO E-E-A-T...')
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, apiKey: key }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || `HTTP ${res.status}`)
      }

      const data: AuditResult = await res.json()
      const checks = data.checks || {}
      setAiResults(checks)

      const newState: Record<string, boolean> = {}
      SECTIONS.forEach(s => {
        s.items.forEach((item, i) => {
          if (item.auto && item.key && checks[item.key]?.status === 'pass') {
            newState[`${s.id}_${i}`] = true
          }
        })
      })
      setState(newState)
      setAuditMeta({ summary: data.summary, top_issues: data.top_issues, top_strengths: data.top_strengths })

      const pc = Object.values(checks).filter(v => v.status === 'pass').length
      const wc = Object.values(checks).filter(v => v.status === 'warn').length
      const fc = Object.values(checks).filter(v => v.status === 'fail').length
      setStatus('ok')
      setStatusMsg(`Hoàn tất · ${Object.keys(checks).length} tiêu chí · ${pc} đạt · ${wc} cần cải thiện · ${fc} chưa đạt`)
    } catch (e) {
      setStatus('error')
      setStatusMsg(e instanceof Error ? e.message : 'Lỗi không xác định')
    } finally {
      setIsScanning(false)
    }
  }

  function handleToggle(sid: number, i: number) {
    setState(prev => ({ ...prev, [`${sid}_${i}`]: !prev[`${sid}_${i}`] }))
  }

  function handleReset() {
    if (!confirm('Đặt lại tất cả kết quả và tiến độ?')) return
    setState({})
    setAiResults({})
    setAuditMeta(null)
    setUrl('')
    setStatus('idle')
    setStatusMsg('Nhập URL và nhấn "Kiểm tra". Cần API key để chạy phân tích AI.')
  }

  function exportReport() {
    const pass = SECTIONS.reduce((a, s) => a + s.items.filter((_, i) => state[`${s.id}_${i}`]).length, 0)
    let txt = `SEO E-E-A-T AI AUDIT REPORT\n${'='.repeat(50)}\nURL: ${url || '(chưa nhập)'}\nNgày: ${new Date().toLocaleDateString('vi-VN')}\nKết quả: ${pass}/${TOTAL} hạng mục đạt chuẩn (${Math.round(pass / TOTAL * 100)}%)\n\n`
    if (auditMeta?.summary) txt += `Nhận xét: ${auditMeta.summary}\n\n`
    if (auditMeta?.top_strengths?.length) txt += `Điểm mạnh:\n${auditMeta.top_strengths.map(s => `  • ${s}`).join('\n')}\n\n`
    if (auditMeta?.top_issues?.length) txt += `Ưu tiên cải thiện:\n${auditMeta.top_issues.map(s => `  • ${s}`).join('\n')}\n\n${'='.repeat(50)}\n\n`
    SECTIONS.forEach(s => {
      const dc = s.items.filter((_, i) => state[`${s.id}_${i}`]).length
      txt += `${s.id}. ${s.title} [${dc}/${s.items.length}]\n`
      s.items.forEach((item, i) => {
        const st = getItemStatus(s.id, i)
        const mk = st === 'pass' ? '[✓]' : st === 'fail' ? '[✗]' : st === 'warn' ? '[!]' : '[ ]'
        const note = item.auto && item.key && aiResults[item.key] ? ` — ${aiResults[item.key].note}` : ''
        txt += `   ${mk} ${item.t}${note}\n`
      })
      txt += '\n'
    })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([txt], { type: 'text/plain;charset=utf-8' }))
    a.download = `seo-eeat-${new Date().toISOString().slice(0, 10)}.txt`
    a.click()
  }

  const statusColors: Record<StatusType, string> = {
    idle: 'bg-[#f0efe9] dark:bg-[#252523] text-[#6b6960] dark:text-[#a09e96] border-black/[0.06] dark:border-white/[0.06]',
    scanning: 'bg-[#e8f0fb] dark:bg-[#0c2540] text-[#1d5fa8] dark:text-[#5da8f0] border-transparent',
    ok: 'bg-[#e6f4ec] dark:bg-[#0a2e1a] text-[#1a7a4a] dark:text-[#4dbb7a] border-transparent',
    error: 'bg-[#fce8e8] dark:bg-[#2e0f0f] text-[#b83030] dark:text-[#e06060] border-transparent',
  }

  const FILTERS: { key: Filter; label: string }[] = [
    { key: 'all', label: 'Tất cả' },
    { key: 'pass', label: '✓ Đạt' },
    { key: 'warn', label: '! Cần cải thiện' },
    { key: 'fail', label: '✕ Chưa đạt' },
    { key: 'manual', label: 'Thủ công' },
  ]

  return (
    <>
      <ApiKeyModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onSave={k => { setApiKey(k); localStorage.setItem(API_KEY_STORE, k) }}
        existing={apiKey}
      />

      {/* Header */}
      <header className="bg-white dark:bg-[#1c1c1a] border-b border-black/[0.08] dark:border-white/[0.08] sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center gap-3">
          <span className="font-mono text-[15px] font-medium">
            SEO<span className="text-[#1d5fa8] dark:text-[#5da8f0]">·EEAT</span>
          </span>
          <span className="font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 rounded bg-[#e8f0fb] dark:bg-[#0c2540] text-[#1d5fa8] dark:text-[#5da8f0]">
            AI Audit
          </span>
          <div className="ml-auto flex items-center gap-2">
            {/* Dark mode toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-black/10 dark:border-white/10 text-[#6b6960] dark:text-[#a09e96] hover:bg-[#f0efe9] dark:hover:bg-[#252523] transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
                </svg>
              )}
            </button>
            {/* API key button */}
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-1.5 text-[12px] px-3 py-1.5 rounded-lg border border-black/[0.12] dark:border-white/[0.12] text-[#6b6960] dark:text-[#a09e96] hover:border-[#1d5fa8] dark:hover:border-[#5da8f0] hover:text-[#1d5fa8] dark:hover:text-[#5da8f0] transition-colors"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${apiKey ? 'bg-[#1a7a4a] dark:bg-[#4dbb7a]' : 'bg-[#a8a69e] dark:bg-[#5a5850]'}`} />
              {apiKey ? 'API key đã lưu' : 'Nhập API key'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8 pb-20">
        {/* Hero */}
        <div className="mb-8 pb-7 border-b border-black/[0.06] dark:border-white/[0.06]">
          <p className="font-mono text-[10px] uppercase tracking-widest text-[#a8a69e] dark:text-[#5a5850] mb-3">
            v1.0 · Chuẩn Google E-E-A-T & AI Search
          </p>
          <h1 className="text-[28px] font-medium tracking-tight leading-tight mb-3">
            Kiểm tra SEO{' '}
            <em className="not-italic text-[#1d5fa8] dark:text-[#5da8f0]">E-E-A-T</em>
            <br />tự động bằng AI
          </h1>
          <p className="text-[14px] text-[#6b6960] dark:text-[#a09e96] leading-relaxed max-w-lg">
            Nhập URL bất kỳ — hệ thống fetch HTML, phân tích kỹ thuật và dùng Claude AI đánh giá 42 hạng mục E-E-A-T. Kết quả hiển thị ngay, có thể xuất báo cáo.
          </p>
        </div>

        {/* URL Input */}
        <div className="bg-white dark:bg-[#1c1c1a] border border-black/[0.08] dark:border-white/[0.08] rounded-2xl p-5 mb-4">
          <p className="font-mono text-[10px] uppercase tracking-widest text-[#a8a69e] dark:text-[#5a5850] mb-3">
            URL cần kiểm tra
          </p>
          <div className="flex gap-2">
            <input
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') startAudit() }}
              placeholder="https://example.com/bai-viet-cua-ban"
              className="flex-1 font-mono text-[13px] h-10 px-3.5 rounded-xl border border-black/[0.12] dark:border-white/[0.12] bg-[#f5f4f1] dark:bg-[#252523] text-[#1a1917] dark:text-[#e8e6df] placeholder:text-[#a8a69e] dark:placeholder:text-[#5a5850] outline-none focus:border-[#1d5fa8] dark:focus:border-[#5da8f0] transition-colors"
            />
            <button
              onClick={startAudit}
              disabled={isScanning}
              className="h-10 px-5 rounded-xl bg-[#1d5fa8] hover:bg-[#184d8a] disabled:opacity-50 disabled:cursor-not-allowed text-white text-[13px] font-medium flex items-center gap-2 whitespace-nowrap transition-colors"
            >
              {isScanning ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 animate-spin-slow">
                  <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0"/>
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
                </svg>
              )}
              {isScanning ? 'Đang phân tích...' : 'Bắt đầu kiểm tra'}
            </button>
          </div>
        </div>

        {/* Status */}
        <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border text-[13px] mb-4 transition-all ${statusColors[status]}`}>
          {status === 'scanning' ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 flex-shrink-0 animate-spin-slow">
              <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0"/>
            </svg>
          ) : status === 'ok' ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 flex-shrink-0">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22,4 12,14.01 9,11.01"/>
            </svg>
          ) : status === 'error' ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 flex-shrink-0">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 flex-shrink-0">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          )}
          <span dangerouslySetInnerHTML={{ __html: statusMsg }} />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2.5 mb-4">
          {[
            { label: 'Tổng mục', val: TOTAL, cls: 'text-[#1d5fa8] dark:text-[#5da8f0]' },
            { label: 'Đạt chuẩn', val: stats.pass, cls: 'text-[#1a7a4a] dark:text-[#4dbb7a]' },
            { label: 'Cần cải thiện', val: stats.warn, cls: 'text-[#996010] dark:text-[#e8a830]' },
            { label: 'Chưa đạt', val: stats.fail, cls: 'text-[#b83030] dark:text-[#e06060]' },
          ].map(s => (
            <div key={s.label} className="bg-white dark:bg-[#1c1c1a] border border-black/[0.08] dark:border-white/[0.08] rounded-xl p-3.5">
              <p className="font-mono text-[10px] uppercase tracking-[0.4px] text-[#a8a69e] dark:text-[#5a5850] mb-1">{s.label}</p>
              <p className={`font-mono text-[28px] font-medium tracking-tight ${s.cls}`}>{s.val}</p>
            </div>
          ))}
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex justify-between font-mono text-[11px] text-[#a8a69e] dark:text-[#5a5850] mb-2">
            <span>Tỉ lệ đạt chuẩn</span>
            <span>{stats.pass} / {TOTAL}</span>
          </div>
          <div className="h-1.5 bg-[#f0efe9] dark:bg-[#252523] rounded-full overflow-hidden border border-black/[0.06] dark:border-white/[0.06]">
            <div
              className="h-full bg-[#1a7a4a] dark:bg-[#4dbb7a] rounded-full transition-all duration-500"
              style={{ width: `${stats.pct}%` }}
            />
          </div>
        </div>

        {/* Report */}
        {auditMeta && (
          <div className="bg-white dark:bg-[#1c1c1a] border border-black/[0.08] dark:border-white/[0.08] rounded-2xl p-5 mb-4 animate-slide-up">
            <div className="flex items-center gap-2 mb-4">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-[#1d5fa8] dark:text-[#5da8f0]">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/>
                <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
              <span className="text-[13px] font-medium">Tổng quan kết quả AI audit</span>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                { n: Object.values(aiResults).filter(v => v.status === 'pass').length, label: 'Đạt chuẩn', cls: 'bg-[#e6f4ec] dark:bg-[#0a2e1a]', nc: 'text-[#1a7a4a] dark:text-[#4dbb7a]' },
                { n: Object.values(aiResults).filter(v => v.status === 'warn').length, label: 'Cần cải thiện', cls: 'bg-[#fdf2db] dark:bg-[#2a1d04]', nc: 'text-[#996010] dark:text-[#e8a830]' },
                { n: Object.values(aiResults).filter(v => v.status === 'fail').length, label: 'Chưa đạt', cls: 'bg-[#fce8e8] dark:bg-[#2e0f0f]', nc: 'text-[#b83030] dark:text-[#e06060]' },
              ].map(r => (
                <div key={r.label} className={`${r.cls} rounded-xl p-3 text-center`}>
                  <p className={`font-mono text-[24px] font-medium ${r.nc}`}>{r.n}</p>
                  <p className="text-[11px] text-[#6b6960] dark:text-[#a09e96] mt-0.5">{r.label}</p>
                </div>
              ))}
            </div>

            <div className="border-t border-black/[0.06] dark:border-white/[0.06] pt-4 text-[13px] text-[#6b6960] dark:text-[#a09e96] leading-relaxed space-y-3">
              {auditMeta.summary && <p><span className="font-medium text-[#1a1917] dark:text-[#e8e6df]">Nhận xét:</span> {auditMeta.summary}</p>}
              {auditMeta.top_strengths?.length > 0 && (
                <div>
                  <p className="font-medium text-[#1a1917] dark:text-[#e8e6df] mb-1">Điểm mạnh</p>
                  <ul className="space-y-1">{auditMeta.top_strengths.map((s, i) => <li key={i} className="flex gap-2"><span className="text-[#1a7a4a] dark:text-[#4dbb7a] mt-0.5">•</span>{s}</li>)}</ul>
                </div>
              )}
              {auditMeta.top_issues?.length > 0 && (
                <div>
                  <p className="font-medium text-[#1a1917] dark:text-[#e8e6df] mb-1">Ưu tiên cải thiện</p>
                  <ul className="space-y-1">{auditMeta.top_issues.map((s, i) => <li key={i} className="flex gap-2"><span className="text-[#b83030] dark:text-[#e06060] mt-0.5">•</span>{s}</li>)}</ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Toolbar */}
        <div className="flex gap-1.5 flex-wrap items-center mb-4">
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`text-[12px] px-3.5 py-1.5 rounded-full border transition-all whitespace-nowrap ${
                filter === f.key
                  ? 'bg-[#e8f0fb] dark:bg-[#0c2540] text-[#1d5fa8] dark:text-[#5da8f0] border-transparent'
                  : 'border-black/[0.12] dark:border-white/[0.12] text-[#6b6960] dark:text-[#a09e96] bg-white dark:bg-[#1c1c1a] hover:border-[#1d5fa8] dark:hover:border-[#5da8f0] hover:text-[#1d5fa8] dark:hover:text-[#5da8f0]'
              }`}
            >
              {f.label}
            </button>
          ))}
          <button
            onClick={handleReset}
            className="ml-auto text-[12px] px-3.5 py-1.5 rounded-full border border-black/[0.12] dark:border-white/[0.12] text-[#6b6960] dark:text-[#a09e96] bg-white dark:bg-[#1c1c1a] hover:bg-[#fce8e8] dark:hover:bg-[#2e0f0f] hover:text-[#b83030] dark:hover:text-[#e06060] hover:border-transparent transition-all"
          >
            ↺ Đặt lại
          </button>
        </div>

        {/* Sections */}
        <div className="space-y-2">
          {SECTIONS.map((s, idx) => (
            <SectionCard
              key={s.id}
              section={s}
              state={state}
              aiResults={aiResults}
              isScanning={isScanning}
              filter={filter}
              onToggle={handleToggle}
              defaultOpen={idx === 0}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="flex justify-center gap-3 pt-8">
          <button
            onClick={exportReport}
            className="flex items-center gap-2 text-[13px] font-medium px-6 py-2.5 rounded-xl border border-black/[0.12] dark:border-white/[0.12] text-[#1a1917] dark:text-[#e8e6df] hover:bg-white dark:hover:bg-[#1c1c1a] transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
              <polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Xuất báo cáo (.txt)
          </button>
        </div>
      </main>

      <footer className="text-center font-mono text-[11px] text-[#a8a69e] dark:text-[#5a5850] py-8 border-t border-black/[0.06] dark:border-white/[0.06]">
        SEO·EEAT AI Audit · Phiên bản tiếng Việt · Nguồn: Minhdigi.com
      </footer>
    </>
  )
}
