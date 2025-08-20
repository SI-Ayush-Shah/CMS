import { Outlet, Link } from 'react-router-dom'
import './App.css'
import Header from './components/Header'
import { useEffect } from 'react'
import Footer from './components/Footer'

function App() {
  useEffect(() => {
    console.log('App component mounted!');
    console.log('Header component:', Header);
  }, []);

  return (
    <div className="app">
      <Header/>
      
      <main className="main-content">
        <Outlet />
      </main>

      <Footer />
    </div>
  )
}

export default App
