import { ImgHTMLAttributes } from "react";

export interface AvatarProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "alt"> {
  name?: string;
  alt?: string;
  size?: number;
}

export function Avatar({ name, alt, size = 32, src, className = "", ...rest }: AvatarProps) {
  const initials = (name || "?")
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (src) {
    return (
      <img
        src={src}
        width={size}
        height={size}
        alt={alt || name || "avatar"}
        className={`rounded-full object-cover ${className}`.trim()}
        {...rest}
      />
    );
  }

  return (
    <span
      style={{ width: size, height: size }}
      className={`inline-flex items-center justify-center rounded-full bg-core-prim-500 text-invert-high text-[12px] ${className}`.trim()}
    >
      {initials}
    </span>
  );
}


