import { createHash } from "node:crypto"
import { XMLParser } from "fast-xml-parser"
import admin from "firebase-admin"

admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)),
})
const db = admin.firestore()
const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" })

const MAX_PER_RUN = 6 // giới hạn để blog không bị spam

// category phải trùng với giá trị bạn đang dùng trong collection "categories"
const FEEDS = [
  { url: "https://hnrss.org/frontpage?points=150", category: "news", tag: "tech-news" },
  { url: "https://github.com/facebook/react/releases.atom", category: "react", tag: "react" },
  { url: "https://github.com/vercel/next.js/releases.atom", category: "react", tag: "nextjs" },
  { url: "https://github.com/nodejs/node/releases.atom", category: "nodejs", tag: "nodejs" },
]

const asArray = (x) => (x == null ? [] : Array.isArray(x) ? x : [x])
const strip = (html = "") =>
  String(html).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
const short = (s, n = 280) => (s.length > n ? s.slice(0, n).trimEnd() + "…" : s)

async function readFeed({ url, category, tag }) {
  const res = await fetch(url, { headers: { "User-Agent": "dev-blog-bot" } })
  if (!res.ok) throw new Error(`${url} -> ${res.status}`)
  const xml = parser.parse(await res.text())
  const items = asArray(xml?.rss?.channel?.item ?? xml?.feed?.entry)
  return items.slice(0, 5).map((it) => {
    const link = typeof it.link === "string" ? it.link : it.link?.["@_href"] ?? it.link?.[0]?.["@_href"]
    return {
      title: strip(it.title?.["#text"] ?? it.title),
      link,
      summary: short(strip(it.description ?? it.summary ?? it.content?.["#text"] ?? "")),
      category,
      tag,
    }
  })
}

async function readJobs() {
  const res = await fetch("https://remotive.com/api/remote-jobs?category=software-dev&limit=5")
  if (!res.ok) throw new Error(`remotive -> ${res.status}`)
  const { jobs = [] } = await res.json()
  return jobs.map((j) => ({
    title: `${j.title} @ ${j.company_name}`,
    link: j.url,
    summary: short(`Remote · ${j.job_type ?? ""} · ${j.candidate_required_location ?? "Worldwide"}`),
    category: "jobs",
    tag: "jobs",
  }))
}

async function summarizeVi(item) {
  const key = process.env.COHERE_API_KEY
  // Không có key, không có mô tả, hoặc là tin tuyển dụng thì giữ nguyên
  if (!key || item.noAI || item.summary.length < 40) return item.summary
  try {
    const res = await fetch("https://api.cohere.com/v2/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: "command-a-03-2025",
        messages: [
          {
            role: "system",
            content:
              "Bạn là biên tập viên tin công nghệ. Chỉ tóm tắt bằng tiếng Việt, 2-3 câu, dựa HOÀN TOÀN vào đoạn văn được cung cấp. Không thêm thông tin, số liệu hay nhận định không có trong đoạn văn. Chỉ trả về đoạn tóm tắt.",
          },
          { role: "user", content: `Tiêu đề: ${item.title}\n\nMô tả: ${item.summary}` },
        ],
      }),
    })
    if (!res.ok) throw new Error(`cohere -> ${res.status}`)
    const data = await res.json()
    return data?.message?.content?.[0]?.text?.trim() || item.summary
  } catch (e) {
    console.warn("Cohere lỗi, dùng mô tả gốc:", e.message)
    return item.summary
  }
}

async function publish(item) {
  const id = "bot-" + createHash("sha1").update(item.link).digest("hex").slice(0, 20)
  const ref = db.collection("posts").doc(id)
  if ((await ref.get()).exists) return false

  const summary = await summarizeVi(item)
  await ref.create({
    title: item.title,
    excerpt: summary,
    content: `${summary}\n\n**Nguồn:** [${item.link}](${item.link})\n\n*Bài này được tổng hợp tự động.*`,
    status: "published",
    category: item.category,
    tags: [item.tag, "auto"],
    thumbnailUrl: "",
    author: "News Bot",
    readTime: "1 phút",
    source: "bot",
    views: 0,
    date: admin.firestore.FieldValue.serverTimestamp(),
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  })
  return true
}

const results = await Promise.allSettled([...FEEDS.map(readFeed), readJobs()])
const items = results.flatMap((r) => (r.status === "fulfilled" ? r.value : []))
results.filter((r) => r.status === "rejected").forEach((r) => console.warn("Feed lỗi:", r.reason.message))

let added = 0
for (const item of items) {
  if (added >= MAX_PER_RUN) break
  if (!item.title || !item.link) continue
  if (await publish(item)) added++
}
console.log(`Đã thêm ${added} bài`)
if (items.length === 0) process.exit(1) // để GitHub gửi mail báo lỗi khi mọi nguồn đều hỏng