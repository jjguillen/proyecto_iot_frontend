// Componente Tarjeta de Sensor
import {SensorIcon} from "./SensorIcon.jsx";
import { TrendingUp, TrendingDown } from 'lucide-react';

export const SensorCard = ({ sensor, onClick, isSelected }) => {
    const getStatusColor = () => {
        if (sensor.estado === 'INACTIVO') return 'bg-red-500/20 border-red-500/50';
        return 'bg-emerald-500/20 border-emerald-500/50';
    };

    const getActuatorIcon = (sensor) => {
        // Lógica simple de tendencia (personalizar según necesidades)
        const state = sensor.estado;
        if (state === 'ARRANCADO')
            return <TrendingUp className="w-4 h-4 text-blue-400" />;
        if (state === 'PARADO')
            return <TrendingDown className="w-4 h-4 text-orange-400" />;

        return null;
    };

    const getEstadoClass = (estado) => {
        switch(estado) {
            case 'ACTIVO':
                return 'bg-emerald-500/20 text-emerald-400';
            case 'INACTIVO':
                return 'bg-red-500/20 text-red-400';
            case 'ERROR':
                return 'bg-red-500/20 text-red-400';
            case 'MANTENIMIENTO':
                return 'bg-yellow-500/20 text-yellow-400';
            case 'PARADO':
                return 'bg-orange-500/20 text-orange-400';
            case 'ARRANCADO':
                return 'bg-blue-500/20 text-blue-400';
            default:
                return 'bg-gray-500/20 text-gray-400';
        }
    };

    return (
        <div
            onClick={() => onClick(sensor)}
            className={`
        bg-slate-800 border-2 rounded-xl p-5 cursor-pointer
        transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/20
        ${isSelected ? 'border-blue-500 shadow-lg shadow-blue-500/30' : 'border-slate-700'}
        ${getStatusColor()}
      `}
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg bg-blue-500/20`}>
                    <SensorIcon type={sensor.tipo} />
                </div>
                <div className="flex items-center gap-2">
                    {getActuatorIcon(sensor)}

                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getEstadoClass(sensor.estado)}`}>
                      {sensor.estado}
                    </span>
                </div>
            </div>

            {/* Información del sensor */}
            <div className="space-y-2">
                <h3 className="text-white font-semibold text-lg truncate">{sensor.nombre}</h3>
                <p className="text-slate-400 text-sm">{sensor.ubicacion}</p>
            </div>

            {/* Footer */}
            <div className="mt-4 pt-4 border-t border-slate-700">
                <p className="text-xs text-slate-500">Última actualización: Hace 2 min</p>
            </div>
        </div>
    );
};