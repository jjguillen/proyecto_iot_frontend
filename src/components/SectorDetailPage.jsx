import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Activity, ArrowLeft, Leaf, Grid3x3, MapPin, AlertCircle } from 'lucide-react';
import { sectorService } from '../api/apiservice.jsx';
import SectorScadaIndustrial from '../components/SectorScadaIndustrial.jsx';

// Datos fijos para la predicción del tiempo (3 días)
const weatherForecast = [
  { day: 'Hoy', temp: '25°C', condition: 'Soleado' },
  { day: 'Mañana', temp: '22°C', condition: 'Nublado' },
  { day: 'Pasado', temp: '20°C', condition: 'Lluvia' }
];

export default function SectorDetailPage() {
    const { sectorId } = useParams();
    const navigate = useNavigate();
    const [sector, setSector] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadSectorDetail();
    }, [sectorId]);

    const loadSectorDetail = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await sectorService.getSectorInfo();
            const sectorData = data.find(s => s.id === parseInt(sectorId));
            if (sectorData) {
                setSector(sectorData);
            } else {
                setError('Sector no encontrado');
            }
        } catch (err) {
            console.error('Error loading sector detail:', err);
            setError('No se pudo cargar el detalle del sector');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            {/* Header General */}
            <header className="bg-slate-800/50 border-b border-slate-700 backdrop-blur-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => navigate('/')}
                                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                                title="Volver al inicio"
                            >
                                <ArrowLeft className="w-6 h-6 text-white" />
                            </button>
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
                                    <p className="text-xs text-slate-400">{forecast.day}</p>
                                    <p className="text-base font-bold text-white">{forecast.temp}</p>
                                    <p className="text-xs text-slate-300">{forecast.condition}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {loading && (
                    <div className="bg-slate-800 rounded-lg p-6">
                        <p className="text-slate-300 text-center">Cargando información del sector...</p>
                    </div>
                )}

                {error && (
                    <div className="bg-slate-800 rounded-lg p-6">
                        <div className="flex items-center gap-3 text-orange-400">
                            <AlertCircle className="w-5 h-5" />
                            <p>{error}</p>
                        </div>
                    </div>
                )}

                {sector && (
                    <>
                        {/* Información del Sector */}
                        <div className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-6 mb-6">
                            <div className="mb-6 pb-6 border-b border-slate-700">
                                <h2 className="text-2xl font-bold text-white">{sector.nombre}</h2>
                            </div>

                            <div className="flex flex-wrap gap-6 ml-2 sm:ml-4">
                                {/* Cultivo */}
                                {sector.cultivo && (
                                    <div className="flex items-start gap-3">
                                        <Leaf className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                                        <div>
                                            <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold">Cultivo</p>
                                            <p className="text-base text-white font-medium mt-1">{sector.cultivo}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Parcela */}
                                {sector.parcela && (
                                    <div className="flex items-start gap-3">
                                        <Grid3x3 className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" />
                                        <div>
                                            <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold">Parcela</p>
                                            <p className="text-base text-white font-medium mt-1">{sector.parcela}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Superficie */}
                                {sector.superficie && (
                                    <div className="flex items-start gap-3">
                                        <Grid3x3 className="w-5 h-5 text-amber-400 mt-1 flex-shrink-0" />
                                        <div>
                                            <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold">Superficie</p>
                                            <p className="text-base text-white font-medium mt-1">{sector.superficie.toFixed(2)} m²</p>
                                        </div>
                                    </div>
                                )}

                                {/* Ubicación */}
                                {(sector.latitud || sector.longitud) && (
                                    <div className="flex items-start gap-3">
                                        <MapPin className="w-5 h-5 text-red-400 mt-1 flex-shrink-0" />
                                        <div>
                                            <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold">Ubicación</p>
                                            <p className="text-sm text-slate-300 mt-1">
                                                {sector.latitud?.toFixed(6) || 'N/A'} N, {sector.longitud?.toFixed(6) || 'N/A'} E
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* SCADA del sector */}
                        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 sm:p-6">
                            <SectorScadaIndustrial sector={sector} />
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
