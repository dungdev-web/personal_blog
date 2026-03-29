import { Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PostCard({ post, size = "md" }) {
  const nav = useNavigate();

  const formatDate = (ts) => {
    if (!ts) return "";
    if (ts.seconds) {
      return new Date(ts.seconds * 1000).toLocaleDateString("vi-VN");
    }
    return ts;
  };

  const getInitials = (name = "") =>
    name
      .split(" ")
      .map((w) => w[0])
      .slice(-2)
      .join("")
      .toUpperCase();

  const heightMap = { hero: "h-85", md: "h-75", sm: "h-44" };
  const titleSizeMap = { hero: "text-xl", md: "text-base", sm: "text-sm" };

  return (
    <div
      onClick={() => nav(`/post/${post.id}`)}
      className="group rounded-xl overflow-hidden border border-gray-200/60 cursor-pointer bg-white
                 hover:-translate-y-1 transition-transform duration-200 h-auto"
    >
      {/* Image + Overlay */}
      <div className={`relative w-full overflow-hidden ${heightMap[size]}`}>
        {post.thumbnailUrl ? (
          <img
            src={
              post.thumbnailUrl?.startsWith("http")
                ? post.thumbnailUrl
                : `/blog/${post.thumbnailUrl}`
            }
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600" />
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-black/80" />

        {/* Content on image */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          {/* Category badge */}
          {post.category && (
            <span
              className="inline-block text-[11px] font-medium uppercase tracking-wide
                             px-2.5 py-0.5 rounded-full bg-white/20 text-white/90 mb-2"
            >
              {post.category}
            </span>
          )}

          {/* Title */}
          <h2
            className={`font-semibold leading-snug text-white line-clamp-2 ${titleSizeMap[size]}`}
          >
            {post.title}
          </h2>

          {/* Excerpt — chỉ hiện ở hero & md */}
          {size !== "sm" && post.excerpt && (
            <p className="text-white/70 text-xs mt-1 line-clamp-2 leading-relaxed">
              {post.excerpt}
            </p>
          )}

          {/* Meta */}
          <div className="flex items-center gap-2 mt-2.5 text-white/55 text-[11px]">
            {/* Avatar */}
            {post.author && (
              <>
                <div
                  className="w-5 h-5 rounded-full bg-white/25 border border-white/30
                                flex items-center justify-center text-[9px] font-medium text-white shrink-0"
                >
                  {getInitials(post.author)}
                </div>
                <span>{post.author}</span>
                <span className="w-0.5 h-0.5 rounded-full bg-white/40" />
              </>
            )}
            <Calendar size={11} className="shrink-0" />
            <span>{formatDate(post.date)}</span>
            {post.readTime && (
              <>
                <span className="w-0.5 h-0.5 rounded-full bg-white/40" />
                <span>{post.readTime} phút đọc</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
