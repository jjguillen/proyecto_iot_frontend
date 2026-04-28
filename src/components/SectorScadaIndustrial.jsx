import React, { useEffect, useMemo, useState } from 'react';
import { sensorService } from '../api/apiservice.jsx';

const LEVEL_SENSOR_BY_SECTOR = {
  2: 6,
  3: 7,
  4: 8
};

const SCADA_IDS_BY_SECTOR = {
  2: { pump: 9, flow: 12, pressure: 13, valveA: 10, humidityA: 14, valveB: 11, humidityB: 15 },
  3: { pump: 16, flow: 19, pressure: 20, valveA: 17, humidityA: 21, valveB: 18, humidityB: 22 },
  4: { pump: 23, flow: 26, pressure: 27, valveA: 24, humidityA: 28, valveB: 25, humidityB: 29 }
};

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const isOn = (estado) => estado === 'ARRANCADO' || estado === 'on' || estado === true;

const fmt = (value, digits = 1, suffix = '') => {
  if (value == null || Number.isNaN(Number(value))) return `N/A${suffix ? ` ${suffix}` : ''}`;
  return `${Number(value).toFixed(digits)}${suffix ? ` ${suffix}` : ''}`;
};

async function safeGetSensor(sensorId) {
  if (!sensorId) return null;
  try {
    return await sensorService.getSensorById(sensorId);
  } catch {
    return null;
  }
}

async function safeGetReading(sensorId) {
  if (!sensorId) return null;
  try {
    const reading = await sensorService.getLastSensorReading(sensorId);
    return reading?.valor ?? null;
  } catch {
    return null;
  }
}

const SENSOR_POPUP_CONFIG = {
  tank: { title: 'Sensor nivel balsa', unit: 'cm', digits: 1 },
  flow: { title: 'Sensor caudal', unit: 'L/min', digits: 1 },
  pressure: { title: 'Sensor presion', unit: 'bar', digits: 2 },
  humidityA: { title: 'Sensor humedad ramal 1', unit: '%', digits: 1 },
  humidityB: { title: 'Sensor humedad ramal 2', unit: '%', digits: 1 }
};

const ACTUATOR_POPUP_CONFIG = {
  pump: { title: 'Bomba centrifuga', onLabel: 'EN MARCHA', offLabel: 'PARADA', actionOn: 'Arrancar', actionOff: 'Parar' },
  valveA: { title: 'Electrovalvula EV-1', onLabel: 'ABIERTA', offLabel: 'CERRADA', actionOn: 'Abrir', actionOff: 'Cerrar' },
  valveB: { title: 'Electrovalvula EV-2', onLabel: 'ABIERTA', offLabel: 'CERRADA', actionOn: 'Abrir', actionOff: 'Cerrar' }
};

