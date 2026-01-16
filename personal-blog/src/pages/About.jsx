export default function About() {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50/30 to-purple-50/30">
      {/* Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-96 h-96 bg-blue-200/15 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-purple-200/15 rounded-full blur-3xl"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-20">
        {/* Header */}
        <div className="mb-12 animate-fade-in">
          <div className="inline-block mb-4">
            <span className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium ">
              About Us
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-black">
            Dev Blog
          </h1>
          <div className="w-20 h-1 bg-black rounded-full mb-8"></div>
        </div>

        {/* Main Card */}
        <div className="backdrop-blur-md bg-white/80 border border-blue-200 rounded-2xl p-8 md:p-12 shadow-lg hover:shadow-xl transition-shadow duration-300 mb-12">
          <p className="text-xl text-gray-700 leading-relaxed mb-8">
            Dev Blog là nơi <span className="text-black font-semibold">chia sẻ kiến thức lập trình</span> từ cơ bản đến nâng cao, giúp bạn phát triển kỹ năng và mở rộng tầm nhìn trong thế giới công nghệ.
          </p>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 bg-yellow-50 rounded-xl border border-yellow-200 hover:border-yellow-400 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🎨</span>
              </div>
              <h3 className="font-semibold text-orange-700 mb-2">Kiến Thức Đa Dạng</h3>
              <p className="text-sm text-gray-700">Từ frontend, backend, đến devops và cloud computing</p>
            </div>

            <div className="p-6 bg-orange-50 rounded-xl border border-orange-200 hover:border-orange-400 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">💡</span>
              </div>
              <h3 className="font-semibold text-orange-700 mb-2">Thực Tiễn & Ứng Dụng</h3>
              <p className="text-sm text-gray-700">Các bài viết dựa trên các bài báo và youtube</p>
            </div>

            <div className="p-6 bg-pink-50 rounded-xl border border-pink-200 hover:border-pink-400 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🚀</span>
              </div>
              <h3 className="font-semibold text-orange-700 mb-2">Cập Nhật Liên Tục</h3>
              <p className="text-sm text-gray-700">Theo dõi xu hướng công nghệ mới nhất</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <p className="text-gray-700 mb-6 text-lg">Bắt đầu hành trình học tập của bạn ngay hôm nay</p>
          <div className="flex gap-4 justify-center">
            <a href="/">
            <button className="px-8 py-3 bg-linear-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 transform hover:scale-105">
              Đọc Bài Viết
            </button>
            </a>
            <button className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg border-2 border-blue-300 hover:border-gradient-to-r hover:border-purple-600 hover:bg-blue-50 transition-all duration-300">
              Liên Hệ
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
      `}</style>
    </div>
  )
}