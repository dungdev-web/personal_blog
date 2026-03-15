import { useParams, Link } from "react-router-dom";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  limit,
  getDocs,
  increment,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useEffect, useState } from "react";
import MarkdownRenderer from "../components/MarkdownRenderer";

export default function PostDetail() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const snap = await getDoc(doc(db, "posts", id));
      if (!snap.exists()) return;

      const currentPost = { id: snap.id, ...snap.data() };
      setPost(currentPost);

      // +1 view — dùng increment để tránh race condition
      await updateDoc(doc(db, "posts", id), {
        views: increment(1),
      });

      const q = query(
        collection(db, "posts"),
        where("category", "==", currentPost.category),
        where("status", "==", "published"),
        limit(5)
      );

      const rs = await getDocs(q);
      const items = rs.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((p) => p.id !== currentPost.id)
        .slice(0, 4);

      setRelated(items);
      setLoading(false);
    };

    load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-purple-50">
        <div className="space-y-6 text-center">
          <div className="flex justify-center">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full bg-linear-to-r from-blue-500 via-purple-500 to-pink-500 animate-spin"></div>
              <div className="absolute inset-2 rounded-full bg-white"></div>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-gray-700 font-semibold text-lg">Đang tải bài viết...</p>
            <p className="text-gray-500 text-sm">Vui lòng chờ trong giây lát</p>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-purple-50">
        <div className="bg-white rounded-3xl p-12 shadow-2xl border border-gray-200/50 text-center max-w-md">
          <div className="text-7xl mb-6">🔍</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Không tìm thấy bài viết</h2>
          <p className="text-gray-600 mb-6">Bài viết bạn đang tìm kiếm không tồn tại hoặc đã bị xóa</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300"
          >
            ← Về trang chủ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50/30 to-purple-50/30 py-12 px-4 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-purple-200/20 rounded-full blur-3xl animate-float-delayed"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Breadcrumb */}
        <nav className="mb-8 animate-fade-in">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors duration-300 group"
          >
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="font-medium">Quay lại trang chủ</span>
          </Link>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* MAIN CONTENT */}
          <article className="lg:col-span-3 bg-white/80 backdrop-blur-lg p-8 md:p-12 rounded-3xl shadow-2xl border border-gray-200/50 animate-slide-up">
            {/* Category Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-linear-to-r from-blue-500 to-purple-500 text-white text-sm font-semibold rounded-full mb-6 shadow-lg shadow-blue-500/30">
              <span>📚</span>
              <span>{post.category}</span>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-linear-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent leading-tight">
              {post.title}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-8 pb-8 border-b border-gray-200">
              {/* Ngày */}
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="font-medium">
                  {post.date?.toDate().toLocaleDateString("vi-VN")}
                </span>
              </div>

              {/* Thời gian đọc */}
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">
                  {Math.max(1, Math.ceil((post.content?.split(/\s+/).length || 0) / 200))} phút đọc
                </span>
              </div>

              {/* Lượt xem — +1 đã được increment trước đó nên +1 để hiển thị chính xác */}
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span className="font-medium">
                  {((post.views ?? 0) + 1).toLocaleString("vi-VN")} lượt xem
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="prose prose-lg max-w-none">
              <MarkdownRenderer content={post.content} />
            </div>

            {/* Share Section */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <p className="text-gray-600 font-medium mb-4">Chia sẻ bài viết này:</p>
              <div className="flex gap-3">
                <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-all hover:scale-105 shadow-md">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Facebook
                </button>
                <button className="flex items-center gap-2 px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl transition-all hover:scale-105 shadow-md">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                  Twitter
                </button>
                <button
                  onClick={() => navigator.clipboard.writeText(window.location.href)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gray-600 hover:bg-gray-700 text-white rounded-xl transition-all hover:scale-105 shadow-md"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  Sao chép
                </button>
              </div>
            </div>
          </article>

          {/* SIDEBAR */}
          <aside className="lg:col-span-1 space-y-6">
            {/* Related Posts */}
            <div className="bg-white/80 backdrop-blur-lg p-6 rounded-3xl shadow-xl border border-gray-200/50 animate-slide-up-delayed sticky top-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-linear-to-r from-blue-500 to-purple-500 rounded-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="font-bold text-xl bg-linear-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Bài viết liên quan
                </h3>
              </div>

              {related.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">📝</div>
                  <p className="text-sm text-gray-500">Chưa có bài viết liên quan</p>
                </div>
              ) : (
                <ul className="space-y-4">
                  {related.map((p, idx) => (
                    <li
                      key={p.id}
                      style={{
                        animation: `slideIn 0.5s ease-out forwards`,
                        animationDelay: `${idx * 100}ms`,
                        opacity: 0,
                      }}
                    >
                      <Link
                        to={`/post/${p.id}`}
                        className="block group hover:bg-linear-to-r hover:from-blue-50 hover:to-purple-50 p-4 rounded-2xl transition-all duration-300 border border-transparent hover:border-blue-200 hover:shadow-md"
                      >
                        <div className="text-sm font-semibold text-gray-800 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
                          {p.title}
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {p.date?.toDate().toLocaleDateString("vi-VN")}
                          </div>
                          {p.views > 0 && (
                            <div className="flex items-center gap-1">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              {p.views.toLocaleString("vi-VN")}
                            </div>
                          )}
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </aside>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          50%       { transform: translateY(-20px) translateX(10px); }
        }
        @keyframes floatDelayed {
          0%, 100% { transform: translateY(0) translateX(0); }
          50%       { transform: translateY(-30px) translateX(-15px); }
        }
        .animate-slide-up          { animation: slideUp 0.8s ease-out; }
        .animate-slide-up-delayed  { animation: slideUp 0.8s ease-out 0.2s backwards; }
        .animate-fade-in           { animation: fadeIn 0.6s ease-out; }
        .animate-float             { animation: float 6s ease-in-out infinite; }
        .animate-float-delayed     { animation: floatDelayed 8s ease-in-out infinite; }
      `}</style>
    </div>
  );
}