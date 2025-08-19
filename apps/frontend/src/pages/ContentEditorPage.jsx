import React, { useCallback, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { EnhancedAiChatInput } from "../components/EnhancedAiChatInput";
import { Button } from "../components/Button";
import { contentApi } from "../services/contentApi";
import EditorJsRenderer from "../components/EditorJsRenderer";

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
  const { id } = useParams();
  const { data: article } = useQuery({
    queryKey: ["article", id],
    queryFn: () => contentApi.getContent(id),
    enabled: !!id,
  });

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

  const currentTitle = article?.title || dummyTitle;
  const currentBanner = article?.bannerUrl || dummyImageUrl;
  const currentBody = article?.body;

  const validate = useCallback(() => {
    if (!currentTitle.trim()) {
      showMessage("Please add a title.", "error");
      return false;
    }
    if (!currentBody && !dummyBody.trim()) {
      showMessage("Please write the body content.", "error");
      return false;
    }
    return true;
  }, [currentTitle, currentBody, dummyBody, showMessage]);

  const handleSaveDraft = useCallback(async () => {
    if (!validate()) return;
    try {
      setIsSavingDraft(true);
      const res = await contentApi.saveContent({
        text: article ? currentTitle : `${dummyTitle}\n\n${dummyBody}`,
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
        text: article ? currentTitle : `${dummyTitle}\n\n${dummyBody}`,
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editor column */}
        <section className="lg:col-span-2 space-y-5">
          {/* Header with actions */}
          <div className="flex items-center justify-between mb-5 rounded-2xl border border-core-prim-300/20 bg-core-neu-1000/40 px-4 py-3">
            <div className="text-[20px] font-semibold text-invert-high">
              Creative Wizard {id && (
                <span className="ml-2 text-[12px] text-invert-low">#{id}</span>
              )}
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
                variant="solid"
                onClick={handlePublish}
                isLoading={isPublishing}
                className="min-w-36"
              >
                Publish
              </Button>
            </div>
          </div>
          <div>
            <p className="text-xs text-invert-low mb-2">Image</p>
            <div className="w-full">
              <div className="relative w-full overflow-hidden rounded-2xl border border-core-prim-300/20">
                <img
                  src={currentBanner}
                  alt="Cover preview"
                  className="w-full aspect-[16/10] object-cover"
                />
              </div>
            </div>
          </div>

          <div>
            <p className="text-xs text-invert-low mb-2">Title</p>
            <h1 className="font-semibold text-invert-high text-[22px] sm:text-[24px] lg:text-[26px] leading-8">
              {currentTitle}
            </h1>
          </div>

          <div>
            <p className="text-xs text-invert-low mb-2">Body</p>
            <div className="">
              {currentBody ? (
                <EditorJsRenderer data={currentBody} />
              ) : (
                dummyBody.split("\n").map((para, idx) => (
                  <p
                    key={idx}
                    className="text-main-medium text-[14px] leading-7 mb-2 last:mb-0"
                  >
                    {para}
                  </p>
                ))
              )}
            </div>
          </div>
        </section>

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
