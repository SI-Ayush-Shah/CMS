import React from "react";
import { useProcessingStore } from "../store/processingStore";
import { EnhancedAiChatInput } from "./EnhancedAiChatInput";
import Loader from "./Loader";

export default function ProcessingView({ phase }) {
  const { request } = useProcessingStore();
  return (
    <div className="min-h-[calc(100vh-0px)] w-full">
      <div className="relative w-full">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between w-full px-4 py-3">
          <div className="text-white/90 text-sm font-medium">Processing</div>
          <div className="text-[#747474] text-[11px] uppercase tracking-wide">
            {phase}
          </div>
        </div>

        <div className="mx-auto w-full max-w-6xl px-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 min-h-[70vh] py-4">
            {/* Center preview placeholder */}
            <div className="order-2 md:order-1 md:col-span-7 flex flex-col justify-end">
              <div className="w-full h-full flex items-center justify-center">
                <Loader text="Creating Magic..." />
              </div>
            </div>

            {/* Right prompt panel */}
            <div className="order-1 md:order-2 md:col-span-5 flex flex-col gap-4">
              <div className="bg-neutral-900 text-white rounded-[15px] p-3">
                <p className="text-[14px] leading-[18px] font-[Montserrat] whitespace-pre-wrap break-words">
                  {request?.text || "Preparing your content..."}
                </p>
              </div>

              {/* Common chat input */}
              <EnhancedAiChatInput
                disabled
                placeholder={
                  request?.text?.slice(0, 80) ||
                  "Your blog crafting experience starts here..."
                }
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
