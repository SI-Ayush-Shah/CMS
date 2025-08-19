import { useState } from "react";
import StarBorder from "../components/StarBorder";

// Navbar component - pixel perfect from Figma
const Navbar = ({ state = "Default" }) => {
  if (state === "Collapsed") {
    return (
      <div className="w-full h-full flex flex-col justify-between px-3 py-4">
        {/* Header with logo and navigation */}
        <div className="flex flex-col gap-12 w-full">
          {/* Logo/Header */}
          <div className="flex items-center justify-between p-0 relative shrink-0 size-10">
            <div className="flex gap-2.5 items-center justify-center overflow-clip p-[22px] relative rounded-[500px] shadow-[0px_0px_10px_0px_rgba(100,30,167,0.5)] shrink-0 size-10">
              <div
                className="bg-center bg-no-repeat rounded-[500px] shrink-0 size-8"
                style={{
                  backgroundSize: "133.33%",
                  background: "linear-gradient(45deg, #641ea7, #8c53c3)",
                }}
              ></div>
            </div>
          </div>

          {/* Navigation items */}
          <div className="flex flex-col gap-1 w-full">
            {/* Active item - Magic Wand */}
            <div
              className="bg-[rgba(100,30,167,0.15)] border-[0.5px] border-[rgba(97,63,130,0.25)] flex items-center justify-start rounded-[10px]"
              style={{ width: "40px", height: "40px", padding: "8px" }}
            >
              <div className="w-6 h-6 flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M7.5 5.6L10 7L8.6 4.5C8.2 3.8 8.5 3 9.2 3C9.9 3 10.2 3.8 9.8 4.5L8.4 7L10.8 8.4C11.5 8.8 11.5 9.7 10.8 10.1L8.4 11.5L9.8 14C10.2 14.7 9.9 15.5 9.2 15.5C8.5 15.5 8.2 14.7 8.6 14L7.2 11.5L4.8 10.1C4.1 9.7 4.1 8.8 4.8 8.4L7.2 7L8.6 4.5M19.5 18.4L17 17L18.4 19.5C18.8 20.2 18.5 21 17.8 21C17.1 21 16.8 20.2 17.2 19.5L18.6 17L16.2 15.6C15.5 15.2 15.5 14.3 16.2 13.9L18.6 12.5L17.2 10C16.8 9.3 17.1 8.5 17.8 8.5C18.5 8.5 18.8 9.3 18.4 10L19.8 12.5L22.2 13.9C22.9 14.3 22.9 15.2 22.2 15.6L19.8 17L18.4 19.5Z" />
                </svg>
              </div>
            </div>

            {/* Note Pencil */}
            <div
              className="flex items-center justify-start"
              style={{ width: "40px", height: "40px", padding: "8px" }}
            >
              <div className="w-6 h-6 flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z" />
                </svg>
              </div>
            </div>

            {/* Briefcase */}
            <div
              className="flex items-center justify-start"
              style={{ width: "40px", height: "40px", padding: "8px" }}
            >
              <div className="w-6 h-6 flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M10,2H14A2,2 0 0,1 16,4V6H20A2,2 0 0,1 22,8V19A2,2 0 0,1 20,21H4C2.89,21 2,20.1 2,19V8C2,6.89 2.89,6 4,6H8V4C8,2.89 8.89,2 10,2M14,6V4H10V6H14Z" />
                </svg>
              </div>
            </div>

            {/* Chart */}
            <div
              className="flex items-center justify-start"
              style={{ width: "40px", height: "40px", padding: "8px" }}
            >
              <div className="w-6 h-6 flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M16,11V3H21V11H16M10,16V10H15V16H10M4,21V14H9V21H4M3,8V3H8V8H3Z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Profile at bottom */}
        <div
          className="flex items-center justify-start rounded-lg"
          style={{ width: "40px", height: "40px", padding: "8px" }}
        >
          <div className="flex items-center justify-center">
            <div
              className="rounded-full overflow-hidden bg-center bg-cover"
              style={{
                width: "24px",
                height: "24px",
                background: "linear-gradient(45deg, #3b82f6, #8b5cf6)",
              }}
            >
              <div className="w-full h-full flex items-center justify-center text-white text-xs font-semibold">
                A
              </div>
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
    <StarBorder
      as="div"
      className="w-full h-full"
      color="#8b5cf6"
      speed="6s"
      thickness={0}
    >
      <div className="backdrop-blur-[20px] backdrop-filter bg-black/40 w-full h-full flex flex-col justify-between p-4 rounded-[15px] border-none">
        {/* Main input area */}
        <div className="flex flex-wrap gap-2 items-start justify-between min-h-7 px-2 py-0 rounded-xl w-full">
          <textarea
            className=" font-normal text-[14px] text-[#747474] w-full h-full bg-transparent border-none outline-none resize-none placeholder-[#747474] min-h-[80px]"
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
            <div className=" font-normal text-[#ffffff] text-[12px] whitespace-nowrap">
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
              <div className="font-['Inter'] font-normal text-[#2e2e2e] text-[14px] text-center w-full">
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
    <div className=" relative w-full flex ">
      {/* Collapsed Navbar */}

      <div className="left">
        <Navbar state="Collapsed" />
      </div>
      <div className="right flex flex-col w-full">
        {/* Title - positioned exactly as in Figma */}
        <div className="  font-semibold text-[#ffffff] text-[36px] text-center whitespace-nowrap">
          What's on your mind today?
        </div>

        {/* Subtitle - positioned exactly as in Figma */}
        <div className="  font-normal text-[#a2a2a2] text-[14px] text-center whitespace-nowrap">
          Type it. Dream it. Watch it appear!
        </div>

        {/* AI Chat Input - positioned exactly as in Figma */}
        <div className=" w-full max-w-[600px] h-[175px] backdrop-blur-[20px] backdrop-filter bg-[#000000] rounded-[15px]">
          <AiChatInput />
        </div>
      </div>
    </div>
  );
}
