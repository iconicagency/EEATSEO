import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SEO E-E-A-T · AI Audit Tool',
  description: 'Kiểm tra SEO E-E-A-T tự động bằng AI — 42 hạng mục, phân tích kỹ thuật + nội dung, xuất báo cáo chi tiết.',
  openGraph: {
    title: 'SEO E-E-A-T · AI Audit Tool',
    description: 'Nhập URL → AI phân tích 42 tiêu chí E-E-A-T & AI Search tự động',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className="min-h-screen bg-[#f5f4f1] dark:bg-[#111110] text-[#1a1917] dark:text-[#e8e6df] transition-colors">
        {children}
      </body>
    </html>
  )
}
