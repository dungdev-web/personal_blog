import { formatDate } from "../../lib/firestoreAdmin"
import StatCards from "./StatCards"
import StatusBadge from "../StatusBadge"
import ConfirmDialog from "../ConfirmDialog"
import { useState } from "react"
import { IconSearch, IconSpinner, IconEdit, IconTrash } from "../Icons"
export default function PostList({ posts, categories, loading, onEdit, onDelete }) {
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
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"><IconSearch /></span>
          <input
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-lg outline-none placeholder-slate-400"
            style={{ boxShadow: "none" }}
            placeholder="Tìm kiếm bài viết..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="py-2.5 px-3 text-sm bg-white border border-slate-200 rounded-lg outline-none text-slate-700 cursor-pointer" value={fStatus} onChange={e => setFStatus(e.target.value)}>
          <option value="">Tất cả trạng thái</option>
          <option value="published">Đã xuất bản</option>
          <option value="draft">Bản nháp</option>
          <option value="archived">Lưu trữ</option>
        </select>
        <select className="py-2.5 px-3 text-sm bg-white border border-slate-200 rounded-lg outline-none text-slate-700 cursor-pointer" value={fCat} onChange={e => setFCat(e.target.value)}>
          <option value="">Tất cả danh mục</option>
          {categories.map(c => <option key={c.id} value={c.name || c.id}>{c.name || c.id}</option>)}
        </select>
        <span className="ml-auto text-xs text-slate-400 font-medium">{filtered.length} bài viết</span>
      </div>
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-20 gap-2 text-slate-400">
            <IconSpinner /><span className="text-sm">Đang tải dữ liệu...</span>
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
                <tr><td colSpan={5} className="py-16 text-center text-sm text-slate-400">Không tìm thấy bài viết nào</td></tr>
              ) : filtered.map(p => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-5 py-4 max-w-xs">
                    <p className="text-sm font-semibold text-slate-900 truncate">{p.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5 truncate">{p.excerpt}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-xs text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md font-medium">{p.category || "—"}</span>
                  </td>
                  <td className="px-5 py-4"><StatusBadge status={p.status} /></td>
                  <td className="px-5 py-4 text-xs text-slate-400 whitespace-nowrap">{formatDate(p.date)}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => onEdit(p)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors">
                        <IconEdit /> Sửa
                      </button>
                      <button onClick={() => setDelTarget(p)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-500 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                        <IconTrash /> Xoá
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
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