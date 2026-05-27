import ChatWindow from './components/ChatWindow'
import Calculator from './components/Calculator'

function App() {

  return (

    <div className="min-h-screen bg-[#0f1220] text-white">

      <ChatWindow />

      <div className="max-w-5xl mx-auto px-4 pb-10">
        <Calculator />
      </div>

    </div>
  )
}

export default App