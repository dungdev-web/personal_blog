import { BookOpen, Home, User } from "lucide-react"
import { Link } from "react-router-dom"

export default function Header() {
  return (
    <header className="bg-white shadow sticky  z-50 top-0">
      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between">
        <Link to="/" className="flex items-center gap-2">
          <BookOpen className="text-indigo-600" />
          <span className="font-bold text-xl">Dev Blog</span>
        </Link>
        <nav className="flex gap-4">
          <Link to="/" className="flex gap-1 items-center"><Home size={18}/> Home</Link>
          <Link to="/about" className="flex gap-1 items-center"><User size={18}/> About</Link>
        </nav>
      </div>
    </header>
  )
}
