import React from "react";
import EditorJsRenderer from "./EditorJsRenderer";

export default function ContentEditorView({ article }) {
  if (!article) return null;
  const { title, summary, category, tags = [], bannerUrl, images = [], body } = article;

  return (
    <div className="w-full h-full min-h-screen p-4 md:p-6 lg:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editor column */}
        <section className="lg:col-span-2 space-y-5">
          {/* Header with meta */}
          <div className="flex items-start justify-between rounded-2xl border border-core-prim-300/20 bg-core-neu-1000/40 px-4 py-3">
            <div>
              <div className="text-[20px] font-semibold text-invert-high">{title}</div>
              {summary && <p className="text-xs text-invert-low mt-1">{summary}</p>}
              <div className="flex flex-wrap gap-2 mt-2">
                {category && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-core-prim-500/10 border border-core-prim-500/20 text-core-prim-500">
                    {category}
                  </span>
                )}
                {tags.slice(0, 6).map((t) => (
                  <span key={t} className="text-[11px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-invert-low">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Banner */}
          {bannerUrl && (
            <div>
              <p className="text-xs text-invert-low mb-2">Image</p>
              <div className="relative w-full overflow-hidden rounded-2xl border border-core-prim-300/20">
                <img src={bannerUrl} alt="Cover" className="w-full aspect-[16/10] object-cover" />
              </div>
            </div>
          )}

          {/* Body */}
          <div>
            <p className="text-xs text-invert-low mb-2">Body</p>
            <EditorJsRenderer data={body} />
          </div>
        </section>

        {/* Assistant column placeholder to match layout */}
        <aside className="lg:col-span-1">
          <div className="lg:sticky lg:top-4 h-[calc(100vh-1rem)]">
            <div className="flex flex-col h-full overflow-hidden">
              <div className="rounded-2xl bg-core-neu-1000/40 border border-core-prim-300/20 p-4 flex-1 overflow-auto">
                <p className="text-[12px] text-invert-low">
                  Content generated. Review and refine as needed. You can reuse the assistant panel here if desired.
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}


