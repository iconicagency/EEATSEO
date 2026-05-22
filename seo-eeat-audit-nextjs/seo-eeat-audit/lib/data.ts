export type CheckStatus = 'pass' | 'warn' | 'fail' | 'manual' | 'idle'

export interface CheckItem {
  t: string
  auto: boolean
  key?: string
}

export interface Section {
  id: number
  icon: string
  color: string
  bg: string
  darkBg: string
  title: string
  desc: string
  items: CheckItem[]
}

export interface AiCheckResult {
  status: 'pass' | 'warn' | 'fail'
  note: string
}

export interface AuditResult {
  summary: string
  top_issues: string[]
  top_strengths: string[]
  checks: Record<string, AiCheckResult>
}

export const SECTIONS: Section[] = [
  {
    id: 1, icon: '🔍', color: '#185fa5', bg: '#e8f0fb', darkBg: '#0c2540',
    title: 'Nghiên cứu & đánh giá hành vi người dùng',
    desc: 'Hiểu cách khán giả tìm kiếm trên các nền tảng AI là điều cơ bản. Hành vi tìm kiếm AI khác với tìm kiếm truyền thống: truy vấn dài hơn, dựa trên hội thoại.',
    items: [
      { t: 'Xác định các nền tảng AI mà khán giả sử dụng (ChatGPT, Gemini, Perplexity...) qua GA4', auto: false },
      { t: 'Xác định các truy vấn/lời nhắc phổ biến nhất mà khán giả dùng', auto: false },
      { t: 'Xác định hiệu suất nội dung hiện tại so với đối thủ trên nền tảng AI', auto: false },
      { t: 'Thiết lập truy vấn và chủ đề ưu tiên tối ưu hóa dựa trên hiệu suất vs đối thủ', auto: false },
    ],
  },
  {
    id: 2, icon: '🤖', color: '#0f6e56', bg: '#e6f4ec', darkBg: '#0a2e1a',
    title: 'Tối ưu hóa thu thập dữ liệu & lập chỉ mục cho AI',
    desc: 'Nội dung phải có thể truy cập, lập chỉ mục và tái sử dụng bởi cả trình thu thập truyền thống lẫn AI.',
    items: [
      { t: 'Cho phép AI crawlers trong robots.txt: GPTBot, ClaudeBot, PerplexityBot...', auto: true, key: 'robots_ai' },
      { t: 'Không chặn bot AI bằng tường lửa hoặc bộ lọc', auto: false },
      { t: 'Kết xuất nội dung phía máy chủ (SSR) — tránh phụ thuộc JS phía máy khách', auto: true, key: 'ssr_content' },
      { t: 'Không dùng noindex cho nội dung có giá trị', auto: true, key: 'no_noindex' },
      { t: 'Không dùng quy tắc nosnippet', auto: true, key: 'no_nosnippet' },
      { t: 'Sử dụng thẻ canonical đúng cách', auto: true, key: 'canonical' },
      { t: 'Tối ưu hóa liên kết nội bộ với anchor text mô tả', auto: true, key: 'internal_links' },
    ],
  },
  {
    id: 3, icon: '📚', color: '#534ab7', bg: '#eeedfe', darkBg: '#1a1840',
    title: 'Tối ưu hóa chiều rộng & chiều sâu chủ đề',
    desc: 'Các nền tảng tìm kiếm AI thưởng cho các trang web có chiều rộng và chiều sâu chủ đề rõ ràng.',
    items: [
      { t: 'Sử dụng mô hình cụm chủ đề với trang trụ cột (hub) rõ ràng', auto: true, key: 'topic_depth' },
      { t: 'Trang trụ cột tóm tắt từng khía cạnh và liên kết đến trang cụm', auto: false },
      { t: 'Trang cụm nhắm mục tiêu khía cạnh cụ thể, bao phủ chuyên sâu', auto: false },
      { t: 'Liên kết chéo giữa các trang cụm và quay lại trang trụ cột', auto: true, key: 'cross_linking' },
    ],
  },
  {
    id: 4, icon: '🧩', color: '#993c1d', bg: '#faece7', darkBg: '#2e1008',
    title: 'Tối ưu hóa truy xuất theo khối (Chunk-Level)',
    desc: 'Mỗi đoạn nội dung phải có thể hiểu được một cách độc lập.',
    items: [
      { t: 'Đoạn văn chặt chẽ về ngữ nghĩa, tự chứa — không cần toàn trang để hiểu', auto: true, key: 'semantic_chunks' },
      { t: 'Một ý tưởng cho mỗi đoạn — tập trung vào một khái niệm duy nhất', auto: true, key: 'one_idea' },
      { t: 'HTML có cấu trúc với tiêu đề phụ rõ ràng H2/H3 cho mọi chủ đề phụ', auto: true, key: 'heading_structure' },
    ],
  },
  {
    id: 5, icon: '💡', color: '#854f0b', bg: '#fdf2db', darkBg: '#2a1d04',
    title: 'Tối ưu hóa cho tổng hợp câu trả lời (Answer Synthesis)',
    desc: 'Nội dung phải dễ trích xuất và có cấu trúc logic để phù hợp với câu trả lời đa nguồn.',
    items: [
      { t: 'Bắt đầu bằng câu tóm tắt trực tiếp, sau đó mở rộng (Inverted Pyramid)', auto: true, key: 'inverted_pyramid' },
      { t: 'Giọng văn đơn giản, thực tế, không mang tính quảng cáo', auto: true, key: 'non_promotional' },
      { t: 'Sử dụng Schema markup để AI phân loại và trích xuất câu trả lời', auto: true, key: 'schema_markup' },
      { t: 'Sử dụng định dạng Hỏi & Đáp bằng ngôn ngữ tự nhiên', auto: true, key: 'faq_format' },
    ],
  },
  {
    id: 6, icon: '📎', color: '#185fa5', bg: '#e8f0fb', darkBg: '#0c2540',
    title: 'Tối ưu hóa khả năng trích dẫn',
    desc: 'AI trích dẫn nội dung khi nó chính xác, cập nhật, có cấu trúc tốt và có thẩm quyền.',
    items: [
      { t: 'Sử dụng tuyên bố cụ thể, có thể xác minh — không phải lời chung chung', auto: true, key: 'factual_claims' },
      { t: 'Bao gồm trích dẫn nguồn (liên kết đến nghiên cứu, thống kê, chuyên gia)', auto: true, key: 'citations' },
      { t: 'Thể hiện quyền tác giả và bằng cấp rõ ràng — tín hiệu E-E-A-T', auto: true, key: 'author_credentials' },
      { t: 'Dùng Schema về tác giả và tổ chức để tăng brand visibility', auto: true, key: 'author_schema' },
      { t: 'Làm mới nội dung thường xuyên và dùng dateModified', auto: true, key: 'date_modified' },
      { t: 'Hiển thị rõ thông tin tác giả, người kiểm duyệt trên trang', auto: true, key: 'author_display' },
    ],
  },
  {
    id: 7, icon: '🏆', color: '#3b6d11', bg: '#e6f4ec', darkBg: '#0a2e1a',
    title: 'Tối ưu hóa tín hiệu thẩm quyền nội dung',
    desc: 'Thẩm quyền tăng khả năng được đưa vào và trích dẫn trong câu trả lời AI.',
    items: [
      { t: 'Tối ưu brand presence nhất quán trên các nền tảng web & xã hội', auto: false },
      { t: 'Xuất bản nghiên cứu gốc, báo cáo hoặc dữ liệu độc đáo', auto: true, key: 'original_research' },
      { t: 'Được đề cập trên ấn phẩm ngành, đóng góp nội dung khách mời', auto: false },
      { t: 'Quảng bá nội dung trên kênh bên thứ ba: influencer, cộng đồng...', auto: false },
    ],
  },
  {
    id: 8, icon: '🖼️', color: '#993556', bg: '#fce8f3', darkBg: '#2e0f20',
    title: 'Tối ưu hóa hỗ trợ đa phương thức',
    desc: 'AI ngày càng truy xuất nội dung đa phương thức — hình ảnh, biểu đồ, bảng, video.',
    items: [
      { t: 'Hình ảnh và video có thể thu thập bởi AI (không chặn trong robots.txt)', auto: false },
      { t: 'Cung cấp ảnh qua HTML sạch — tránh lazy loading chỉ bằng JS', auto: true, key: 'image_html' },
      { t: 'Alt text mô tả cho hình ảnh, bao gồm ngữ cảnh chủ đề', auto: true, key: 'alt_text' },
      { t: 'Caption cho hình ảnh và video với giải thích', auto: true, key: 'captions' },
      { t: 'Dùng thẻ <figure>, <table> với markup phù hợp ngữ cảnh', auto: true, key: 'semantic_media' },
      { t: 'Tránh ảnh của bảng — dùng bảng HTML thay thế', auto: true, key: 'html_tables' },
    ],
  },
  {
    id: 9, icon: '🎯', color: '#1d9e75', bg: '#e1f5ee', darkBg: '#0a2e1a',
    title: 'Tối ưu hóa chống chịu cá nhân hóa',
    desc: 'AI cá nhân hóa câu trả lời dựa trên vị trí, ý định, lịch sử tìm kiếm của người dùng.',
    items: [
      { t: 'Bao quát nhiều ý định cho cùng chủ đề để phù hợp nhiều truy vấn cá nhân hóa', auto: true, key: 'intent_coverage' },
      { t: 'Tối ưu cho ý định địa phương: nội dung khu vực, schema LocalBusiness/Place', auto: true, key: 'local_schema' },
      { t: 'Thêm tín hiệu ngữ cảnh — phân khúc nội dung cho các hồ sơ người dùng', auto: false },
      { t: 'Nhận liên kết từ tên miền uy tín qua PR kỹ thuật số, Wikipedia', auto: false },
      { t: 'Giữ chân bằng nội dung nhanh, hữu ích tạo trải nghiệm thỏa mãn', auto: true, key: 'content_quality' },
    ],
  },
  {
    id: 10, icon: '📊', color: '#5f5e5a', bg: '#f0efe9', darkBg: '#1c1c18',
    title: 'Theo dõi hiệu suất tìm kiếm AI',
    desc: 'Theo dõi brand visibility và referrals từ AI giúp xác định cơ hội cải thiện.',
    items: [
      { t: 'Theo dõi từ khóa liên quan đến brand trên các nền tảng AI (Profound, Peec AI...)', auto: false },
      { t: 'Theo dõi đề cập brand, cảm xúc và link trong câu trả lời AI từng nền tảng', auto: false },
      { t: 'Kiểm tra nguồn được trích dẫn trong câu trả lời AI để tìm cơ hội mới', auto: false },
      { t: 'Đánh giá cảm xúc đề cập brand trong AI vs đối thủ', auto: false },
      { t: 'Theo dõi traffic do AI tạo ra (trang đã truy cập, tương tác, chuyển đổi)', auto: false },
      { t: 'Theo dõi hành vi bot AI: tần suất, URL, độ sâu, mã HTTP', auto: false },
      { t: 'Gắn UTM để tách riêng traffic từ AI trong báo cáo', auto: false },
    ],
  },
]

export const ALL_KEYS = [
  'robots_ai','ssr_content','no_noindex','no_nosnippet','canonical','internal_links',
  'topic_depth','cross_linking','semantic_chunks','one_idea','heading_structure',
  'inverted_pyramid','non_promotional','schema_markup','faq_format',
  'factual_claims','citations','author_credentials','author_schema','date_modified','author_display',
  'original_research','image_html','alt_text','captions','semantic_media','html_tables',
  'intent_coverage','local_schema','content_quality',
]

export const TOTAL = SECTIONS.reduce((a, s) => a + s.items.length, 0)
