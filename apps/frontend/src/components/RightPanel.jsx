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

  const contentBoxes = [
    {
      id: 1,
      content: `Write a 500–700 word professional sports news article on the
        chosen topic. Include a strong headline, introduction, match
        highlights, statistics, and realistic quotes (not fabricated)
        in an engaging yet objective tone. Provide contextual analysis
        of impact on team momentum and the ongoing tournament.
        Structure with a clear beginning, middle, and conclusionWrite a 500–700 word professional sports news article on the
        chosen topic. Include a strong headline, introduction, match
        highlights, statistics, and realistic quotes (not fabricated)
        in an engaging yet objective tone. Provide contextual analysis
        of impact on team momentum and the ongoing tournament.
        Structure with a clear beginning, middle, and conclusion.`,
    },
    {
      id: 2,
      content: `Create engaging social media content that drives engagement.
        Focus on trending topics, use relevant hashtags, and include
        compelling visuals. Keep the tone conversational and encourage
        user interaction through questions and calls-to-action.`,
    },
    {
      id: 3,
      content: `Develop a comprehensive marketing strategy for product launch.
        Include target audience analysis, competitive positioning,
        messaging framework, and multi-channel distribution plan.
        Focus on measurable KPIs and ROI optimization.`,
    },
    {
      id: 4,
      content: `Write compelling email newsletter content that increases open rates.
        Use personalized subject lines, engaging preview text, and
        clear value propositions. Include actionable insights and
        maintain consistent branding throughout.`,
    },
    {
      id: 5,
      content: `Create a technical blog post explaining complex concepts simply.
        Use clear examples, code snippets where relevant, and
        step-by-step explanations. Include practical applications
        and real-world use cases for better understanding.`,
    },
  ];

  return (
    <div className="w-full bg-black h-full p-2 max-h-screen sticky top-0">
      <div className="flex flex-col h-full">
        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <div className="flex flex-col items-end gap-2 pb-4">
            {contentBoxes.map((box) => {
              // Check if content height is less than 164px (approximately 8 lines)
              const isShortContent = box.content.length < 200; // Rough estimate for short content

              return (
                <div
                  key={box.id}
                  className={`rounded-2xl bg-button-filled-main-default  border border-core-prim-300/20 p-2 cursor-pointer transition-all duration-200 overflow-hidden w-[80%] ${
                    expandedBoxes[box.id]
                      ? "h-auto"
                      : isShortContent
                        ? "h-auto"
                        : "max-h-[164px]"
                  }`}
                  onClick={() => {
                    // Toggle between expanded and collapsed states
                    toggleBoxExpansion(box.id);
                  }}
                >
                  <p
                    className={`text-[12px] text-invert-high leading-relaxed ${
                      !expandedBoxes[box.id] && !isShortContent
                        ? "line-clamp-8"
                        : ""
                    }`}
                  >
                    {box.content}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom-aligned chat input - Compact height */}
        <div className="h-[200px] w-full mt-2">
          <EnhancedAiChatInput
            placeholder="Refine this blog via AI..."
            maxLength={2000}
            maxImages={0}
            validationOptions={{
              text: { required: true, maxLength: 2000 },
              images: { required: false, maxImages: 0 },
            }}
            onSubmit={async ({ text }) => {
              if (!body || !Array.isArray(body?.blocks)) return;
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
            }}
            disabled={isRefining}
          />
        </div>
      </div>
    </div>
  );
};

export default RightPanel;
