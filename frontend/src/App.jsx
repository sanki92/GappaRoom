import { useState } from 'react'
import Chat from './components/ChatBox'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Register from './pages/Register'
import RoomCreation from './pages/RoomCreation'
import ChatRoom from './pages/ChatRoom';

function App() {
  const [count, setCount] = useState(0)

  return (
   <>
    <Router>
      <Routes>
        <Route element={<Register/>} path='/'/>
        <Route element={<RoomCreation/>} path='/create-room'/>
        <Route element={<ChatRoom/>} path='/gapparoom/:id'/>

      </Routes>
    </Router>
   </>
  )
}

export default App
