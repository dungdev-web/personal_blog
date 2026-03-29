const COHERE_API_KEY = "qzUViCkMeSQCEm66zTS3t87bkCTr9auLMyAkHXsz"

async function cohereChat(message, preamble = "") {
  const res = await fetch("https://api.cohere.com/v1/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${COHERE_API_KEY}`,
    },
    body: JSON.stringify({
      model: "command-a-03-2025",
      message,
      preamble: preamble || "Bạn là trợ lý viết blog tiếng Việt chuyên nghiệp. Luôn trả về nội dung Markdown chuẩn, không giải thích thêm.",
    }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || "Cohere API error")
  return data.text
}

export async function generatePostAI({ topic, tone, type }) {
  const typeMap = {
    tutorial: "hướng dẫn từng bước rõ ràng",
    listicle: "danh sách có số thứ tự",
    opinion:  "bài quan điểm cá nhân sâu sắc",
    review:   "bài đánh giá chi tiết",
    news:     "bài phân tích tin tức",
  }
  const toneMap = {
    friendly:     "thân thiện, gần gũi",
    professional: "chuyên nghiệp, súc tích",
    casual:       "thoải mái, vui vẻ",
    formal:       "trang trọng, học thuật",
  }
  return cohereChat(
    `Viết một bài blog hoàn chỉnh bằng tiếng Việt, định dạng Markdown.
Chủ đề: ${topic}
Giọng văn: ${toneMap[tone] || tone}
Thể loại: ${typeMap[type] || type}

Yêu cầu:
- Dùng # cho tiêu đề chính, ## cho các phần
- Dùng **in đậm** cho từ khoá quan trọng
- Có danh sách, blockquote khi phù hợp
- Dài khoảng 500-700 từ
- Kết thúc bằng phần tóm tắt ngắn

Chỉ trả về nội dung Markdown, không cần giải thích.`
  )
}

export async function improvePostAI(content, instruction) {
  return cohereChat(
    `Cải thiện bài viết Markdown sau theo yêu cầu: "${instruction}"

${content}

Trả về toàn bộ bài đã chỉnh sửa dưới dạng Markdown, không giải thích thêm.`
  )
}