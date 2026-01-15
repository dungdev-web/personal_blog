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
      <div className="flex justify-center items-center min-h-screen">
        <div className="space-y-4 text-center">
          <div className="flex justify-center">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 animate-spin"></div>
              <div className="absolute inset-1 rounded-full bg-white"></div>
            </div>
          </div>
          <p className="text-gray-600 font-medium">Đang tải...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Category Filter */}
        <div className="mb-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 p-2 bg-white rounded-full shadow-lg border border-gray-100 flex-wrap">
            <button
              onClick={() => setCurrentCat("all")}
              className={`px-5 py-2 rounded-full font-semibold transition-all duration-300 whitespace-nowrap ${
                currentCat === "all"
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              Tất cả
            </button>

            {categories.length > 0 && <div className="h-6 w-px bg-gray-200"></div>}

            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCurrentCat(cat.slug)}
                className={`px-5 py-2 rounded-full font-semibold transition-all duration-300 whitespace-nowrap ${
                  currentCat === cat.slug
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Posts */}
        <div className="grid md:grid-cols-2 gap-6">
          {posts.map((p, idx) => (
            <div
              key={p.id}
              style={{
                animation: `slideUp 0.5s ease-out forwards`,
                animationDelay: `${idx * 80}ms`,
                opacity: 0,
              }}
            >
              <PostCard post={p} />
            </div>
          ))}
        </div>

        {posts.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center min-h-96 text-center">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-gray-600 text-lg font-medium">Không có bài viết nào</p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
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

        .animate-fade-in {
          animation: fadeIn 0.6s ease-out;
        }
      `}</style>
    </div>
  )
}