export default function StatCards({ posts }) {
  const published = posts.filter(p => p.status === "published").length
  const draft     = posts.filter(p => p.status === "draft").length
  const archived  = posts.filter(p => p.status === "archived").length

  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      {[
        { label: "Tổng bài viết", value: posts.length, cls: "text-slate-900" },
        { label: "Đã xuất bản",   value: published,    cls: "text-emerald-600" },
        { label: "Bản nháp",      value: draft,        cls: "text-amber-600" },
        { label: "Lưu trữ",       value: archived,     cls: "text-slate-400" },
      ].map(({ label, value, cls }) => (
        <div key={label} className="bg-white rounded-xl border border-slate-200 px-5 py-4 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">{label}</p>
          <p className={`text-3xl font-bold ${cls}`}>{value}</p>
        </div>
      ))}
    </div>
  )
}