// Componente Principal
import { Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import EsquemaBalsasIndustrial from "./EsquemaBalsasIndustrial.jsx";
import SectoresPanel from "./SectoresPanel.jsx";

// Datos fijos para la predicción del tiempo (3 días)
const weatherForecast = [
  { day: 'Hoy', temp: '25°C', condition: 'Soleado' },
  { day: 'Mañana', temp: '22°C', condition: 'Nublado' },
  { day: 'Pasado', temp: '20°C', condition: 'Lluvia' }
];

export default function IoTDashboard() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            {/* Header General */}
            <header className="bg-slate-800/50 border-b border-slate-700 backdrop-blur-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500 rounded-lg">
                                <Activity className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white">Proyecto Agrotech</h1>
                                <p className="text-slate-400 text-sm">Sistema de Monitorización IoT</p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Sub-Header: Predicción del Tiempo */}
            <nav className="bg-slate-700/50 border-b border-slate-600 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-white">Predicción del Tiempo - Próximos 3 Días</h2>
                        <div className="flex gap-6">
                            {weatherForecast.map((forecast, index) => (
                                <div key={index} className="text-center">
                                    <p className="text-sm text-slate-400">{forecast.day}</p>
                                    <p className="text-lg font-bold text-white">{forecast.temp}</p>
                                    <p className="text-sm text-slate-300">{forecast.condition}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content: Esquema de Balsas */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-6">
                    <h2 className="text-xl font-semibold text-white mb-2">Esquema de Balsas Industriales</h2>
                    <p className="text-slate-400">Visualización en tiempo real del sistema de riego</p>
                </div>
                <EsquemaBalsasIndustrial />
                <SectoresPanel />
            </main>
        </div>
    );
}
