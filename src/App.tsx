import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Onboarding from './pages/Onboarding/Onboarding'
import Counter from './pages/Counter/Counter'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Onboarding />} />
        <Route path="/counter" element={<Counter />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
