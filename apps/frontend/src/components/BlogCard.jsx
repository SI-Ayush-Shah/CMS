import React from "react";
import { Button } from "./Button";

const BlogCard = ({
  image = "",
  date = "",
  title = "",
  description = "",
  ctaText = "Read more",
  onCtaClick,
  className = "",
}) => {
  const formatDate = (value) => {
    try {
      const d = new Date(value);
      if (Number.isNaN(d.getTime())) return value;
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(d);
    } catch {
      return value;
    }
  };
  
  return (
    <div
      className={`flex flex-col h-full ${className}`}
    >
      {/* Part 1: Image (Top) */}
      <div className="relative w-full aspect-[16/9] overflow-hidden rounded-[10px] mb-4">
        {image && (
          <img
            src={image}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 rounded-[10px]"
          />
        )}
      </div>

      {/* Part 2: Content (Middle - Flexible) */}
      <div className="flex-1 flex flex-col gap-3 min-h-0 px-2">
        {/* Date */}
        {date && (
          <div className="text-text-main-medium text-[12px]">
            <p className="block" style={{ lineHeight: "1.36", margin: 0 }}>
              {formatDate(date)}
            </p>
          </div>
        )}

        {/* Title */}
        {title && (
          <div className="text-white text-[16px]">
            <h3
              className="block transition-colors duration-200"
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 600,
                lineHeight: "20px",
                margin: 0,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {title}
            </h3>
          </div>
        )}

        {/* Description */}
        {description && (
          <div className="text-[14px] text-text-main-medium">
            <p
              style={{
                fontFamily: "'Montserrat', sans-serif",
                lineHeight: "20px",
                margin: 0,
                display: "-webkit-box",
                WebkitLineClamp: 4,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {description}
            </p>
          </div>
        )}
      </div>

      {/* Part 3: Button (Bottom) */}
      <div className="flex gap-2 items-center justify-start w-full max-w-max mt-4 px-2">
        <Button variant="solid" size="sm" onClick={onCtaClick} className="!rounded-lg">
          {ctaText}
        </Button>
      </div>
    </div>
  );
};

export default BlogCard;


