import { useState, useRef, useEffect, useCallback } from "react"
import {
  collection, getDocs, addDoc, updateDoc,
  deleteDoc, doc, orderBy, query, serverTimestamp,
} from "firebase/firestore"
import { db } from "../firebase/firebase"
import MarkdownRenderer from "../components/MarkdownRenderer"

// ─── Firestore helpers ──────────────────────────────────────────────────────────
async function fetchAllPosts() {
  const q = query(collection(db, "posts"), orderBy("date", "desc"))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}
async function fetchAllCategories() {
  const snap = await getDocs(collection(db, "categories"))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}
async function createPost(data) {
  return await addDoc(collection(db, "posts"), {
    ...data, date: serverTimestamp(), createdAt: serverTimestamp(),
  })
}
async function updatePost(id, data) {
  return await updateDoc(doc(db, "posts", id), { ...data, updatedAt: serverTimestamp() })
}
async function deletePost(id) {
  return await deleteDoc(doc(db, "posts", id))
}

function formatDate(val) {
  if (!val) return "—"
  if (val?.toDate) return val.toDate().toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })
  return val
}

// ─── Inline SVG Icons ───────────────────────────────────────────────────────────
function IconFile()   { return <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"/></svg> }
function IconPlus()   { return <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/></svg> }
function IconEdit()   { return <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/></svg> }
function IconTrash()  { return <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zm-1 7a1 1 0 112 0v3a1 1 0 11-2 0V9zm4 0a1 1 0 112 0v3a1 1 0 11-2 0V9z" clipRule="evenodd"/></svg> }
function IconBack()   { return <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd"/></svg> }
function IconEye()    { return <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/></svg> }
function IconSave()   { return <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293z"/></svg> }
function IconSearch() { return <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/></svg> }
function IconSpinner(){ return <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg> }

// ─── Status Badge — all classes static ─────────────────────────────────────────
function StatusBadge({ status }) {
  if (status === "published") return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
      Đã xuất bản
    </span>
  )
  if (status === "archived") return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-600 ring-1 ring-slate-200">
      <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
      Lưu trữ
    </span>
  )
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-amber-50 text-amber-700 ring-1 ring-amber-200">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
      Bản nháp
    </span>
  )
}

// ─── Markdown Toolbar ───────────────────────────────────────────────────────────
const TB_GROUPS = [
  [
    { label: "B",   title: "In đậm",      cls: "font-bold",         wrap: ["**","**"] },
    { label: "I",   title: "In nghiêng",  cls: "italic",            wrap: ["*","*"] },
    { label: "U",   title: "Gạch chân",   cls: "underline",         wrap: ["__","__"] },
    { label: "~~",  title: "Gạch ngang",  cls: "line-through",      wrap: ["~~","~~"] },
  ],
  [
    { label: "H1",  title: "Heading 1",   cls: "",                  line: "# " },
    { label: "H2",  title: "Heading 2",   cls: "",                  line: "## " },
    { label: "H3",  title: "Heading 3",   cls: "",                  line: "### " },
  ],
  [
    { label: "•",   title: "Danh sách",   cls: "",                  line: "- " },
    { label: "1.",  title: "Số thứ tự",   cls: "",                  line: "1. " },
    { label: "❝",   title: "Trích dẫn",   cls: "",                  line: "> " },
  ],
  [
    { label: "</>", title: "Inline code", cls: "font-mono",         wrap: ["`","`"] },
    { label: "```", title: "Code block",  cls: "font-mono text-xs", wrap: ["\n```\n","\n```\n"] },
    { label: "🔗",  title: "Liên kết",    cls: "",                  wrap: ["[","](url)"] },
  ],
]

function MdToolbar({ taRef, onChange }) {
  const applyWrap = (before, after) => {
    const ta = taRef.current
    if (!ta) return
    const s = ta.selectionStart, e = ta.selectionEnd
    const sel = ta.value.slice(s, e)
    onChange(ta.value.slice(0, s) + before + sel + after + ta.value.slice(e))
    requestAnimationFrame(() => {
      ta.focus()
      ta.selectionStart = s + before.length
      ta.selectionEnd   = s + before.length + sel.length
    })
  }
  const applyLine = (prefix) => {
    const ta = taRef.current
    if (!ta) return
    const s  = ta.selectionStart
    const ls = ta.value.lastIndexOf("\n", s - 1) + 1
    onChange(ta.value.slice(0, ls) + prefix + ta.value.slice(ls))
    requestAnimationFrame(() => {
      ta.focus()
      ta.selectionStart = ta.selectionEnd = ls + prefix.length
    })
  }

  return (
    <div className="flex flex-wrap items-center gap-px px-2 py-1.5 bg-slate-50 border border-b-0 border-slate-200 rounded-t-lg">
      {TB_GROUPS.map((group, gi) => (
        <span key={gi} className="flex items-center gap-px">
          {gi > 0 && <span className="w-px h-4 bg-slate-200 mx-1.5 inline-block" />}
          {group.map((t) => (
            <button
              key={t.label}
              type="button"
              title={t.title}
              onClick={() => t.wrap ? applyWrap(...t.wrap) : applyLine(t.line)}
              className={`min-w-7 h-7 px-1.5 text-xs rounded hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors ${t.cls}`}
            >
              {t.label}
            </button>
          ))}
        </span>
      ))}
    </div>
  )
}

// ─── Confirm Dialog ─────────────────────────────────────────────────────────────
function ConfirmDialog({ title, message, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 border border-slate-200">
        <h3 className="text-base font-semibold text-slate-900 mb-1">{title}</h3>
        <p className="text-sm text-slate-500 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            Huỷ bỏ
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading && <IconSpinner />}
            Xoá bài viết
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Stat Cards ─────────────────────────────────────────────────────────────────
function StatCards({ posts }) {
  const published = posts.filter(p => p.status === "published").length
  const draft     = posts.filter(p => p.status === "draft").length
  const archived  = posts.filter(p => p.status === "archived").length

  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      <div className="bg-white rounded-xl border border-slate-200 px-5 py-4 shadow-sm">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Tổng bài viết</p>
        <p className="text-3xl font-bold text-slate-900">{posts.length}</p>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 px-5 py-4 shadow-sm">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Đã xuất bản</p>
        <p className="text-3xl font-bold text-emerald-600">{published}</p>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 px-5 py-4 shadow-sm">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Bản nháp</p>
        <p className="text-3xl font-bold text-amber-600">{draft}</p>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 px-5 py-4 shadow-sm">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Lưu trữ</p>
        <p className="text-3xl font-bold text-slate-400">{archived}</p>
      </div>
    </div>
  )
}

// ─── Post List ──────────────────────────────────────────────────────────────────
function PostList({ posts, categories, loading, onEdit, onDelete }) {
  const [search,    setSearch]    = useState("")
  const [fStatus,   setFStatus]   = useState("")
  const [fCat,      setFCat]      = useState("")
  const [delTarget, setDelTarget] = useState(null)
  const [deleting,  setDeleting]  = useState(false)

  const filtered = posts.filter(p =>
    (!search  || p.title?.toLowerCase().includes(search.toLowerCase()) || p.excerpt?.toLowerCase().includes(search.toLowerCase())) &&
    (!fStatus || p.status   === fStatus) &&
    (!fCat    || p.category === fCat)
  )

  const handleDelete = async () => {
    setDeleting(true)
    await onDelete(delTarget.id)
    setDeleting(false)
    setDelTarget(null)
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6">
      <StatCards posts={posts} />

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            <IconSearch />
          </span>
          <input
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-lg outline-none placeholder-slate-400"
            style={{ boxShadow: "none" }}
            placeholder="Tìm kiếm bài viết..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className="py-2.5 px-3 text-sm bg-white border border-slate-200 rounded-lg outline-none text-slate-700 cursor-pointer"
          value={fStatus}
          onChange={e => setFStatus(e.target.value)}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="published">Đã xuất bản</option>
          <option value="draft">Bản nháp</option>
          <option value="archived">Lưu trữ</option>
        </select>
        <select
          className="py-2.5 px-3 text-sm bg-white border border-slate-200 rounded-lg outline-none text-slate-700 cursor-pointer"
          value={fCat}
          onChange={e => setFCat(e.target.value)}
        >
          <option value="">Tất cả danh mục</option>
          {categories.map(c => (
            <option key={c.id} value={c.name || c.id}>{c.name || c.id}</option>
          ))}
        </select>
        <span className="ml-auto text-xs text-slate-400 font-medium">{filtered.length} bài viết</span>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-20 gap-2 text-slate-400">
            <IconSpinner />
            <span className="text-sm">Đang tải dữ liệu...</span>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-5 py-3">Bài viết</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-5 py-3">Danh mục</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-5 py-3">Trạng thái</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-5 py-3">Ngày tạo</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-sm text-slate-400">
                    Không tìm thấy bài viết nào
                  </td>
                </tr>
              ) : (
                filtered.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-5 py-4 max-w-xs">
                      <p className="text-sm font-semibold text-slate-900 truncate">{p.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5 truncate">{p.excerpt}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md font-medium">
                        {p.category || "—"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-400 whitespace-nowrap">
                      {formatDate(p.date)}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onEdit(p)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                        >
                          <IconEdit /> Sửa
                        </button>
                        <button
                          onClick={() => setDelTarget(p)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-500 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                        >
                          <IconTrash /> Xoá
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {delTarget && (
        <ConfirmDialog
          title="Xoá bài viết"
          message={`Bạn có chắc muốn xoá "${delTarget.title}"? Hành động này không thể hoàn tác.`}
          onConfirm={handleDelete}
          onCancel={() => setDelTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  )
}

// ─── Post Editor ────────────────────────────────────────────────────────────────
function PostEditor({ post, categories, onSave, onCancel }) {
  const [title,    setTitle]    = useState(post?.title    ?? "")
  const [excerpt,  setExcerpt]  = useState(post?.excerpt  ?? "")
  const [content,  setContent]  = useState(post?.content  ?? "")
  const [status,   setStatus]   = useState(post?.status   ?? "draft")
  const [category, setCategory] = useState(post?.category ?? (categories[0]?.name || ""))
  const [tags,     setTags]     = useState(Array.isArray(post?.tags) ? post.tags.join(", ") : (post?.tags ?? ""))
  const [tab,      setTab]      = useState("write")
  const [saving,   setSaving]   = useState(false)
  const [error,    setError]    = useState("")
  const taRef = useRef(null)

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0

  const handleSave = async () => {
    if (!title.trim()) { setError("Vui lòng nhập tiêu đề bài viết"); return }
    setError("")
    setSaving(true)
    await onSave({
      id: post?.id ?? null,
      title: title.trim(),
      excerpt: excerpt.trim() || title.trim(),
      content,
      status,
      category,
      tags,
    })
    setSaving(false)
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-6xl mx-auto px-6 py-6 flex gap-6 items-start">

        {/* Editor column */}
        <div className="flex-1 min-w-0 flex flex-col gap-5">

          {/* Title + excerpt */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <input
              className={`w-full text-2xl font-bold text-slate-900 placeholder-slate-300 outline-none pb-3 mb-3 border-b ${error ? "border-red-400" : "border-slate-100"}`}
              placeholder="Tiêu đề bài viết..."
              value={title}
              onChange={e => { setTitle(e.target.value); setError("") }}
            />
            {error && <p className="text-xs text-red-500 mb-2">{error}</p>}
            <input
              className="w-full text-sm text-slate-500 placeholder-slate-300 outline-none"
              placeholder="Mô tả ngắn / tóm tắt bài viết..."
              value={excerpt}
              onChange={e => setExcerpt(e.target.value)}
            />
          </div>

          {/* Markdown editor */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            {/* Tab bar */}
            <div className="flex items-center border-b border-slate-200 bg-white px-4">
              <div className="flex">
                <button
                  type="button"
                  onClick={() => setTab("write")}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px ${tab === "write" ? "border-indigo-500 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}
                >
                  Soạn thảo
                </button>
                <button
                  type="button"
                  onClick={() => setTab("preview")}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px ${tab === "preview" ? "border-indigo-500 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}
                >
                  Xem trước
                </button>
              </div>
              <div className="ml-auto flex items-center gap-3 text-xs text-slate-400 select-none">
                <span>{wordCount.toLocaleString()} từ</span>
                <span>·</span>
                <span>{content.length.toLocaleString()} ký tự</span>
              </div>
            </div>

            {tab === "write" ? (
              <>
                <MdToolbar taRef={taRef} onChange={setContent} />
                <textarea
                  ref={taRef}
                  className="w-full border-t border-slate-200 px-5 py-4 text-sm font-mono leading-relaxed text-slate-800 placeholder-slate-300 resize-none outline-none bg-white"
                  style={{ minHeight: 400 }}
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder={"# Tiêu đề bài viết\n\nBắt đầu viết nội dung Markdown tại đây...\n\n**In đậm**, *in nghiêng*, `inline code`\n\n> Trích dẫn\n\n- Danh sách\n- Mục 2"}
                />
              </>
            ) : (
              <div className="p-6" style={{ minHeight: 400 }}>
                {content
                  ? <MarkdownRenderer content={content} />
                  : <p className="text-sm text-slate-300 italic">Chưa có nội dung để xem trước...</p>
                }
              </div>
            )}
          </div>
        </div>

        {/* Meta sidebar */}
        <div className="w-64 shrink-0 flex flex-col gap-4" style={{ position: "sticky", top: "1.5rem" }}>

          {/* Publish */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
              <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Xuất bản</h3>
            </div>
            <div className="p-4 flex flex-col gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Trạng thái</label>
                <select
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white outline-none"
                  value={status}
                  onChange={e => setStatus(e.target.value)}
                >
                  <option value="draft">📝  Bản nháp</option>
                  <option value="published">✅  Xuất bản</option>
                  <option value="archived">📦  Lưu trữ</option>
                </select>
              </div>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:opacity-60"
              >
                {saving ? <IconSpinner /> : <IconSave />}
                {saving ? "Đang lưu..." : "Lưu bài viết"}
              </button>
              <button
                type="button"
                onClick={onCancel}
                disabled={saving}
                className="w-full py-2 text-sm text-slate-600 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                Huỷ bỏ
              </button>
            </div>
          </div>

          {/* Category */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
              <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Danh mục</h3>
            </div>
            <div className="p-4">
              <select
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white outline-none"
                value={category}
                onChange={e => setCategory(e.target.value)}
              >
                {categories.map(c => (
                  <option key={c.id} value={c.name || c.id}>{c.name || c.id}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Tags */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
              <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Tags</h3>
            </div>
            <div className="p-4">
              <input
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white outline-none placeholder-slate-300"
                placeholder="react, vite, firebase..."
                value={tags}
                onChange={e => setTags(e.target.value)}
              />
              <p className="text-xs text-slate-400 mt-1.5">Cách nhau bởi dấu phẩy</p>
            </div>
          </div>

          {/* Markdown guide */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
              <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Cú pháp Markdown</h3>
            </div>
            <div className="p-4 flex flex-col gap-2">
              {[
                ["# H1 / ## H2", "Tiêu đề"],
                ["**text**",     "In đậm"],
                ["*text*",       "In nghiêng"],
                ["`code`",       "Inline code"],
                ["```...```",    "Code block"],
                ["> text",       "Trích dẫn"],
                ["- item",       "Danh sách"],
                ["[txt](url)",   "Liên kết"],
              ].map(([s, d]) => (
                <div key={s} className="flex items-center justify-between gap-2">
                  <code className="text-xs font-mono bg-slate-50 text-rose-600 px-1.5 py-0.5 rounded border border-slate-200 shrink-0">
                    {s}
                  </code>
                  <span className="text-xs text-slate-400">{d}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

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

      {/* Sidebar */}
      <aside className="w-56 shrink-0 bg-white border-r border-slate-200 flex flex-col">
        {/* Brand */}
        <div className="px-5 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-sm font-bold shrink-0">
              B
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 leading-tight">BlogAdmin</p>
              <p className="text-xs text-slate-400">CMS Panel</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 flex flex-col gap-0.5">
          <p className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-widest">
            Nội dung
          </p>
          <button
            type="button"
            onClick={() => setView("list")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-colors text-left ${
              view === "list"
                ? "bg-indigo-50 text-indigo-700 font-semibold"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <IconFile />
            <span>Bài viết</span>
            {!loading && (
              <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-medium ${
                view === "list"
                  ? "bg-indigo-100 text-indigo-600"
                  : "bg-slate-100 text-slate-500"
              }`}>
                {posts.length}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={handleNew}
            className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-colors text-left ${
              isEditor
                ? "bg-indigo-50 text-indigo-700 font-semibold"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <IconPlus />
            <span>Tạo bài viết</span>
          </button>
        </nav>

        {/* User */}
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-2.5 px-1">
            <div className="w-7 h-7 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
              A
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-700 truncate">Admin</p>
              <p className="text-xs text-slate-400">Administrator</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0" style={{ height: 57 }}>
          <div className="flex items-center gap-3 min-w-0">
            {isEditor && (
              <button
                type="button"
                onClick={() => setView("list")}
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
              <button
                type="button"
                onClick={handleNew}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
              >
                <IconPlus /> Tạo bài viết
              </button>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
                <IconEye />
                <span>{view === "new" ? "Bài viết mới" : "Đang chỉnh sửa"}</span>
              </div>
            )}
          </div>
        </header>

        {/* Views */}
        {view === "list" && (
          <PostList
            posts={posts}
            categories={categories}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
        {isEditor && (
          <PostEditor
            key={editingPost?.id ?? "new"}
            post={editingPost}
            categories={categories}
            onSave={handleSave}
            onCancel={() => setView("list")}
          />
        )}
      </div>
    </div>
  )
}