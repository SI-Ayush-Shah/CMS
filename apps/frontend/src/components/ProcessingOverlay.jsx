import React from "react";

/**
 * Processing overlay that mirrors the Figma design (node 276:1469)
 * Shown full-screen while the API is processing.
 *
 * Notes:
 * - Image assets in the Figma auto-generated code point to a localhost server. Since these
 *   are not reliably accessible here, we render equivalent layout, gradients, and shapes,
 *   and leave decorative imagery as non-blocking placeholders.
 */
export default function ProcessingOverlay({ phase }) {
  return (
    <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm">
      {/* Main content area - responsive grid using container width */}
      <div className="relative h-full w-full">
        {/* Header row */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center justify-between w-[92%] max-w-6xl">
          <div className="text-white/90 text-sm font-medium">Processing</div>
          <div className="text-[#747474] text-[11px] uppercase tracking-wide">
            {phase}
          </div>
        </div>

        <div className="mx-auto h-full w-full max-w-6xl px-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-full py-16 md:py-24">
            {/* Center preview */}
            <div className="order-2 md:order-1 md:col-span-7 flex flex-col justify-end h-full">
              <div className="relative flex-1 hidden md:block">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-28 w-28 rounded-full shadow-[0_0_100px_0_rgba(100,30,167,0.3)] flex items-center justify-center">
                    <div className="h-40 w-40 rounded-full bg-gradient-to-br from-[#641ea7] to-[#b588e0] opacity-60" />
                  </div>
                </div>
              </div>

              {/* Bottom action bar */}
              <div className="w-full flex items-center justify-center gap-4">
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

              <div className="rounded-[15px] bg-black/70 border border-[#5f2e9f]/50 backdrop-blur-md">
                <div className="w-full h-full px-3 py-3 flex flex-col gap-3">
                  <div className="px-2">
                    <div className="text-[14px] text-[#747474] font-[Montserrat] truncate">
                      Your blog crafting experience starts here...
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 px-1 py-1 rounded-2xl">
                      <div className="size-4 rounded bg-white/30" />
                      <div className="text-white text-[12px] font-[Montserrat]">
                        Cover Image
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-neutral-900 rounded-2xl px-2 py-1">
                      <div className="size-4 rounded-full bg-[#2e2e2e]" />
                      <div className="text-[14px] text-[#2e2e2e] font-[Inter]">
                        Send
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
