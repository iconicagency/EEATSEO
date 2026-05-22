# SEO E-E-A-T · AI Audit Tool

Ứng dụng Next.js kiểm tra SEO E-E-A-T tự động bằng Claude AI.

## Tính năng

- Nhập URL → fetch HTML + robots.txt tự động
- Claude AI phân tích 29 tiêu chí kỹ thuật E-E-A-T
- Tự động tick checklist + hiển thị lý do pass/fail/warn
- Report tổng quan: điểm mạnh, vấn đề cần cải thiện
- Dark mode tự động
- Xuất báo cáo .txt
- API key lưu local, không qua server

## Deploy lên Vercel (nhanh nhất)

### Cách 1: Vercel CLI
```bash
npm i -g vercel
cd seo-eeat-audit
npm install
vercel --prod
```

### Cách 2: GitHub + Vercel Dashboard
1. Push toàn bộ folder lên GitHub repo mới
2. Vào [vercel.com](https://vercel.com) → New Project → Import repo
3. Framework: Next.js (tự detect) → Deploy

### Cách 3: Netlify
```bash
npm install
npm run build
# Upload thư mục .next lên Netlify
```

## Chạy local

```bash
npm install
npm run dev
# Mở http://localhost:3000
```

## Cấu trúc

```
app/
  page.tsx          # Trang chính
  layout.tsx        # Root layout
  globals.css       # Tailwind + animations
  api/audit/
    route.ts        # API route (proxy Anthropic)
components/
  ApiKeyModal.tsx   # Modal nhập API key
  CheckItemRow.tsx  # Hàng checklist item
  SectionCard.tsx   # Accordion section
lib/
  data.ts           # Dữ liệu checklist, types
```

## API Key

Người dùng tự nhập Anthropic API key → lưu localStorage → gửi qua API route `/api/audit` đến Anthropic.
Key không lưu trên server. Mỗi lần audit ~$0.003–0.005.

## Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Anthropic Claude Sonnet
