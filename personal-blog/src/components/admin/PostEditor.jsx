import { useState, useRef } from "react";
import MarkdownRenderer from "../MarkdownRenderer";
import MdToolbar from "./MdToolbar";
import AIPanel from "./AIPanel";
import ImageUploader from "./ImageUploader";
import { Box, File, FileCheck } from "lucide-react";
import { IconSave, IconSpinner, IconEye } from "../Icons";

const INPUT =
  "w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white outline-none placeholder-slate-300 focus:border-indigo-300";

function SideSection({ title, children }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
        <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
          {title}
        </h3>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

export default function PostEditor({ post, categories, onSave, onCancel }) {
  const [title, setTitle] = useState(post?.title ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [status, setStatus] = useState(post?.status ?? "draft");
  const [category, setCategory] = useState(
    post?.category ?? (categories[0]?.name || ""),
  );
  const [tags, setTags] = useState(
    Array.isArray(post?.tags) ? post.tags.join(", ") : (post?.tags ?? ""),
  );
  const [thumbnail, setThumbnail] = useState(post?.thumbnailUrl ?? null);
  const [tab, setTab] = useState("write");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const taRef = useRef(null);

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  const handleSave = async () => {
    if (!title.trim()) {
      setError("Vui lòng nhập tiêu đề bài viết");
      return;
    }
    setError("");
    setSaving(true);
    await onSave({
      id: post?.id ?? null,
      title: title.trim(),
      excerpt: excerpt.trim() || title.trim(),
      content,
      status,
      category,
      tags,
      thumbnailUrl: thumbnail ?? "",
    });
    setSaving(false);
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-6xl mx-auto px-6 py-6 flex gap-6 items-start">
        {/* Editor column */}
        <div className="flex-1 min-w-0 flex flex-col gap-5">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <input
              className={`w-full text-2xl font-bold text-slate-900 placeholder-slate-300 outline-none pb-3 mb-3 border-b ${error ? "border-red-400" : "border-slate-100"}`}
              placeholder="Tiêu đề bài viết..."
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setError("");
              }}
            />
            {error && <p className="text-xs text-red-500 mb-2">{error}</p>}
            <input
              className="w-full text-sm text-slate-500 placeholder-slate-300 outline-none"
              placeholder="Mô tả ngắn / tóm tắt bài viết..."
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
            />
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="flex items-center border-b border-slate-200 bg-white px-4">
              <div className="flex">
                {["write", "preview"].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTab(t)}
                    className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px
                      ${tab === t ? "border-indigo-500 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}
                  >
                    {t === "write" ? "Soạn thảo" : "Xem trước"}
                  </button>
                ))}
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
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={
                    "# Tiêu đề bài viết\n\nBắt đầu viết nội dung Markdown tại đây..."
                  }
                />
              </>
            ) : (
              <div className="p-6" style={{ minHeight: 400 }}>
                {content ? (
                  <MarkdownRenderer content={content} />
                ) : (
                  <p className="text-sm text-slate-300 italic">
                    Chưa có nội dung để xem trước...
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div
          className="w-64 shrink-0 flex flex-col gap-4"
          style={{ position: "sticky", top: "1.5rem" }}
        >
          {/* AI */}
          <AIPanel
            content={content}
            onContentChange={setContent}
            onTitleChange={setTitle}
          />

          {/* Thumbnail upload */}
          <ImageUploader value={thumbnail} onChange={setThumbnail} />

          {/* Publish */}
          <SideSection title="Xuất bản">
            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                  Trạng thái
                </label>
                {/* Thay select bằng custom dropdown */}
                <div className="flex flex-col gap-2">
                  {[
                    { value: "draft", label: "Bản nháp", Icon: File },
                    { value: "published", label: "Xuất bản", Icon: FileCheck },
                    { value: "archived", label: "Lưu trữ", Icon: Box },
                  ].map(({ value, label, Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setStatus(value)}
                      className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg border transition-colors text-left
        ${
          status === value
            ? "border-indigo-400 bg-indigo-50 text-indigo-700 font-medium"
            : "border-slate-200 text-slate-600 hover:bg-slate-50"
        }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <IconSpinner /> Đang lưu...
                  </>
                ) : (
                  <>
                    <IconSave /> Lưu bài viết
                  </>
                )}
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
          </SideSection>

          {/* Category */}
          <SideSection title="Danh mục">
            <select
              className={INPUT}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.name || c.id}>
                  {c.name || c.id}
                </option>
              ))}
            </select>
          </SideSection>

          {/* Tags */}
          <SideSection title="Tags">
            <input
              className={INPUT}
              placeholder="react, vite, firebase..."
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
            <p className="text-xs text-slate-400 mt-1.5">
              Cách nhau bởi dấu phẩy
            </p>
          </SideSection>

          {/* Markdown guide */}
          <SideSection title="Cú pháp Markdown">
            <div className="flex flex-col gap-2">
              {[
                ["# H1 / ## H2", "Tiêu đề"],
                ["**text**", "In đậm"],
                ["*text*", "In nghiêng"],
                ["`code`", "Inline code"],
                ["```...```", "Code block"],
                ["> text", "Trích dẫn"],
                ["- item", "Danh sách"],
                ["[txt](url)", "Liên kết"],
              ].map(([s, d]) => (
                <div
                  key={s}
                  className="flex items-center justify-between gap-2"
                >
                  <code className="text-xs font-mono bg-slate-50 text-rose-600 px-1.5 py-0.5 rounded border border-slate-200 shrink-0">
                    {s}
                  </code>
                  <span className="text-xs text-slate-400">{d}</span>
                </div>
              ))}
            </div>
          </SideSection>
        </div>
      </div>
    </div>
  );
}
