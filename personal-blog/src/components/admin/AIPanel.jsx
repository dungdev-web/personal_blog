import { useState } from "react"
import { generatePostAI, improvePostAI } from "../../lib/cohereApi"
import { IconAI, IconWand, IconSpinner } from "../Icons"

export default function AIPanel({ content, onContentChange, onTitleChange }) {
  const [aiMode,      setAiMode]      = useState("generate")
  const [topic,       setTopic]       = useState("")
  const [tone,        setTone]        = useState("friendly")
  const [type,        setType]        = useState("tutorial")
  const [instruction, setInstruction] = useState("")
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState("")
  const [success,     setSuccess]     = useState("")

  const handleGenerate = async () => {
    if (!topic.trim()) { setError("Nhập chủ đề trước nhé!"); return }
    setError(""); setSuccess(""); setLoading(true)
    try {
      const result = await generatePostAI({ topic, tone, type })
      const titleLine = result.split("\n").find(l => l.startsWith("# "))
      if (titleLine && onTitleChange) onTitleChange(titleLine.replace(/^#\s+/, "").trim())
      onContentChange(result)
      setSuccess("Tạo bài xong! Hãy kiểm tra và chỉnh sửa.")
    } catch (e) {
      setError("Lỗi: " + e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleImprove = async () => {
    if (!content.trim())     { setError("Chưa có nội dung để cải thiện!"); return }
    if (!instruction.trim()) { setError("Nhập yêu cầu cải thiện trước nhé!"); return }
    setError(""); setSuccess(""); setLoading(true)
    try {
      onContentChange(await improvePostAI(content, instruction))
      setSuccess("Đã cải thiện xong!")
    } catch (e) {
      setError("Lỗi: " + e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100 bg-gradient-to-r from-violet-50 to-indigo-50 flex items-center gap-2">
        <div className="w-5 h-5 rounded-md bg-indigo-600 flex items-center justify-center text-white">
          <IconAI />
        </div>
        <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Trợ lý AI</h3>
        <span className="ml-auto text-xs bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded font-medium">Cohere</span>
      </div>

      <div className="flex border-b border-slate-100">
        {["generate", "improve"].map((mode) => (
          <button key={mode} type="button"
            onClick={() => { setAiMode(mode); setError(""); setSuccess("") }}
            className={`flex-1 py-2 text-xs font-medium transition-colors border-l first:border-l-0 border-slate-100
              ${aiMode === mode ? "text-indigo-600 bg-indigo-50" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"}`}
          >
            {mode === "generate" ? "Tạo bài mới" : "Cải thiện bài"}
          </button>
        ))}
      </div>

      <div className="p-4 flex flex-col gap-3">
        {aiMode === "generate" ? (
          <>
            <Field label="Chủ đề">
              <input className={INPUT} placeholder="vd: Cách học React hiệu quả"
                value={topic} onChange={e => setTopic(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleGenerate()} />
            </Field>
            <Field label="Thể loại">
              <select className={INPUT} value={type} onChange={e => setType(e.target.value)}>
                <option value="tutorial">Hướng dẫn</option>
                <option value="listicle">Danh sách</option>
                <option value="opinion">Quan điểm</option>
                <option value="review">Đánh giá</option>
                <option value="news">Phân tích</option>
              </select>
            </Field>
            <Field label="Giọng văn">
              <select className={INPUT} value={tone} onChange={e => setTone(e.target.value)}>
                <option value="friendly">Thân thiện</option>
                <option value="professional">Chuyên nghiệp</option>
                <option value="casual">Thoải mái</option>
                <option value="formal">Trang trọng</option>
              </select>
            </Field>
            <button type="button" onClick={handleGenerate} disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:opacity-60">
              {loading ? <><IconSpinner /> Đang tạo...</> : <><IconWand /> Tạo bài viết</>}
            </button>
          </>
        ) : (
          <>
            <Field label="Yêu cầu cải thiện">
              <textarea className={`${INPUT} resize-none`} style={{ height: 80 }}
                placeholder="vd: Viết ngắn hơn, thêm ví dụ thực tế..."
                value={instruction} onChange={e => setInstruction(e.target.value)} />
            </Field>
            <p className="text-xs text-slate-400">
              {content ? `${content.split(/\s+/).length} từ hiện tại` : "Chưa có nội dung"}
            </p>
            <button type="button" onClick={handleImprove} disabled={loading || !content}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg bg-violet-600 text-white hover:bg-violet-700 transition-colors disabled:opacity-60">
              {loading ? <><IconSpinner /> Đang cải thiện...</> : <><IconWand /> Cải thiện bài</>}
            </button>
          </>
        )}
        {error   && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
        {success && <p className="text-xs text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg">{success}</p>}
      </div>
    </div>
  )
}

const INPUT = "w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white outline-none placeholder-slate-300 focus:border-indigo-300"
function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1.5">{label}</label>
      {children}
    </div>
  )
}