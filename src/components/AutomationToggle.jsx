import React, { useEffect, useState } from 'react';
import { configuracionService } from '../api/apiservice.jsx';

/**
 * Muestra dos botones toggle para activar/desactivar las automatizaciones
 * de niveles de balsa y de riego por humedad.
 *
 * Props:
 *  - showNivel   (bool, default true)  — muestra el toggle de nivel
 *  - showHumedad (bool, default true)  — muestra el toggle de humedad
 */
export default function AutomationToggle({ showNivel = true, showHumedad = true }) {
    const [config, setConfig] = useState({ nivelEnabled: true, humedadEnabled: true });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        configuracionService.getConfig()
            .then(setConfig)
            .catch(console.error);
    }, []);

    const toggle = async (tipo) => {
        setLoading(true);
        try {
            let updated;
            if (tipo === 'nivel') {
                updated = await configuracionService.setNivel(!config.nivelEnabled);
            } else {
                updated = await configuracionService.setHumedad(!config.humedadEnabled);
            }
            setConfig(updated);
        } catch (e) {
            console.error('Error al cambiar automatización:', e);
        } finally {
            setLoading(false);
        }
    };

    const ToggleBtn = ({ label, enabled, onClick }) => (
        <button
            onClick={onClick}
            disabled={loading}
            title={enabled ? 'Automatización activa — pulsa para desactivar' : 'Automatización inactiva — pulsa para activar'}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: '20px',
                border: `1px solid ${enabled ? '#639922' : '#888'}`,
                background: enabled ? '#EAF3DE' : '#f0f0f0',
                color: enabled ? '#3B6D11' : '#666',
                fontSize: '11px',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                transition: 'all .2s',
                whiteSpace: 'nowrap',
            }}
        >
            {/* Indicador circular */}
            <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: enabled ? '#639922' : '#aaa',
                flexShrink: 0,
            }} />
            {label}
            <span style={{ fontWeight: 400, opacity: 0.8 }}>{enabled ? 'ON' : 'OFF'}</span>
        </button>
    );

    return (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: '#888', marginRight: '2px' }}>Auto:</span>
            {showNivel && (
                <ToggleBtn
                    label="Niveles"
                    enabled={config.nivelEnabled}
                    onClick={() => toggle('nivel')}
                />
            )}
            {showHumedad && (
                <ToggleBtn
                    label="Humedad"
                    enabled={config.humedadEnabled}
                    onClick={() => toggle('humedad')}
                />
            )}
        </div>
    );
}

