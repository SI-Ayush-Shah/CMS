import React, { useMemo, useState, useCallback } from "react";
import EnhancedAiChatInput from "./EnhancedAiChatInput";
import { contentApi } from "../services/contentApi";
import { normalizeEditorJsBody } from "../utils";

const RightPanel = ({ blogId, body, onRefinement }) => {
  const [expandedBoxes, setExpandedBoxes] = useState({});
  const [messages, setMessages] = useState([]);
  const [isRefining, setIsRefining] = useState(false);

  const toggleBoxExpansion = (boxId) => {
    setExpandedBoxes((prev) => ({
      ...prev,
      [boxId]: !prev[boxId],
    }));
  };

  // Derive dynamic suggestions based on current body content
  const suggestions = useMemo(() => {
    const blocks = Array.isArray(body?.blocks) ? body.blocks : [];
    const textFromBlocks = (types) =>
      blocks
        .filter((b) => types.includes(b.type))
        .map((b) => {
          if (b.type === "paragraph" || b.type === "header")
            return b.data?.text || "";
          return "";
        })
        .join(" ");
    const plainText = textFromBlocks(["header", "paragraph"])
      .replace(/<[^>]*>/g, " ")
      .trim();
    const wordCount = plainText
      ? plainText.split(/\s+/).filter(Boolean).length
      : 0;
    const hasHeaders = blocks.some((b) => b.type === "header");
    const hasImages = blocks.some((b) => b.type === "image");
    const hasLists = blocks.some((b) => b.type === "list");
    const hasConclusionHeader = blocks.some(
      (b) =>
        b.type === "header" &&
        /conclusion|summary|final thoughts/i.test(b.data?.text || "")
    );
    const hasIntroHeader = blocks.some(
      (b) =>
        b.type === "header" &&
        /intro|introduction|overview/i.test(b.data?.text || "")
    );

    const s = [];
    if (wordCount < 500)
      s.push(
        "Expand the article to at least 700 words with more depth and examples."
      );
    if (!hasHeaders)
      s.push("Add clear subheadings (H2/H3) to structure the content.");
    if (!hasIntroHeader)
      s.push(
        "Add an engaging introduction that sets context and hooks the reader."
      );
    if (!hasConclusionHeader)
      s.push(
        "Add a concise conclusion summarizing key takeaways and next steps."
      );
    if (!hasImages)
      s.push(
        "Suggest where an image or chart would improve readability and add an <image> block."
      );
    if (!hasLists)
      s.push("Convert dense paragraphs into bullet lists where appropriate.");
    if (s.length === 0)
      s.push("Improve clarity and flow while preserving meaning.");
    return s.map((content, idx) => ({ id: idx + 1, content }));
  }, [body]);

  const runRefinement = useCallback(
    async (text) => {
      if (!text || !body || !Array.isArray(body?.blocks)) return;
      const normalized = normalizeEditorJsBody(body);
      const userMsg = { role: "user", content: text };
      setMessages((prev) => [...prev, userMsg]);
      setIsRefining(true);
      try {
        const res = await contentApi.refineContent(
          blogId,
          text,
          normalized,
          "custom"
        );
        const updated = res?.data?.updatedBody;
        if (updated && onRefinement) {
          onRefinement(updated);
        }
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: res?.data?.message || "Refinement applied.",
          },
        ]);
      } catch (err) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: err?.message || "Failed to refine content.",
          },
        ]);
      } finally {
        setIsRefining(false);
      }
    },
    [blogId, body, onRefinement]
  );

  return (
    <div className="w-full bg-black h-full p-2 max-h-screen sticky top-0">
      <div className="flex flex-col h-full">
        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <div className="flex flex-col items-end gap-2 pb-4">
            {/* Show chat history if present */}
            {messages.length > 0 && (
              <div className="w-full flex flex-col gap-2">
                {messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`max-w-[80%] rounded-2xl border border-core-prim-300/20 p-2 ${
                      m.role === "user"
                        ? "self-end bg-core-prim-500/10 text-invert-high"
                        : "self-start bg-button-filled-main-default text-invert-low"
                    }`}
                  >
                    <p className="text-[12px] leading-relaxed">{m.content}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Dynamic suggestions (click to apply) */}
            {suggestions.map((s) => {
              const isShortContent = s.content.length < 200;
              return (
                <div
                  key={s.id}
                  className={`rounded-2xl bg-button-filled-main-default border border-core-prim-300/20 p-2 cursor-pointer transition-all duration-200 overflow-hidden w-[80%] ${
                    expandedBoxes[s.id]
                      ? "h-auto"
                      : isShortContent
                        ? "h-auto"
                        : "max-h-[164px]"
                  }`}
                  onClick={() => {
                    toggleBoxExpansion(s.id);
                    runRefinement(s.content);
                  }}
                >
                  <p
                    className={`text-[12px] text-invert-low leading-relaxed ${
                      !expandedBoxes[s.id] && !isShortContent
                        ? "line-clamp-8"
                        : ""
                    }`}
                  >
                    {s.content}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom-aligned chat input - Compact height */}
        <div className="h-[150px] w-full mt-2">
          <EnhancedAiChatInput
            placeholder="Refine this blog via AI..."
            maxLength={2000}
            maxImages={0}
            validationOptions={{
              text: { required: true, maxLength: 2000 },
              images: { required: false, maxImages: 0 },
            }}
            onSubmit={async ({ text }) => runRefinement(text)}
            disabled={isRefining}
          />
        </div>
      </div>
    </div>
  );
};

export default RightPanel;
