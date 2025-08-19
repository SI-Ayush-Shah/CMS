import { memo } from "react";
import GradientOrb from "../ui/GradientOrb";

/**
 * ContentWizardLayout Component - Main layout structure for Content Wizard page
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.navbar - Navbar component
 * @param {React.ReactNode} props.title - Page title component
 * @param {React.ReactNode} props.subtitle - Page subtitle component
 * @param {React.ReactNode} props.chatInput - AI chat input component
 * @param {React.ReactNode} props.children - Additional content
 * @param {string} props.className - Additional CSS classes
 */
function ContentWizardLayout({
  navbar,
  title,
  subtitle,
  chatInput,
  children,
  className = "",
}) {
  const layoutStyle = {
    background: "var(--content-wizard-bg)",
  };

  return (
    <div
      className={`relative w-full min-h-screen flex ${className}`}
      style={layoutStyle}
    >
      {/* Background gradient orbs */}
      <GradientOrb size={800} top="10%" left="-20%" opacity={0.15} />
      <GradientOrb size={600} bottom="20%" right="-15%" opacity={0.1} />

      {/* Navbar Section */}
      {navbar && <div className="left shrink-0">{navbar}</div>}

      {/* Main Content Section */}
      <div className="right flex flex-col w-full items-center justify-center gap-6 p-8">
        {/* Title Section */}
        {title && (
          <div className="flex flex-col items-center gap-2">
            {title}
            {subtitle}
          </div>
        )}

        {/* Chat Input Section */}
        {chatInput && <div className="w-full max-w-[600px]">{chatInput}</div>}

        {/* Additional Content */}
        {children}
      </div>
    </div>
  );
}

export default memo(ContentWizardLayout);
