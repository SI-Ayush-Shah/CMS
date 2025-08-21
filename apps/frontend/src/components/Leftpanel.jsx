import { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Button } from "./Button";
import { BsReverseLayoutSidebarReverse } from "react-icons/bs";
import { FaUser, FaSignOutAlt } from "react-icons/fa";
import { PiSignOutLight } from "react-icons/pi";
import { PiChartLineUp, PiMagicWand, PiNotePencilThin } from "react-icons/pi";
import { IoBriefcaseOutline } from "react-icons/io5";
import { MdRssFeed } from "react-icons/md";
import { FaHashtag } from "react-icons/fa";
import useAuthStore from "../store/authStore";
import { GoStack } from "react-icons/go";
import { IoShareSocialOutline } from "react-icons/io5";
import { ImFeed } from "react-icons/im";
import logo from "../assets/logo.png";
export function Leftpanel() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeItemId, setActiveItemId] = useState("creative-wizard");
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const navigationItems = useMemo(
    () => [
      {
        id: "creative-wizard",
        label: "Creative Wizard",
        icon: <PiMagicWand />,
        path: "/wizard",
        matchPaths: ["/wizard", "/creative-wizard"],
      },
      {
        id: "content-hub",
        label: "Content Hub",
        icon: <GoStack />,
        path: "/content-hub",
        matchPaths: ["/content-hub", "/blog"],
      },

      {
        id: "social-media",
        label: "Social Media",
        icon: <IoShareSocialOutline />,
        path: "/social-media",
      },
      {
        id: "feed-manager",
        label: "RSS Feed",
        icon: <ImFeed />,
        path: "/feed-manager",
      },
      {
        id: "analytics",
        label: "Analytics",
        icon: <PiChartLineUp />,
        path: "/analytics",
        matchPaths: ["/analytics", "/components"],
      },
    ],
    []
  );

  const togglePanel = () => {
    setIsExpanded(!isExpanded);
  };

  const handleLogout = () => {
    window.location.href = "/hackathon-2025-content-studio/login";
    logout();
  };

  // Highlight active item based on current route (supports aliases)
  useEffect(() => {
    const matched = navigationItems.find((item) => {
      const paths = item.matchPaths || (item.path ? [item.path] : []);
      return paths.some(
        (p) => location.pathname === p || location.pathname.startsWith(`${p}/`)
      );
    });
    if (matched) setActiveItemId(matched.id);
  }, [location.pathname, navigationItems]);

  return (
    <div
      className={`text-invert-high h-full flex rounded-lg flex-col transition-all duration-300 ease-in-out border border-core-prim-500  ${
        isExpanded ? "w-56" : "w-16"
      }`}
      // style={{background: 'linear-gradient(90deg, rgba(74, 49, 102, 0.4) 0%, rgba(126, 76, 171, 0.05) 100%)'}}
    >
      {/* Header Section */}
      <div className="flex items-center justify-between p-3 ">
        {/* Logo - Clickable to open panel */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => !isExpanded && setIsExpanded(true)}
            className={`w-10 h-10 bg-core-prim-500 rounded-full flex items-center justify-center transition-all duration-200 ${
              !isExpanded
                ? "hover:bg-core-prim-400 cursor-pointer"
                : "cursor-default"
            }`}
          >
            <img src={logo} alt="logo" className="w-full h-full" />
          </button>
        </div>

        {/* Toggle Button - Only show when expanded */}
        {isExpanded && (
          <button
            onClick={togglePanel}
            className="text-core-prim-300 text-[18px]"
          >
            <BsReverseLayoutSidebarReverse />
          </button>
        )}
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-3 space-y-1">
        {navigationItems.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            onClick={() => setActiveItemId(item.id)}
            className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg text-[14px] font-normal group ${
              activeItemId === item.id
                ? "bg-core-prim-500/20 text-invert-high border border-border-main-default/50"
                : "text-text-invert-low hover:text-invert-high"
            }`}
          >
            <span
              className={`flex-shrink-0 text-[24px] group-hover:text-invert-high ${activeItemId === item.id ? "text-invert-high" : "text-text-invert-low"}`}
            >
              {item.icon}
            </span>
            {isExpanded && (
              <span className="truncate text-inherit">{item.label}</span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User Profile Section */}
      <div className=" flex items-center justify-between p-4">
        <div className="flex items-center justify-center gap-3">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0">
            <FaUser />
          </div>
          {isExpanded && (
            <div className="flex-1 min-w-0">
              <p className="text-invert-high text-[14px] font-normal truncate">
                {user?.name || "Admin User"}
              </p>
            </div>
          )}
        </div>

        <div>
          {/* Logout Button */}
          {isExpanded && (
            <a
              href="/login"
              onClick={(e) => {
                e.preventDefault();
                handleLogout();
              }}
              className="w-full  text-[14px] font-normal text-core-prim-300 hover:text-invert-high cursor-pointer"
            >
              <PiSignOutLight className="text-[20px]" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
