const TB_GROUPS = [
  [
    { label: "B",   title: "In đậm",      cls: "font-bold",         wrap: ["**","**"] },
    { label: "I",   title: "In nghiêng",  cls: "italic",            wrap: ["*","*"] },
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

export default function MdToolbar({ taRef, onChange }) {
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
              key={t.label} type="button" title={t.title}
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