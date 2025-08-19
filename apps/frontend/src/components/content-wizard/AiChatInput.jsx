import { memo, useState } from "react";
import StarBorder from "../StarBorder";
import ActionButton from "./ActionButton";

/**
 * AiChatInput Component
 *
 * @param {Object} props - Component props
 * @param {string} props.placeholder - Input placeholder text
 * @param {string} props.value - Controlled input value
 * @param {Function} props.onChange - Input change handler
 * @param {Function} props.onGenerate - Generate button click handler
 * @param {Function} props.onCoverImage - Cover image button click handler
 * @param {string} props.className - Additional CSS classes
 */
function AiChatInput({
  placeholder = "Your blog crafting experience starts here...",
  value,
  onChange = () => {},
  onGenerate = () => {},
  onCoverImage = () => {},
  className = "",
}) {
  const [inputValue, setInputValue] = useState(value || "");

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
  };

  const containerStyle = {
    width: "var(--chat-input-width)",
    height: "var(--chat-input-height)",
    borderRadius: "var(--chat-input-border-radius)",
  };

  const backgroundStyle = {
    background: "var(--chat-input-bg)",
    backdropFilter: `blur(var(--chat-input-backdrop-blur))`,
    padding: "var(--chat-input-padding)",
    borderRadius: "var(--chat-input-border-radius)",
  };

  return (
    <div className={className} style={containerStyle}>
      <StarBorder
        as="div"
        className="w-full h-full"
        color="#8b5cf6"
        speed="6s"
        thickness={0}
      >
        <div
          className="w-full h-full flex flex-col justify-between border-none"
          style={backgroundStyle}
        >
          {/* Main input area */}
          <div className="flex flex-wrap gap-2 items-start justify-between min-h-7 px-2 py-0 rounded-xl w-full">
            <textarea
              className="font-normal text-[14px] w-full h-full bg-transparent border-none outline-none resize-none min-h-[80px] placeholder:text-[#747474] text-[#747474]"
              placeholder={placeholder}
              value={inputValue}
              onChange={handleInputChange}
              style={{ lineHeight: "normal" }}
              aria-label="Content input"
            />
          </div>

          {/* Bottom buttons */}
          <div className="flex flex-wrap gap-2 items-center justify-between min-h-7 p-0 rounded-xl w-full">
            <ActionButton
              type="cover-image"
              label="Cover Image"
              onClick={onCoverImage}
            />

            <ActionButton type="generate" label="" onClick={onGenerate} />
          </div>
        </div>
      </StarBorder>
    </div>
  );
}

export default memo(AiChatInput);
