import React, { useCallback, useMemo, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "../components/Button";
import { contentApi } from "../services/contentApi";
import EditorJsRenderer from "../components/EditorJsRenderer";
import RightPanel from "../components/RightPanel";
import { normalizeEditorJsBody } from "../utils";

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

  // Read-only dummy content for the editor preview (LHS)
  const dummyTitle = "Virat Kohli: A Career Unforgettable—and Unfulfilled";
  const dummyBody = `Virat Kohli's retirement from Tests has left Indian cricket beleaguered and the sporting world gasping in surprise.\n\nComing on the heels of captain Rohit Sharma quitting a few days earlier, it adds up to a double whammy for India who embark on a tough tour of England for a five-Test series come June without their two most experienced batters.\n\nLike Sharma, Kohli took to Instagram, where he commands more than 270 million followers, to make his retirement public. "As I step away from this format, it's not easy – but it feels right..." he explained to his disconsolate fans.\n\nTributes for Kohli have come in a deluge since: from fellow cricketers, past and present, old and young, and also legends from other disciplines like tennis ace Novak Djokovic and football star Harry Kane, which highlights the sweep and heft of Kohli's global appeal.\n\nLeading India to victory in the Under-19 World Cup in 2008, Kohli was fast tracked into international cricket by the then-chairman of selectors, former India captain Dilip Vengsarkar, against the judgement of others in the cricket establishment.`;
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
  const [editorBody, setEditorBody] = useState(currentBody || null);
  useEffect(() => {
    setEditorBody(currentBody || null);
  }, [currentBody]);

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

  const handleRefinementApplied = useCallback(
    async (updatedBody) => {
      try {
        const blogId = article?.id;
        const normalized = normalizeEditorJsBody(updatedBody);
        setEditorBody(normalized);
        if (blogId) {
          await contentApi.updateBlogContent(blogId, normalized);
          showMessage("Refinement saved.");
        } else {
          showMessage("Refinement applied to preview.");
        }
      } catch (err) {
        showMessage(err?.message || "Failed to save refinement.", "error");
      }
    },
    [article?.id, showMessage]
  );

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
          <div className="flex items-center justify-between mb-5 rounded-md border border-core-prim-300/20 bg-core-neu-1000/40 px-4 py-2 sticky top-2 z-10 backdrop-blur-lg">
            <div className="text-[20px] flex flex-col font-semibold text-invert-high">
              Creative Wizard{" "}
              {id && (
                <span className="text-[12px] text-invert-low">#{id}</span>
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
          <div className="px-3">
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

          <div className="px-3">
            <p className="text-xs text-invert-low mb-2">Body</p>
            <div className="">
              {editorBody ? (
                <EditorJsRenderer data={editorBody} />
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

        {/* Right Panel */}
        <RightPanel
          blogId={article?.id}
          body={editorBody || currentBody}
          onRefinement={handleRefinementApplied}
        />
      </div>
    </div>
  );
}
