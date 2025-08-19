import { useState } from "react";
import CollapsedNavbar from "../components/navigation/CollapsedNavbar";
import ContentWizardLayout from "../components/content-wizard/ContentWizardLayout";
import AiChatInput from "../components/content-wizard/AiChatInput";
import PageTitle from "../components/typography/PageTitle";
import PageSubtitle from "../components/typography/PageSubtitle";

/**
 * ContentWizardPage - Refactored to use modular component architecture
 *
 * This page uses the new modular components while maintaining the exact same
 * visual appearance and functionality as the original implementation.
 */
export default function ContentWizardPage() {
  const [inputValue, setInputValue] = useState("");
  const [activeNavItem, setActiveNavItem] = useState("magic-wand");

  const handleInputChange = (value) => {
    setInputValue(value);
  };

  const handleGenerate = () => {
    if (inputValue.trim()) {
      console.log("Generate content:", inputValue);
      // Add generate logic here
    }
  };

  const handleCoverImage = () => {
    console.log("Add cover image");
    // Add cover image logic here
  };

  const handleNavItemClick = (itemId) => {
    setActiveNavItem(itemId);
    console.log("Nav item clicked:", itemId);
    // Add navigation logic here
  };

  return (
    <ContentWizardLayout
      navbar={
        <CollapsedNavbar
          activeItem={activeNavItem}
          onItemClick={handleNavItemClick}
          userInitial="A"
        />
      }
      title={<PageTitle>What's on your mind today?</PageTitle>}
      subtitle={
        <PageSubtitle>Type it. Dream it. Watch it appear!</PageSubtitle>
      }
      chatInput={
        <AiChatInput
          placeholder="Your blog crafting experience starts here..."
          value={inputValue}
          onChange={handleInputChange}
          onGenerate={handleGenerate}
          onCoverImage={handleCoverImage}
        />
      }
    />
  );
}
