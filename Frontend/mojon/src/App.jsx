import { Routes, Route } from 'react-router-dom'

import Casa from './components/Casa/Casa'
import Disponibilidad from './components/Disponibilidad/Disponibilidad'
import Calendario from './components/Calendario/Calendario'
import Admin from './components/Admin/Admin'
import Privacidad from '../Public/Privacidad'
import Terminos from '../Public/Terminos'

import './App.css'

function App() {

  return (
    <>
      <Routes>
        <Route path='/' element={<Casa />} />
        <Route path='/disponibilidad' element={<Disponibilidad />} />
        <Route path='/calendario' element={<Calendario />} />
        <Route path='/admin' element={<Admin />} />
        <Route path='/privacidad' element={<Privacidad />} />
        <Route path='/terminos' element={<Terminos />} />
      </Routes>
    </>
  )
}

export default App
