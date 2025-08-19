import { memo } from "react";

// Icon paths from Figma specifications
const ICON_PATHS = {
  magicWand:
    "M7.5 5.6L10 7L8.6 4.5C8.2 3.8 8.5 3 9.2 3C9.9 3 10.2 3.8 9.8 4.5L8.4 7L10.8 8.4C11.5 8.8 11.5 9.7 10.8 10.1L8.4 11.5L9.8 14C10.2 14.7 9.9 15.5 9.2 15.5C8.5 15.5 8.2 14.7 8.6 14L7.2 11.5L4.8 10.1C4.1 9.7 4.1 8.8 4.8 8.4L7.2 7L8.6 4.5M19.5 18.4L17 17L18.4 19.5C18.8 20.2 18.5 21 17.8 21C17.1 21 16.8 20.2 17.2 19.5L18.6 17L16.2 15.6C15.5 15.2 15.5 14.3 16.2 13.9L18.6 12.5L17.2 10C16.8 9.3 17.1 8.5 17.8 8.5C18.5 8.5 18.8 9.3 18.4 10L19.8 12.5L22.2 13.9C22.9 14.3 22.9 15.2 22.2 15.6L19.8 17L18.4 19.5Z",
  notePencil:
    "M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z",
  briefcase:
    "M10,2H14A2,2 0 0,1 16,4V6H20A2,2 0 0,1 22,8V19A2,2 0 0,1 20,21H4C2.89,21 2,20.1 2,19V8C2,6.89 2.89,6 4,6H8V4C8,2.89 8.89,2 10,2M14,6V4H10V6H14Z",
  chartLineUp:
    "M16,11V3H21V11H16M10,16V10H15V16H10M4,21V14H9V21H4M3,8V3H8V8H3Z",
  paperclip:
    "M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z",
  round:
    "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z",
};

/**
 * Icon Component
 *
 * @param {Object} props - Component props
 * @param {string} props.name - Icon name from ICON_PATHS
 * @param {number} props.size - Icon size in pixels (default: 24)
 * @param {string} props.color - Icon color (default: currentColor)
 * @param {string} props.className - Additional CSS classes
 */
function Icon({ name, size = 24, color = "currentColor", className = "" }) {
  const iconPath = ICON_PATHS[name];

  if (!iconPath) {
    console.warn(`Icon "${name}" not found in ICON_PATHS`);
    return null;
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      className={className}
      role="img"
      aria-hidden="true"
    >
      <path d={iconPath} />
    </svg>
  );
}

export default memo(Icon);
