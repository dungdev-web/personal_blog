import { useState } from "react"
import { Atom, Braces, Briefcase, Database, FileText, GitBranch, Newspaper, Palette, Server } from "lucide-react"
import { thumbSrc } from "../lib/postUtils"

const PALETTES = [
  "from-indigo-500 to-violet-600",
  "from-sky-500 to-indigo-600",
  "from-emerald-500 to-teal-600",
  "from-rose-500 to-orange-500",
  "from-fuchsia-500 to-purple-600",
  "from-slate-700 to-slate-900",
]

const ICONS = [
  ["react", Atom], ["node", Server], ["job", Briefcase], ["news", Newspaper],
  ["database", Database], ["mongo", Database], ["git", GitBranch],
  ["css", Palette], ["script", Braces], ["api", Braces],
]

function hash(str = "") {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0
  return h
}

function Fallback({ category = "" }) {
  const key = category.toLowerCase()
  const Icon = ICONS.find(([k]) => key.includes(k))?.[1] ?? FileText
  const palette = PALETTES[hash(key) % PALETTES.length]
  return (
    <div
      className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br ${palette}`}
      style={{
        backgroundImage:
          "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.18) 1px, transparent 0)",
        backgroundSize: "18px 18px",
      }}
    >
      <Icon className="h-1/3 w-1/3 max-h-24 max-w-24 text-white/80" strokeWidth={1.25} />
    </div>
  )
}

// Ảnh bìa: ảnh thật nếu có, lỗi/không có thì dùng nền gradient theo danh mục.
export default function PostThumb({ post, className = "", eager = false }) {
  const src = thumbSrc(post.thumbnailUrl)
  const [failedSrc, setFailedSrc] = useState("")
  const showImg = src && failedSrc !== src
  const contain = post.thumbFit === "contain"

  return (
    <div className={`relative overflow-hidden bg-slate-100 ${className}`}>
      {showImg ? (
        <img
          src={src}
          alt=""
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setFailedSrc(src)}
          className={`reveal-img absolute inset-0 h-full w-full transition-[scale] duration-500 group-hover:scale-105 ${
            contain ? "bg-white object-contain p-10" : "object-cover"
          }`}
        />
      ) : (
        <Fallback category={post.category} />
      )}
    </div>
  )
}
