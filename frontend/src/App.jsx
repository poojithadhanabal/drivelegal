import { useState } from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'

import ChatWindow from './components/ChatWindow'
import LocationBar from './components/LocationBar'
import ChallanCalculator from './pages/ChallanCalculator'

export default function App() {
  const [location, setLocation] = useState(
    localStorage.getItem('drivelegal_location') || 'National'
  )

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100 flex flex-col">

        {/* Navbar */}
        <header className="bg-green-800 text-white px-6 py-4 flex items-center justify-between shadow-md">
          <div>
            <h1 className="text-2xl font-bold">🚦 DriveLegal</h1>
            <p className="text-green-300 text-xs">
              AI Traffic Law Assistant
            </p>
          </div>

          <nav className="flex gap-5 text-sm font-medium">
            <Link
              to="/"
              className="hover:text-green-300 transition-colors"
            >
              💬 Chat
            </Link>

            <Link
              to="/challan"
              className="hover:text-green-300 transition-colors"
            >
              💰 Calculator
            </Link>
          </nav>
        </header>

        {/* Routes */}
        <Routes>

          {/* Chat page */}
          <Route
            path="/"
            element={
              <>
                <LocationBar onLocationChange={setLocation} />

                <div
                  className="flex-1 max-w-3xl w-full mx-auto bg-white
                             shadow-sm rounded-b-2xl overflow-hidden
                             flex flex-col"
                  style={{ height: 'calc(100vh - 140px)' }}
                >
                  <ChatWindow location={location} />
                </div>
              </>
            }
          />

          {/* Challan calculator page */}
          <Route
            path="/challan"
            element={<ChallanCalculator />}
          />

        </Routes>
      </div>
    </BrowserRouter>
  )
}