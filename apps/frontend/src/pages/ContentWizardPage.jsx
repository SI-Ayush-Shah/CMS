import { useState } from "react";

// Placeholder component for Navbar
const Navbar = ({ state = "Default" }) => {
  if (state === "Collapsed") {
    return (
      <div className="bg-gradient-to-r from-[#4a31660d] to-[#7e4cab0d] border border-[rgba(97,63,130,0.25)] box-border content-stretch flex flex-col items-start justify-between px-3 py-4 relative rounded-xl size-full">
        {/* Header with logo */}
        <div className="box-border content-stretch flex flex-col gap-12 items-start justify-start p-0 relative shrink-0 w-full">
          <div className="box-border content-stretch flex items-center justify-between p-0 relative shrink-0 size-10">
            <div className="box-border content-stretch flex gap-2.5 items-center justify-center overflow-clip p-[22px] relative rounded-[500px] shadow-[0px_0px_10px_0px_rgba(100,30,167,0.5)] shrink-0 size-10 bg-gradient-to-r from-purple-600 to-purple-800">
              <div className="bg-gradient-to-br from-purple-400 to-purple-600 rounded-[500px] shrink-0 size-8 flex items-center justify-center">
                <span className="text-white text-sm font-bold">✨</span>
              </div>
            </div>
          </div>

          {/* Navigation items */}
          <div className="box-border content-stretch flex flex-col gap-1 items-start justify-start p-0 relative shrink-0 w-full">
            {/* Active item - Magic Wand */}
            <div className="bg-[rgba(100,30,167,0.15)] border border-[rgba(97,63,130,0.25)] box-border content-stretch flex gap-3 items-center justify-start p-[8px] relative rounded-[10px] shrink-0 w-10">
              <div className="relative shrink-0 size-6 flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a.5.5 0 00-.707-.707L9 12l-4-4a.5.5 0 00-.707.707L9 13.414l5.707-5.707z"
                  />
                </svg>
              </div>
            </div>

            {/* Note Pencil */}
            <div className="box-border content-stretch flex gap-3 items-center justify-start p-[8px] relative shrink-0 size-10">
              <div className="relative shrink-0 size-6 flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </div>
            </div>

            {/* Briefcase */}
            <div className="box-border content-stretch flex gap-3 items-center justify-start p-[8px] relative shrink-0 size-10">
              <div className="relative shrink-0 size-6 flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h2zm4-3a1 1 0 00-1 1v1h2V4a1 1 0 00-1-1z"
                  />
                </svg>
              </div>
            </div>

            {/* Chart */}
            <div className="box-border content-stretch flex gap-3 items-center justify-start p-[8px] relative shrink-0 size-10">
              <div className="relative shrink-0 size-6 flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Profile at bottom */}
        <div className="box-border content-stretch flex gap-3 items-center justify-start p-[8px] relative rounded-lg shrink-0 w-10">
          <div className="box-border content-stretch flex items-center justify-center p-0 relative rounded-lg shrink-0">
            <div className="overflow-clip relative rounded-[80px] shrink-0 size-6 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
              <span className="text-white text-xs font-semibold">A</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

// AI Chat Input component
const AiChatInput = ({ state = "Default" }) => {
  const [inputValue, setInputValue] = useState("");

  return (
    <div className="backdrop-blur-[20px] backdrop-filter border border-[#5f2e9f] relative rounded-[15px] size-full bg-black/40">
      <div className="box-border content-stretch flex flex-col items-start justify-between overflow-clip px-3 py-4 relative size-full">
        {/* Main input area */}
        <div className="box-border content-start flex flex-wrap gap-2 items-start justify-between min-h-7 px-2 py-0 relative rounded-xl shrink-0 w-full">
          <div className="basis-0 box-border content-stretch flex flex-col grow h-32 items-start justify-start min-h-px min-w-px p-2 relative rounded-xl shrink-0">
            <textarea
              className="font-['Montserrat'] font-normal text-[#747474] text-[14px] w-full h-full bg-transparent border-none outline-none resize-none placeholder-[#747474]"
              placeholder="Your blog crafting experience starts here..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
          </div>
        </div>

        {/* Bottom buttons */}
        <div className="box-border content-center flex flex-wrap gap-2 items-center justify-between min-h-7 p-0 relative rounded-xl shrink-0 w-full">
          {/* Cover Image button */}
          <div className="box-border content-stretch flex gap-2 items-center justify-center min-h-7 min-w-7 p-[4px] relative rounded-2xl shrink-0">
            <div className="box-border content-stretch flex items-center justify-center p-0 relative rounded-lg shrink-0">
              <div className="relative shrink-0 size-4 flex items-center justify-center">
                <svg
                  className="w-3 h-3 text-white"
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
            <div className="font-['Montserrat'] font-normal text-[#ffffff] text-[12px] text-nowrap">
              Cover Image
            </div>
          </div>

          {/* Generate button */}
          <div className="bg-neutral-900 box-border content-stretch flex gap-1 items-center justify-center px-2 py-1 relative rounded-2xl shrink-0 hover:bg-neutral-800 transition-colors cursor-pointer">
            <div className="box-border content-stretch flex items-center justify-center p-0 relative rounded-lg shrink-0">
              <div className="relative shrink-0 size-4 flex items-center justify-center">
                <svg
                  className="w-3 h-3 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832L14 10.202a1 1 0 000-1.664l-4.445-2.37z"
                  />
                </svg>
              </div>
            </div>
            <div className="font-['Inter'] font-normal text-[#ffffff] text-[14px] leading-[20px]">
              Generate
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Content Wizard Screen component
export default function ContentWizardPage() {
  return (
    <div className="bg-black relative size-full min-h-screen overflow-hidden">
      {/* Background gradient/pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-purple-900/10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/30 via-transparent to-transparent" />
      </div>

      {/* Collapsed Navbar */}
      <div className="absolute left-4 top-4 h-[868px] w-16 z-10">
        <Navbar state="Collapsed" />
      </div>

      {/* Main content area */}
      <div className="flex flex-col items-center justify-center min-h-screen px-4 ml-20">
        {/* Title */}
        <div className="text-center mb-8 z-10">
          <h1 className="font-['Montserrat'] font-semibold text-[36px] text-white leading-tight mb-4">
            What's on your mind today?
          </h1>
          <p className="font-['Montserrat'] font-normal text-[14px] text-[#a2a2a2]">
            Type it. Dream it. Watch it appear!
          </p>
        </div>

        {/* AI Chat Input */}
        <div className="w-[600px] h-[175px] z-10">
          <AiChatInput />
        </div>
      </div>
    </div>
  );
}
