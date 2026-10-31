export function toDate(val) {
  if (!val) return null
  if (val.toDate) return val.toDate()
  if (val.seconds) return new Date(val.seconds * 1000)
  const d = new Date(val)
  return Number.isNaN(d.getTime()) ? null : d
}

export function formatDate(val) {
  const d = toDate(val)
  return d ? d.toLocaleDateString("vi-VN") : ""
}

export function formatDateLong(val) {
  const d = toDate(val)
  return d
    ? d.toLocaleDateString("vi-VN", { day: "numeric", month: "long", year: "numeric" })
    : ""
}

// Bài bot lưu readTime là "1 phút", bài admin không có -> tính từ nội dung
export function readMinutes(post) {
  const n = parseInt(String(post?.readTime ?? "").replace(/\D/g, ""), 10)
  if (n > 0) return n
  const words = (post?.content ?? "").trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / 200))
}

export function thumbSrc(url) {
  if (!url) return ""
  return /^https?:\/\//i.test(url) ? url : `/blog/${url}`
}

export function initials(name = "") {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .map((w) => w[0])
      .slice(-2)
      .join("")
      .toUpperCase() || "DB"
  )
}

export function tagList(tags) {
  if (!tags) return []
  const arr = typeof tags === "string" ? tags.split(",") : tags
  return arr.map((t) => String(t).trim()).filter(Boolean)
}

// Bỏ dấu để tìm "react" khớp "React", "tuyen dung" khớp "tuyển dụng"
export function normalize(s = "") {
  return String(s)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
}
