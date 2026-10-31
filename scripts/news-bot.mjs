import { createHash } from "node:crypto";
import { XMLParser } from "fast-xml-parser";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import {
  htmlToText, pageToArticleText, ogImageFrom, isGrounded,
  looksLikeArticle, introExcerpt, readMinutesOf,
} from "./article-utils.mjs";

initializeApp({
  credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)),
});
const db = getFirestore();
const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
});

const MAX_PER_RUN = 6; // giới hạn để blog không bị spam
const MIN_SOURCE = 600; // nguồn ngắn hơn số ký tự này thì chỉ tóm tắt 2-3 câu, không viết bài dài

// category phải trùng với giá trị bạn đang dùng trong collection "categories"
const FEEDS = [
  {
    url: "https://hnrss.org/frontpage?points=150",
    category: "news",
    tag: "tech-news",
  },
  {
    url: "https://github.com/facebook/react/releases.atom",
    label: "React",
    category: "react",
    tag: "react",
  },
  {
    url: "https://github.com/vercel/next.js/releases.atom",
    label: "Next.js",
    category: "react",
    tag: "nextjs",
  },
  {
    url: "https://github.com/nodejs/node/releases.atom",
    label: "Node.js",
    category: "nodejs",
    tag: "nodejs",
  },
];

const asArray = (x) => (x == null ? [] : Array.isArray(x) ? x : [x]);
const strip = (html = "") =>
  String(html)
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
const short = (s, n = 280) =>
  s.length > n ? s.slice(0, n).trimEnd() + "…" : s;

// Hacker News RSS chỉ có "Article URL / Comments URL / Points" chứ không có mô tả thật
const isHnBoilerplate = (t) => /^Article URL:/i.test(t) || /^Comments URL:/i.test(t);

async function readFeed({ url, label, category, tag }) {
  const res = await fetch(url, { headers: { "User-Agent": "dev-blog-bot" } });
  if (!res.ok) throw new Error(`${url} -> ${res.status}`);
  const xml = parser.parse(await res.text());
  const items = asArray(xml?.rss?.channel?.item ?? xml?.feed?.entry);
  return items.slice(0, 5).map((it) => {
    const link =
      typeof it.link === "string"
        ? it.link
        : (it.link?.["@_href"] ?? it.link?.[0]?.["@_href"]);
    const textOf = (v) => (typeof v === "string" ? v : (v?.["#text"] ?? ""));
    const html = textOf(it.description) || textOf(it.summary) || textOf(it.content);
    const desc = strip(html);
    const noDesc = isHnBoilerplate(desc);
    const rawTitle = strip(it.title?.["#text"] ?? it.title);
    // "19.3.1 (October 14th, 2026)" -> "React 19.3.1 (October 14th, 2026)"
    const title =
      label && !rawTitle.toLowerCase().includes(label.toLowerCase())
        ? `${label} ${rawTitle}`
        : rawTitle;
    return {
      title,
      link,
      // không có mô tả thật thì không gọi AI, tránh model phải bịa
      summary: noDesc ? "Bài viết nổi bật trên Hacker News." : short(desc),
      rawDesc: noDesc ? "" : short(desc, 1500), // đoạn gửi cho model (tóm tắt ngắn)
      fullText: noDesc ? "" : htmlToText(html).slice(0, 9000), // toàn văn có cấu trúc (release notes)
      noAI: noDesc,
      category,
      tag,
    };
  });
}

async function readJobs() {
  const res = await fetch(
    "https://remotive.com/api/remote-jobs?category=software-dev&limit=5",
  );
  if (!res.ok) throw new Error(`remotive -> ${res.status}`);
  const { jobs = [] } = await res.json();
  return jobs.map((j) => ({
    title: `${j.title} @ ${j.company_name}`,
    link: j.url,
    summary: short(
      `Remote · ${j.job_type ?? ""} · ${j.candidate_required_location ?? "Worldwide"}`,
    ),
    noAI: true, // tin tuyển dụng chỉ có metadata, giữ nguyên
    thumbnailUrl: /^https?:\/\//i.test(j.company_logo ?? "") ? j.company_logo : "",
    thumbFit: "contain", // logo vuông nên hiển thị nguyên vẹn, không cắt
    skipPage: true,
    category: "jobs",
    tag: "jobs",
  }));
}

async function summarizeVi(item) {
  const key = process.env.COHERE_API_KEY;
  const fallback = { text: item.summary, ai: false };
  const source = item.rawDesc ?? item.summary;
  // Không có key, không có mô tả đủ dài, hoặc là tin tuyển dụng thì giữ nguyên
  if (!key || item.noAI || source.length < 40) return fallback;
  try {
    const res = await fetch("https://api.cohere.com/v2/chat", {
      method: "POST",
      signal: AbortSignal.timeout(20000),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: "command-a-03-2025",
        temperature: 0.2, // thấp để model bám sát đoạn văn gốc
        messages: [
          {
            role: "system",
            content:
              "Bạn là biên tập viên tin công nghệ. Chỉ tóm tắt bằng tiếng Việt, 2-3 câu, dựa HOÀN TOÀN vào đoạn văn được cung cấp. Không thêm thông tin, số liệu hay nhận định không có trong đoạn văn. Chỉ trả về đoạn tóm tắt.",
          },
          {
            role: "user",
            content: `Tiêu đề: ${item.title}\n\nMô tả: ${source}`,
          },
        ],
      }),
    });
    if (!res.ok) throw new Error(`cohere -> ${res.status}`);
    const data = await res.json();
    const text = data?.message?.content?.[0]?.text?.trim();
    // Rỗng hoặc dài bất thường (model lan man) thì dùng mô tả gốc
    if (!text || text.length > 700) return fallback;
    return { text, ai: true };
  } catch (e) {
    console.warn("Cohere lỗi, dùng mô tả gốc:", e.message);
    return fallback;
  }
}

