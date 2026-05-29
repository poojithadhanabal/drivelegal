import ChatWindow from './components/ChatWindow'
import Calculator from './components/Calculator'
import Dashboard from './components/Dashboard'

function App() {

  return (

    <div
      className="
        min-h-screen
        bg-[#0f1220]
        text-white
      "
    >

      {/* CHAT SECTION */}

      <section className="pb-10">

        <ChatWindow />

      </section>

      {/* CALCULATOR SECTION */}

      <section
        className="
          max-w-6xl
          mx-auto
          px-4
          pb-12
        "
      >

        <Calculator />

      </section>

      {/* DASHBOARD SECTION */}

      <section
        className="
          max-w-6xl
          mx-auto
          px-4
          pb-20
        "
      >

        <Dashboard />

      </section>

      {/* FOOTER */}

      <footer
        className="
          border-t
          border-white/10
          py-6
          text-center
          text-gray-400
          text-sm
        "
      >

        🚦 DriveLegal AI • Smart Traffic Law Assistant

      </footer>

    </div>
  )
}

export default App