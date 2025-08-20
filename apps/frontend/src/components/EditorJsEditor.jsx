import React, { useEffect, useRef } from "react";
import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";
import List from "@editorjs/list";
import Table from "@editorjs/table";
import Code from "@editorjs/code";
import Quote from "@editorjs/quote";
// Delimiter intentionally disabled to avoid injecting separators
import Checklist from "@editorjs/checklist";
import Warning from "@editorjs/warning";
import Embed from "@editorjs/embed";
import ImageTool from "@editorjs/image";
import { imageUploadApi } from "../services/imageUploadApi";
import "./editorjs-theme.css";

/**
 * EditorJsEditor
 *
 * A thin React wrapper around Editor.js with a broad set of tools enabled
 * and a file uploader that leverages our imageUploadApi mock.
 */
export default function EditorJsEditor({
  initialData,
  onChange,
  className = "",
  style,
  readOnly = false,
}) {
  const holderRef = useRef(null);
  const editorRef = useRef(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    const holderEl = holderRef.current;
    if (!holderEl) return;
    if (initializedRef.current || editorRef.current) return;

    // Global singleton guard (dev StrictMode resilience)
    if (typeof window !== "undefined" && window.__cmsEditorInstance) {
      try {
        window.__cmsEditorInstance.destroy();
      } catch (err) {
        console.warn("Previous global EditorJS instance destroy failed", err);
      }
      window.__cmsEditorInstance = null;
    }

    const normalizeInitialData = (data) => {
      if (!data || !Array.isArray(data.blocks)) return { blocks: [] };
      const blocks = data.blocks.map((block) => {
        if (block?.type === "image") {
          const d = block.data || {};
          const url =
            typeof d.file === "string" ? d.file : d?.file?.url || d?.url;
          return {
            ...block,
            data: { ...d, file: url ? { url } : d.file },
          };
        }
        return block;
      });
      return { ...data, blocks };
    };

    // Ensure clean mount surface
    holderEl.innerHTML = "";

    const editor = new EditorJS({
      holder: holderEl,
      autofocus: !readOnly,
      placeholder: "Start writing your article...",
      data: normalizeInitialData(initialData) || { blocks: [] },
      readOnly,
      tools: {
        header: {
          class: Header,
          inlineToolbar: ["link", "bold", "italic"],
          config: { levels: [2, 3, 4], defaultLevel: 2 },
        },
        list: {
          class: List,
          inlineToolbar: true,
        },
        table: {
          class: Table,
          inlineToolbar: true,
        },
        code: Code,
        quote: {
          class: Quote,
          inlineToolbar: true,
          config: {
            quotePlaceholder: "Enter a quote",
            captionPlaceholder: "Quote author",
          },
        },
        // delimiter: Delimiter,
        checklist: {
          class: Checklist,
          inlineToolbar: true,
        },
        warning: Warning,
        embed: {
          class: Embed,
          inlineToolbar: false,
          config: {
            services: {
              youtube: true,
              vimeo: true,
              twitter: true,
              instagram: true,
              codepen: true,
            },
          },
        },
        image: {
          class: ImageTool,
          config: {
            captionPlaceholder: "Add a caption",
            uploader: {
              async uploadByFile(file) {
                const uploaded = await imageUploadApi.uploadImage(
                  file,
                  () => {}
                );
                return { success: 1, file: { url: uploaded.url } };
              },
              async uploadByUrl(url) {
                return { success: 1, file: { url } };
              },
            },
          },
        },
      },
      onChange: async () => {
        if (readOnly) return; // no-op in preview mode
        try {
          const data = await editor.save();
          if (onChange) onChange(data);
        } catch (err) {
          console.error("EditorJS save failed", err);
        }
      },
    });

    editorRef.current = editor;
    initializedRef.current = true;
    if (typeof window !== "undefined") {
      window.__cmsEditorInstance = editor;
    }

    // After the editor is ready, ensure only a single DOM root exists
    // Some dev-mode/StrictMode flows or fast remounts can transiently leave
    // multiple codex-editor roots; prune older ones deterministically.
    try {
      editor.isReady
        .then(() => {
          if (!holderEl) return;
          const roots = holderEl.querySelectorAll(".codex-editor");
          if (roots.length > 1) {
            for (let i = 0; i < roots.length - 1; i += 1) {
              const node = roots[i];
              try {
                node.remove();
              } catch {
                /* no-op */
              }
            }
          }
        })
        .catch(() => {
          /* no-op */
        });
    } catch {
      /* no-op */
    }

    return () => {
      const instance = editorRef.current;
      editorRef.current = null;
      initializedRef.current = false;
      try {
        instance && instance.destroy();
      } catch (err) {
        console.warn("EditorJS destroy failed", err);
      }
      if (
        typeof window !== "undefined" &&
        window.__cmsEditorInstance === instance
      ) {
        window.__cmsEditorInstance = null;
      }
      // Ensure holder is cleared to avoid ghost toolbars
      try {
        holderEl.innerHTML = "";
      } catch (err) {
        console.warn("Failed to clear editor holder", err);
      }
    };
    // We intentionally want to init once per mount; do not depend on initialData
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Toggle readOnly state without re-initializing
  useEffect(() => {
    const instance = editorRef.current;
    if (!instance) return;
    try {
      if (!instance.readOnly) return;
      if (readOnly) {
        if (typeof instance.readOnly.enable === "function") {
          instance.readOnly.enable();
        } else if (typeof instance.readOnly.toggle === "function") {
          instance.readOnly.toggle(true);
        } else if (typeof instance.readOnly.on === "function") {
          instance.readOnly.on();
        }
      } else {
        if (typeof instance.readOnly.disable === "function") {
          instance.readOnly.disable();
        } else if (typeof instance.readOnly.toggle === "function") {
          instance.readOnly.toggle(false);
        } else if (typeof instance.readOnly.off === "function") {
          instance.readOnly.off();
        }
      }
    } catch (err) {
      console.warn("Failed to toggle readOnly state", err);
    }
  }, [readOnly]);

  return (
    <div
      className={`editorjs-theme px-18 rounded-xl border border-core-prim-300/20  p-3 ${className}`}
      style={style}
    >
      <div ref={holderRef} className="min-h-[560px]" />
    </div>
  );
}
