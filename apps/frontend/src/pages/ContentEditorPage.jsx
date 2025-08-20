import React, { useCallback, useMemo, useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { contentApi } from "../services/contentApi";
import EditorJsEditor from "../components/EditorJsEditor";
import EditorJsRenderer from "../components/EditorJsRenderer";
import RightPanel from "../components/RightPanel";
import Loader from "../components/Loader";
import { normalizeEditorJsBody } from "../utils";
import { useAutoResize } from "../hooks/useAutoResize";

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
  const location = useLocation();
  const rssFeedItem = location.state?.rssFeedItem;
  const isSummarizeMode = location.state?.mode === "summarize";

  // State for summarization loading
  const [isSummarizing, setIsSummarizing] = useState(false);

  const { data: article } = useQuery({
    queryKey: ["article", id],
    queryFn: () => contentApi.getContent(id),
    enabled: !!id && id !== "new",
  });

  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // 'success' | 'error'
  const [viewMode, setViewMode] = useState("edit"); // 'edit' | 'preview'

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
  const currentBanner =
    article?.bannerUrl ||
    location.state?.generatedContent?.bannerUrl ||
    rssFeedItem?.imageUrl ||
    dummyImageUrl;
  const currentBody = article?.body;
  const [editorBody, setEditorBody] = useState(currentBody || null);
  const [editorMountKey, setEditorMountKey] = useState(0);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState([]);
  // Auto-resize for summary textarea
  const { textareaRef: summaryRef } = useAutoResize(summary, {
    minHeight: 120,
    maxHeight: 400,
  });
  // Effect to handle RSS feed item summarization
  useEffect(() => {
    const processSummarization = async () => {
      if (rssFeedItem && isSummarizeMode && !isSummarizing) {
        try {
          setIsSummarizing(true);
          showMessage("Summarizing content...", "info");

          // Set initial values from RSS item
          setTitle(rssFeedItem.title || "");
          setSummary(rssFeedItem.summary || "");

          // Call the summarize API
          const response = await contentApi.summarizeContent(
            rssFeedItem,
            rssFeedItem.imageUrl
          );

          if (response && response.success && response.data) {
            showMessage("Content summarized successfully!", "success");

            // Extract generatedContent from the response
            const { generatedContent } = response.data;

            if (generatedContent) {
              // Update title, summary, category, tags
              setTitle(generatedContent.title || rssFeedItem.title || "");
              setSummary(generatedContent.summary || rssFeedItem.summary || "");
              setCategory(generatedContent.category || "");
              setTags(
                Array.isArray(generatedContent.tags)
                  ? generatedContent.tags
                  : []
              );

              // Update editor body
              if (generatedContent.body) {
                setEditorBody(generatedContent.body);
                setEditorMountKey((k) => k + 1);
              }
            }
          } else {
            showMessage(
              "Failed to summarize content. Using original content.",
              "error"
            );
          }
        } catch (error) {
          console.error("Error summarizing content:", error);
          showMessage("Error summarizing content. Please try again.", "error");
        } finally {
          setIsSummarizing(false);
        }
      }
    };

    processSummarization();
  }, [rssFeedItem, isSummarizeMode, isSummarizing, showMessage]);

  // Effect to handle article data changes
  useEffect(() => {
    setEditorBody(currentBody || null);
    setTitle(article?.title || rssFeedItem?.title || "");
    setSummary(article?.summary || rssFeedItem?.summary || "");
    setCategory(article?.category || "");
    setTags(Array.isArray(article?.tags) ? article.tags : []);
    setEditorMountKey((k) => k + 1);
  }, [
    currentBody,
    article?.title,
    article?.summary,
    article?.category,
    article?.tags,
    rssFeedItem,
  ]);

  const initialEditorData = useMemo(() => {
    if (editorBody) return editorBody;
    if (currentBody) return currentBody;
    const blocks = dummyBody
      .split("\n")
      .filter(Boolean)
      .map((p) => ({
        id: Math.random().toString(36).slice(2),
        type: "paragraph",
        data: { text: p },
      }));
    return { time: Date.now(), blocks, version: "2.30.7" };
  }, [editorBody, currentBody, dummyBody]);

  const handleEditorChange = useCallback((data) => {
    const normalized = normalizeEditorJsBody(data);
    setEditorBody(normalized);
  }, []);

  const validate = useCallback(() => {
    if (!(title || currentTitle).trim()) {
      showMessage("Please add a title.", "error");
      return false;
    }
    const hasEditorBlocks =
      Array.isArray(editorBody?.blocks) && editorBody.blocks.length > 0;
    if (!hasEditorBlocks && !dummyBody.trim()) {
      showMessage("Please write the body content.", "error");
      return false;
    }
    return true;
  }, [title, currentTitle, editorBody, dummyBody, showMessage]);

  const handleSaveDraft = useCallback(async () => {
    if (!validate()) return;
    try {
      setIsSavingDraft(true);
      if (id) {
        const payload = {
          title: title || currentTitle,
          summary: summary || undefined,
          category: category || undefined,
          tags: tags.length ? tags : undefined,
          body: editorBody || currentBody,
        };
        const res = await contentApi.patchContent(id, payload);
        showMessage("Draft updated successfully.");
        return res;
      } else {
        const res = await contentApi.saveContent({
          text: `${dummyTitle}\n\n${dummyBody}`,
          imageIds: [],
          metadata: { status: "draft" },
        });
        showMessage("Saved to drafts successfully.");
        return res;
      }
    } catch (err) {
      showMessage(err?.message || "Failed to save draft.", "error");
    } finally {
      setIsSavingDraft(false);
    }
  }, [
    validate,
    dummyTitle,
    dummyBody,
    showMessage,
    id,
    editorBody,
    title,
    summary,
    category,
    tags,
    currentTitle,
    currentBody,
  ]);

  const handlePublish = useCallback(async () => {
    if (!validate()) return;
    try {
      setIsPublishing(true);
      if (id) {
        const payload = {
          title: title || currentTitle,
          summary: summary || undefined,
          category: category || undefined,
          tags: tags.length ? tags : undefined,
          body: editorBody || currentBody,
        };
        const res = await contentApi.patchContent(id, payload);
        showMessage("Content updated.");
        return res;
      } else {
        const res = await contentApi.saveContent({
          text: `${dummyTitle}\n\n${dummyBody}`,
          imageIds: [],
          metadata: { status: "published" },
        });
        showMessage("Published successfully.");
        return res;
      }
    } catch (err) {
      showMessage(err?.message || "Failed to publish.", "error");
    } finally {
      setIsPublishing(false);
    }
  }, [
    validate,
    dummyTitle,
    dummyBody,
    showMessage,
    id,
    editorBody,
    title,
    summary,
    category,
    tags,
    currentTitle,
    currentBody,
  ]);

  const handleRefinementApplied = useCallback(
    async (updatedBody) => {
      try {
        const blogId = article?.id;
        const normalized = normalizeEditorJsBody(updatedBody);
        setEditorBody(normalized);
        setEditorMountKey((k) => k + 1);
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
          className={`mb-4 p-3 rounded-lg text-sm border ${
            messageType === "success"
              ? "bg-success-500/10 border-success-500/20 text-success-500"
              : messageType === "error"
                ? "bg-error-500/10 border-error-500/20 text-error-400"
                : "bg-core-prim-500/10 border-core-prim-500/20 text-core-prim-400"
          }`}
          role="status"
          aria-live={messageType === "error" ? "assertive" : "polite"}
        >
          {message}
        </div>
      )}

      {/* Removed full-screen overlay */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editor column */}
        <section className="lg:col-span-2 space-y-5">
          {/* Header with title, status, updated at, and actions only */}
          <div className=" max-w-[860px] mx-auto mb-5 rounded-xl border border-core-prim-300/20 bg-core-neu-1000/40 px-4 py-3 sticky top-0 z-10 backdrop-blur-lg shadow">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex flex-col">
                  <label
                    htmlFor="title"
                    className="text-[11px] text-invert-low mb-1"
                  >
                    Title
                  </label>
                  <Input
                    id="title"
                    placeholder="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="text-[18px] font-semibold"
                  />
                </div>
                {article?.updatedAt && (
                  <div className="text-[11px] text-invert-low mt-1">
                    Updated {new Date(article.updatedAt).toLocaleString()}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3 mt-2 md:mt-0">
                {article?.status && (
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full border ${
                      article.status === "published"
                        ? "bg-success-500/10 border-success-500/20 text-success-400"
                        : "bg-warning-500/10 border-warning-500/20 text-warning-400"
                    }`}
                  >
                    {article.status}
                  </span>
                )}
                <Button
                  variant="outline"
                  onClick={handleSaveDraft}
                  isLoading={isSavingDraft}
                  className="min-w-28"
                >
                  Save draft
                </Button>
                <Button
                  variant="solid"
                  onClick={handlePublish}
                  isLoading={isPublishing}
                  className="min-w-24"
                >
                  Publish
                </Button>
              </div>
            </div>
          </div>

          <div className=" max-w-[860px] mx-auto">
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

          <div className=" max-w-[860px] mx-auto">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-invert-low">Body</p>
              <div
                className="flex items-center rounded-md overflow-hidden border border-core-prim-300/20"
                role="tablist"
                aria-label="Editor mode"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={viewMode === "edit"}
                  className={`px-3 py-1.5 text-[12px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-core-prim-500 ${
                    viewMode === "edit"
                      ? "bg-core-prim-500/20 text-invert-high"
                      : "bg-transparent text-invert-low"
                  }`}
                  onClick={() => setViewMode("edit")}
                >
                  Edit
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={viewMode === "preview"}
                  className={`px-3 py-1.5 text-[12px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-core-prim-500 ${
                    viewMode === "preview"
                      ? "bg-core-prim-500/20 text-invert-high"
                      : "bg-transparent text-invert-low"
                  }`}
                  onClick={() => setViewMode("preview")}
                >
                  Preview
                </button>
              </div>
            </div>

            {/* Show loader in LHS when summarizing */}
            {isSummarizing ? (
              <div
                className="rounded-xl border border-core-prim-300/20 bg-core-neu-1000/40 p-6 mx-auto max-w-[860px] flex flex-col items-center justify-center"
                style={{ minHeight: "300px" }}
              >
                <Loader text="Summarizing content..." size={120} />
                <p className="text-invert-low text-sm mt-4">
                  This may take a few moments
                </p>
              </div>
            ) : viewMode === "preview" ? (
              <div className="max-w-[860px] mx-auto">
                <EditorJsRenderer
                  data={editorBody || currentBody || initialEditorData}
                  className="editorjs-theme"
                />
              </div>
            ) : (
              <div className="">
                <EditorJsEditor
                  key={editorMountKey}
                  initialData={initialEditorData}
                  onChange={handleEditorChange}
                  className="mx-auto  "
                />
              </div>
            )}
          </div>
          {/* Metadata fields below header */}
          <div className=" max-w-[860px] mx-auto rounded-xl border border-core-prim-300/20 bg-core-neu-1000/40 px-4 py-3">
            <div className="flex flex-col gap-3">
              <div className="flex flex-col">
                <label
                  htmlFor="summary"
                  className="text-[11px] text-invert-low mb-1"
                >
                  Summary
                </label>
                <textarea
                  id="summary"
                  ref={summaryRef}
                  placeholder="Summary"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  rows={5}
                  className="w-full resize-none rounded-lg px-3 py-2 text-[13px] bg-button-filled-main-default focus:ring-2 focus:ring-core-prim-500"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col">
                  <label
                    htmlFor="category"
                    className="text-[11px] text-invert-low mb-1"
                  >
                    Category
                  </label>
                  <Input
                    id="category"
                    placeholder="Category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  />
                </div>
                <div className="flex flex-col">
                  <label
                    htmlFor="tags"
                    className="text-[11px] text-invert-low mb-1"
                  >
                    Tags
                  </label>
                  <Input
                    id="tags"
                    placeholder="Tags (comma-separated)"
                    value={tags.join(", ")}
                    onChange={(e) =>
                      setTags(
                        e.target.value
                          .split(",")
                          .map((t) => t.trim())
                          .filter(Boolean)
                      )
                    }
                    hint="Separate with commas"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Right Panel */}
        <RightPanel
          blogId={article?.id}
          body={editorBody || currentBody || initialEditorData}
          onRefinement={handleRefinementApplied}
        />
      </div>
    </div>
  );
}
