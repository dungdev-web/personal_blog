import { useEffect, useState } from "react"
import { BookOpen } from "lucide-react"
import { Link, NavLink } from "react-router-dom"

const navClass = ({ isActive }) =>
  `rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
    isActive ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
  }`

export default function Header() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-colors duration-300 ${
        scrolled ? "border-slate-200/70 bg-white/80 backdrop-blur-xl" : "border-transparent bg-white/0"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-sm shadow-indigo-500/30">
            <BookOpen size={18} />
          </span>
          <span className="text-lg font-extrabold tracking-tight text-slate-900">Dev Blog</span>
        </Link>
        <nav className="flex items-center gap-1">
          <NavLink to="/" end className={navClass}>Trang chủ</NavLink>
          <NavLink to="/about" className={navClass}>Giới thiệu</NavLink>
        </nav>
      </div>
    </header>
  )
}
