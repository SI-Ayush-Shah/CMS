import { memo, useState } from "react";
import NavItem from "./NavItem";
import ProfileSection from "./ProfileSection";

// Navigation items configuration
const NAV_ITEMS = [
  { id: "magic-wand", icon: "magicWand" },
  { id: "note-pencil", icon: "notePencil" },
  { id: "briefcase", icon: "briefcase" },
  { id: "chart", icon: "chartLineUp" },
];

/**
 * CollapsedNavbar Component
 *
 * @param {Object} props - Component props
 * @param {string} props.activeItem - Currently active item ID (default: "magic-wand")
 * @param {Function} props.onItemClick - Handler for nav item clicks
 * @param {string} props.userInitial - User initial for profile (default: "A")
 * @param {string} props.className - Additional CSS classes
 */
function CollapsedNavbar({
  activeItem = "magic-wand",
  onItemClick = () => {},
  userInitial = "A",
  className = "",
}) {
  const [currentActive, setCurrentActive] = useState(activeItem);

  const handleItemClick = (itemId) => {
    setCurrentActive(itemId);
    onItemClick(itemId);
  };

  const containerStyle = {
    width: "var(--navbar-collapsed-width)",
    height: "var(--navbar-height)",
    background: "var(--navbar-bg-gradient)",
    border: "var(--navbar-border-width) solid var(--navbar-border-color)",
    borderRadius: "var(--navbar-border-radius)",
    padding: "var(--navbar-padding)",
  };

  return (
    <div
      className={`w-full h-full flex flex-col justify-between ${className}`}
      style={containerStyle}
    >
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
            />
          </div>
        </div>

        {/* Navigation items */}
        <div className="flex flex-col gap-1 w-full">
          {NAV_ITEMS.map((item) => (
            <NavItem
              key={item.id}
              icon={item.icon}
              isActive={currentActive === item.id}
              onClick={() => handleItemClick(item.id)}
            />
          ))}
        </div>
      </div>

      {/* Profile at bottom */}
      <ProfileSection initial={userInitial} />
    </div>
  );
}

export default memo(CollapsedNavbar);
