// Các hàm thuần (không gọi mạng) để bot dựng bài dài từ nội dung nguồn.

const ENT = { "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'", "&apos;": "'", "&nbsp;": " " };

function decode(s) {
  return s
    .replace(/&(?:amp|lt|gt|quot|#39|apos|nbsp);/g, (m) => ENT[m])
    .replace(/&#(\d{1,7});/g, (m, n) => {
      const cp = Number(n);
      return cp > 0 && cp <= 0x10ffff ? String.fromCodePoint(cp) : m;
    });
}

// HTML -> văn bản thuần nhưng giữ cấu trúc: tiêu đề thành "## ", mục danh sách thành "- "
export function htmlToText(html = "") {
  return decode(
    String(html)
      .replace(/<(script|style|noscript|svg|nav|header|footer|aside|form|iframe)\b[\s\S]*?<\/\1>/gi, " ")
      .replace(/<h[1-6][^>]*>/gi, "\n\n## ")
      .replace(/<\/h[1-6]>/gi, "\n")
      .replace(/<li[^>]*>/gi, "\n- ")
      .replace(/<\/(p|div|ul|ol|tr|blockquote|section|article)>/gi, "\n")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<[^>]+>/g, " "),
  )
    .replace(/[ \t\u00a0]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// Trang web -> các đoạn văn/tiêu đề/gạch đầu dòng của phần nội dung chính
export function pageToArticleText(html = "", max = 9000) {
  const root =
    html.match(/<article\b[\s\S]*?<\/article>/i)?.[0] ??
    html.match(/<main\b[\s\S]*?<\/main>/i)?.[0] ??
    html;
  const parts = [];
  for (const m of root.matchAll(/<(h[1-3]|p|li)\b[^>]*>([\s\S]*?)<\/\1>/gi)) {
    const tag = m[1].toLowerCase();
    const t = htmlToText(m[2]).replace(/\s+/g, " ").trim();
    if (!t) continue;
    if (tag.startsWith("h")) parts.push(`## ${t}`);
    else if (tag === "li") { if (t.length > 40) parts.push(`- ${t}`); }
    else if (t.length >= 60) parts.push(t); // bỏ các dòng ngắn kiểu menu, cookie
  }
  return parts.join("\n\n").slice(0, max);
}

// Ảnh og:image / twitter:image; trả "" nếu không có
export function ogImageFrom(html = "", baseUrl = "") {
  for (const m of html.matchAll(/<meta\b[^>]*>/gi)) {
    const tag = m[0];
    if (!/(?:property|name)=["'](?:og:image|twitter:image)["']/i.test(tag)) continue;
    const c = tag.match(/content=["']([^"']+)["']/i)?.[1];
    if (!c) continue;
    try {
      const u = new URL(c.replace(/&amp;/g, "&"), baseUrl);
      if (u.protocol === "http:") u.protocol = "https:";
      if (u.protocol === "https:") return u.href;
    } catch {
      /* URL hỏng, thử thẻ khác */
    }
  }
  return "";
}

// Kiểm tra "không bịa": mọi số phiên bản, số lớn, năm và URL trong bài viết
// đều phải xuất hiện trong văn bản nguồn. Số 1-2 chữ số được bỏ qua vì
// model hay tự đếm ("5 điểm") hoặc đổi định dạng ngày.
export function isGrounded(output, source) {
  const body = output.replace(/^\s*\d+\.\s+/gm, "");
  for (const n of body.match(/\d[\d.,]*\d|\d/g) ?? []) {
    const clean = n.replace(/[.,]+$/, "");
    if (/^\d{1,2}$/.test(clean)) continue;
    if (!source.includes(clean)) return false;
  }
  for (const u of body.match(/https?:\/\/[^\s)]+/g) ?? []) {
    if (!source.includes(u)) return false;
  }
  return true;
}

// Bài hợp lệ: có ít nhất 1 tiêu đề ##, không có tiêu đề cấp 1, độ dài hợp lý
export function looksLikeArticle(md) {
  return (
    /^## \S/m.test(md) &&
    !/^# /m.test(md) &&
    md.length >= 250 &&
    md.length <= 4500
  );
}

// Đoạn mở đầu làm excerpt cho thẻ bài viết
export function introExcerpt(md, n = 220) {
  const intro = md.match(/##\s*Giới thiệu\s*\n+([\s\S]*?)(?=\n##|\s*$)/i)?.[1];
  const t = (intro ?? md.replace(/^#+ .*$/gm, ""))
    .replace(/^\s*[-*]\s+/gm, "")
    .replace(/[*_`#>]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return t.length > n ? t.slice(0, n).trimEnd() + "…" : t;
}

export const readMinutesOf = (text) =>
  Math.max(1, Math.ceil(text.trim().split(/\s+/).filter(Boolean).length / 200));
