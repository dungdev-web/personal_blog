function parseMarkdown(markdown) {
  if (!markdown) return "";

  let html = markdown;

  html = html.replace(/`\\`\\`/g, "```");
  html = html.replace(/\\`/g, "`");
  html = html.replace(/\\\$/g, "$");

  // Prefix tĩnh, đủ lạ để AI không sinh ra
  const CB  = "ꗝCBꗝ";
  const IC  = "ꗝICꗝ";

  // 1. Code blocks
  const codeBlocks = [];
  html = html.replace(/```(\w*)\n?([\s\S]+?)```/g, (match, lang, code) => {
    const idx = codeBlocks.length;
    const escaped = code.trim()
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    const langLabel = lang
      ? `<span class="text-xs text-gray-400 mb-2 block">${lang}</span>`
      : "";
    codeBlocks.push(
      `<pre class="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-4 font-mono text-sm">${langLabel}<code>${escaped}</code></pre>`
    );
    return `\n${CB}${idx}${CB}\n`;
  });

  // 2. Inline code
  const inlineCodes = [];
  html = html.replace(/`([^`\n]+)`/g, (match, code) => {
    const idx = inlineCodes.length;
    const escaped = code
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    inlineCodes.push(
      `<code class="bg-gray-100 px-2 py-0.5 rounded text-sm text-red-600 font-mono">${escaped}</code>`
    );
    return `${IC}${idx}${IC}`;
  });

  // 3. Headers
  html = html.replace(/^#### (.+)$/gm, '<h4 class="text-base font-semibold mt-4 mb-2">$1</h4>');
  html = html.replace(/^### (.+)$/gm,  '<h3 class="text-lg font-semibold mt-6 mb-3">$1</h3>');
  html = html.replace(/^## (.+)$/gm,   '<h2 class="text-xl font-semibold mt-8 mb-4">$1</h2>');
  html = html.replace(/^# (.+)$/gm,    '<h1 class="text-3xl font-bold mt-8 mb-4">$1</h1>');

  // 4. Blockquote
  html = html.replace(/^> (.+)$/gm,
    '<blockquote class="border-l-4 border-gray-300 pl-4 italic text-gray-600 my-4">$1</blockquote>'
  );

  // 5. Bold + Italic + Underline + Strikethrough
  html = html.replace(/\*\*\*([^\*\n]+)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*([^\*\n]+)\*\*/g,     '<strong class="font-semibold">$1</strong>');
  html = html.replace(/(^|[^*])\*([^*\n]+)\*([^*]|$)/g, '$1<em class="italic">$2</em>$3');
  html = html.replace(/(^|[^_])_([^_\n]+)_([^_]|$)/g,   '$1<em class="italic">$2</em>$3');
  html = html.replace(/__([^_\n]+)__/g, '<u class="underline">$1</u>');
  html = html.replace(/~~([^~\n]+)~~/g, '<del class="line-through">$1</del>');

  // 6. Links
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" class="text-blue-600 underline hover:text-blue-800" target="_blank" rel="noopener">$1</a>'
  );

  // 7. Lists
  const lines = html.split("\n");
  const processed = [];
  let inUL = false;
  let inOL = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (/^[-*] (.+)/.test(trimmed)) {
      if (inOL) { processed.push("</ol>"); inOL = false; }
      if (!inUL) { processed.push('<ul class="my-4 space-y-2">'); inUL = true; }
      processed.push(`<li class="ml-6 list-disc">${trimmed.replace(/^[-*] /, "")}</li>`);
    } else if (/^\d+\. (.+)/.test(trimmed)) {
      if (inUL) { processed.push("</ul>"); inUL = false; }
      if (!inOL) { processed.push('<ol class="my-4 space-y-2 list-decimal">'); inOL = true; }
      processed.push(`<li class="ml-6">${trimmed.replace(/^\d+\. /, "")}</li>`);
    } else {
      if (inUL) { processed.push("</ul>"); inUL = false; }
      if (inOL) { processed.push("</ol>"); inOL = false; }
      processed.push(line);
    }
  }
  if (inUL) processed.push("</ul>");
  if (inOL) processed.push("</ol>");
  html = processed.join("\n");

  // 8. Paragraphs — check bằng ký tự đặc biệt của prefix
  html = html
    .split("\n\n")
    .map((block) => {
      block = block.trim();
      if (!block) return "";
      // Bỏ qua nếu đã là HTML tag hoặc chứa placeholder
      if (block.startsWith("<") || block.includes("ꗝ")) return block;
      return `<p class="mb-4 leading-relaxed text-gray-700">${block.replace(/\n/g, "<br/>")}</p>`;
    })
    .join("\n\n");

  // 9. Restore — dùng split/join tránh lỗi regex
  codeBlocks.forEach((code, i) => {
    html = html.split(`${CB}${i}${CB}`).join(code);
  });
  inlineCodes.forEach((code, i) => {
    html = html.split(`${IC}${i}${IC}`).join(code);
  });

  return html;
}

export default function MarkdownRenderer({ content }) {
  const html = parseMarkdown(content || "");

  return (
    <div
      className="prose prose-slate max-w-none"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
