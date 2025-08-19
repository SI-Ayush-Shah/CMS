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
    <div className="fixed inset-0 z-40 bg-[#000000]">
      {/* Left gradient navbar */}
      <div className="absolute left-4 top-4 h-[868px] rounded-[10px] px-3 py-4 flex flex-col justify-between bg-gradient-to-r from-[#4a31660d] to-[#7e4cab0d] border border-[rgba(97,63,130,0.25)]/50">
        <div className="flex flex-col gap-12">
          {/* Blob logo */}
          <div className="size-10 rounded-full shadow-[0_0_10px_0_rgba(100,30,167,0.5)] overflow-hidden flex items-center justify-center">
            <div className="size-8 rounded-full bg-gradient-to-br from-[#641ea7] to-[#b588e0] opacity-50" />
          </div>

          {/* Vertical tabs */}
          <div className="flex flex-col gap-1">
            <div className="w-10 p-2 rounded-[10px] bg-[rgba(100,30,167,0.15)] border border-[rgba(97,63,130,0.25)]/50 flex items-center justify-center">
              <div className="size-6 rounded bg-[#641ea7]/30" />
            </div>
            <div className="w-10 p-2 rounded-[10px] flex items-center justify-center">
              <div className="size-6 rounded bg-white/20" />
            </div>
            <div className="w-10 p-2 rounded-[10px] flex items-center justify-center">
              <div className="size-6 rounded bg-white/20" />
            </div>
            <div className="w-10 p-2 rounded-[10px] flex items-center justify-center">
              <div className="size-6 rounded bg-white/20" />
            </div>
          </div>
        </div>

        {/* Profile */}
        <div className="w-10 h-10 rounded-lg flex items-center justify-center">
          <div className="size-6 rounded-full bg-[#b588e0]/40" />
        </div>
      </div>

      {/* Main content area */}
      <div className="absolute left-20 top-0 flex items-start">
        {/* Content Preview section */}
        <div className="relative w-[918px] h-[900px] overflow-hidden">
          {/* Center blob image placeholder */}
          <div className="absolute left-[398px] top-[389px] size-[122px] rounded-full overflow-hidden shadow-[0_0_100px_0_rgba(100,30,167,0.3)] flex items-center justify-center">
            <div className="size-[166px] rounded-full bg-gradient-to-br from-[#641ea7] to-[#b588e0] opacity-60" />
          </div>

          {/* Bottom action bar */}
          <div className="absolute left-0 top-[824px] w-[918px] h-[76px] flex items-center justify-center gap-4 p-4">
            <div className="flex-1 min-w-px min-h-px rounded-[15px] relative bg-[rgba(97,63,130,0.5)] px-3 py-[10px] flex items-center justify-center">
              <div className="absolute inset-0 rounded-[15px] border border-[#b588e0] pointer-events-none" />
              <div className="text-[#ffffff] text-[16px] font-medium font-[Montserrat]">
                Save to drafts
              </div>
            </div>
            <button className="flex-1 min-w-px min-h-px rounded-[15px] bg-[#641ea7] px-3 py-[10px] text-white text-[16px] font-medium font-[Montserrat]">
              Publish
            </button>
          </div>
        </div>

        {/* Prompt section (right) */}
        <div className="relative w-[514px] h-[900px] p-6 flex flex-col items-end">
          {/* Full-height frosted panel */}
          <div className="absolute left-1/2 top-0 -translate-x-1/2 w-[514px] h-[900px] bg-[#000000] backdrop-blur-[20px] rounded-[12px] border border-[#5f2e9f]/50" />

          {/* Example prompt card */}
          <div className="relative z-10 mt-[582px] bg-neutral-900 text-white rounded-[15px] p-[10px] w-auto">
            <p className="text-[14px] leading-[18px] font-[Montserrat] w-[372px]">
              Write a 500–700 word professional sports news article on Virat
              Kohli’s recent performance. Include a strong headline,
              introduction, match highlights, statistics, and realistic quotes
              (not fabricated) in an engaging yet objective tone. Provide
              contextual analysis of his impact on the team’s momentum and the
              ongoing series/tournament. Structure the article with a clear
              beginning, middle, and conclusion.
            </p>
          </div>

          {/* Bottom AI chat input */}
          <div className="relative z-10 mt-4 w-full h-[110px] rounded-[15px] bg-[#000000] backdrop-blur-[20px]">
            <div className="w-full h-full px-3 py-4 overflow-hidden flex flex-col justify-between">
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
            <div className="pointer-events-none absolute inset-0 rounded-[15px] border border-[#5f2e9f]/50" />
          </div>

          {/* Phase label (top-right small) */}
          <div className="absolute right-6 top-6 text-[11px] uppercase tracking-wide text-[#747474]">
            {phase}
          </div>
          {/* Processing title */}
          <div className="absolute left-6 top-6 text-white text-sm font-medium">
            Processing
          </div>
        </div>
      </div>
    </div>
  );
}
