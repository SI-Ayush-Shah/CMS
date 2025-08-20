import React from "react";
import { useProcessingStore } from "../store/processingStore";
import { EnhancedAiChatInput } from "./EnhancedAiChatInput";
import RightPanel from "./RightPanel";
import Loader from "./Loader";

export default function ProcessingView() {
  // intentionally not reading store values to avoid unused warnings
  void useProcessingStore;
  return (
    <div className="w-full flex h-screen">
      {/* Center preview placeholder */}
      <div className="w-full flex items-center justify-center">
        <Loader text="Creating Magic..." />
      </div>

      {/* Right prompt panel */}

      {/* Common chat input */}
      <div className="w-[45%] h-full">
        <RightPanel />
      </div>
    </div>
  );
}
