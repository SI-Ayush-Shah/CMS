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
  return (
    <div
      className={`inline-grid leading-[0] place-items-start relative shrink-0 ${className}`}
      style={{ gridColumns: "max-content", gridRows: "max-content" }}
    >
      {/* Image (16:9) */}
      <div
        className="relative w-full aspect-[16/9] overflow-hidden rounded-[10px]"
        style={{ gridArea: "1 / 1" }}
      >
        {image && (
          <img
            src={image}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 rounded-[10px]"
          />
        )}
      </div>

      {/* Content */}
      <div
        className="flex flex-col gap-4 items-start justify-start relative"
        style={{ gridArea: "1 / 1", marginTop: "calc((100%/16)*9)", padding: "12px", width: "100%" }}
      >
        {/* Text Block */}
        <div
          className="flex flex-col gap-3 items-center justify-start leading-[0] relative shrink-0 w-full"
          style={{ height: "149px" }}
        >
          {/* Date */}
          {date && (
            <div className="flex flex-col justify-center text-white text-[12px] w-full">
              <p className="block" style={{ fontFamily: "'Poppins', sans-serif", lineHeight: "1.36", margin: 0 }}>
                {date}
              </p>
            </div>
          )}

          {/* Title */}
          {title && (
            <div className="flex flex-col justify-center text-white text-[16px] w-full">
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
            <div className="text-[14px] w-full" style={{ color: "#a2a2a2" }}>
              <p
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  lineHeight: "20px",
                  margin: 0,
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {description}
              </p>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="flex gap-2 items-center justify-start w-full max-w-max">
          <Button variant="solid" size="md" onClick={onCtaClick} className="!rounded-lg">
            {ctaText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BlogCard;


