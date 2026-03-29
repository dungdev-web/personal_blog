import { fetchAllPosts, fetchAllCategories, createPost, updatePost, deletePost } from "../../lib/firestoreAdmin"
import PostList from "../../components/admin/PostList"
import PostEditor from "../../components/admin/PostEditor"
import { IconFile, IconPlus, IconBack, IconEye } from "../../components/Icons"
import { useCallback,useEffect,useState } from "react"


// ─── Root AdminPage ─────────────────────────────────────────────────────────────
export default function AdminPage() {
  const [posts,       setPosts]       = useState([])
  const [categories,  setCategories]  = useState([])
  const [loading,     setLoading]     = useState(true)
  const [view,        setView]        = useState("list")
  const [editingPost, setEditingPost] = useState(null)

  const loadPosts = useCallback(async () => {
    setLoading(true)
    const data = await fetchAllPosts()
    setPosts(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    loadPosts()
    fetchAllCategories().then(setCategories)
  }, [loadPosts])

  const handleEdit   = (post) => { setEditingPost(post); setView("edit") }
  const handleNew    = ()     => { setEditingPost(null);  setView("new") }
  const handleDelete = async (id) => {
    await deletePost(id)
    setPosts(prev => prev.filter(p => p.id !== id))
  }
  const handleSave = async ({ id, ...fields }) => {
    if (id) await updatePost(id, fields)
    else    await createPost(fields)
    await loadPosts()
    setView("list")
  }

  const isEditor = view === "new" || view === "edit"

  return (
    <div className="flex bg-slate-100 overflow-hidden" style={{ height: "100vh" }}>
      <aside className="w-56 shrink-0 bg-white border-r border-slate-200 flex flex-col">
        <div className="px-5 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-sm font-bold shrink-0">B</div>
            <div>
              <p className="text-sm font-bold text-slate-900 leading-tight">BlogAdmin</p>
              <p className="text-xs text-slate-400">CMS Panel</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 flex flex-col gap-0.5">
          <p className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-widest">Nội dung</p>
          <button type="button" onClick={() => setView("list")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-colors text-left ${view === "list" ? "bg-indigo-50 text-indigo-700 font-semibold" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}
          >
            <IconFile /><span>Bài viết</span>
            {!loading && (
              <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-medium ${view === "list" ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 text-slate-500"}`}>
                {posts.length}
              </span>
            )}
          </button>
          <button type="button" onClick={handleNew}
            className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-colors text-left ${isEditor ? "bg-indigo-50 text-indigo-700 font-semibold" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}
          >
            <IconPlus /><span>Tạo bài viết</span>
          </button>
        </nav>
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-2.5 px-1">
            <div className="w-7 h-7 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold shrink-0">A</div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-700 truncate">Admin</p>
              <p className="text-xs text-slate-400">Administrator</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0" style={{ height: 57 }}>
          <div className="flex items-center gap-3 min-w-0">
            {isEditor && (
              <button type="button" onClick={() => setView("list")}
                className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors shrink-0"
              >
                <IconBack />
              </button>
            )}
            <div className="min-w-0">
              <h1 className="text-sm font-bold text-slate-900">
                {view === "list" ? "Bài viết" : view === "new" ? "Tạo bài viết mới" : "Chỉnh sửa bài viết"}
              </h1>
              {view === "edit" && editingPost && (
                <p className="text-xs text-slate-400 truncate max-w-xs">{editingPost.title}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {view === "list" ? (
              <button type="button" onClick={handleNew}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
              >
                <IconPlus /> Tạo bài viết
              </button>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
                <IconEye /><span>{view === "new" ? "Bài viết mới" : "Đang chỉnh sửa"}</span>
              </div>
            )}
          </div>
        </header>

        {view === "list" && <PostList posts={posts} categories={categories} loading={loading} onEdit={handleEdit} onDelete={handleDelete} />}
        {isEditor && <PostEditor key={editingPost?.id ?? "new"} post={editingPost} categories={categories} onSave={handleSave} onCancel={() => setView("list")} />}
      </div>
    </div>
  )
}