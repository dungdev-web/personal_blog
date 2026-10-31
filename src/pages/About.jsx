import { Link } from "react-router-dom"
import { Lightbulb, Layers, RefreshCw } from "lucide-react"
import Reveal from "../components/Reveal"

const FEATURES = [
  { icon: Layers, title: "Kiến thức đa dạng", text: "Từ frontend, backend đến devops và cloud computing." },
  { icon: Lightbulb, title: "Thực tiễn và ứng dụng", text: "Các bài viết dựa trên các bài báo và YouTube." },
  { icon: RefreshCw, title: "Cập nhật liên tục", text: "Theo dõi xu hướng công nghệ mới nhất." },
]

export default function About() {
  return (
    <div className="mx-auto max-w-4xl px-5 pb-24 pt-14 sm:px-8 sm:pt-20">
      <span className="animate-rise inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
        Giới thiệu
      </span>
      <h1
        className="animate-rise mt-5 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl"
        style={{ animationDelay: "80ms" }}
      >
        Dev Blog
      </h1>
      <p
        className="animate-rise mt-6 max-w-2xl text-xl leading-9 text-slate-600"
        style={{ animationDelay: "160ms" }}
      >
        Dev Blog là nơi chia sẻ kiến thức lập trình từ cơ bản đến nâng cao, giúp bạn phát triển kỹ năng và mở rộng tầm nhìn trong thế giới công nghệ.
      </p>

      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {FEATURES.map(({ icon: Icon, title, text }, i) => (
          <Reveal key={title} delay={i * 90} className="rounded-3xl border border-slate-200 p-7 transition-colors hover:border-indigo-300">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <Icon size={22} />
            </span>
            <h3 className="mt-5 text-lg font-bold text-slate-900">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">{text}</p>
          </Reveal>
        ))}
      </div>

      <Reveal className="mt-10 rounded-3xl bg-slate-50 p-7 sm:p-9">
        <h2 className="text-lg font-bold text-slate-900">Về các bài tổng hợp tự động</h2>
        <p className="mt-2 leading-7 text-slate-600">
          Mỗi ngày, một bot thu thập tin từ Hacker News, các bản phát hành của React, Next.js, Node.js và danh sách việc làm remote. Phần tóm tắt tiếng Việt do AI viết lại từ đúng đoạn mô tả của nguồn, kèm link bài gốc để bạn đối chiếu.
        </p>
      </Reveal>

      <Reveal className="mt-16 text-center">
        <p className="text-lg text-slate-600">Bắt đầu hành trình học tập của bạn ngay hôm nay</p>
        <Link
          to="/"
          className="mt-6 inline-flex rounded-full bg-indigo-600 px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          Đọc bài viết
        </Link>
      </Reveal>
    </div>
  )
}
