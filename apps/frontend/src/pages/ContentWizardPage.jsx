import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { EnhancedAiChatInput } from "../components/EnhancedAiChatInput";
import { useContentSubmission } from "../hooks/useContentSubmission";
import ContentWizardErrorBoundary from "../components/ContentWizardErrorBoundary";
import LoadingProgress from "../components/LoadingProgress";
import ProcessingView from "../components/ProcessingView";
import { useProcessingStore } from "../store/processingStore";
import ContentEditorView from "../components/ContentEditorView";

// Main Content Wizard Screen component
export default function ContentWizardPage() {
  const navigate = useNavigate();

  // State for success/error feedback
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackType, setFeedbackType] = useState(""); // 'success' | 'error' | ''

  // Content submission hook
  const [article, setArticle] = useState(null);

  const { submit, isLoading, loadingState } = useContentSubmission({
    onSuccess: (result) => {
      // Extract blog ID from response for navigation
      const blogId = result?.generatedContent?.data?.blogId ||
        result?.generatedContent?.blogId ||
        result?.data?.blogId;

      if (blogId) {
        setFeedbackMessage("Content generated successfully! Redirecting to editor...");
        setFeedbackType("success");

        // Navigate to editor page after short delay for user feedback
        setTimeout(() => {
          navigate(`/editor/${blogId}`);
        }, 1500);
      } else {
        // Fallback to current behavior if no blog ID
        const payload = result?.generatedContent;
        const gc =
          payload?.data?.generatedContent || payload?.generatedContent || payload;
        const normalized = {
          title: gc?.title,
          summary: gc?.summary,
          category: gc?.category,
          tags: gc?.tags || [],
          bannerUrl: gc?.bannerUrl,
          images: gc?.images || [],
          body: gc?.body,
        };
        setArticle(normalized);
        setFeedbackMessage("Content generated successfully!");
        setFeedbackType("success");

        // Clear feedback after 5 seconds
        setTimeout(() => {
          setFeedbackMessage("");
          setFeedbackType("");
        }, 5000);
      }
    },
    onError: (error) => {
      setFeedbackMessage(
        error.message || "Failed to generate content. Please try again."
      );
      setFeedbackType("error");

      // Clear error feedback after 8 seconds
      setTimeout(() => {
        setFeedbackMessage("");
        setFeedbackType("");
      }, 8000);
    },
  });

  /**
   * Handles content submission from the enhanced input
   */
  const handleContentSubmit = useCallback(
    async (submissionData) => {
      const { text, images } = submissionData;

      try {
        await submit(text, images, {
          saveContent: true, // Save the content after generation
        });
      } catch (error) {
        console.error("Content submission failed:", error);
      }
    },
    [submit]
  );

  /**
   * Clears feedback messages
   */
  const clearFeedback = useCallback(() => {
    setFeedbackMessage("");
    setFeedbackType("");
  }, []);

  const { isProcessing, phase } = useProcessingStore();

  return (
    <ContentWizardErrorBoundary>
      <div className="relative w-full flex h-full items-center justify-center">
        {/* Top progress bar while processing */}
        <LoadingProgress
          isLoading={loadingState?.phase && loadingState.phase !== "idle"}
        />
        <div className="flex flex-col w-full gap-4 h-full justify-center ">
          {/* Title - responsive design with improved mobile spacing */}
          <div className="font-semibold text-invert-high text-xl sm:text-2xl md:text-3xl lg:text-[36px] text-center px-4 sm:px-6">
            What's on your mind today?
          </div>

          {/* Subtitle - responsive design with better mobile readability */}
          <div className="font-normal text-invert-low text-sm sm:text-base text-center px-4 sm:px-6">
            Type it. Dream it. Watch it appear!
          </div>

          {/* Feedback message */}
          {feedbackMessage && (
            <div
              className={`max-w-[600px] mx-auto p-3 sm:p-4 rounded-lg text-center text-sm sm:text-base font-medium transition-all duration-300 mx-4 sm:mx-auto ${feedbackType === "success"
                ? "bg-green-500/10 border border-green-500/20 text-green-400"
                : "bg-error-500/10 border border-error-500/20 text-error-400"
                }`}
            >
              <div className="flex items-center justify-center gap-2">
                {feedbackType === "success" ? (
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                <span>{feedbackMessage}</span>
                <button
                  onClick={clearFeedback}
                  className="ml-2 hover:opacity-70 transition-opacity"
                  aria-label="Dismiss message"
                >
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Switch between: input → processing → editor */}
          {isProcessing ? (
            <>
              <ProcessingView phase={phase} />
            </>
          ) : article ? (
            <ContentEditorView
              article={
                article || {
                  title: "Hello world",
                  summary: "Hello world",
                  category: "Hello world",
                  tags: ["Hello world"],
                  bannerUrl: "https://via.placeholder.com/150",
                  images: ["https://via.placeholder.com/150"],
                  body: {
                    blocks: [
                      {
                        id: "intro_header",
                        type: "header",
                        data: {
                          level: 2,
                          text: "The Unprecedented Milestone: Virat Kohli's 100th Century",
                        },
                      },
                      {
                        id: "intro_para1",
                        type: "paragraph",
                        data: {
                          text: "In the annals of cricket history, few records stand as monumental as Sachin Tendulkar's 100 international centuries. Yet, as Virat Kohli continues his relentless pursuit of greatness, the prospect of him reaching this unprecedented milestone has captivated fans and pundits alike. This article explores how King Kohli might celebrate such an iconic achievement and delves into a comprehensive comparison with the Master Blaster himself, Sachin Tendulkar.",
                        },
                      },
                      {
                        id: "delimiter_1",
                        type: "delimiter",
                        data: {},
                      },
                      {
                        id: "celebration_header",
                        type: "header",
                        data: {
                          level: 3,
                          text: "How Virat Kohli Would Celebrate His 100th Century",
                        },
                      },
                      {
                        id: "celebration_para1",
                        type: "paragraph",
                        data: {
                          text: "Virat Kohli, known for his passion and intensity, often expresses his emotions vividly on the field. His 100th international century would undoubtedly be a moment of profound significance, likely celebrated with a blend of his characteristic aggression and newfound maturity.",
                        },
                      },
                      {
                        id: "celebration_list",
                        type: "list",
                        data: {
                          items: [
                            "A trademark aggressive roar and bat raise towards the dressing room and fans, acknowledging the support.",
                            "A quiet moment of reflection, perhaps looking up to the heavens, a gesture often associated with his late father.",
                            "A warm embrace with his batting partner, emphasizing team camaraderie over individual glory.",
                            "A humble bow to the crowd, soaking in the thunderous applause and chants of 'Kohli, Kohli!'",
                            "A special dedication to his family – Anushka Sharma and Vamika – who have been his pillars of strength.",
                            "Post-match, a heartfelt speech acknowledging his teammates, coaches, and the journey of two decades of professional cricket.",
                          ],
                          style: "unordered",
                        },
                      },
                      {
                        id: "celebration_para2",
                        type: "paragraph",
                        data: {
                          text: "Unlike some of his more animated celebrations in the past, his 100th century might see a more composed, yet deeply emotional, display, reflecting the weight of the achievement and his growth as an individual.",
                        },
                      },
                      {
                        id: "delimiter_2",
                        type: "delimiter",
                        data: {},
                      },
                      {
                        id: "sachin_header",
                        type: "header",
                        data: {
                          level: 3,
                          text: "A Look Back: Sachin Tendulkar's Unparalleled Legacy",
                        },
                      },
                      {
                        id: "sachin_para1",
                        type: "paragraph",
                        data: {
                          text: "Sachin Tendulkar's 100 international centuries, achieved in 2012, was a feat that seemed insurmountable. His journey was one of consistent brilliance, carrying the hopes of a billion people for over two decades. He was often described as the 'God of Cricket' in India, revered for his humility, impeccable technique, and ability to perform under immense pressure.",
                        },
                      },
                      {
                        id: "sachin_quote",
                        type: "quote",
                        data: {
                          caption: "Rahul Dravid on Sachin Tendulkar",
                          alignment: "left",
                          text: "I have seen God; he bats at number 4 for India.",
                        },
                      },
                      {
                        id: "delimiter_3",
                        type: "delimiter",
                        data: {},
                      },
                      {
                        id: "comparison_header",
                        type: "header",
                        data: {
                          level: 3,
                          text: "Kohli vs. Tendulkar: A Statistical Comparison",
                        },
                      },
                      {
                        id: "comparison_para1",
                        type: "paragraph",
                        data: {
                          text: "While direct comparisons are often unfair due to different eras, playing conditions, and cricketing landscapes, a statistical overview highlights the incredible achievements of both legends.",
                        },
                      },
                      {
                        id: "comparison_table_header",
                        type: "table",
                        data: {
                          content: [
                            "Metric",
                            "Sachin Tendulkar",
                            "Virat Kohli (as of late career)",
                          ],
                          withHeadings: true,
                        },
                      },
                      {
                        id: "comparison_table_row1",
                        type: "table",
                        data: {
                          content: [
                            "International Centuries",
                            "100 (51 Tests, 49 ODIs)",
                            "79+ (29 Tests, 50 ODIs)",
                          ],
                          withHeadings: false,
                        },
                      },
                      {
                        id: "comparison_table_row2",
                        type: "table",
                        data: {
                          content: [
                            "Total International Runs",
                            "34,357",
                            "26,000+",
                          ],
                          withHeadings: false,
                        },
                      },
                      {
                        id: "comparison_table_row3",
                        type: "table",
                        data: {
                          content: ["International Matches", "664", "520+"],
                          withHeadings: false,
                        },
                      },
                      {
                        id: "comparison_table_row4",
                        type: "table",
                        data: {
                          content: ["ODI Average", "44.83", "58.67+"],
                          withHeadings: false,
                        },
                      },
                      {
                        id: "comparison_table_row5",
                        type: "table",
                        data: {
                          content: ["Test Average", "53.78", "49.15+"],
                          withHeadings: false,
                        },
                      },
                      {
                        id: "comparison_table_row6",
                        type: "table",
                        data: {
                          content: [
                            "World Cup Trophies",
                            "1 (2011)",
                            "0 (Finals, Semis)",
                          ],
                          withHeadings: false,
                        },
                      },
                      {
                        id: "comparison_para2",
                        type: "paragraph",
                        data: {
                          text: "Virat Kohli's remarkable consistency, especially in ODIs, and his ability to chase down targets have earned him the moniker 'Chase Master'. Sachin, on the other hand, was the pillar of Indian batting for decades, adapting through various eras of cricket.",
                        },
                      },
                      {
                        id: "delimiter_4",
                        type: "delimiter",
                        data: {},
                      },
                      {
                        id: "expert_header",
                        type: "header",
                        data: {
                          level: 3,
                          text: "Expert Opinions on the Pursuit",
                        },
                      },
                      {
                        id: "expert_quote1",
                        type: "quote",
                        data: {
                          caption: "Ricky Ponting, Former Australia Captain",
                          alignment: "left",
                          text: "Virat is an absolute champion. If anyone can get to 100 international hundreds, it's him. He has the hunger and the fitness.",
                        },
                      },
                      {
                        id: "expert_quote2",
                        type: "quote",
                        data: {
                          caption: "Sunil Gavaskar, Indian Cricket Legend",
                          alignment: "left",
                          text: "Sachin's record was once thought to be unbreakable. But Virat has shown that with dedication and focus, anything is possible. It will be a testament to his longevity.",
                        },
                      },
                      {
                        id: "delimiter_5",
                        type: "delimiter",
                        data: {},
                      },
                      {
                        id: "fortitude_header",
                        type: "header",
                        data: {
                          level: 3,
                          text: "The Mental Fortitude and Pressure",
                        },
                      },
                      {
                        id: "fortitude_para1",
                        type: "paragraph",
                        data: {
                          text: "Both Sachin and Virat have faced immense pressure from a cricket-crazy nation. The expectation to perform consistently at the highest level, especially when nearing a significant milestone, can be mentally taxing.",
                        },
                      },
                      {
                        id: "fortitude_checklist",
                        type: "checklist",
                        data: {
                          items: [
                            "text",
                            "Handling media scrutiny and public expectations.",
                            "checked",
                            "Maintaining peak physical fitness over two decades.",
                            "text",
                            "Adapting to evolving formats and opposition strategies.",
                            "checked",
                            "Balancing personal life with professional demands.",
                            "text",
                            "Overcoming periods of lean form and criticism.",
                          ],
                        },
                      },
                      {
                        id: "fortitude_para2",
                        type: "paragraph",
                        data: {
                          text: "Kohli's ability to bounce back from slumps, like his recent form resurgence, speaks volumes about his mental strength and resilience.",
                        },
                      },
                      {
                        id: "delimiter_6",
                        type: "delimiter",
                        data: {},
                      },
                      {
                        id: "impact_header",
                        type: "header",
                        data: {
                          level: 3,
                          text: "Impact on Indian Cricket and Global Reverberations",
                        },
                      },
                      {
                        id: "impact_para1",
                        type: "paragraph",
                        data: {
                          text: "A 100th century for Virat Kohli would not just be a personal milestone but a cultural event in India. It would reignite the 'greatest of all time' debates and further cement his legacy as one of cricket's true titans. Globally, it would be celebrated as a testament to sustained excellence in a demanding sport.",
                        },
                      },
                      {
                        id: "impact_image1",
                        type: "image",
                        data: {
                          caption: "A stadium full of passionate cricket fans.",
                          file: "https://res.cloudinary.com/djaouwzay/image/upload/v1755611905/generated-content/20250507_2038_Espverse_Logo_Design_simple_compose_01jtnmk5txf15rsmn8y8x6x33d.png",
                          withBorder: false,
                          withBackground: false,
                          stretched: false,
                        },
                      },
                      {
                        id: "delimiter_7",
                        type: "delimiter",
                        data: {},
                      },
                      {
                        id: "future_header",
                        type: "header",
                        data: {
                          level: 3,
                          text: "Future Outlook for Records",
                        },
                      },
                      {
                        id: "future_para1",
                        type: "paragraph",
                        data: {
                          text: "While 100 centuries is a staggering number, the modern cricketing landscape, with more T20s and fewer Tests, might make it harder for future generations to emulate. Kohli's potential achievement would highlight his adaptability and dominance across formats, setting a new benchmark for consistency.",
                        },
                      },
                      {
                        id: "delimiter_8",
                        type: "delimiter",
                        data: {},
                      },
                      {
                        id: "faq_header",
                        type: "header",
                        data: {
                          level: 3,
                          text: "Frequently Asked Questions (FAQs)",
                        },
                      },
                      {
                        id: "faq_list",
                        type: "list",
                        data: {
                          items: [
                            "Q: Has any other player come close to 100 international centuries?",
                            "A: Only Sachin Tendulkar has achieved this feat. Ricky Ponting is next with 71 centuries.",
                            "Q: What is Virat Kohli's current century count?",
                            "A: As of recent records, Virat Kohli has over 79 international centuries (50 in ODIs, 29 in Tests).",
                            "Q: How long might it take for Kohli to reach 100 centuries?",
                            "A: Depending on his form and the number of matches India plays, it could take another 2-4 years, provided he maintains fitness and consistency.",
                          ],
                          style: "ordered",
                        },
                      },
                      {
                        id: "delimiter_9",
                        type: "delimiter",
                        data: {},
                      },
                      {
                        id: "conclusion_header",
                        type: "header",
                        data: {
                          level: 2,
                          text: "Conclusion",
                        },
                      },
                      {
                        id: "conclusion_para1",
                        type: "paragraph",
                        data: {
                          text: "Virat Kohli's journey to a potential 100 international centuries is a narrative of ambition, dedication, and unparalleled skill. While the comparison with Sachin Tendulkar is inevitable, both players have carved out unique legacies that have profoundly impacted the sport. Kohli's celebration of this monumental feat would undoubtedly be a moment etched in history, a testament to his enduring greatness and a beacon of inspiration for generations of cricketers to come. The cricketing world eagerly awaits the day King Kohli potentially reaches this pinnacle, celebrating not just a record, but a career defined by relentless pursuit of excellence.",
                        },
                      },
                    ],
                    time: 1700000000000,
                    version: "2.28.2",
                  },
                }
              }
            />
          ) : (
            <div className="w-full max-w-[600px] mx-auto min-h-[175px] sm:min-h-[200px] backdrop-blur-[20px] backdrop-filter bg-core-neu-1000 rounded-[15px] px-2 sm:px-4 md:px-0">
              <EnhancedAiChatInput
                onSubmit={handleContentSubmit}
                placeholder="Your blog crafting experience starts here..."
                maxLength={5000}
                maxImages={10}
                disabled={isLoading}
                validationOptions={{
                  text: {
                    required: true,
                    maxLength: 2000,
                  },
                  images: {
                    maxImages: 10,
                    required: false,
                  },
                }}
              />
            </div>
          )}
        </div>

        {/* Submission overlay matching Figma loading state */}
        {/* Overlay removed – page switches to processing view above */}
      </div>
    </ContentWizardErrorBoundary>
  );
}
