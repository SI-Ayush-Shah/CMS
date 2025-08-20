import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaCalendarAlt,
  FaShare,
  FaFacebook,
  FaTwitter,
  FaWhatsapp,
  FaCopy,
  FaArrowLeft,
} from "react-icons/fa";

function DetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Sample data - in a real app, this would come from an API based on the ID
  const newsData = {
    1: {
      title: "Sanju Samson makes the cut in India's Asia Cup 2025 squad",
      subtitle:
        "Dhruv Jurel, Riyan Parag and Yashasvi Jaiswal are named among the standby players.",
      date: "19 Aug, 2025",
      content: `**Sanju Samson** has been named in India's 15-member squad for the **Asia Cup 2025**, the Board of Control for Cricket in India (BCCI) confirmed on Tuesday. The T20 tournament will be held in the UAE from September 9 to 28.

Samson, who captains Rajasthan Royals in the Indian Premier League, has played 42 T20 Internationals (T20Is) for the Indian cricket team and has scored 861 runs at an average of 25.32 and a strike rate of 152.38. He also has three T20I centuries to his name.

In November last year, Samson was India's second-highest run-getter in the T20I series against South Africa with 216 runs at an average of 72.00 and a blistering strike rate of 194.59.

Samson's consistency has also been unmatched at the Rajasthan Royals. With 4027 runs in 149 IPL matches, he is the team's all-time leading run-scorer.

Three more Royals stars - Dhruv Jurel, Riyan Parag and Yashasvi Jaiswal - have been named among the standby players for the Asia Cup. All three were part of Rajasthan's squad in IPL 2025.

India, the reigning champions and record eight-time winners of the Asia Cup, will begin their campaign against hosts UAE on September 10 in Dubai before facing arch-rivals Pakistan on September 14 in the group stage.

The competition, alternating formats since 2016, returns to T20Is this year after last being played in the 50-over format in 2023.`,
      squad: {
        title: "Indian cricket team for Asia Cup 2025",
        main: "Indian cricket team: Suryakumar Yadav (captain), Shubman Gill (vice-captain), Abhishek Sharma, Tilak Verma, Hardik Pandya, Shivam Dube, Axar Patel, Jitesh Sharma, Jasprit Bumrah, Varun Chakaravarthy, Arshdeep Singh, Kuldeep Yadav, Sanju Samson, Harshit Rana, Rinku Singh.",
        standby:
          "Standby players: Prasidh Krishna, Washington Sundar, Dhruv Jurel, Riyan Parag, Yashasvi Jaiswal",
      },
      imageUrl:
        "https://imgs.search.brave.com/5qtRzpLD_tho5javBzbwjW8wHDrS_s1SrUDvfE2RwhA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93YWxs/cGFwZXJhY2Nlc3Mu/Y29tL2Z1bGwvOTE3/NjY5Mi5qcGc",
    },
    2: {
      title: "Rajasthan Royals announce new coaching staff for IPL 2025",
      subtitle:
        "The franchise has brought in fresh faces to strengthen their coaching setup ahead of the new season.",
      date: "18 Aug, 2025",
      content: `**Rajasthan Royals** have announced a **revamped coaching staff** for the upcoming IPL 2025 season, bringing in fresh perspectives and expertise to guide the team to success.

The new coaching setup includes several high-profile appointments, with the franchise focusing on building a strong foundation for the future. The announcement comes after a comprehensive review of the previous season's performance and strategic planning for the upcoming campaign.

**Key Appointments:**

**Head Coach:** A renowned international coach with extensive IPL experience has been appointed to lead the team. The new head coach brings a wealth of knowledge from coaching successful T20 franchises around the world.

**Batting Coach:** A former international batsman known for his innovative approach to T20 batting has joined the coaching staff. This appointment aims to enhance the team's batting performance and develop young talent.

**Bowling Coach:** The franchise has secured the services of a highly respected bowling coach who has worked with several international teams and IPL franchises, focusing on developing both pace and spin bowling skills.

**Fielding Coach:** A specialist fielding coach has been brought in to improve the team's fielding standards, which is crucial in the modern T20 game where every run saved can make a difference.

The franchise management expressed confidence that this new coaching setup will provide the right guidance and mentorship to the players, helping them reach their full potential and achieve success in IPL 2025.`,
      imageUrl:
        "https://imgs.search.brave.com/5qtRzpLD_tho5javBzbwjW8wHDrS_s1SrUDvfE2RwhA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93YWxs/cGFwZXJhY2Nlc3Mu/Y29tL2Z1bGwvOTE3/NjY5Mi5qcGc",
    },
    3: {
      title: "Jos Buttler's century powers Royals to victory in practice match",
      subtitle:
        "English wicketkeeper-batsman Jos Buttler scored a brilliant century in the team's practice match.",
      date: "17 Aug, 2025",
      content: `**Jos Buttler** showcased his exceptional batting prowess as he scored a magnificent **century** to power Rajasthan Royals to a convincing victory in their practice match ahead of the IPL 2025 season.

The English wicketkeeper-batsman, who has been a cornerstone of the Royals' batting lineup, demonstrated why he's considered one of the most destructive T20 batsmen in world cricket. His innings was a masterclass in controlled aggression, combining elegant stroke play with powerful hitting.

**Match Highlights:**

Buttler's innings of 108 runs came off just 58 deliveries, featuring 12 boundaries and 6 sixes. His strike rate of 186.21 was a testament to his ability to score quickly while maintaining composure at the crease.

The practice match, held at the Royals' home ground, saw the team post a formidable total of 198/6 in their allotted 20 overs. Buttler's partnership with captain Sanju Samson was particularly impressive, as the duo added 89 runs for the second wicket.

**Team Performance:**

The Royals' bowling unit also showed promise, with the new recruits demonstrating their skills. The team successfully defended their total, restricting the opposition to 165/8, securing a 33-run victory.

This performance has boosted the team's confidence ahead of the new season, with the coaching staff particularly pleased with the team's overall display and the form of key players like Buttler.`,
      imageUrl:
        "https://imgs.search.brave.com/5qtRzpLD_tho5javBzbwjW8wHDrS_s1SrUDvfE2RwhA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93YWxs/cGFwZXJhY2Nlc3Mu/Y29tL2Z1bGwvOTE3/NjY5Mi5qcGc",
    },
    4: {
      title: "Rajasthan Royals sign promising young fast bowler",
      subtitle:
        "The franchise has added a talented young fast bowler to their squad for the upcoming season.",
      date: "16 Aug, 2025",
      content: `**Rajasthan Royals** have made a significant addition to their squad by signing a **promising young fast bowler** who has been making waves in domestic cricket circuits.

The 22-year-old pacer has been identified as one of the most exciting fast bowling prospects in the country, with his ability to generate pace and movement making him a valuable asset for the franchise. His signing represents the Royals' commitment to nurturing young talent and building for the future.

**Player Profile:**

The young bowler has impressed scouts with his **raw pace**, consistently bowling in the 140-145 km/h range. His ability to swing the ball both ways and generate bounce from good length areas has drawn comparisons to some of the great fast bowlers of the game.

**Domestic Performance:**

In the recent domestic season, the bowler has taken 45 wickets in 12 matches, with an impressive economy rate of 6.8. His performances in crucial matches, including the final of the domestic T20 tournament, have showcased his temperament and ability to perform under pressure.

**Development Plan:**

The Royals have outlined a comprehensive development plan for the young bowler, including specialized training programs and mentorship from experienced players in the squad. The franchise believes that with proper guidance and exposure to high-level cricket, he can develop into a world-class fast bowler.

This signing aligns with the Royals' philosophy of building a balanced squad with a mix of experienced international players and promising young talent, ensuring both immediate success and long-term sustainability.`,
      imageUrl:
        "https://imgs.search.brave.com/5qtRzpLD_tho5javBzbwjW8wHDrS_s1SrUDvfE2RwhA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93YWxs/cGFwZXJhY2Nlc3Mu/Y29tL2Z1bGwvOTE3/NjY5Mi5qcGc",
    },
    5: {
      title: "Royals' home ground to undergo major renovation",
      subtitle:
        "Sawai Mansingh Stadium will see significant upgrades to enhance the spectator experience.",
      date: "15 Aug, 2025",
      content: `**Sawai Mansingh Stadium**, the iconic home ground of Rajasthan Royals, is set to undergo a **major renovation** project aimed at enhancing the overall spectator experience and modernizing the facility to meet international standards.

The renovation project, which is expected to be completed before the start of IPL 2025, will transform the stadium into one of the most modern and fan-friendly venues in the country. The project represents a significant investment by the franchise and the state government in cricket infrastructure.

**Key Upgrades:**

**Seating and Comfort:** The stadium will feature upgraded seating arrangements with improved comfort and better sightlines. Premium seating areas will be added, along with corporate boxes and hospitality suites.

**Technology Integration:** State-of-the-art technology will be integrated throughout the stadium, including high-definition LED screens, improved sound systems, and enhanced lighting for better visibility during day and night matches.

**Fan Amenities:** The renovation will include modern amenities such as food courts, merchandise shops, interactive zones, and improved restroom facilities. Special attention will be given to accessibility features for differently-abled spectators.

**Playing Surface:** The playing surface will be upgraded with the latest turf technology, ensuring optimal playing conditions and reducing the risk of injuries to players.

**Infrastructure:** The stadium will see improvements in parking facilities, entry and exit points, and overall crowd management systems to ensure smooth operations during match days.

The renovation project reflects the Royals' commitment to providing the best possible experience for both players and spectators, while also contributing to the development of cricket infrastructure in Rajasthan.`,
      imageUrl:
        "https://imgs.search.brave.com/5qtRzpLD_tho5javBzbwjW8wHDrS_s1SrUDvfE2RwhA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93YWxs/cGFwZXJhY2Nlc3Mu/Y29tL2Z1bGwvOTE3/NjY5Mi5qcGc",
    },
    6: {
      title: "Rajasthan Royals launch new fan engagement program",
      subtitle:
        "The franchise introduces innovative ways for fans to connect with their favorite players.",
      date: "14 Aug, 2025",
      content: `**Rajasthan Royals** have launched an **innovative fan engagement program** that aims to create deeper connections between the franchise and its loyal supporters. The program introduces several unique initiatives designed to bring fans closer to their favorite players and the team.

**Program Highlights:**

**Virtual Meet & Greets:** Fans will have the opportunity to participate in virtual meet-and-greet sessions with players through an interactive platform. These sessions will allow fans to ask questions, share their thoughts, and interact directly with the team members.

**Fan Content Creation:** The program encourages fans to create and share content related to the Royals, with the best submissions being featured on the franchise's official channels. This initiative aims to celebrate the creativity and passion of the Royals' fan base.

**Exclusive Behind-the-Scenes Access:** Fans will get unprecedented access to behind-the-scenes content, including training sessions, team meetings, and player interviews. This transparency will help fans feel more connected to the team's journey.

**Interactive Fan Zones:** The franchise will create interactive fan zones at the stadium and through digital platforms, where fans can participate in quizzes, games, and other engaging activities.

**Community Initiatives:** The program includes community outreach initiatives where players and franchise staff will participate in social causes and community development projects, allowing fans to join these efforts.

**Digital Integration:** A dedicated mobile app will be launched to serve as a central hub for all fan engagement activities, making it easier for supporters to stay connected with the franchise throughout the year.

This comprehensive fan engagement program demonstrates the Royals' commitment to building a strong and engaged fan community, recognizing that fans are the backbone of any successful sports franchise.`,
      imageUrl:
        "https://imgs.search.brave.com/5qtRzpLD_tho5javBzbwjW8wHDrS_s1SrUDvfE2RwhA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93YWxs/cGFwZXJhY2Nlc3Mu/Y29tL2Z1bGwvOTE3/NjY5Mi5qcGc",
    },
    7: {
      title: "Royals' captain Sanju Samson speaks about team strategy",
      subtitle:
        "Sanju Samson shares insights into the team's approach for the upcoming IPL season.",
      date: "13 Aug, 2025",
      content: `**Sanju Samson**, the charismatic captain of Rajasthan Royals, recently shared detailed insights into the team's **strategic approach** for the upcoming IPL 2025 season. In an exclusive interview, Samson outlined the team's vision and the key areas they are focusing on to achieve success.

**Strategic Vision:**

Samson emphasized that the Royals are building their strategy around **consistency and adaptability**. The team has learned valuable lessons from previous seasons and is implementing a more structured approach to both batting and bowling.

**Batting Strategy:**

The captain revealed that the team is focusing on building strong partnerships and maintaining a balanced approach throughout the innings. "We want to be aggressive but smart about it," Samson said. "The key is to adapt to different situations and conditions."

**Bowling Approach:**

Samson highlighted the importance of having a versatile bowling attack that can adapt to different conditions and opposition strengths. The team is working on developing multiple bowling options and strategies for various match situations.

**Team Culture:**

The captain emphasized the importance of maintaining a positive team culture and supporting each other through both good and challenging times. "We're building a family atmosphere where every player feels valued and supported," he added.

**Key Focus Areas:**

**Fitness and Conditioning:** The team is placing increased emphasis on fitness and conditioning, recognizing that physical preparedness is crucial for success in the demanding IPL format.

**Mental Strength:** Samson stressed the importance of mental strength and resilience, especially in high-pressure situations. The team is working with sports psychologists to develop mental toughness.

**Youth Development:** The Royals continue to focus on developing young talent, providing opportunities for promising players to showcase their skills and grow within the team environment.

Samson expressed confidence that with the right preparation and execution of their strategic plans, the Royals are well-positioned to compete strongly in IPL 2025.`,
      imageUrl:
        "https://imgs.search.brave.com/5qtRzpLD_tho5javBzbwjW8wHDrS_s1SrUDvfE2RwhA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93YWxs/cGFwZXJhY2Nlc3Mu/Y29tL2Z1bGwvOTE3/NjY5Mi5qcGc",
    },
    8: {
      title: "Rajasthan Royals announce partnership with local cricket academy",
      subtitle:
        "The franchise partners with a local academy to nurture young cricket talent in Rajasthan.",
      date: "12 Aug, 2025",
      content: `**Rajasthan Royals** have announced a **strategic partnership** with a prominent local cricket academy, marking a significant step in their commitment to developing cricket talent at the grassroots level in Rajasthan.

This partnership represents a long-term investment in the future of cricket in the state, with the franchise and academy working together to identify, nurture, and develop young talent from an early age.

**Partnership Objectives:**

**Talent Identification:** The partnership will focus on identifying promising young cricketers from across Rajasthan, providing them with opportunities to showcase their skills and potential.

**Skill Development:** The academy will implement specialized training programs designed by the Royals' coaching staff, ensuring that young players receive world-class coaching and guidance.

**Infrastructure Support:** The Royals will provide support in upgrading the academy's facilities, including training grounds, equipment, and technology to create an optimal learning environment.

**Pathway to Professional Cricket:** The partnership will create a clear pathway for talented young players to progress from the academy to higher levels of cricket, including opportunities to train with the Royals' main squad.

**Community Engagement:** The initiative will also focus on community engagement, organizing cricket clinics, tournaments, and awareness programs to promote the sport among young people in Rajasthan.

**Expected Outcomes:**

This partnership is expected to produce several benefits for both the franchise and the local cricket community:

**Local Talent Pool:** The initiative will help build a strong pool of local talent that can potentially represent the Royals in future IPL seasons.

**Grassroots Development:** The partnership will contribute to the overall development of cricket at the grassroots level in Rajasthan, creating a sustainable ecosystem for the sport.

**Community Impact:** The initiative will have a positive impact on the local community, providing opportunities for young people to pursue their cricket dreams and develop valuable life skills.

The Royals' management expressed excitement about this partnership and their commitment to working closely with the academy to achieve their shared vision of developing cricket talent in Rajasthan.`,
      imageUrl:
        "https://imgs.search.brave.com/5qtRzpLD_tho5javBzbwjW8wHDrS_s1SrUDvfE2RwhA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93YWxs/cGFwZXJhY2Nlc3Mu/Y29tL2Z1bGwvOTE3/NjY5Mi5qcGc",
    },
  };

  const currentNews = newsData[id] || newsData[1];

  const handleShare = (platform) => {
    const url = window.location.href;
    const text = currentNews.title;

    switch (platform) {
      case "facebook":
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
        );
        break;
      case "twitter":
        window.open(
          `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`
        );
        break;
      case "whatsapp":
        window.open(
          `https://wa.me/?text=${encodeURIComponent(text + " " + url)}`
        );
        break;
      case "copy":
        navigator.clipboard.writeText(url);
        // You could add a toast notification here
        break;
      default:
        break;
    }
  };

  return (
    <>
    <div className="p-4">
      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-2 text-[11px] mb-6 cursor-pointer"
      >
        <FaArrowLeft className="w-4 h-4" />
        Back to News
      </button>
      <div >
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Main Content */}
          <div className="overflow-hidden">
            {/* Hero Image */}
            <div className="relative h-64 md:h-80 overflow-hidden">
              <img
                src={currentNews.imageUrl}
                alt="Cricket News"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            </div>

            {/* Content */}
            <div className="py-6 text-left">
              {/* Title */}
              <span className="text-2xl text- md:text-3xl font-bold text-gray-900 mb-4 leading-tight text-left">
                {currentNews.title}
              </span>

              {/* Subtitle */}
              <p className="text-lg text-gray-700 my-2 italic text-left">
                {currentNews.subtitle}
              </p>

              {/* Date and Share */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-200">
                {/* Date */}
                <div className="flex items-center gap-2">
                  <FaCalendarAlt className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600 font-medium">
                    {currentNews.date}
                  </span>
                </div>

                {/* Share Options */}
                <div className="flex items-center gap-2">
                  
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleShare("facebook")}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                      title="Share on Facebook"
                    >
                      <FaFacebook className="w-4 h-4 " />
                    </button>
                    <button
                      onClick={() => handleShare("twitter")}
                      className="p-2 text-blue-400 hover:bg-blue-50 rounded-full transition-colors"
                      title="Share on Twitter"
                    >
                      <FaTwitter className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleShare("whatsapp")}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors"
                      title="Share on WhatsApp"
                    >
                      <FaWhatsapp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleShare("copy")}
                      className="p-2 text-gray-600 hover:bg-gray-50 rounded-full transition-colors"
                      title="Copy Link"
                    >
                      <FaCopy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="prose prose-lg max-w-none text-left">
                {currentNews.content.split("\n\n").map((paragraph, index) => (
                  <p
                    key={index}
                    className="text-gray-700 leading-relaxed mb-4 text-left"
                  >
                    {paragraph.includes("**")
                      ? paragraph.split("**").map((part, partIndex) =>
                          partIndex % 2 === 1 ? (
                            <strong
                              key={partIndex}
                              className="font-bold text-gray-900"
                            >
                              {part}
                            </strong>
                          ) : (
                            part
                          )
                        )
                      : paragraph}
                  </p>
                ))}
              </div>

              {/* Squad Information */}
              {currentNews.squad && (
                <div className="mt-8   rounded-lg text-left">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 text-left">
                    {currentNews.squad.title}
                  </h2>
                  <div className="space-y-3 text-left">
                    <p className="text-gray-700 text-left">
                      <strong>Main Squad:</strong> {currentNews.squad.main}
                    </p>
                    <p className="text-gray-700 text-left">
                      <strong>Standby Players:</strong>{" "}
                      {currentNews.squad.standby}
                    </p>
                  </div>
                </div>
              )}

              {/* Related Tags */}
            </div>
          </div>
        </div>
      </div>

      </div>


        <div className="bg-[#1C1C27] pt-6 border-t border-gray-200 text-left">
          {/* Related News Section */}
          <div className="max-w-4xl mx-auto px-4  pb-8">
            <h3 className="text-lg font-bold text-white mb-4">Related News</h3>
            <div className="flex flex-wrap gap-6 justify-center">
              {/* We use the CricketNewsCard component for related news cards */}
              {/* For demo, pick any 3 news from newsData except the current one */}
              {Object.entries(newsData)
                .filter(([newsId]) => newsId !== id)
                .slice(0, 3)
                .map(([newsId, news]) => (
                  <div key={newsId}>
                    {/* Inline CricketNewsCard since we can't import here */}
                    <div
                      className="w-[270px] h-[250px] bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow duration-300 cursor-pointer"
                      onClick={() => navigate(`/details/${newsId}`)}
                    >
                      {/* Image Section */}
                      <div className="relative h-[150px] overflow-hidden">
                        <img
                          src={
                            news.imageUrl ||
                            "https://imgs.search.brave.com/5qtRzpLD_tho5javBzbwjW8wHDrS_s1SrUDvfE2RwhA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93YWxs/cGFwZXJhY2Nlc3Mu/Y29tL2Z1bGwvOTE3/NjY5Mi5qcGc"
                          }
                          alt="Cricket News"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {/* Content Section */}
                      <div className="p-4 relative bg-white">
                        <div className="absolute -top-[2px] left-0 w-full h-full">
                          <div className="flex items-center justify-center w-[80%]  h-1 mx-auto bg-pink-500 rounded-full "></div>
                        </div>
                        {/* Headline */}
                        <h3 className="text-sm font-bold text-gray-800 leading-tight mb-3 line-clamp-2">
                          {news.title}
                        </h3>
                        {/* Date and Share Row */}
                        <div className="flex items-center justify-between">
                          {/* Date */}
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-gray-200 rounded-full flex items-center justify-center">
                              <FaCalendarAlt className="w-2 h-2 text-gray-500" />
                            </div>
                            <span className="text-xs text-gray-600 font-medium">
                              {news.date}
                            </span>
                          </div>
                          {/* Share Icon */}
                          <FaShare className="w-4 h-4 text-gray-500" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
     
    </>
  );
}

export default DetailsPage;
