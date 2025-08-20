import React from "react";

/**
 * Renders Editor.js data blocks into React elements without the Editor.js runtime.
 * Supports common block types used in our API.
 */
export default function EditorJsRenderer({ data }) {
  if (!data || !Array.isArray(data.blocks)) return null;

  const renderBlock = (block) => {
    const { id, type, data } = block;
    switch (type) {
      case "delimiter":
        return null;
      case "header": {
        const level = Math.min(Math.max(data?.level || 2, 1), 6);
        const Tag = `h${level}`;
        return (
          <Tag key={id} className="font-semibold text-invert-high mt-4 mb-2">
            {data?.text}
          </Tag>
        );
      }
      case "paragraph": {
        return (
          <p
            key={id}
            className="text-main-medium text-[14px] leading-7 mb-3"
            dangerouslySetInnerHTML={{ __html: data?.text || "" }}
          />
        );
      }
      case "list": {
        const items = Array.isArray(data?.items) ? data.items : [];
        if (data?.style === "ordered") {
          return (
            <ol key={id} className="list-decimal pl-5 space-y-1 mb-3">
              {items.map((item, idx) => (
                <li
                  key={`${id}-${idx}`}
                  dangerouslySetInnerHTML={{ __html: item }}
                />
              ))}
            </ol>
          );
        }
        return (
          <ul key={id} className="list-disc pl-5 space-y-1 mb-3">
            {items.map((item, idx) => (
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
        // Handle both 2D and 1D arrays (some providers send one row per block)
        const rows = Array.isArray(content?.[0]) ? content : [content];
        return (
          <div key={id} className="overflow-auto mb-4">
            <table className="min-w-full text-left border-collapse">
              <tbody>
                {Array.isArray(rows) &&
                  rows.filter(Boolean).map((row, rIdx) => {
                    const cells = Array.isArray(row) ? row : [row];
                    return (
                      <tr
                        key={`${id}-row-${rIdx}`}
                        className="border-b border-core-prim-300/10"
                      >
                        {cells.map((cell, cIdx) => (
                          <td
                            key={`${id}-cell-${rIdx}-${cIdx}`}
                            className="px-3 py-2 align-top text-[14px]"
                          >
                            {cell}
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
            className="border-l-4 border-core-prim-400 pl-3 italic text-invert-high/80 my-4"
          >
            <blockquote>{data?.text}</blockquote>
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
          <ul key={id} className="space-y-2 mb-3">
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
                    className="text-[14px] leading-7"
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
        if (!url) return null;
        return (
          <figure key={id} className="my-4">
            <img
              src={url}
              alt={caption || "image"}
              className="w-full rounded-xl border border-core-prim-300/20"
            />
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

  return <div>{data.blocks.map(renderBlock)}</div>;
}
