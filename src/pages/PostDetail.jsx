import { useEffect, useRef, useState } from "react"
import { Link, useParams } from "react-router-dom"
import {
  collection, doc, getDoc, getDocs, increment, limit, query, updateDoc, where,
} from "firebase/firestore"
import { ArrowLeft, ArrowUpRight, Calendar, Check, Clock, Eye, Link2 } from "lucide-react"
import { db } from "../firebase/firebase"
import MarkdownRenderer from "../components/MarkdownRenderer"
import PostCard, { CategoryChip } from "../components/PostCard"
import PostThumb from "../components/PostThumb"
import Reveal from "../components/Reveal"
import { formatDateLong, initials, readMinutes, tagList } from "../lib/postUtils"

const SOURCE_LINE = /\*\*Nguồn:\*\*\s*\[[^\]]*\]\((https?:\/\/[^)\s]+)\)[^\n]*\n*/

export default function PostDetail() {
  const { id } = useParams()
  const [post, setPost] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const bar = useRef(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setPost(null)
      setRelated([])
      try {
        const snap = await getDoc(doc(db, "posts", id))
        if (cancelled) return
        if (!snap.exists()) { setLoading(false); return }
        const current = { id: snap.id, ...snap.data() }
        setPost(current)
        setLoading(false)

        updateDoc(doc(db, "posts", id), { views: increment(1) }).catch(() => {})

        if (current.category) {
          const rs = await getDocs(
            query(
              collection(db, "posts"),
              where("category", "==", current.category),
              where("status", "==", "published"),
              limit(5),
            ),
          )
          if (cancelled) return
          setRelated(
            rs.docs.map((d) => ({ id: d.id, ...d.data() })).filter((p) => p.id !== current.id).slice(0, 3),
          )
        }
      } catch (e) {
        console.error(e)
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [id])

  useEffect(() => {
    if (post?.title) document.title = `${post.title} | Dev Blog`
    return () => { document.title = "Dev Blog" }
  }, [post])

  // Thanh tiến độ đọc, cập nhật bằng style trực tiếp để không render lại
  useEffect(() => {
    if (!post) return
    let raf = 0
    const update = () => {
      raf = 0
      const h = document.documentElement.scrollHeight - window.innerHeight
      const p = h > 0 ? Math.min(1, window.scrollY / h) : 0
      if (bar.current) bar.current.style.transform = `scaleX(${p})`
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update) }
    update()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [post])

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl animate-pulse px-5 pt-16 sm:px-8">
        <div className="h-5 w-24 rounded-full bg-slate-100" />
        <div className="mt-6 h-10 w-full rounded bg-slate-100" />
        <div className="mt-3 h-10 w-2/3 rounded bg-slate-100" />
        <div className="mt-10 aspect-[16/8] rounded-3xl bg-slate-100" />
      </div>
    )
  }

  if (!post) {
    return (
      <div className="mx-auto max-w-md px-5 py-32 text-center">
        <p className="text-6xl font-extrabold text-slate-200">404</p>
        <p className="mt-4 text-slate-500">Không tìm thấy bài viết này.</p>
        <Link to="/" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800">
          <ArrowLeft size={16} /> Về trang chủ
        </Link>
      </div>
    )
  }

  const sourceUrl = post.content?.match(SOURCE_LINE)?.[1]
  const body = sourceUrl ? post.content.replace(SOURCE_LINE, "") : post.content
  const tags = tagList(post.tags)
  // bài dài của bot đã có mục "Giới thiệu" ngay trong nội dung, không lặp excerpt dưới tiêu đề
  const hasIntro = /^##\s*Giới thiệu/m.test(post.content ?? "")
  const author = post.author || "Dev Blog"
  const shareUrl = encodeURIComponent(window.location.href)

  return (
    <article className="pb-24">
      <div
        ref={bar}
        aria-hidden
        className="fixed inset-x-0 top-0 z-[60] h-0.5 origin-left scale-x-0 bg-indigo-600"
      />

      <header className="mx-auto max-w-3xl px-5 pt-8 sm:px-8 sm:pt-12">
        <Link
          to="/"
          className="animate-rise group inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-slate-900"
        >
          <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-0.5" />
          Tất cả bài viết
        </Link>

        <div className="animate-rise mt-8 flex flex-wrap items-center gap-2" style={{ animationDelay: "60ms" }}>
          <CategoryChip>{post.category}</CategoryChip>
          {tags.includes("auto") && (
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
              Tổng hợp tự động
            </span>
          )}
        </div>

        <h1
          className="animate-rise mt-4 text-3xl font-extrabold leading-[1.15] tracking-tight text-slate-900 sm:text-5xl"
          style={{ animationDelay: "120ms" }}
        >
          {post.title}
        </h1>

        {post.excerpt && post.excerpt !== post.title && !hasIntro && (
          <p className="animate-rise mt-5 text-lg leading-8 text-slate-500" style={{ animationDelay: "180ms" }}>
            {post.excerpt}
          </p>
        )}

        <div
          className="animate-rise mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 border-y border-slate-200 py-4 text-sm text-slate-500"
          style={{ animationDelay: "240ms" }}
        >
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
              {initials(author)}
            </span>
            <span className="font-semibold text-slate-800">{author}</span>
          </div>
          <span className="flex items-center gap-1.5"><Calendar size={15} />{formatDateLong(post.date)}</span>
          <span className="flex items-center gap-1.5"><Clock size={15} />{readMinutes(post)} phút đọc</span>
          <span className="flex items-center gap-1.5"><Eye size={15} />{((post.views ?? 0) + 1).toLocaleString("vi-VN")} lượt xem</span>
        </div>
      </header>

      <div className="mx-auto mt-10 max-w-5xl px-5 sm:px-8">
        <PostThumb post={post} eager className="aspect-[16/8] rounded-3xl" />
      </div>

      <div className="mx-auto mt-12 max-w-3xl px-5 sm:px-8">
        <MarkdownRenderer content={body} />

        {sourceUrl && (
          <a
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            Đọc bài gốc <ArrowUpRight size={16} />
          </a>
        )}

        {tags.length > 0 && (
          <div className="mt-10 flex flex-wrap gap-2">
            {tags.map((t) => (
              <span key={t} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">#{t}</span>
            ))}
          </div>
        )}

        <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-slate-200 pt-8">
          <span className="mr-1 text-sm font-semibold text-slate-500">Chia sẻ</span>
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
            target="_blank" rel="noopener noreferrer"
            className="rounded-full bg-[#1877f2] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#166fe5]"
          >
            Facebook
          </a>
          <a
            href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${encodeURIComponent(post.title)}`}
            target="_blank" rel="noopener noreferrer"
            className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            X
          </a>
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-indigo-600 hover:text-indigo-700"
          >
            {copied ? <><Check size={15} className="text-emerald-600" /> Đã sao chép</> : <><Link2 size={15} /> Sao chép link</>}
          </button>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mx-auto mt-20 max-w-6xl px-5 sm:px-8">
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Bài viết liên quan</h2>
          <div className="mt-8 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p, i) => (
              <Reveal key={p.id} delay={i * 90}>
                <PostCard post={p} />
              </Reveal>
            ))}
          </div>
        </section>
      )}
    </article>
  )
}
