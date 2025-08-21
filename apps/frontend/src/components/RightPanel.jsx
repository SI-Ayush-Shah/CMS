import React, { useEffect, useRef } from "react";
import EnhancedAiChatInput from "./EnhancedAiChatInput";
import { contentApi } from "../services/contentApi";
import { normalizeEditorJsBody } from "../utils";
import { useRefinementStore } from "../store/refinementStore";

const RightPanel = ({ blogId, body, onRefinement }) => {
  const {
    messages,
    isProcessing,
    startRefinement,
    completeRefinement,
    failRefinement,
    addUserMessage,
  } = useRefinementStore();

  const scrollRef = useRef(null);

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  return (
    <div className="w-full bg-black h-full p-2 max-h-screen sticky top-0">
      <div className="flex flex-col h-full">
        {/* Scrollable chat/messages area */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto scrollbar-hide mt-4"
        >
          <div className="flex flex-col gap-4 pb-4">
            {messages && messages.length > 0 ? (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={
                    msg.type === "user"
                      ? "self-end max-w-[80%]"
                      : "self-start max-w-[80%]"
                  }
                >
                  <div
                    className={
                      msg.type === "user"
                        ? "rounded-2xl bg-core-prim-500/20 border border-core-prim-300/30 p-2 text-md text-invert-high"
                        : msg.status === "error"
                          ? "rounded-2xl bg-error-500/10 border border-error-500/20 p-2 text-md text-error-400"
                          : "rounded-2xl bg-button-filled-main-default border border-core-prim-300/20 p-2 text-md text-invert-high"
                    }
                  >
                    {msg.content}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-[12px] text-invert-low p-2">
                Start a refinement conversation using the prompt box below.
              </div>
            )}
          </div>
        </div>

        {/* Bottom-aligned chat input - Compact height */}
        <div className="h-[200px] w-full mt-2">
          <EnhancedAiChatInput
            placeholder="Refine this blog via AI..."
            maxLength={2000}
            maxImages={0}
            showKeyboardShortcuts={false}
            
            validationOptions={{
              text: { required: true, maxLength: 2000 },
              images: { required: false, maxImages: 0 },
            }}
            onSubmit={async ({ text }) => {
              try {
                startRefinement(text);
                const normalized = normalizeEditorJsBody(body);

                // Require a valid Editor.js body with blocks; blogId is optional per backend schema
                if (
                  !normalized ||
                  !Array.isArray(normalized?.blocks) ||
                  normalized.blocks.length === 0
                ) {
                  failRefinement("Cannot refine: body missing or invalid.");
                  return;
                }

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
                const assistantMsg =
                  res?.data?.message || "Refinement applied.";
                completeRefinement(assistantMsg);
              } catch (err) {
                const errorMessage =
                  err?.message || "Failed to refine content.";
                failRefinement(errorMessage);
              }
            }}
            disabled={isProcessing}
          />
        </div>
      </div>
    </div>
  );
};

export default RightPanel;
