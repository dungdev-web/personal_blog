import { Link } from "react-router-dom"

export default function Footer() {
  return (
    <footer className="border-t border-slate-200/70">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-10 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div>
          <p className="font-bold text-slate-900">Dev Blog</p>
          <p className="mt-1">Một phần bài viết được tổng hợp tự động từ các nguồn công khai.</p>
        </div>
        <div className="flex items-center gap-6">
          <Link to="/" className="hover:text-slate-900">Trang chủ</Link>
          <Link to="/about" className="hover:text-slate-900">Giới thiệu</Link>
          <span>© {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  )
}
