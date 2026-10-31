const CB = "ꗝCBꗝ"
const IC = "ꗝICꗝ"
const LK = "ꗝLKꗝ"

const isSafeUrl = (u) => /^(https?:\/\/|mailto:|\/|#)/i.test(u)
const escAttr = (s) => s.replace(/"/g, "%22")
const escHtml = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

// Dòng bắt đầu bằng thẻ khối thì không bọc <p>
const BLOCK_START = /^<\/?(h[1-6]|ul|ol|li|blockquote|pre|div|table|hr)[\s>/]/i
const CODE_ONLY = new RegExp(`^${CB}\\d+${CB}$`)

const P_CLASS = "my-5 text-[1.0625rem] leading-8 text-slate-700"

function parseMarkdown(markdown) {
  if (!markdown) return ""

  let html = markdown
  html = html.replace(/`\\`\\`/g, "```")
  html = html.replace(/\\`/g, "`")
  html = html.replace(/\\\$/g, "$")

  // 1. Code blocks
  const codeBlocks = []
  html = html.replace(/```(\w*)\n?([\s\S]+?)```/g, (_m, lang, code) => {
    const idx = codeBlocks.length
    const label = lang ? `<span class="mb-3 block text-xs font-medium text-slate-400">${lang}</span>` : ""
    codeBlocks.push(
      `<pre class="my-6 overflow-x-auto rounded-2xl bg-slate-900 p-5 font-mono text-sm leading-7 text-slate-100">${label}<code>${escHtml(code.trim())}</code></pre>`,
    )
    return `\n${CB}${idx}${CB}\n`
  })

  // 2. Inline code
  const inlineCodes = []
  html = html.replace(/`([^`\n]+)`/g, (_m, code) => {
    const idx = inlineCodes.length
    inlineCodes.push(
      `<code class="rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-[0.9em] text-indigo-700">${escHtml(code)}</code>`,
    )
    return `${IC}${idx}${IC}`
  })

  // 3. Ảnh và link: tách ra trước khi xử lý in đậm/nghiêng,
  //    nếu không dấu _ trong URL sẽ bị biến thành thẻ <em> làm hỏng link
  const links = []
  html = html.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (_m, alt, url) => {
    if (!isSafeUrl(url)) return ""
    const idx = links.length
    links.push(
      `<img src="${escAttr(url)}" alt="${escAttr(alt)}" loading="lazy" referrerpolicy="no-referrer" class="my-6 block w-full rounded-2xl" />`,
    )
    return `${LK}${idx}${LK}`
  })
  html = html.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_m, text, url) => {
    if (!isSafeUrl(url)) return text
    const idx = links.length
    links.push(
      `<a href="${escAttr(url)}" class="break-words font-medium text-indigo-600 underline decoration-indigo-300 underline-offset-4 transition-colors hover:decoration-indigo-600" target="_blank" rel="noopener noreferrer">${text}</a>`,
    )
    return `${LK}${idx}${LK}`
  })

  // 4. Headers
  html = html.replace(/^#### (.+)$/gm, '<h4 class="mb-2 mt-6 text-lg font-semibold text-slate-900">$1</h4>')
  html = html.replace(/^### (.+)$/gm, '<h3 class="mb-3 mt-8 text-xl font-bold text-slate-900">$1</h3>')
  html = html.replace(/^## (.+)$/gm, '<h2 class="mb-4 mt-12 text-2xl font-bold tracking-tight text-slate-900">$1</h2>')
  html = html.replace(/^# (.+)$/gm, '<h1 class="mb-4 mt-12 text-3xl font-extrabold tracking-tight text-slate-900">$1</h1>')

  // 5. Blockquote
  html = html.replace(
    /^> (.+)$/gm,
    '<blockquote class="my-6 rounded-r-xl border-l-4 border-indigo-400 bg-indigo-50/60 py-3 pl-5 pr-4 text-slate-700">$1</blockquote>',
  )

  // 6. Emphasis
  html = html.replace(/\*\*\*([^*\n]+)\*\*\*/g, "<strong><em>$1</em></strong>")
  html = html.replace(/\*\*([^*\n]+)\*\*/g, '<strong class="font-semibold text-slate-900">$1</strong>')
  html = html.replace(/(^|[^*])\*([^*\n]+)\*([^*]|$)/g, '$1<em class="italic">$2</em>$3')
  html = html.replace(/(^|[^_])_([^_\n]+)_([^_]|$)/g, '$1<em class="italic">$2</em>$3')
  html = html.replace(/__([^_\n]+)__/g, '<u class="underline">$1</u>')
  html = html.replace(/~~([^~\n]+)~~/g, '<del class="line-through">$1</del>')

  // 7. Lists
  const lines = html.split("\n")
  const processed = []
  let inUL = false
  let inOL = false
  for (const line of lines) {
    const trimmed = line.trim()
    if (/^[-*] (.+)/.test(trimmed)) {
      if (inOL) { processed.push("</ol>"); inOL = false }
      if (!inUL) { processed.push('<ul class="my-5 space-y-2">'); inUL = true }
      processed.push(`<li class="ml-6 list-disc leading-8 text-slate-700 marker:text-indigo-400">${trimmed.replace(/^[-*] /, "")}</li>`)
    } else if (/^\d+\. (.+)/.test(trimmed)) {
      if (inUL) { processed.push("</ul>"); inUL = false }
      if (!inOL) { processed.push('<ol class="my-5 list-decimal space-y-2">'); inOL = true }
      processed.push(`<li class="ml-6 leading-8 text-slate-700 marker:font-semibold marker:text-indigo-500">${trimmed.replace(/^\d+\. /, "")}</li>`)
    } else {
      if (inUL) { processed.push("</ul>"); inUL = false }
      if (inOL) { processed.push("</ol>"); inOL = false }
      processed.push(line)
    }
  }
  if (inUL) processed.push("</ul>")
  if (inOL) processed.push("</ol>")

  // 8. Đoạn văn: gom các dòng thường liên tiếp vào một <p>
  const out = []
  let para = []
  const flush = () => {
    if (para.length) {
      out.push(`<p class="${P_CLASS}">${para.join("<br/>")}</p>`)
      para = []
    }
  }
  for (const raw of processed) {
    const line = raw.trim()
    if (!line) { flush(); continue }
    if (BLOCK_START.test(line) || CODE_ONLY.test(line)) { flush(); out.push(line); continue }
    para.push(line)
  }
  flush()
  html = out.join("\n")

  // 9. Khôi phục placeholder
  codeBlocks.forEach((c, i) => { html = html.split(`${CB}${i}${CB}`).join(c) })
  inlineCodes.forEach((c, i) => { html = html.split(`${IC}${i}${IC}`).join(c) })
  links.forEach((c, i) => { html = html.split(`${LK}${i}${LK}`).join(c) })

  return html
}

export default function MarkdownRenderer({ content }) {
  return (
    <div
      className="max-w-none break-words [&>*:first-child]:mt-0"
      dangerouslySetInnerHTML={{ __html: parseMarkdown(content || "") }}
    />
  )
}
