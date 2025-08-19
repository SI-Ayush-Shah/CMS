import React, { useCallback, useMemo, useState } from "react";
import { EnhancedAiChatInput } from "../components/EnhancedAiChatInput";
import { Button } from "../components/Button";
import { contentApi } from "../services/contentApi";

/**
 * Content Editor Page
 *
 * UI inspired by the provided Figma. Left column contains the editor:
 * - Cover Image (single image)
 * - Title
 * - Body
 * - Actions (Save to drafts / Publish)
 *
 * Right column contains an assistant panel using the existing
 * EnhancedAiChatInput for ideation/help while writing.
 */
export default function ContentEditorPage() {
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // 'success' | 'error'
  const [isContentExpanded, setIsContentExpanded] = useState(false);

  // Read-only dummy content for the editor preview (LHS)
  const dummyTitle = "Virat Kohli: A Career Unforgettable—and Unfulfilled";
  const dummyBody = `Virat Kohli\'s retirement from Tests has left Indian cricket beleaguered and the sporting world gasping in surprise.\n\nComing on the heels of captain Rohit Sharma quitting a few days earlier, it adds up to a double whammy for India who embark on a tough tour of England for a five-Test series come June without their two most experienced batters.\n\nLike Sharma, Kohli took to Instagram, where he commands more than 270 million followers, to make his retirement public. \"As I step away from this format, it\'s not easy – but it feels right...\" he explained to his disconsolate fans.\n\nTributes for Kohli have come in a deluge since: from fellow cricketers, past and present, old and young, and also legends from other disciplines like tennis ace Novak Djokovic and football star Harry Kane, which highlights the sweep and heft of Kohli\'s global appeal.\n\nLeading India to victory in the Under-19 World Cup in 2008, Kohli was fast tracked into international cricket by the then-chairman of selectors, former India captain Dilip Vengsarkar, against the judgement of others in the cricket establishment.`;
  const dummyImageUrl = useMemo(
    () =>
      "https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=1600&auto=format&fit=crop",
    []
  );

  const showMessage = useCallback((text, type = "success") => {
    setMessage(text);
    setMessageType(type);
    window.setTimeout(
      () => {
        setMessage("");
        setMessageType("");
      },
      type === "success" ? 4000 : 6000
    );
  }, []);

  const validate = useCallback(() => {
    if (!dummyTitle.trim()) {
      showMessage("Please add a title.", "error");
      return false;
    }
    if (!dummyBody.trim()) {
      showMessage("Please write the body content.", "error");
      return false;
    }
    return true;
  }, [dummyTitle, dummyBody, showMessage]);

  const handleSaveDraft = useCallback(async () => {
    if (!validate()) return;
    try {
      setIsSavingDraft(true);
      const res = await contentApi.saveContent({
        text: `${dummyTitle}\n\n${dummyBody}`,
        imageIds: [],
        metadata: { status: "draft" },
      });
      showMessage("Saved to drafts successfully.");
      return res;
    } catch (err) {
      showMessage(err?.message || "Failed to save draft.", "error");
    } finally {
      setIsSavingDraft(false);
    }
  }, [validate, dummyTitle, dummyBody, showMessage]);

  const handlePublish = useCallback(async () => {
    if (!validate()) return;
    try {
      setIsPublishing(true);
      const res = await contentApi.saveContent({
        text: `${dummyTitle}\n\n${dummyBody}`,
        imageIds: [],
        metadata: { status: "published" },
      });
      showMessage("Published successfully.");
      return res;
    } catch (err) {
      showMessage(err?.message || "Failed to publish.", "error");
    } finally {
      setIsPublishing(false);
    }
  }, [validate, dummyTitle, dummyBody, showMessage]);

  return (
    <div className="w-full h-full">
      {/* Message */}
      {message && (
        <div
          className={`mb-4 p-3 rounded-lg text-sm ${
            messageType === "success"
              ? "bg-success-500/10 border border-success-500/20 text-success-500"
              : "bg-error-500/10 border border-error-500/20 text-error-400"
          }`}
        >
          {message}
        </div>
      )}

      <div className="flex flex-1 w-full gap-3 h-full">
        <div className="w-[55%] gap-6 w-full">
          {/* Editor column */}
          <section className="lg:col-span-2 space-y-5 p-2 ">
            {/* Header with actions */}

            <div className="flex items-center sticky top-2 z-10 justify-between mb-6 rounded-2xl border border-core-prim-300/20 px-4 py-2 bg-core-prim-900">
              <div className="text-[20px] font-semibold text-invert-high">
                Creative Wizard
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={handleSaveDraft}
                  isLoading={isSavingDraft}
                  className="min-w-40"
                >
                  Save to drafts
                </Button>
                <Button
                  variant="outline"
                  onClick={handlePublish}
                  isLoading={isPublishing}
                  className="min-w-36"
                >
                  Publish
                </Button>
              </div>
            </div>

            <div className="px-3 overflow-y-auto">
              <div className="">
                <p className="text-xs text-invert-low mb-2">Image</p>
                <div className="w-full">
                  <div className="relative w-[90%] overflow-hidden rounded-2xl border border-core-prim-300/20">
                    <img
                      src={dummyImageUrl}
                      alt="Cover preview"
                      className="w-full aspect-[16/10] object-cover"
                    />
                  </div>
                </div>
              </div>

              <div className="py-3">
                <p className="text-xs text-invert-low mb-2">Title</p>
                <h1 className="font-semibold text-invert-high text-[22px] sm:text-[24px] lg:text-[26px] leading-8">
                  {dummyTitle}
                </h1>
              </div>

              <div className="">
                <p className="text-xs text-invert-low mb-2">Body</p>
                <div className="">
                  {dummyBody.split("\n").map((para, idx) => (
                    <p
                      key={idx}
                      className="text-main-medium text-[14px] leading-7 mb-2 last:mb-0"
                    >
                      {para}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Assistant column */}
        <div className=" w-[45%] bg-black h-screen sticky top-0 p-2">
          <div className="flex flex-col h-full ">
            <div className="flex-1 overflow-y-auto w-full h-[calc(100vh-110px)]">
              <div className="h-full w-full flex flex-col items-end gap-2">
              <div 
                className={`rounded-2xl bg-button-filled-main-default border border-core-prim-300/20 p-2 cursor-pointer transition-all duration-200 ${
                  isContentExpanded ? 'min-h-fit' : 'h-[164px]'
                } overflow-hidden w-[80%]`}
                onClick={() => setIsContentExpanded(!isContentExpanded)}
              >
                <p className={`text-[12px] text-invert-low ${
                  !isContentExpanded ? 'line-clamp-8' : ''
                }`}>
                  Write a 500–700 word professional sports news article on the
                  chosen topic. Include a strong headline, introduction, match
                  highlights, statistics, and realistic quotes (not fabricated)
                  in an engaging yet objective tone. Provide contextual analysis
                  of impact on team momentum and the ongoing tournament.
                  Structure with a clear beginning, middle, and conclusion.
                </p>
                
                {!isContentExpanded && (
                  <div className="text-[10px] text-invert-low mt-2 text-center">
                    Click to expand
                  </div>
                )}
              </div>
              <div 
                className={`rounded-2xl bg-button-filled-main-default border border-core-prim-300/20 p-2 cursor-pointer transition-all duration-200 ${
                  isContentExpanded ? 'min-h-fit' : 'h-[164px]'
                } overflow-hidden w-[80%]`}
                onClick={() => setIsContentExpanded(!isContentExpanded)}
              >
                <p className={`text-[12px] text-invert-low ${
                  !isContentExpanded ? 'line-clamp-8' : ''
                }`}>
                  Write a 500–700 word professional sports news article on the
                  chosen topic. Include a strong headline, introduction, match
                  highlights, statistics, and realistic quotes (not fabricated)
                  in an engaging yet objective tone. Provide contextual analysis
                  of impact on team momentum and the ongoing tournament.
                  Structure with a clear beginning, middle, and conclusion.
                </p>
                
                {!isContentExpanded && (
                  <div className="text-[10px] text-invert-low mt-2 text-center">
                    Click to expand
                  </div>
                )}
              </div>
              </div>
            </div>
            {/* Bottom-aligned chat input */}
            <div className="rounded-2xl bg-button-filled-main-default border h-[150px] w-full border-core-prim-300/20">
              <EnhancedAiChatInput
                placeholder="Your blog crafting experience starts here..."
                maxLength={2000}
                maxImages={10}
                validationOptions={{
                  text: { required: true, maxLength: 2000 },
                  images: { required: false, maxImages: 10 },
                }}
                onSubmit={() => {
                  /* keep local; authoring helper only */
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
