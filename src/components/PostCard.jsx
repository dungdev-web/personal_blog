import { Link } from "react-router-dom"
import { ArrowUpRight } from "lucide-react"
import PostThumb from "./PostThumb"
import { formatDate, initials, readMinutes } from "../lib/postUtils"

export function CategoryChip({ children, solid = false }) {
  if (!children) return null
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
        solid ? "bg-indigo-600 text-white" : "bg-indigo-50 text-indigo-700"
      }`}
    >
      {children}
    </span>
  )
}

export default function PostCard({ post, variant = "default", categoryLabel }) {
  const featured = variant === "featured"
  const author = post.author || "Dev Blog"

  return (
    <Link
      to={`/post/${post.id}`}
      className={`group rounded-3xl outline-offset-8 focus-visible:outline-2 focus-visible:outline-indigo-600 ${
        featured ? "grid items-center gap-6 md:grid-cols-5 md:gap-8" : "flex h-full flex-col"
      }`}
    >
      <PostThumb
        post={post}
        eager={featured}
        className={`aspect-[16/10] rounded-3xl ${featured ? "md:col-span-3" : ""}`}
      />

      <div className={featured ? "md:col-span-2" : "mt-4 flex flex-1 flex-col"}>
        <div className="flex flex-wrap items-center gap-2">
          {featured && <CategoryChip solid>Mới nhất</CategoryChip>}
          <CategoryChip>{categoryLabel || post.category}</CategoryChip>
        </div>

        <h2
          className={`mt-3 font-extrabold tracking-tight text-slate-900 transition-colors group-hover:text-indigo-700 ${
            featured ? "line-clamp-3 text-2xl leading-tight sm:text-3xl" : "line-clamp-2 text-lg leading-snug"
          }`}
        >
          {post.title}
        </h2>

        {post.excerpt && (
          <p
            className={`mt-2 text-slate-500 ${
              featured ? "line-clamp-4 text-base leading-7" : "line-clamp-2 text-sm leading-6"
            }`}
          >
            {post.excerpt}
          </p>
        )}

        <div className={`flex items-center gap-3 ${featured ? "mt-6" : "mt-auto pt-5"}`}>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
            {initials(author)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-800">{author}</p>
            <p className="flex gap-3 text-xs text-slate-400">
              <span>{readMinutes(post)} phút đọc</span>
              <span>{formatDate(post.date)}</span>
            </p>
          </div>
          <ArrowUpRight
            className="h-5 w-5 shrink-0 text-slate-400 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-indigo-600"
            aria-hidden
          />
        </div>
      </div>
    </Link>
  )
}
