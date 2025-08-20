import React from 'react'
import CricketNewsCard from '../components/CricketNewsCard'
import Footer from '../components/Footer'

function ListingPage() {
  // Sample data for cricket news cards
  const cricketNewsData = [
    {
      id: 1,
      title: "Sanju Samson makes the cut in India's Asia Cup 2025 squad",
      date: "19 Aug, 2025",
      imageUrl: "https://imgs.search.brave.com/5qtRzpLD_tho5javBzbwjW8wHDrS_s1SrUDvfE2RwhA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93YWxs/cGFwZXJhY2Nlc3Mu/Y29tL2Z1bGwvOTE3/NjY5Mi5qcGc",
      description: "Rajasthan Royals captain Sanju Samson has been included in India's squad for the upcoming Asia Cup 2025."
    },
    {
      id: 2,
      title: "Rajasthan Royals announce new coaching staff for IPL 2025",
      date: "18 Aug, 2025",
      imageUrl: "https://imgs.search.brave.com/5qtRzpLD_tho5javBzbwjW8wHDrS_s1SrUDvfE2RwhA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93YWxs/cGFwZXJhY2Nlc3Mu/Y29tL2Z1bGwvOTE3/NjY5Mi5qcGc",
      description: "The franchise has brought in fresh faces to strengthen their coaching setup ahead of the new season."
    },
    {
      id: 3,
      title: "Jos Buttler's century powers Royals to victory in practice match",
      date: "17 Aug, 2025",
      imageUrl: "https://imgs.search.brave.com/5qtRzpLD_tho5javBzbwjW8wHDrS_s1SrUDvfE2RwhA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93YWxs/cGFwZXJhY2Nlc3Mu/Y29tL2Z1bGwvOTE3/NjY5Mi5qcGc",
      description: "English wicketkeeper-batsman Jos Buttler scored a brilliant century in the team's practice match."
    },
    {
      id: 4,
      title: "Rajasthan Royals sign promising young fast bowler",
      date: "16 Aug, 2025",
      imageUrl: "https://imgs.search.brave.com/5qtRzpLD_tho5javBzbwjW8wHDrS_s1SrUDvfE2RwhA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93YWxs/cGFwZXJhY2Nlc3Mu/Y29tL2Z1bGwvOTE3/NjY5Mi5qcGc",
      description: "The franchise has added a talented young fast bowler to their squad for the upcoming season."
    },
    {
      id: 5,
      title: "Royals' home ground to undergo major renovation",
      date: "15 Aug, 2025",
      imageUrl: "https://imgs.search.brave.com/5qtRzpLD_tho5javBzbwjW8wHDrS_s1SrUDvfE2RwhA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93YWxs/cGFwZXJhY2Nlc3Mu/Y29tL2Z1bGwvOTE3/NjY5Mi5qcGc",
      description: "Sawai Mansingh Stadium will see significant upgrades to enhance the spectator experience."
    },
    {
      id: 6,
      title: "Rajasthan Royals launch new fan engagement program",
      date: "14 Aug, 2025",
      imageUrl: "https://imgs.search.brave.com/5qtRzpLD_tho5javBzbwjW8wHDrS_s1SrUDvfE2RwhA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93YWxs/cGFwZXJhY2Nlc3Mu/Y29tL2Z1bGwvOTE3/NjY5Mi5qcGc",
      description: "The franchise introduces innovative ways for fans to connect with their favorite players."
    },
    {
      id: 7,
      title: "Royals' captain Sanju Samson speaks about team strategy",
      date: "13 Aug, 2025",
      imageUrl: "https://imgs.search.brave.com/5qtRzpLD_tho5javBzbwjW8wHDrS_s1SrUDvfE2RwhA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93YWxs/cGFwZXJhY2Nlc3Mu/Y29tL2Z1bGwvOTE3/NjY5Mi5qcGc",
      description: "Sanju Samson shares insights into the team's approach for the upcoming IPL season."
    },
    {
      id: 8,
      title: "Rajasthan Royals announce partnership with local cricket academy",
      date: "12 Aug, 2025",
      imageUrl: "https://imgs.search.brave.com/5qtRzpLD_tho5javBzbwjW8wHDrS_s1SrUDvfE2RwhA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93YWxs/cGFwZXJhY2Nlc3Mu/Y29tL2Z1bGwvOTE3/NjY5Mi5qcGc",
      description: "The franchise partners with a local academy to nurture young cricket talent in Rajasthan."
    }
  ];

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-2xl font-bold  mb-2" >
            <span style={{ color: 'linear-gradient(90deg, hsl(var(--color-hsl-primary-dark)) 0.93%, hsl(var(--color-hsl-secondary-dark)) 100%)' }}>Rajasthan Royals news</span>
          </div>
          <div className="h-[7px] mx-auto w-64 mb-1" style={{ background: 'linear-gradient(90deg, hsl(var(--color-hsl-primary-dark)) 0.93%, hsl(var(--color-hsl-secondary-dark)) 100%)' }}></div>
          <div className="h-1 mx-auto w-64" style={{ background: 'linear-gradient(90deg, hsl(var(--color-hsl-primary-dark)) 0.93%, hsl(var(--color-hsl-secondary-dark)) 100%)' }}></div>
        </div>
        
        {/* Card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center pt-3">
          {/* Multiple Cricket News Cards */}
          {cricketNewsData.map((news) => (
            <CricketNewsCard
              key={news.id}
              id={news.id}
              title={news.title}
              date={news.date}
              imageUrl={news.imageUrl}
              description={news.description}
            />
          ))}
        </div>
        
        {/* Footer */}
        
      </div>
    </div>
  )
}

export default ListingPage 