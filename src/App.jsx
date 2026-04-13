import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css'
import IoTDashboard from "./components/IoTDashboard.jsx";
import SectorDetailPage from "./components/SectorDetailPage.jsx";

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<IoTDashboard/>} />
                <Route path="/sector/:sectorId" element={<SectorDetailPage/>} />
            </Routes>
        </BrowserRouter>
    </>
  )
}

export default App