// Tải trang gốc một lần, dùng cho cả ảnh bìa và nội dung. Lỗi/bị chặn thì trả null.
async function fetchPage(url) {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; dev-blog-bot)", Accept: "text/html" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok || !(res.headers.get("content-type") ?? "").includes("text/html")) return null;
    return { html: (await res.text()).slice(0, 600_000), url: res.url };
  } catch {
    return null;
  }
}

// Viết bài dài có cấu trúc, chỉ dựa trên văn bản nguồn. Trả null nếu không đạt kiểm tra.
async function writeArticle(item, sourceText) {
  const key = process.env.COHERE_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch("https://api.cohere.com/v2/chat", {
      method: "POST",
      signal: AbortSignal.timeout(40000),
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: "command-a-03-2025",
        temperature: 0.2,
        max_tokens: 1500,
        messages: [
          {
            role: "system",
            content: [
              "Bạn là biên tập viên tin công nghệ. Viết lại văn bản nguồn thành một bài đọc bằng tiếng Việt, định dạng Markdown, CHỈ dựa trên văn bản được cung cấp.",
              "Quy tắc bắt buộc:",
              "1. Không thêm sự kiện, số liệu, tên người, sản phẩm, khóa học, đường link hay nhận định nào không có trong văn bản nguồn.",
              "2. Diễn đạt bằng lời của bạn, không chép nguyên các câu dài. Giữ nguyên số phiên bản, tên riêng và ngày tháng như trong nguồn.",
              "3. Cấu trúc: `## Giới thiệu` (2-3 câu nói bài này về điều gì); `## Điểm chính` (3-6 dòng bắt đầu bằng `- `, mỗi dòng mở đầu bằng cụm in đậm dạng `**Cụm từ:** giải thích`); `## Chi tiết` (tùy chọn, chỉ khi nguồn đủ nội dung, gồm 1-3 mục `### Tên mục` mỗi mục 2-3 câu). Bỏ mục nào mà nguồn không có thông tin.",
              "4. Tối đa khoảng 350 từ. Không dùng tiêu đề cấp 1, không lời chào, không kết luận chung chung. Chỉ trả về bài viết.",
            ].join("\n"),
          },
          { role: "user", content: `Tiêu đề: ${item.title}\n\nVăn bản nguồn:\n${sourceText}` },
        ],
      }),
    });
    if (!res.ok) throw new Error(`cohere -> ${res.status}`);
    const text = (await res.json())?.message?.content?.[0]?.text?.trim().replace(/[<>]/g, "");
    if (!text || !looksLikeArticle(text)) return null;
    if (!isGrounded(text, `${item.title}\n${sourceText}`)) {
      console.warn("Bỏ bài dài vì có số/link không có trong nguồn:", item.title);
      return null;
    }
    return text;
  } catch (e) {
    console.warn("Cohere (bài dài) lỗi:", e.message);
    return null;
  }
}

async function publish(item) {
  const id =
    "bot-" + createHash("sha1").update(item.link).digest("hex").slice(0, 20);
  const ref = db.collection("posts").doc(id);
  if ((await ref.get()).exists) return false;

  const page = item.skipPage ? null : await fetchPage(item.link);
  const thumbnailUrl = item.thumbnailUrl ?? (page ? ogImageFrom(page.html, page.url) : "");
  const sourceText = item.fullText || (page ? pageToArticleText(page.html) : "");

  // 1) đủ nguồn thì viết bài dài; 2) không thì tóm tắt 2-3 câu như trước
  const article = !item.skipPage && sourceText.length >= MIN_SOURCE
    ? await writeArticle(item, sourceText)
    : null;

  let excerpt, body, ai, readTime;
  if (article) {
    excerpt = introExcerpt(article);
    body = article;
    ai = true;
    readTime = `${readMinutesOf(article)} phút`;
  } else {
    const r = await summarizeVi(item);
    // nội dung đi vào dangerouslySetInnerHTML ở phía web nên loại ký tự thẻ HTML
    excerpt = body = r.text.replace(/[<>]/g, "");
    ai = r.ai;
    readTime = "1 phút";
  }
  const note = ai
    ? "*Bài này được tổng hợp tự động; nội dung do AI viết lại từ bài gốc, hãy xem nguồn để đối chiếu.*"
    : "*Bài này được tổng hợp tự động.*";
  await ref.create({
    title: item.title,
    excerpt,
    content: `${body}\n\n**Nguồn:** [${item.link}](${item.link})\n\n${note}`,
    status: "published",
    category: item.category,
    tags: ai ? [item.tag, "auto", "ai-summary"] : [item.tag, "auto"],
    thumbnailUrl,
    thumbFit: item.thumbFit ?? "cover",
    author: "News Bot",
    readTime,
    source: "bot",
    views: 0,
    date: FieldValue.serverTimestamp(),
    createdAt: FieldValue.serverTimestamp(),
  });
  return true;
}

const results = await Promise.allSettled([...FEEDS.map(readFeed), readJobs()]);
const items = results.flatMap((r) => (r.status === "fulfilled" ? r.value : []));
results
  .filter((r) => r.status === "rejected")
  .forEach((r) => console.warn("Feed lỗi:", r.reason.message));

let added = 0;
for (const item of items) {
  if (added >= MAX_PER_RUN) break;
  if (!item.title || !/^https?:\/\//i.test(item.link ?? "")) continue;
  if (await publish(item)) added++;
}
console.log(`Đã thêm ${added} bài`);
if (items.length === 0) process.exit(1); // để GitHub gửi mail báo lỗi khi mọi nguồn đều hỏng
