import React from "react";

/**
 * Renders Editor.js data blocks into React elements without the Editor.js runtime.
 * Supports common block types used in our API.
 */
export default function EditorJsRenderer({ data, className = "" }) {
  if (!data || !Array.isArray(data.blocks)) return null;

  const headerLevelToClasses = (level) => {
    switch (level) {
      case 1:
        return "text-[32px] leading-[45px]";
      case 2:
        return "text-[28px] leading-[39px]";
      case 3:
        return "text-[24px] leading-[34px]";
      case 4:
        return "text-[20px] leading-[28px]";
      case 5:
        return "text-[18px] leading-[26px]";
      default:
        return "text-[16px] leading-[22px]";
    }
  };

  const formatInlineHtml = (value) => {
    if (typeof value !== "string") return "";
    if (value.includes("<") && value.includes(">")) return value;
    return value.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  };

  const tryParseJsonArray = (value) => {
    if (typeof value !== "string") return null;
    const trimmed = value.trim();
    if (!trimmed.startsWith("[") || !trimmed.endsWith("]")) return null;
    try {
      const parsed = JSON.parse(trimmed);
      return Array.isArray(parsed) ? parsed : null;
    } catch {
      return null;
    }
  };

  const normalizeTableContent = (content) => {
    if (!Array.isArray(content)) return [];

    // Case 1: Proper 2D array already
    if (Array.isArray(content[0])) {
      const first = content[0];
      // Handle odd shape: [["[\"h1\",\"h2\"]", "[\"r1c1\",\"r1c2\"]", ...]]
      const looksLikeStringifiedRows = Array.isArray(first) && first.every((cell) => typeof cell === "string");
      if (looksLikeStringifiedRows && content.length === 1) {
        const parsedRows = first
          .map((cell) => tryParseJsonArray(cell))
          .filter((row) => Array.isArray(row));
        if (parsedRows.length === first.length) return parsedRows;
      }

      // Also handle variants where individual rows are stringified JSON
      return content.map((row) => {
        if (typeof row === "string") {
          const parsed = tryParseJsonArray(row);
          return parsed ?? [row];
        }
        if (Array.isArray(row) && row.length === 1 && typeof row[0] === "string") {
          const parsed = tryParseJsonArray(row[0]);
          return parsed ?? row;
        }
        return row;
      });
    }

    // Case 2: 1D array of stringified rows
    const allStringified = content.every((cell) => typeof cell === "string");
    if (allStringified) {
      const parsedRows = content
        .map((cell) => tryParseJsonArray(cell))
        .filter((row) => Array.isArray(row));
      if (parsedRows.length) return parsedRows;
    }

    // Fallback: wrap once
    return [content];
  };

  const renderBlock = (block) => {
    const { id, type, data } = block;
    switch (type) {
      case "delimiter":
        return null;
      case "header": {
        const level = Math.min(Math.max(data?.level || 2, 1), 6);
        const Tag = `h${level}`;
        return (
          <Tag
            key={id}
            className={`font-semibold text-invert-high tracking-tight mt-6 mb-2 ${headerLevelToClasses(
              level
            )}`}
            dangerouslySetInnerHTML={{ __html: data?.text || "" }}
          />
        );
      }
      case "paragraph": {
        return (
          <p
            key={id}
            className="text-invert-medium text-[15px] leading-8 mb-4"
            dangerouslySetInnerHTML={{ __html: data?.text || "" }}
          />
        );
      }
      case "list": {
        const items = Array.isArray(data?.items) ? data.items : [];
        // Convert simple markdown-like **bold** in list items to <strong>
        const itemsHtml = items.map((i) => formatInlineHtml(i));
        if (data?.style === "ordered") {
          return (
            <ol key={id} className="list-decimal pl-5 space-y-1.5 mb-4">
              {itemsHtml.map((item, idx) => (
                <li
                  key={`${id}-${idx}`}
                  dangerouslySetInnerHTML={{ __html: item }}
                />
              ))}
            </ol>
          );
        }
        return (
          <ul key={id} className="list-disc pl-5 space-y-1.5 mb-4">
            {itemsHtml.map((item, idx) => (
              <li
                key={`${id}-${idx}`}
                dangerouslySetInnerHTML={{ __html: item }}
              />
            ))}
          </ul>
        );
      }
      case "table": {
        const content = data?.content;
        const rows = normalizeTableContent(content);
        const withHeadings = !!data?.withHeadings;
        const head = withHeadings && rows.length > 0 ? rows[0] : null;
        const bodyRows = withHeadings ? rows.slice(1) : rows;
        return (
          <div key={id} className="overflow-x-auto my-4 rounded-xl border border-core-prim-300/20">
            <table className="min-w-full text-left border-collapse text-[14px]">
              {head && (
                <thead className="bg-core-prim-500/10 text-invert-high">
                  <tr>
                    {head.map((cell, cIdx) => (
                      <th key={`${id}-head-${cIdx}`} className="px-4 py-2 font-semibold">
                        {String(cell)}
                      </th>
                    ))}
                  </tr>
                </thead>
              )}
              <tbody>
                {Array.isArray(bodyRows) &&
                  bodyRows.filter(Boolean).map((row, rIdx) => {
                    const cells = Array.isArray(row) ? row : [row];
                    return (
                      <tr
                        key={`${id}-row-${rIdx}`}
                        className={`${rIdx % 2 === 0 ? "bg-white/[0.02]" : "bg-transparent"} border-t border-core-prim-300/10`}
                      >
                        {cells.map((cell, cIdx) => (
                          <td
                            key={`${id}-cell-${rIdx}-${cIdx}`}
                            className="px-4 py-2 align-top text-invert-medium"
                          >
                            {String(cell)}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        );
      }
      case "code": {
        return (
          <pre
            key={id}
            className="bg-black/40 border border-core-prim-300/20 rounded-lg p-3 text-[12px] overflow-auto mb-3"
          >
            <code>{data?.code || ""}</code>
          </pre>
        );
      }
      case "quote": {
        return (
          <figure
            key={id}
            className="border-l-4 border-core-prim-500/60 pl-4 italic text-invert-high/80 my-5 bg-core-prim-500/5 rounded-r-xl py-3"
          >
            <blockquote className="text-[16px] leading-8">{data?.text}</blockquote>
            {data?.caption && (
              <figcaption className="text-[12px] text-invert-low mt-1">
                {data.caption}
              </figcaption>
            )}
          </figure>
        );
      }
      case "checklist": {
        const rawItems = Array.isArray(data?.items) ? data.items : [];
        return (
          <ul key={id} className="space-y-2 mb-4">
            {rawItems.map((item, idx) => {
              const text = typeof item === "string" ? item : item?.text;
              const checked =
                typeof item === "object" ? !!item?.checked : false;
              return (
                <li key={`${id}-${idx}`} className="flex items-start gap-3">
                  <span
                    className={`mt-1 inline-flex items-center justify-center w-4 h-4 rounded-full border ${
                      checked
                        ? "bg-core-prim-500/80 border-core-prim-500 text-white"
                        : "border-core-prim-300/40 text-invert-low"
                    }`}
                  >
                    {checked ? "✓" : ""}
                  </span>
                  <span
                    className="text-[15px] leading-8"
                    dangerouslySetInnerHTML={{ __html: text || "" }}
                  />
                </li>
              );
            })}
          </ul>
        );
      }
      case "warning": {
        return (
          <div
            key={id}
            className="rounded-lg bg-warning-500/10 border border-warning-500/20 p-3 my-3"
          >
            {data?.title && (
              <div className="font-medium mb-1">{data.title}</div>
            )}
            <div className="text-[14px]">{data?.message}</div>
          </div>
        );
      }
      case "image": {
        const url =
          typeof data?.file === "string"
            ? data.file
            : data?.file?.url || data?.url;
        const caption = data?.caption;
        const stretched = !!data?.stretched;
        const withBorder = !!data?.withBorder;
        const withBackground = !!data?.withBackground;
        if (!url) return null;
        return (
          <figure key={id} className={`my-5 ${stretched ? "w-full" : ""}`}>
            <div
              className={`${withBackground ? "bg-white/[0.03]" : ""} ${
                withBorder ? "border border-core-prim-300/20" : ""
              } rounded-xl overflow-hidden`}
            >
              <img src={url} alt={caption || "image"} className="w-full object-cover" />
            </div>
            {caption && (
              <figcaption className="text-[12px] text-invert-low mt-1">
                {caption}
              </figcaption>
            )}
          </figure>
        );
      }
      case "embed": {
        const embed = data?.embed || data?.source;
        if (!embed) return null;
        return (
          <div key={id} className="my-4">
            <iframe
              src={embed}
              title={data?.caption || id}
              className="w-full aspect-video rounded-xl border border-core-prim-300/20"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        );
      }
      case "linkTool": {
        const link = data?.link || data?.url;
        if (!link) return null;
        return (
          <a
            key={id}
            href={link}
            target="_blank"
            rel="noreferrer"
            className="text-core-prim-400 underline"
          >
            {data?.meta?.title || link}
          </a>
        );
      }
      default:
        return null;
    }
  };

  return <div className={className}>{data.blocks.map(renderBlock)}</div>;
}
