import React, {
  useCallback,
  useMemo,
  useState,
  useEffect,
  useRef,
} from "react";
import { SlCloudUpload } from "react-icons/sl";

import { useParams, useLocation } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { contentApi } from "../services/contentApi";
import EditorJsEditor from "../components/EditorJsEditor";
import EditorJsRenderer from "../components/EditorJsRenderer";
import RightPanel from "../components/RightPanel";
import Loader from "../components/Loader";
import ProcessingView from "../components/ProcessingView";
import { normalizeEditorJsBody } from "../utils";
import { useAutoResize } from "../hooks/useAutoResize";
import { imageUploadApi } from "../services/imageUploadApi";
import { useProgress } from "../contexts/ProgressContext";
import { getSocialJobStatus } from "../services/socialApi";

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
  const queryClient = useQueryClient();

  // State for summarization loading
  const [isSummarizing, setIsSummarizing] = useState(false);
  const summarizationTriggeredRef = useRef(false);

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
  // Fallback image URL not needed currently

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
  const [bannerUrl, setBannerUrl] = useState("");
  const currentBanner =
    bannerUrl ||
    article?.bannerUrl ||
    location.state?.generatedContent?.bannerUrl ||
    rssFeedItem?.imageUrl;
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
  // Banner upload state
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const bannerInputRef = useRef(null);
  const [isBannerDragOver, setIsBannerDragOver] = useState(false);
  const [bannerDragCounter, setBannerDragCounter] = useState(0);
  const socialJobsStartedRef = useRef(false);
  const pollingTimersRef = useRef({});
  const jobProgressRef = useRef({});
  const { addTask, updateProgress, removeTask, setCustomTitle } = useProgress();

  const handleBannerFile = useCallback(
    async (file) => {
      if (!file) return;
      if (!file.type?.startsWith("image/")) {
        showMessage("Please drop a valid image file.", "error");
        return;
      }
      try {
        setIsUploadingBanner(true);
        const uploaded = await imageUploadApi.uploadImage(file);
        setBannerUrl(uploaded.url);
        if (id) {
          await contentApi.patchContent(id, { bannerUrl: uploaded.url });
          showMessage("Banner updated.");
        } else {
          showMessage("Banner selected.", "info");
        }
      } catch (err) {
        showMessage(err?.message || "Failed to upload banner.", "error");
      } finally {
        setIsUploadingBanner(false);
      }
    },
    [id, showMessage]
  );

  // Helper to start polling for social generation jobs and show ProgressToast
  const startSocialJobsPolling = useCallback(
    (jobs) => {
      if (!jobs || socialJobsStartedRef.current) return;
      const { twitterJobId, instagramJobId } = jobs || {};
      if (!twitterJobId && !instagramJobId) return;
      socialJobsStartedRef.current = true;
      try {
        setCustomTitle && setCustomTitle("Generating social media posts...");
      } catch {
        // no-op
      }

      const startJob = (jobId, label) => {
        if (!jobId) return;
        const taskId = addTask(label, () => {
          // Cancel polling and remove task
          const t = pollingTimersRef.current[jobId];
          if (t) clearTimeout(t);
          removeTask(taskId);
        });
        jobProgressRef.current[jobId] = 5;
        updateProgress(taskId, 5);

        const tick = async () => {
          try {
            const res = await getSocialJobStatus(jobId, 60000);
            const state = res?.data?.state;
            if (state === "completed") {
              updateProgress(taskId, 100);
              return; // stop polling; toast will auto-hide
            }
            if (state === "failed") {
              // Mark as complete to clear UI, or keep at 99% to indicate near-done
              updateProgress(taskId, 100);
              return;
            }
            // No numeric progress from server; animate up to 95%
            const current = jobProgressRef.current[jobId] ?? 5;
            const next = Math.min(
              95,
              current + Math.max(1, Math.round(Math.random() * 8))
            );
            jobProgressRef.current[jobId] = next;
            updateProgress(taskId, next);
          } catch {
            // Backoff a bit on error, keep progress steady
          } finally {
            pollingTimersRef.current[jobId] = setTimeout(tick, 2000);
          }
        };
        tick();
      };

      startJob(twitterJobId, "Twitter post generation");
      startJob(instagramJobId, "Instagram post generation");
    },
    [addTask, removeTask, setCustomTitle, updateProgress]
  );

  // Start polling if job IDs were passed via navigation state
  useEffect(() => {
    const sj = location.state?.socialJobs;
    if (sj && (sj.twitterJobId || sj.instagramJobId)) {
      startSocialJobsPolling(sj);
    }
    return () => {
      Object.values(pollingTimersRef.current || {}).forEach((t) =>
        clearTimeout(t)
      );
      pollingTimersRef.current = {};
    };
  }, [location.state, startSocialJobsPolling]);
  // SEO meta description guidance
  const SEO_META_MIN = 50;
  const SEO_META_MAX = 760;
  const summaryLength = (summary || "").trim().length;
  const isSummaryTooShort = summaryLength > 0 && summaryLength < SEO_META_MIN;
  const isSummaryTooLong = summaryLength > SEO_META_MAX;
  const charCountClass =
    isSummaryTooShort || isSummaryTooLong
      ? "text-error-400"
      : "text-invert-low";
  const summaryStatusText =
    summaryLength === 0
      ? "Meta description missing — search engines may auto-generate less relevant text."
      : isSummaryTooShort
        ? `Too short — aim for ${SEO_META_MIN}\u2013${SEO_META_MAX} characters.`
        : isSummaryTooLong
          ? "Too long — may be truncated in search results."
          : "Looks good — concise and descriptive.";
  const summaryStatusClass =
    summaryLength === 0
      ? "text-warning-400"
      : isSummaryTooShort || isSummaryTooLong
        ? "text-error-400"
        : "text-success-400";
  // Effect to handle RSS feed item summarization (guarded to run once)
  useEffect(() => {
    const processSummarization = async () => {
      if (summarizationTriggeredRef.current) return;
      if (rssFeedItem && isSummarizeMode) {
        summarizationTriggeredRef.current = true;
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

            // If social generation jobs were enqueued, start polling to show top-right progress
            if (
              response.jobs &&
              (response.jobs.twitterJobId || response.jobs.instagramJobId)
            ) {
              startSocialJobsPolling(response.jobs);
            }

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
  }, [rssFeedItem, isSummarizeMode, showMessage, startSocialJobsPolling]);

  // Effect to handle article data changes
  useEffect(() => {
    setEditorBody(currentBody || null);
    setTitle(article?.title || rssFeedItem?.title || "");
    setSummary(article?.summary || rssFeedItem?.summary || "");
    setCategory(article?.category || "");
    setTags(Array.isArray(article?.tags) ? article.tags : []);
    setBannerUrl(
      article?.bannerUrl ||
        location.state?.generatedContent?.bannerUrl ||
        rssFeedItem?.imageUrl ||
        ""
    );
    setEditorMountKey((k) => k + 1);
  }, [
    currentBody,
    article?.bannerUrl,
    article?.title,
    article?.summary,
    article?.category,
    article?.tags,
    location.state?.generatedContent?.bannerUrl,
    rssFeedItem,
  ]);

  // Update document title and meta tags when title changes
  useEffect(() => {
    if (title && title.trim()) {
      // Update document title
      document.title = `${title} - Content Editor`;
      
      // Update meta description if summary exists
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.name = 'description';
        document.head.appendChild(metaDescription);
      }
      metaDescription.content = summary || `Editing content: ${title}`;
      
      // Update Open Graph title
      let ogTitle = document.querySelector('meta[property="og:title"]');
      if (!ogTitle) {
        ogTitle = document.createElement('meta');
        ogTitle.setAttribute('property', 'og:title');
        document.head.appendChild(ogTitle);
      }
      ogTitle.content = title;
      
      // Update Open Graph description
      let ogDescription = document.querySelector('meta[property="og:description"]');
      if (!ogDescription) {
        ogDescription = document.createElement('meta');
        ogDescription.setAttribute('property', 'og:description');
        document.head.appendChild(ogDescription);
      }
      ogDescription.content = summary || `Editing content: ${title}`;
      
      console.log("Updated document title and meta tags for:", title);
    } else {
      // Reset to default when no title
      document.title = 'Content Editor - CMS';
    }
  }, [title, summary]);

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
    // Non-blocking SEO meta description guidance
    if (!summary?.trim()) {
      showMessage("Consider adding a meta description for better SEO.", "info");
    } else if (summary.trim().length < SEO_META_MIN) {
      showMessage(
        `Meta description is short; aim for ${SEO_META_MIN}\u2013${SEO_META_MAX} characters.`,
        "info"
      );
    } else if (summary.trim().length > SEO_META_MAX) {
      showMessage(
        "Meta description may be truncated in search results.",
        "info"
      );
    }
    return true;
  }, [title, currentTitle, editorBody, dummyBody, summary, showMessage]);

  const handleSaveDraft = useCallback(async () => {
    if (!validate()) return;
    try {
      setIsSavingDraft(true);
      if (id && id !== "new") {
        const payload = {
          title: title || currentTitle,
          summary: summary || undefined,
          category: category || undefined,
          tags: tags.length ? tags : undefined,
          bannerUrl: bannerUrl || undefined,
          body: editorBody || currentBody,
        };
        const res = await contentApi.patchContent(id, payload);
        showMessage("Draft updated successfully.");
        return res;
      } else {
        // Fallback save for new/unsaved content
        const res = await contentApi.saveContent({
          text: `${(title || currentTitle) ?? dummyTitle}\n\n${dummyBody}`,
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
    bannerUrl,
  ]);

  const handlePublish = useCallback(async () => {
    if (!validate()) return;
    try {
      setIsPublishing(true);
      if (id && id !== "new") {
        const payload = {
          title: title || currentTitle,
          summary: summary || undefined,
          category: category || undefined,
          tags: tags.length ? tags : undefined,
          bannerUrl: bannerUrl || undefined,
          body: editorBody || currentBody,
          status: "published",
        };
        const res = await contentApi.patchContent(id, payload);
        showMessage("Content updated.");
        // Ensure latest status and fields are reflected
        await queryClient.invalidateQueries({ queryKey: ["article", id] });
        return res;
      } else {
        // Fallback publish for new/unsaved content
        const res = await contentApi.saveContent({
          text: `${(title || currentTitle) ?? dummyTitle}\n\n${dummyBody}`,
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
    bannerUrl,
    queryClient,
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

  // While summarizing, show the ProcessingView (full-screen) similar to wizard
  if (isSummarizing) {
    return <ProcessingView phase="summarizing" />;
  }

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
        <section className="lg:col-span-2 space-y-5 ">
          {/* Header with title, status, updated at, and actions only */}
          <div className=" mb-5  border border-core-prim-300/20 bg-core-neu-1000 px-4 py-3 sticky top-0 z-10 backdrop-blur-lg shadow">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex flex-col">
                  {/* <label
                    htmlFor="title"
                    className="text-md text-invert-low mb-1"
                  >
                    Title
                  </label> */}
                  <Input
                    id="title"
                    placeholder="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="text-[18px] font-semibold"
                  />
                </div>
                {article?.updatedAt && (
                  <div className="text-md text-invert-low mt-1">
                    Updated {new Date(article.updatedAt).toLocaleString()}
                  </div>
                )}
              </div>
              <div className="flex flex-col items-end gap-3 mt-2 md:mt-0">
                {article?.status && (
                  <span
                    className={`text-md px-2 py-0.5 rounded-full border ${
                      article.status === "published"
                        ? "bg-success-500/10 border-success-500/20 text-success-400"
                        : "bg-warning-500/10 border-warning-500/20 text-warning-400"
                    }`}
                  >
                    {article.status}
                  </span>
                )}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={handleSaveDraft}
                    isLoading={isSavingDraft}
                    className="min-w-32"
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
          </div>

          <div className=" ">
            <p className="text-md text-invert-low mb-2">Image</p>
            <div className="w-full">
              <div
                className={`relative w-full overflow-hidden rounded-2xl border border-core-prim-300/20 ${isBannerDragOver ? "ring-2 ring-core-prim-500" : ""}`}
                onDragEnter={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setBannerDragCounter((c) => c + 1);
                  const hasFiles = Array.from(e.dataTransfer?.items || []).some(
                    (i) => i.kind === "file"
                  );
                  if (hasFiles) setIsBannerDragOver(true);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  e.dataTransfer.dropEffect = "copy";
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setBannerDragCounter((c) => Math.max(0, c - 1));
                  if (bannerDragCounter - 1 <= 0) setIsBannerDragOver(false);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsBannerDragOver(false);
                  setBannerDragCounter(0);
                  const file = e.dataTransfer?.files?.[0];
                  if (file) handleBannerFile(file);
                }}
              >
                <img
                  src={currentBanner}
                  alt="Cover preview"
                  className="w-full aspect-[16/10] object-cover"
                />
                <div className="absolute top-2 right-2 flex gap-2">
                  <input
                    ref={bannerInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      await handleBannerFile(file);
                      if (e.target) e.target.value = "";
                    }}
                  />
                  <Button
                    variant="outline"
                    onClick={() => bannerInputRef.current?.click()}
                    className="text-[12px] px-2 py-1 min-w-0"
                    isLoading={isUploadingBanner}
                  >
                    <SlCloudUpload />
                    {article?.bannerUrl || bannerUrl ? "Replace" : "Upload"}
                  </Button>
                </div>
                {isBannerDragOver && (
                  <div className="absolute inset-0 bg-core-prim-500/10 flex items-center justify-center pointer-events-none">
                    <div className="text-[12px] px-3 py-1.5 bg-core-neu-1000/80 rounded-full border border-core-prim-300/30">
                      Drop image to set as banner
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className=" ">
            <div className="flex items-center justify-between mb-2">
              <p className="text-md text-invert-low">Body</p>
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
                  className="editorjs-theme px-4"
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
          <div className="  rounded-xl border border-core-prim-300/20 bg-core-neu-1000/40 px-4 py-3">
            <div className="flex flex-col gap-3">
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="summary" className="text-md text-invert-low">
                    Meta description (SEO)
                  </label>
                  <span className={`text-md ${charCountClass}`}>
                    {summaryLength}/{SEO_META_MAX}
                  </span>
                </div>
                <textarea
                  id="summary"
                  ref={summaryRef}
                  placeholder="Write a concise summary for search engines (50–160 characters)"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  rows={5}
                  aria-describedby="summary-help"
                  aria-invalid={isSummaryTooShort || isSummaryTooLong}
                  className="w-full resize-none rounded-lg px-3 py-2 text-[13px] bg-button-filled-main-default focus:ring-2 focus:ring-core-prim-500"
                />
                <p
                  id="summary-help"
                  className={`text-xs mt-1 ${summaryStatusClass}`}
                >
                  Appears as the SEO meta description in search results. Aim for{" "}
                  {SEO_META_MIN}–{SEO_META_MAX} characters and include your
                  primary keyword. {summaryStatusText}
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col">
                  <label
                    htmlFor="category"
                    className="text-md text-invert-low mb-1"
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
                    className="text-md text-invert-low mb-1"
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
