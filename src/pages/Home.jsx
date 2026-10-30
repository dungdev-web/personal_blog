import { useState, useEffect } from "react";
import { usePosts } from "../hooks/usePosts";
import PostCard from "../components/PostCard";
import { fetchCategories } from "../hooks/useCategories";

export default function Home() {
  const [currentCat, setCurrentCat] = useState("all");
  const [categories, setCategories] = useState([]);

  const { posts, loading } = usePosts(currentCat);

  useEffect(() => {
    fetchCategories().then(setCategories);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f6f1]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500 tracking-widest uppercase">Đang tải</p>
      </div>
    </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f6f1] py-16 px-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl animate-float-delayed"></div>
      </div>

      <div className="mx-auto relative z-10">
        {/* Header Section */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className=" h-14 text-4xl md:text-5xl font-bold bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Khám Phá Nội Dung
          </h1>
          <p className="text-gray-600 text-lg">
            Tìm kiếm bài viết phù hợp với sở thích của bạn
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-10">
          <div className="flex justify-center">
            <div className="flex items-center gap-1 p-1 bg-white border border-gray-200 rounded-xl shadow-sm flex-wrap">
              <button
                onClick={() => setCurrentCat("all")}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  currentCat === "all"
                    ? "bg-gray-900 text-white"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                Tất cả
              </button>

              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCurrentCat(cat.slug)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                    currentCat === cat.slug
                      ? "bg-gray-900 text-white"
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {posts.map((p, idx) => (
            <div key={p.id} className={idx === 0 ? "md:col-span-2" : ""}>
              <PostCard post={p} size={idx === 0 ? "hero" : "md"} />
            </div>
          ))}
        </div>

        {/* Empty State */}
        {posts.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center min-h-96 text-center animate-fade-in">
            <div className="bg-linear-to-br from-blue-50 to-purple-50 rounded-3xl p-12 shadow-lg border border-gray-200/50">
              <div className="text-7xl mb-6 animate-bounce-slow">📭</div>
              <p className="text-gray-700 text-xl font-semibold mb-2">
                Chưa có bài viết
              </p>
              <p className="text-gray-500">
                Hãy thử chọn danh mục khác hoặc quay lại sau
              </p>
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
  );
}
