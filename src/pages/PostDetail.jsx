import { useParams, Link } from "react-router-dom";
import {
  doc, getDoc, updateDoc, collection,
  query, where, limit, getDocs, increment,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useEffect, useState } from "react";
import MarkdownRenderer from "../components/MarkdownRenderer";

function formatDate(val) {
  if (!val) return "";
  const d = val?.toDate ? val.toDate() : new Date(val);
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "long", year: "numeric" });
}

function readingTime(content) {
  return Math.max(1, Math.ceil((content?.split(/\s+/).length || 0) / 200));
}

export default function PostDetail() {
  const { id } = useParams();
  const [post, setPost]       = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied]   = useState(false);

  useEffect(() => {
    const load = async () => {
      const snap = await getDoc(doc(db, "posts", id));
      if (!snap.exists()) { setLoading(false); return; }
      const currentPost = { id: snap.id, ...snap.data() };
      setPost(currentPost);
      await updateDoc(doc(db, "posts", id), { views: increment(1) });
      const q = query(
        collection(db, "posts"),
        where("category", "==", currentPost.category),
        where("status", "==", "published"),
        limit(5),
      );
      const rs = await getDocs(q);
      setRelated(rs.docs.map(d => ({ id: d.id, ...d.data() })).filter(p => p.id !== currentPost.id).slice(0, 4));
      setLoading(false);
    };
    load();
  }, [id]);

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f6f1]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500 tracking-widest uppercase">Đang tải</p>
      </div>
    </div>
  );

  if (!post) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f6f1]">
      <div className="text-center">
        <p className="text-6xl font-thin text-gray-300 mb-4">404</p>
        <p className="text-gray-500 mb-6">Không tìm thấy bài viết</p>
        <Link to="/" className="text-sm underline underline-offset-4 text-gray-700 hover:text-gray-900">← Về trang chủ</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8f6f1]" style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>

      {/* ── Top bar ── */}
      <header className="sticky top-0 z-50 bg-[#f8f6f1]/90 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 h-15 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group" style={{ fontFamily: "'system-ui', sans-serif" }}>
            <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="text-sm font-medium">Trang chủ</span>
          </Link>

          <div className="flex items-center gap-2 text-xs text-gray-400" style={{ fontFamily: "'system-ui', sans-serif" }}>
            <span className="px-2.5 py-1 bg-gray-900 text-white rounded-full font-medium">{post.category}</span>
            <span>·</span>
            <span>{readingTime(post.content)} phút đọc</span>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <div className=" mx-auto px-6 pt-16 pb-10 text-center">
        {/* Label */}
        <div className="flex items-center gap-3 mb-8">
          <div className="h-px flex-1 bg-gray-300" />
          <span className="text-xs tracking-[0.2em] uppercase text-gray-500" style={{ fontFamily: "'system-ui', sans-serif" }}>{post.category}</span>
          <div className="h-px flex-1 bg-gray-300" />
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold leading-tight text-gray-950 mb-6" style={{ letterSpacing: "-0.02em" }}>
          {post.title}
        </h1>

        {/* Excerpt */}
        {post.excerpt && post.excerpt !== post.title && (
          <p className="text-xl text-gray-500 leading-relaxed mb-8 font-normal italic">
            {post.excerpt}
          </p>
        )}

        {/* Meta row */}
        <div className="flex flex-wrap items-center justify-end gap-5 text-sm text-gray-500 pb-8 border-b-2 border-gray-900" style={{ fontFamily: "'system-ui', sans-serif" }}>
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{formatDate(post.date)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{readingTime(post.content)} phút đọc</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span>{((post.views ?? 0) + 1).toLocaleString("vi-VN")} lượt xem</span>
          </div>

          {/* Tags */}
          {post.tags && (
            <div className="flex gap-1.5 flex-wrap ml-auto">
              {(typeof post.tags === "string" ? post.tags.split(",") : post.tags)
                .map(t => t.trim()).filter(Boolean)
                .map(tag => (
                  <span key={tag} className="px-2.5 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">#{tag}</span>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Body: Content + Sidebar ── */}
      <div className=" mx-auto px-6 pb-20">
        <div className="flex gap-12 items-start">

          {/* Content */}
          <main className="flex-1 min-w-0">
            <div className="bg-white rounded-2xl px-10 py-12 shadow-sm border border-gray-100"
              style={{
                fontFamily: "'Georgia', 'Times New Roman', serif",
                fontSize: "18px",
                lineHeight: "1.85",
                color: "#1a1a1a",
              }}
            >
              <MarkdownRenderer content={post.content} />
            </div>

            {/* Share */}
            <div className="mt-8 flex items-center gap-4" style={{ fontFamily: "'system-ui', sans-serif" }}>
              <span className="text-sm text-gray-500 font-medium">Chia sẻ:</span>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-[#1877f2] hover:bg-[#166fe5] text-white text-sm font-medium rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                Facebook
              </a>
              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(post.title)}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.258 5.63 5.906-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                X (Twitter)
              </a>
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 hover:border-gray-500 text-gray-700 text-sm font-medium rounded-lg transition-colors"
              >
                {copied ? (
                  <><svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg> Đã sao chép!</>
                ) : (
                  <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg> Sao chép link</>
                )}
              </button>
            </div>
          </main>

          {/* Sidebar */}
          <aside className="w-72 shrink-0 sticky top-20 flex flex-col gap-6" style={{ fontFamily: "'system-ui', sans-serif" }}>

            {/* About article */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <p className="text-xs tracking-widest uppercase text-gray-400 font-medium mb-4">Về bài viết</p>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                  <span className="text-gray-400">Danh mục</span>
                  <span className="font-medium text-gray-800 text-right">{post.category || "—"}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                  <span className="text-gray-400">Ngày đăng</span>
                  <span className="font-medium text-gray-800">{formatDate(post.date)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                  <span className="text-gray-400">Thời gian đọc</span>
                  <span className="font-medium text-gray-800">{readingTime(post.content)} phút</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-400">Lượt xem</span>
                  <span className="font-medium text-gray-800">{((post.views ?? 0) + 1).toLocaleString("vi-VN")}</span>
                </div>
              </div>
            </div>

            {/* Related posts */}
            {related.length > 0 && (
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <p className="text-xs tracking-widest uppercase text-gray-400 font-medium mb-4">Bài viết liên quan</p>
                <div className="flex flex-col gap-4">
                  {related.map((p, idx) => (
                    <Link
                      key={p.id}
                      to={`/post/${p.id}`}
                      className="group flex gap-3 items-start"
                      style={{ animationDelay: `${idx * 80}ms` }}
                    >
                      {/* Number */}
                      <span className="text-2xl font-thin text-gray-200 leading-none mt-0.5 select-none w-6 shrink-0">
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800 leading-snug line-clamp-2 group-hover:text-gray-500 transition-colors">
                          {p.title}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">{formatDate(p.date)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Back to top */}
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gray-900 hover:bg-gray-700 text-white text-sm font-medium rounded-xl transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              Lên đầu trang
            </button>
          </aside>
        </div>
      </div>

      {/* ── Related posts bottom (mobile) ── */}
      {related.length > 0 && (
        <div className="lg:hidden max-w-3xl mx-auto px-6 pb-16" style={{ fontFamily: "'system-ui', sans-serif" }}>
          <p className="text-xs tracking-widest uppercase text-gray-400 font-medium mb-4">Bài viết liên quan</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {related.map(p => (
              <Link key={p.id} to={`/post/${p.id}`}
                className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <span className="text-xs text-gray-400 uppercase tracking-wide">{p.category}</span>
                <p className="font-semibold text-gray-800 mt-1 line-clamp-2 text-sm leading-snug">{p.title}</p>
                <p className="text-xs text-gray-400 mt-2">{formatDate(p.date)}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}