export default function SectorScadaIndustrial({ sector }) {
  const sectorId = Number(sector?.id);

  const [loading, setLoading] = useState(true);
  const [scada, setScada] = useState({
    tankLevel: null,
    pumpOn: null,
    flow: null,
    pressure: null,
    valveAOn: null,
    humidityA: null,
    valveBOn: null,
    humidityB: null
  });
  const [sensorInfo, setSensorInfo] = useState({
    tank: null,
    pump: null,
    flow: null,
    pressure: null,
    valveA: null,
    humidityA: null,
    valveB: null,
    humidityB: null
  });
  const [popup, setPopup] = useState({ visible: false, nodeKey: null });
  const [actionLoading, setActionLoading] = useState(false);

  const ids = useMemo(() => {
    const level = LEVEL_SENSOR_BY_SECTOR[sectorId];
    const defaults = SCADA_IDS_BY_SECTOR[sectorId] || {};

    return {
      level,
      ...defaults
    };
  }, [sectorId]);

  const nodeSensorIds = useMemo(() => ({
    tank: ids.level,
    pump: ids.pump,
    flow: ids.flow,
    pressure: ids.pressure,
    valveA: ids.valveA,
    humidityA: ids.humidityA,
    valveB: ids.valveB,
    humidityB: ids.humidityB
  }), [ids]);

  useEffect(() => {
    let alive = true;

    const loadScada = async () => {
      setLoading(true);

      const [
        tankSensor,
        levelReading,
        pumpSensor,
        flowSensor,
        flowReading,
        pressureSensor,
        pressureReading,
        valveASensor,
        humidityASensor,
        humidityAReading,
        valveBSensor,
        humidityBSensor,
        humidityBReading
      ] = await Promise.all([
        safeGetSensor(ids.level),
        safeGetReading(ids.level),
        safeGetSensor(ids.pump),
        safeGetSensor(ids.flow),
        safeGetReading(ids.flow),
        safeGetSensor(ids.pressure),
        safeGetReading(ids.pressure),
        safeGetSensor(ids.valveA),
        safeGetSensor(ids.humidityA),
        safeGetReading(ids.humidityA),
        safeGetSensor(ids.valveB),
        safeGetSensor(ids.humidityB),
        safeGetReading(ids.humidityB)
      ]);

      if (!alive) return;

      setScada({
        tankLevel: levelReading,
        pumpOn: pumpSensor ? isOn(pumpSensor.estado) : null,
        flow: flowReading,
        pressure: pressureReading,
        valveAOn: valveASensor ? isOn(valveASensor.estado) : null,
        humidityA: humidityAReading,
        valveBOn: valveBSensor ? isOn(valveBSensor.estado) : null,
        humidityB: humidityBReading
      });

      setSensorInfo({
        tank: tankSensor,
        pump: pumpSensor,
        flow: flowSensor,
        pressure: pressureSensor,
        valveA: valveASensor,
        humidityA: humidityASensor,
        valveB: valveBSensor,
        humidityB: humidityBSensor
      });

      setLoading(false);
    };

    loadScada();
    const interval = setInterval(loadScada, 10000);

    return () => {
      alive = false;
      clearInterval(interval);
    };
  }, [ids]);

  const tankPct = clamp(((scada.tankLevel ?? 0) / 100) * 100, 0, 100);

  const openPopup = (nodeKey) => setPopup({ visible: true, nodeKey });
  const closePopup = () => setPopup({ visible: false, nodeKey: null });

  const readingByNode = {
    tank: scada.tankLevel,
    flow: scada.flow,
    pressure: scada.pressure,
    humidityA: scada.humidityA,
    humidityB: scada.humidityB
  };

  const actuatorStateByNode = {
    pump: scada.pumpOn,
    valveA: scada.valveAOn,
    valveB: scada.valveBOn
  };

  const popupSensor = popup.nodeKey ? sensorInfo[popup.nodeKey] : null;
  const popupSensorCfg = popup.nodeKey ? SENSOR_POPUP_CONFIG[popup.nodeKey] : null;
  const popupActuatorCfg = popup.nodeKey ? ACTUATOR_POPUP_CONFIG[popup.nodeKey] : null;
  const popupReading = popup.nodeKey ? readingByNode[popup.nodeKey] : null;
  const popupActuatorState = popup.nodeKey ? actuatorStateByNode[popup.nodeKey] : null;

  const actuatorNodeKeys = ['pump', 'valveA', 'valveB'];

  const applyAutomationActions = (actions = []) => {
    const keyBySensorId = actuatorNodeKeys.reduce((acc, key) => {
      const id = nodeSensorIds[key];
      if (id) acc[id] = key;
      return acc;
    }, {});

    setScada((prev) => {
      const next = { ...prev };
      actions.forEach((action) => {
        const nodeKey = keyBySensorId[action.actuadorId];
        if (!nodeKey) return;
        const on = isOn(action.state);
        if (nodeKey === 'pump') next.pumpOn = on;
        if (nodeKey === 'valveA') next.valveAOn = on;
        if (nodeKey === 'valveB') next.valveBOn = on;
      });
      return next;
    });

    setSensorInfo((prev) => {
      const next = { ...prev };
      actions.forEach((action) => {
        const nodeKey = keyBySensorId[action.actuadorId];
        if (!nodeKey || !next[nodeKey]) return;
        next[nodeKey] = { ...next[nodeKey], estado: action.state };
      });
      return next;
    });
  };

  const handleActuatorToggle = async (newValue) => {
    if (!popup.nodeKey) return;

    const sensorId = nodeSensorIds[popup.nodeKey];
    if (!sensorId) return;

    try {
      setActionLoading(true);
      const targetState = newValue ? 'ARRANCADO' : 'PARADO';
      const decision = await sensorService.decideActuatorState(sensorId, targetState);

      if (!decision?.allowed) {
        window.alert(decision?.reason || 'Accion no permitida por reglas de automatizacion');
        return;
      }

      applyAutomationActions(decision.actions || []);
    } catch (error) {
      const reason = error?.response?.data?.reason;
      if (reason) {
        window.alert(reason);
      } else {
        console.error('Error actualizando actuador:', error);
      }
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-base font-semibold text-white">Esquema {sector?.nombre || 'del sector'}</h3>
        <span className="text-xs text-slate-400">{loading ? 'Actualizando...' : 'Actualizado'}</span>
      </div>

      <div className="rounded-lg border border-slate-700 bg-slate-900/30 p-3">
        <style>{`
          .scada-lbl { font-family: sans-serif; font-size: 11px; fill: #D3D1C7; }
          .scada-lbl-sm { font-family: sans-serif; font-size: 10px; fill: #B4B2A9; }
          .scada-lbl-bold { font-family: sans-serif; font-size: 12px; font-weight: 700; fill: #ECEBE6; }
          .scada-val-ok { font-family: sans-serif; font-size: 10px; font-weight: 700; fill: #3B6D11; }
          .scada-val-warn { font-family: sans-serif; font-size: 10px; font-weight: 700; fill: #BA7517; }
          .scada-val-off { font-family: sans-serif; font-size: 10px; font-weight: 700; fill: #A32D2D; }
          .scada-pipe { fill: none; stroke: #185FA5; stroke-width: 6; stroke-linecap: round; stroke-linejoin: round; }
          .scada-sig { fill: none; stroke: #888780; stroke-width: 1; stroke-dasharray: 4 3; stroke-linecap: round; }
          .scada-tank-bg { fill: #444441; stroke: #888780; stroke-width: 1.2; }
          .scada-water { fill: #85B7EB; opacity: 0.6; }
          .scada-hov { cursor: pointer; }
          .scada-hov:hover { opacity: 0.85; }
        `}</style>

        <svg width="100%" viewBox="0 0 980 420" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <clipPath id="cp-sector-tank"><rect x="40" y="125" width="140" height="180" rx="6" /></clipPath>
            <marker id="arr-sector" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M2 1L8 5L2 9" fill="none" stroke="#185FA5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </marker>
          </defs>

          <g className="scada-hov" onClick={() => openPopup('tank')}>
            <rect x="40" y="125" width="140" height="180" rx="6" className="scada-tank-bg" />
            <rect x="40" y={125 + (180 * (100 - tankPct) / 100)} width="140" height={180 * tankPct / 100} className="scada-water" clipPath="url(#cp-sector-tank)" />
            <rect x="40" y="125" width="140" height="180" rx="6" fill="none" stroke="#888780" strokeWidth="1.2" />
          </g>
          <text className="scada-lbl-bold" x="110" y="326" textAnchor="middle">Balsa {sector?.nombre || ''}</text>
          <g className="scada-hov" onClick={() => openPopup('tank')}>
            <line x1="110" y1="125" x2="110" y2="95" className="scada-sig" />
            <rect x="70" y="74" width="80" height="18" rx="4" fill="#EAF3DE" stroke="#639922" strokeWidth="0.8" />
            <text className="scada-val-ok" x="110" y="86" textAnchor="middle">{fmt(scada.tankLevel, 1, 'cm')}</text>
          </g>

          <line x1="180" y1="216" x2="250" y2="216" className="scada-pipe" />
          <line x1="195" y1="213" x2="208" y2="216" stroke="#fff" strokeWidth="1.5" markerEnd="url(#arr-sector)" />
          <line x1="220" y1="213" x2="233" y2="216" stroke="#fff" strokeWidth="1.5" markerEnd="url(#arr-sector)" />

          <g className="scada-hov" onClick={() => openPopup('pump')}>
            <circle cx="275" cy="216" r="26" fill="#F1EFE8" stroke="#444441" strokeWidth="1.2" />
            <circle cx="275" cy="216" r="17" fill="none" stroke="#185FA5" strokeWidth="1" />
            <polygon points="267,210 289,216 267,222" fill={scada.pumpOn ? '#185FA5' : '#B4B2A9'} />
            <text className="scada-lbl-sm" x="275" y="248" textAnchor="middle">Bomba</text>
            <rect x="254" y="252" width="42" height="14" rx="3" fill={scada.pumpOn ? '#EAF3DE' : '#FCEBEB'} stroke={scada.pumpOn ? '#639922' : '#A32D2D'} strokeWidth="0.8" />
            <text className={scada.pumpOn ? 'scada-val-ok' : 'scada-val-off'} x="275" y="262" textAnchor="middle">{scada.pumpOn == null ? 'N/A' : scada.pumpOn ? 'ON' : 'OFF'}</text>
          </g>

          <line x1="301" y1="216" x2="390" y2="216" className="scada-pipe" />

          <g className="scada-hov" onClick={() => openPopup('flow')}>
            <rect x="390" y="190" width="92" height="52" rx="8" fill="#1F2937" stroke="#475569" strokeWidth="1.2" />
            <text className="scada-lbl-sm" x="436" y="208" textAnchor="middle">Sensor caudal</text>
            <text className="scada-lbl-bold" x="436" y="228" textAnchor="middle">{fmt(scada.flow, 1, 'L/min')}</text>
          </g>

          <line x1="482" y1="216" x2="568" y2="216" className="scada-pipe" />

          <g className="scada-hov" onClick={() => openPopup('pressure')}>
            <rect x="568" y="190" width="92" height="52" rx="8" fill="#1F2937" stroke="#475569" strokeWidth="1.2" />
            <text className="scada-lbl-sm" x="614" y="208" textAnchor="middle">Sensor presion</text>
            <text className="scada-lbl-bold" x="614" y="228" textAnchor="middle">{fmt(scada.pressure, 2, 'bar')}</text>
          </g>

          <line x1="660" y1="216" x2="736" y2="216" className="scada-pipe" />
          <line x1="736" y1="216" x2="736" y2="110" className="scada-pipe" />
          <line x1="736" y1="216" x2="736" y2="322" className="scada-pipe" />

          <line x1="736" y1="110" x2="840" y2="110" className="scada-pipe" />
          <g className="scada-hov" onClick={() => openPopup('valveA')}>
            <rect x="840" y="97" width="30" height="26" rx="5" fill={scada.valveAOn ? '#EAF3DE' : '#FCEBEB'} stroke={scada.valveAOn ? '#3B6D11' : '#A32D2D'} strokeWidth="1.2" />
            <line x1="847" y1="101" x2="863" y2="119" stroke={scada.valveAOn ? '#3B6D11' : '#A32D2D'} strokeWidth="1.5" strokeLinecap="round" />
            <line x1="863" y1="101" x2="847" y2="119" stroke={scada.valveAOn ? '#3B6D11' : '#A32D2D'} strokeWidth="1.5" strokeLinecap="round" />
            <text className="scada-lbl-sm" x="855" y="136" textAnchor="middle">EV-1</text>
          </g>

          <g className="scada-hov" onClick={() => openPopup('humidityA')}>
            <rect x="885" y="84" width="86" height="52" rx="8" fill="#1F2937" stroke="#475569" strokeWidth="1.2" />
            <text className="scada-lbl-sm" x="928" y="102" textAnchor="middle">Humedad 1</text>
            <text className={scada.humidityA != null && scada.humidityA < 30 ? 'scada-val-warn' : 'scada-val-ok'} x="928" y="122" textAnchor="middle">{fmt(scada.humidityA, 1, '%')}</text>
          </g>

          <line x1="736" y1="322" x2="840" y2="322" className="scada-pipe" />
          <g className="scada-hov" onClick={() => openPopup('valveB')}>
            <rect x="840" y="309" width="30" height="26" rx="5" fill={scada.valveBOn ? '#EAF3DE' : '#FCEBEB'} stroke={scada.valveBOn ? '#3B6D11' : '#A32D2D'} strokeWidth="1.2" />
            <line x1="847" y1="313" x2="863" y2="331" stroke={scada.valveBOn ? '#3B6D11' : '#A32D2D'} strokeWidth="1.5" strokeLinecap="round" />
            <line x1="863" y1="313" x2="847" y2="331" stroke={scada.valveBOn ? '#3B6D11' : '#A32D2D'} strokeWidth="1.5" strokeLinecap="round" />
            <text className="scada-lbl-sm" x="855" y="348" textAnchor="middle">EV-2</text>
          </g>

          <g className="scada-hov" onClick={() => openPopup('humidityB')}>
            <rect x="885" y="296" width="86" height="52" rx="8" fill="#1F2937" stroke="#475569" strokeWidth="1.2" />
            <text className="scada-lbl-sm" x="928" y="314" textAnchor="middle">Humedad 2</text>
            <text className={scada.humidityB != null && scada.humidityB < 30 ? 'scada-val-warn' : 'scada-val-ok'} x="928" y="334" textAnchor="middle">{fmt(scada.humidityB, 1, '%')}</text>
          </g>
        </svg>
      </div>

      {popup.visible && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.35)',
            zIndex: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div
            style={{
              background: '#fff',
              border: '0.5px solid #ccc',
              borderRadius: '12px',
              padding: '20px 24px',
              minWidth: '240px',
              maxWidth: '320px',
              position: 'relative'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <span style={{ fontSize: '14px', fontWeight: 500, color: '#222' }}>
                {popupActuatorCfg?.title || popupSensorCfg?.title || 'Componente SCADA'}
              </span>
              <button
                onClick={closePopup}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: '#888', padding: '0 4px' }}
              >
                ✕
              </button>
            </div>

            {popupSensorCfg && (
              <div>
                <div style={{ marginBottom: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '10px' }}>
                    <span style={{ fontSize: '28px', fontWeight: 500, color: '#3B6D11' }}>
                      {fmt(popupReading, popupSensorCfg.digits, popupSensorCfg.unit)}
                    </span>
                  </div>
                </div>
                <div style={{ borderTop: '0.5px solid #e0e0e0', paddingTop: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: '12px' }}>
                    <span style={{ color: '#888' }}>Nombre</span>
                    <span style={{ fontWeight: 500, color: '#222' }}>{popupSensor?.nombre || 'N/A'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: '12px' }}>
                    <span style={{ color: '#888' }}>Tipo</span>
                    <span style={{ fontWeight: 500, color: '#222' }}>{popupSensor?.tipo || 'N/A'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: '12px' }}>
                    <span style={{ color: '#888' }}>Ubicacion</span>
                    <span style={{ fontWeight: 500, color: '#222' }}>{popupSensor?.ubicacion || 'N/A'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: '12px' }}>
                    <span style={{ color: '#888' }}>Topic MQTT</span>
                    <code style={{ fontSize: '10px', background: '#f5f5f5', padding: '2px 6px', borderRadius: '4px' }}>
                      {popupSensor?.topicMQTT || 'N/A'}
                    </code>
                  </div>
                </div>
              </div>
            )}

            {popupActuatorCfg && (
              <div>
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '0.5px solid #e0e0e0' }}>
                    <span style={{ fontSize: '12px', color: '#888' }}>Estado</span>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: popupActuatorState ? '#3B6D11' : '#A32D2D' }}>
                      {popupActuatorState == null ? 'DESCONOCIDO' : popupActuatorState ? popupActuatorCfg.onLabel : popupActuatorCfg.offLabel}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0' }}>
                    <span style={{ fontSize: '12px', color: '#888' }}>Topic MQTT</span>
                    <code style={{ fontSize: '10px', background: '#f5f5f5', padding: '2px 6px', borderRadius: '4px' }}>
                      {popupSensor?.topicMQTT || 'N/A'}
                    </code>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handleActuatorToggle(true)}
                    disabled={actionLoading}
                    style={{
                      flex: 1,
                      padding: '8px',
                      borderRadius: '8px',
                      border: '0.5px solid #639922',
                      background: popupActuatorState ? '#EAF3DE' : 'transparent',
                      color: '#3B6D11',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: actionLoading ? 'not-allowed' : 'pointer',
                      opacity: actionLoading ? 0.6 : 1
                    }}
                  >
                    {popupActuatorCfg.actionOn}
                  </button>
                  <button
                    onClick={() => handleActuatorToggle(false)}
                    disabled={actionLoading}
                    style={{
                      flex: 1,
                      padding: '8px',
                      borderRadius: '8px',
                      border: '0.5px solid #A32D2D',
                      background: popupActuatorState === false ? '#FCEBEB' : 'transparent',
                      color: '#A32D2D',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: actionLoading ? 'not-allowed' : 'pointer',
                      opacity: actionLoading ? 0.6 : 1
                    }}
                  >
                    {popupActuatorCfg.actionOff}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
