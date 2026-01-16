import { useState, useEffect } from "react"
import { usePosts } from "../hooks/usePosts"
import PostCard from "../components/PostCard"
import { fetchCategories } from "../hooks/useCategories"

export default function Home() {
  const [currentCat, setCurrentCat] = useState("all")
  const [categories, setCategories] = useState([])

  const { posts, loading } = usePosts(currentCat)

  useEffect(() => {
    fetchCategories().then(setCategories)
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
        <div className="space-y-6 text-center">
          <div className="flex justify-center">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-spin"></div>
              <div className="absolute inset-2 rounded-full bg-white"></div>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-gray-700 font-semibold text-lg">Đang tải nội dung...</p>
            <p className="text-gray-500 text-sm">Vui lòng chờ trong giây lát</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 py-16 px-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl animate-float-delayed"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header Section */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Khám Phá Nội Dung
          </h1>
          <p className="text-gray-600 text-lg">Tìm kiếm bài viết phù hợp với sở thích của bạn</p>
        </div>

        {/* Category Filter */}
        <div className="mb-12 animate-fade-in-up">
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-3 p-2.5 bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 flex-wrap max-w-4xl">
              <button
                onClick={() => setCurrentCat("all")}
                className={`px-6 py-2.5 rounded-xl font-semibold transition-all duration-300 whitespace-nowrap ${
                  currentCat === "all"
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30 scale-105 hover:shadow-xl"
                    : "text-gray-700 hover:bg-gray-100/80 hover:scale-105"
                }`}
              >
                ✨ Tất cả
              </button>

              {categories.length > 0 && <div className="h-8 w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent"></div>}

              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCurrentCat(cat.slug)}
                  className={`px-6 py-2.5 rounded-xl font-semibold transition-all duration-300 whitespace-nowrap ${
                    currentCat === cat.slug
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30 scale-105 hover:shadow-xl"
                      : "text-gray-700 hover:bg-gray-100/80 hover:scale-105"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Posts Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
          {posts.map((p, idx) => (
            <div
              key={p.id}
              style={{
                animation: `slideUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards`,
                animationDelay: `${idx * 100}ms`,
                opacity: 0,
              }}
              className="transform transition-all duration-300 hover:scale-[1.02]"
            >
              <PostCard post={p} />
            </div>
          ))}
        </div>

        {/* Empty State */}
        {posts.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center min-h-96 text-center animate-fade-in">
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-12 shadow-lg border border-gray-200/50">
              <div className="text-7xl mb-6 animate-bounce-slow">📭</div>
              <p className="text-gray-700 text-xl font-semibold mb-2">Chưa có bài viết</p>
              <p className="text-gray-500">Hãy thử chọn danh mục khác hoặc quay lại sau</p>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
          }
          50% {
            transform: translateY(-20px) translateX(10px);
          }
        }

        @keyframes floatDelayed {
          0%, 100% {
            transform: translateY(0) translateX(0);
          }
          50% {
            transform: translateY(-30px) translateX(-15px);
          }
        }

        @keyframes bounceSlow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.8s ease-out;
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out;
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: floatDelayed 8s ease-in-out infinite;
        }

        .animate-bounce-slow {
          animation: bounceSlow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}