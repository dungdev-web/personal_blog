import { useEffect, useMemo, useState } from "react"
import { Search, X } from "lucide-react"
import PostCard from "../components/PostCard"
import Reveal from "../components/Reveal"
import { usePosts } from "../hooks/usePosts"
import { fetchCategories } from "../hooks/useCategories"
import { normalize, tagList } from "../lib/postUtils"

function Skeleton({ featured = false }) {
  return (
    <div className={`animate-pulse ${featured ? "sm:col-span-2" : ""}`}>
      <div className="aspect-[16/10] rounded-3xl bg-slate-100" />
      <div className="mt-4 h-4 w-20 rounded-full bg-slate-100" />
      <div className="mt-3 h-5 w-4/5 rounded bg-slate-100" />
      <div className="mt-2 h-4 w-3/5 rounded bg-slate-100" />
    </div>
  )
}

export default function Home() {
  const [currentCat, setCurrentCat] = useState("all")
  const [categories, setCategories] = useState([])
  const [q, setQ] = useState("")

  const { posts, loading, loadingMore, hasMore, loadMore, error } = usePosts(currentCat)

  useEffect(() => {
    fetchCategories().then(setCategories).catch(() => {})
  }, [])

  const catName = useMemo(
    () => Object.fromEntries(categories.map((c) => [c.slug, c.name])),
    [categories],
  )

  const searching = q.trim().length > 0
  const filtered = useMemo(() => {
    const needle = normalize(q.trim())
    if (!needle) return posts
    return posts.filter((p) =>
      normalize(`${p.title} ${p.excerpt ?? ""} ${tagList(p.tags).join(" ")}`).includes(needle),
    )
  }, [posts, q])

  const featured = !searching ? filtered[0] : null
  const rest = featured ? filtered.slice(1) : filtered

  const catItems = [{ id: "all", slug: "all", name: "Tất cả" }, ...categories]

  return (
    <div className="mx-auto max-w-6xl px-5 pb-24 sm:px-8">
      {/* Hero */}
      <section className="mx-auto max-w-2xl pt-12 text-center sm:pt-16">
        <span className="animate-rise inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
          Bài viết và bản tin công nghệ
        </span>
        <h1
          className="animate-rise mt-5 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl"
          style={{ animationDelay: "80ms" }}
        >
          Đọc nhanh, hiểu đủ về công nghệ
        </h1>
        <p
          className="animate-rise mt-4 text-lg leading-8 text-slate-500"
          style={{ animationDelay: "160ms" }}
        >
          Hướng dẫn, ghi chú và tin mới được tóm tắt bằng tiếng Việt.
        </p>
      </section>

      <div className="mt-12 grid gap-10 sm:mt-16 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-12">
        {/* Sidebar */}
        <aside className="animate-rise lg:sticky lg:top-24 lg:self-start" style={{ animationDelay: "240ms" }}>
          <label htmlFor="search" className="mb-2 block text-xs font-semibold text-slate-500">
            Tìm bài viết
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Nhập từ khóa..."
              className="w-full rounded-full border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100"
            />
            {q && (
              <button
                type="button"
                aria-label="Xóa từ khóa"
                onClick={() => setQ("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <p className="mb-3 mt-8 hidden text-xs font-semibold text-indigo-700 lg:block">Danh mục</p>

          {/* Mobile: cuộn ngang */}
          <div className="-mx-5 mt-5 flex gap-2 overflow-x-auto px-5 pb-1 lg:hidden [scrollbar-width:none]">
            {catItems.map((c) => (
              <button
                key={c.id}
                onClick={() => setCurrentCat(c.slug)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  currentCat === c.slug
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>

          {/* Desktop: danh sách có vạch bên trái */}
          <nav className="hidden border-l border-slate-200 lg:block" aria-label="Danh mục">
            {catItems.map((c) => (
              <button
                key={c.id}
                onClick={() => setCurrentCat(c.slug)}
                aria-current={currentCat === c.slug}
                className={`-ml-px block w-full border-l-2 py-2 pl-4 text-left text-sm transition-colors ${
                  currentCat === c.slug
                    ? "border-indigo-600 font-bold text-slate-900"
                    : "border-transparent font-medium text-slate-500 hover:border-slate-300 hover:text-slate-900"
                }`}
              >
                {c.name}
              </button>
            ))}
          </nav>
        </aside>

        {/* Kết quả */}
        <section aria-live="polite">
          {loading ? (
            <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2">
              <Skeleton featured />
              <Skeleton />
              <Skeleton />
            </div>
          ) : error ? (
            <div className="rounded-3xl border border-slate-200 p-10 text-center">
              <p className="font-bold text-slate-900">Không tải được bài viết</p>
              <p className="mt-2 text-sm text-slate-500">Kiểm tra kết nối mạng rồi tải lại trang.</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 p-10 text-center">
              <p className="font-bold text-slate-900">
                {searching ? "Không có bài nào khớp từ khóa" : "Chưa có bài viết"}
              </p>
              <p className="mt-2 text-sm text-slate-500">
                {searching
                  ? "Thử từ khóa khác, hoặc bấm “Xem thêm” để tìm trong nhiều bài hơn."
                  : "Thử chọn danh mục khác hoặc quay lại sau."}
              </p>
            </div>
          ) : (
            <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2">
              {featured && (
                <Reveal className="sm:col-span-2">
                  <PostCard post={featured} variant="featured" categoryLabel={catName[featured.category]} />
                </Reveal>
              )}
              {rest.map((p, i) => (
                <Reveal key={p.id} delay={(i % 2) * 90}>
                  <PostCard post={p} categoryLabel={catName[p.category]} />
                </Reveal>
              ))}
            </div>
          )}

          {!loading && !error && hasMore && (
            <div className="mt-14 text-center">
              {searching && (
                <p className="mb-3 text-xs text-slate-400">Từ khóa chỉ được tìm trong các bài đã tải.</p>
              )}
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="rounded-full border border-slate-200 px-7 py-3 text-sm font-semibold text-slate-800 transition hover:border-indigo-600 hover:text-indigo-700 disabled:opacity-60"
              >
                {loadingMore ? "Đang tải..." : "Xem thêm bài viết"}
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
