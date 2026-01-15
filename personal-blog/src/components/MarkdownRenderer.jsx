function parseMarkdown(markdown) {
  if (!markdown) return "";

  let html = markdown;

  // QUAN TRỌNG: Unescape backticks trước
  html = html.replace(/`\\`\\`/g, "```");
  html = html.replace(/\\`/g, "`");
  html = html.replace(/\\\$/g, "$");

  // 1. Code blocks
  const codeBlocks = [];
  html = html.replace(/```(\w*)\n([\s\S]+?)\n```/g, (match, lang, code) => {
    const placeholder = `@@CODEBLOCK_${codeBlocks.length}@@`;
    const escaped = code
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    codeBlocks.push(
      `<pre class="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-4 font-mono text-sm"><code>${escaped}</code></pre>`
    );
    return `\n${placeholder}\n`;
  });

  // 2. Inline code
  const inlineCodes = [];
  html = html.replace(/`([^`\n]+)`/g, (match, code) => {
    const placeholder = `@@INLINECODE_${inlineCodes.length}@@`;

    const escaped = code
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    inlineCodes.push(
      `<code class="bg-gray-100 px-2 py-0.5 rounded text-sm text-red-600 font-mono">${escaped}</code>`
    );
    return placeholder;
  });

  // 3. Headers
  html = html.replace(
    /^### (.+)$/gm,
    '<h3 class="text-lg font-semibold mt-6 mb-3">$1</h3>'
  );
  html = html.replace(
    /^## (.+)$/gm,
    '<h2 class="text-xl font-semibold mt-8 mb-4">$1</h2>'
  );
  html = html.replace(
    /^# (.+)$/gm,
    '<h1 class="text-3xl font-bold mt-8 mb-4">$1</h1>'
  );

  // 4. Bold
  html = html.replace(
    /\*\*([^\*\n]+)\*\*/g,
    '<strong class="font-semibold">$1</strong>'
  );
  // 4.5 Italic
  html = html.replace(
    /(^|[^*])\*([^*\n]+)\*([^*]|$)/g,
    '$1<em class="italic">$2</em>$3'
  );

  html = html.replace(
    /(^|[^_])_([^_\n]+)_([^_]|$)/g,
    '$1<em class="italic">$2</em>$3'
  );
  // 4.6 Underline
  html = html.replace(/__([^_\n]+)__/g, '<u class="underline">$1</u>');

  // 5. Lists
  const lines = html.split("\n");
  const processed = [];
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (/^[-*] (.+)/.test(trimmed)) {
      if (!inList) {
        processed.push('<ul class="my-4 space-y-2">');
        inList = true;
      }
      const content = trimmed.replace(/^[-*] /, "");
      processed.push(`<li class="ml-6 list-disc">${content}</li>`);
    } else {
      if (inList && trimmed !== "") {
        processed.push("</ul>");
        inList = false;
      }
      processed.push(line);
    }
  }
  if (inList) processed.push("</ul>");

  html = processed.join("\n");

  // 6. Paragraphs
  html = html
    .split("\n\n")
    .map((block) => {
      block = block.trim();
      if (!block) return "";

      if (
        block.startsWith("<") ||
        block.includes("@@CODE_BLOCK_") ||
        block.includes("@@INLINE_CODE_")
      ) {
        return block;
      }

      return `<p class="mb-4 leading-relaxed text-gray-700">${block}</p>`;
    })
    .join("\n\n");

  // 7. Restore code blocks và inline codes
  codeBlocks.forEach((code, i) => {
    html = html.replace(`@@CODEBLOCK_${i}@@`, code);
  });
  inlineCodes.forEach((code, i) => {
    html = html.replace(`@@INLINECODE_${i}@@`, code);
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
