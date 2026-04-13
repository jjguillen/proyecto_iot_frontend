import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { sectorService } from '../api/apiservice.jsx';
import { AlertCircle, MapPin, Leaf, Grid3x3 } from 'lucide-react';

export default function SectoresPanel() {
    const navigate = useNavigate();
    const [sectores, setSectores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadSectores();
    }, []);

    const loadSectores = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await sectorService.getSectorInfo();
            setSectores(data);
        } catch (err) {
            console.error('Error loading sectors:', err);
            setError('No se pudieron cargar los sectores');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-slate-800 rounded-lg p-6">
                <p className="text-slate-300 text-center">Cargando información de sectores...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-slate-800 rounded-lg p-6">
                <div className="flex items-center gap-3 text-orange-400">
                    <AlertCircle className="w-5 h-5" />
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="mt-12">
            <div className="mb-6">
                <h2 className="text-xl font-semibold text-white mb-2">Información de Sectores</h2>
                <p className="text-slate-400">Detalles de los sectores de cultivo asociados</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {sectores.map((sector) => (
                    <div key={sector.id} className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-slate-600 transition-colors">
                        {/* Encabezado con nombre */}
                        <div className="mb-4 pb-4 border-b border-slate-700">
                            <h3 className="text-lg font-semibold text-white">{sector.nombre}</h3>
                        </div>

                        {/* Información del sector */}
                        <div className="space-y-3">
                            {/* Cultivo */}
                            {sector.cultivo && (
                                <div className="flex items-start gap-3">
                                    <Leaf className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                                    <div className="flex-1">
                                        <p className="text-xs text-slate-400 uppercase tracking-wide">Cultivo</p>
                                        <p className="text-sm text-white font-medium">{sector.cultivo}</p>
                                    </div>
                                </div>
                            )}

                            {/* Parcela */}
                            {sector.parcela && (
                                <div className="flex items-start gap-3">
                                    <Grid3x3 className="w-4 h-4 text-blue-400 mt-1 flex-shrink-0" />
                                    <div className="flex-1">
                                        <p className="text-xs text-slate-400 uppercase tracking-wide">Parcela</p>
                                        <p className="text-sm text-white font-medium">{sector.parcela}</p>
                                    </div>
                                </div>
                            )}

                            {/* Superficie */}
                            {sector.superficie && (
                                <div className="flex items-start gap-3">
                                    <Grid3x3 className="w-4 h-4 text-amber-400 mt-1 flex-shrink-0" />
                                    <div className="flex-1">
                                        <p className="text-xs text-slate-400 uppercase tracking-wide">Superficie</p>
                                        <p className="text-sm text-white font-medium">
                                            {sector.superficie.toFixed(2)} m²
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Ubicación (Latitud y Longitud) */}
                            {(sector.latitud || sector.longitud) && (
                                <div className="flex items-start gap-3">
                                    <MapPin className="w-4 h-4 text-red-400 mt-1 flex-shrink-0" />
                                    <div className="flex-1">
                                        <p className="text-xs text-slate-400 uppercase tracking-wide">Ubicación</p>
                                        <p className="text-xs text-slate-300">
                                            {sector.latitud?.toFixed(6) || 'N/A'} N
                                        </p>
                                        <p className="text-xs text-slate-300">
                                            {sector.longitud?.toFixed(6) || 'N/A'} E
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Botón de acción */}
                        <button
                            onClick={() => navigate(`/sector/${sector.id}`)}
                            className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 rounded transition-colors"
                        >
                            Ver detalles
                        </button>
                    </div>
                ))}
            </div>

            {sectores.length === 0 && (
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 text-center">
                    <p className="text-slate-400">No hay sectores disponibles</p>
                </div>
            )}
        </div>
    );
}
