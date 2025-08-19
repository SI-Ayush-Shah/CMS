import React from "react";
import { EnhancedAiChatInput } from "./EnhancedAiChatInput";

export default function ProcessingView({ phase }) {
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
              <div className="relative hidden md:block flex-1">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-28 w-28 rounded-full shadow-[0_0_100px_0_rgba(100,30,167,0.3)] flex items-center justify-center">
                    <div className="h-40 w-40 rounded-full bg-gradient-to-br from-[#641ea7] to-[#b588e0] opacity-60" />
                  </div>
                </div>
              </div>

              {/* Bottom action bar */}
              <div className="w-full flex items-center justify-center gap-4 mt-6">
                <div className="flex-1 rounded-[15px] relative bg-[rgba(97,63,130,0.5)] px-4 py-3 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-[15px] border border-[#b588e0] pointer-events-none" />
                  <div className="text-white text-[16px] font-medium font-[Montserrat]">
                    Save to drafts
                  </div>
                </div>
                <button className="flex-1 rounded-[15px] bg-[#641ea7] px-4 py-3 text-white text-[16px] font-medium font-[Montserrat]">
                  Publish
                </button>
              </div>
            </div>

            {/* Right prompt panel */}
            <div className="order-1 md:order-2 md:col-span-5 flex flex-col gap-4">
              <div className="bg-neutral-900 text-white rounded-[15px] p-3">
                <p className="text-[14px] leading-[18px] font-[Montserrat]">
                  Write a 500–700 word professional sports news article on Virat
                  Kohli’s recent performance. Include a strong headline,
                  introduction, match highlights, statistics, and realistic
                  quotes (not fabricated) in an engaging yet objective tone.
                  Provide contextual analysis of his impact on the team’s
                  momentum and the ongoing series/tournament. Structure the
                  article with a clear beginning, middle, and conclusion.
                </p>
              </div>

              {/* Common chat input */}
              <div className="rounded-[15px] bg-black/70 border border-[#5f2e9f]/50 backdrop-blur-md">
                <div className="px-3 py-3">
                  <EnhancedAiChatInput
                    disabled
                    placeholder="Your blog crafting experience starts here..."
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
