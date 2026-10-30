import { useState, useRef, useCallback } from "react"
import { uploadToCloudinary } from "../../lib/cloudinaryUpload"
import { IconImage, IconX, IconSpinner } from "../../components/Icons"

export default function ImageUploader({ value, onChange }) {
  const [progress,  setProgress]  = useState(0)
  const [uploading, setUploading] = useState(false)
  const [error,     setError]     = useState("")
  const [dragging,  setDragging]  = useState(false)
  const inputRef = useRef(null)

  const handleFile = useCallback(async (file) => {
    if (!file) return
    if (!file.type.startsWith("image/")) { setError("Chỉ hỗ trợ file ảnh"); return }
    if (file.size > 5 * 1024 * 1024)     { setError("Ảnh tối đa 5MB"); return }

    setError("")
    setUploading(true)
    setProgress(0)

    try {
      const url = await uploadToCloudinary(file, setProgress)
      onChange(url)
    } catch (e) {
      setError(e.message)
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }, [onChange])

  const onDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files[0])
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
        <IconImage />
        <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Ảnh thumbnail</h3>
      </div>

      <div className="p-4 flex flex-col gap-3">
        {value ? (
          <div className="relative rounded-lg overflow-hidden border border-slate-200">
            <img src={value} alt="thumbnail" className="w-full h-40 object-cover" />
            <button type="button" onClick={() => onChange(null)}
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors">
              <IconX />
            </button>
          </div>
        ) : (
          <div
            onClick={() => !uploading && inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={`flex flex-col items-center justify-center gap-2 h-36 rounded-lg border-2 border-dashed transition-colors
              ${uploading ? "cursor-not-allowed border-slate-200 bg-slate-50"
              : dragging  ? "cursor-copy border-indigo-400 bg-indigo-50"
              :             "cursor-pointer border-slate-200 hover:border-indigo-300 hover:bg-slate-50"}`}
          >
            {uploading ? (
              <div className="flex flex-col items-center gap-3 w-full px-6">
                <IconSpinner />
                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full transition-all duration-200"
                    style={{ width: `${progress}%` }} />
                </div>
                <p className="text-xs text-slate-400">{progress}%</p>
              </div>
            ) : (
              <>
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                  <IconImage />
                </div>
                <p className="text-xs font-medium text-slate-500">Kéo thả hoặc click để chọn ảnh</p>
                <p className="text-xs text-slate-400">PNG, JPG, WebP — tối đa 5MB</p>
              </>
            )}
          </div>
        )}

        {/* Nhập URL thủ công */}
        {!value && !uploading && (
          <div>
            <p className="text-xs text-slate-400 mb-1.5">hoặc nhập URL ảnh</p>
            <input
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white outline-none placeholder-slate-300 focus:border-indigo-300"
              placeholder="https://example.com/image.jpg"
              onBlur={(e) => { const v = e.target.value.trim(); if (v) { onChange(v); e.target.value = "" } }}
            />
          </div>
        )}

        {error && <p className="text-xs text-red-500 bg-red-50 px-3 py-1.5 rounded-lg">{error}</p>}

        <input ref={inputRef} type="file" accept="image/*" className="hidden"
          onChange={(e) => handleFile(e.target.files[0])} />
      </div>
    </div>
  )
}