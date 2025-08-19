import { useState } from "react";
import StarBorder from "../components/StarBorder";

// AI Chat Input component
const AiChatInput = () => {
  const [inputValue, setInputValue] = useState("");

  return (
    <StarBorder
      as="div"
      className="w-full h-full"
      color="var(--color-core-prim-300)"
      speed="6s"
      thickness={0}
    >
      <div className="backdrop-blur-[20px] backdrop-filter bg-core-neu-1000/40 w-full h-full flex flex-col justify-between p-4 rounded-[15px] border-none">
        {/* Main input area */}
        <div className="flex flex-wrap gap-2 items-start justify-between min-h-7 px-2 py-0 rounded-xl w-full">
          <textarea
            className=" font-normal text-[14px] text-invert-low w-full h-full bg-transparent border-none outline-none resize-none placeholder:text-invert-low min-h-[80px]"
            placeholder="Your blog crafting experience starts here..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            style={{ lineHeight: "normal" }}
          />
        </div>

        {/* Bottom buttons */}
        <div className="flex flex-wrap gap-2 items-center justify-between min-h-7 p-0 rounded-xl w-full">
          {/* Cover Image button */}
          <div className="flex gap-2 items-center justify-center min-h-7 min-w-7 p-[4px] rounded-2xl shrink-0">
            <div className="flex items-center justify-center p-0 rounded-lg shrink-0">
              <div className="relative shrink-0 size-4">
                <svg
                  className="w-full h-full text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                  />
                </svg>
              </div>
            </div>
            <div className=" font-normal text-invert-high text-[12px] whitespace-nowrap">
              Cover Image
            </div>
          </div>

          {/* Generate button */}
          <div className="bg-neutral-900 flex gap-1 items-center justify-center px-2 py-1 rounded-2xl shrink-0 hover:bg-neutral-800 transition-colors cursor-pointer">
            <div className="flex items-center justify-center p-0 rounded-lg shrink-0">
              <div className="relative shrink-0 size-4">
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-start justify-center p-0 rounded-xl shrink-0">
              <div className="font-['Inter'] font-normal text-core-neu-800 text-[14px] text-center w-full">
                <p className="block leading-[20px]"></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StarBorder>
  );
};

// Main Content Wizard Screen component
export default function ContentWizardPage() {
  return (
    <div className="relative w-full flex">
      <div className="flex flex-col w-full gap-4">
        {/* Title - positioned exactly as in Figma */}
        <div className="font-semibold text-invert-high text-[36px] text-center whitespace-nowrap">
          What's on your mind today?
        </div>

        {/* Subtitle - positioned exactly as in Figma */}
        <div className="font-normal text-invert-low text-[14px] text-center whitespace-nowrap">
          Type it. Dream it. Watch it appear!
        </div>

        {/* AI Chat Input - positioned exactly as in Figma */}
        <div className="w-full max-w-[600px] h-[175px] backdrop-blur-[20px] backdrop-filter bg-core-neu-1000 rounded-[15px] mx-auto">
          <AiChatInput />
        </div>
      </div>
    </div>
  );
}
