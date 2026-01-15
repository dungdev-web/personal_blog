import { Calendar } from "lucide-react"
import { useNavigate } from "react-router-dom"

export default function PostCard({ post }) {
  const nav = useNavigate()
const formatDate = (ts) => {
  if (!ts) return ""
  if (ts.seconds) {
    return new Date(ts.seconds * 1000).toLocaleDateString("vi-VN")
  }
  return ts
}

  return (
    <div
      onClick={() => nav(`/post/${post.id}`)}
      className="bg-white p-6 rounded-lg shadow hover:shadow-lg cursor-pointer"
    >
      <span className="text-sm bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full">
        {post.category}
      </span>

      <h2 className="text-xl font-bold mt-3">{post.title}</h2>
      <p className="text-gray-600 mt-2">{post.excerpt}</p>

      <div className="flex items-center gap-2 text-sm text-gray-500 mt-3">
        <Calendar size={16} /> {formatDate(post.date)}
      </div>
    </div>
  )
}
