import { Routes, Route } from 'react-router-dom'

import Casa from './components/Casa/Casa'
import Disponibilidad from './components/Disponibilidad/Disponibilidad'
import Calendario from './components/Calendario/Calendario'
import Admin from './components/Admin/Admin'

import './App.css'

function App() {

  return (
    <>
      <Routes>
        <Route path='/' element={<Casa />} />
        <Route path='/disponibilidad' element={<Disponibilidad />} />
        <Route path='/calendario' element={<Calendario />} />
        <Route path='/admin' element={<Admin/>} />
      </Routes>
    </>
  )
}

export default App
