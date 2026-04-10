import React, { useState, useEffect } from 'react';
import { sensorService } from '../api/apiservice.jsx';

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const pctFromLevel = (levelCm, maxCm) => {
  if (levelCm == null || maxCm == null || maxCm <= 0) return 0;
  return clamp((levelCm / maxCm) * 100, 0, 100);
};

export default function EsquemaBalsasIndustrial({ data = ejemploDatos }) {
  // Mapeo de sensores a actuadores
  const ACTUADORES = {
    bomba: 1,
    ev1: 2,
    ev2: 3,
    ev3: 4
  };

  // Mapeo de sensores de nivel
  const SENSORES_NIVEL = {
    mainTank: 5, // Balsa general
    b1: 6,       // Balsa 1
    b2: 7,       // Balsa 2
    b3: 8        // Balsa 3
  };

  const [state, setState] = useState({
    pump: { estado: null, topicMQTT: '' },
    ev1: { estado: null, topicMQTT: '' },
    ev2: { estado: null, topicMQTT: '' },
    ev3: { estado: null, topicMQTT: '' }
  });

  const [sensorData, setSensorData] = useState({
    mainTank: { distanceCm: 0, maxDistanceCm: 100 },
    tanks: {
      b1: { distanceCm: 0, maxDistanceCm: 100 },
      b2: { distanceCm: 0, maxDistanceCm: 100 },
      b3: { distanceCm: 0, maxDistanceCm: 100 }
    }
  });

  const [popup, setPopup] = useState({ visible: false, title: '', type: '', id: null });
  const [loading, setLoading] = useState(true);

  // Cargar el estado de los actuadores y sensores del backend
  useEffect(() => {
    loadActuadores();
    loadSensores();

    // Recargar datos cada 10 segundos
    const interval = setInterval(() => {
      loadActuadores();
      loadSensores();
    }, 10000);

    // Limpiar el intervalo al desmontar el componente
    return () => clearInterval(interval);
  }, []);

  const loadActuadores = async () => {
    try {
      setLoading(true);

      // Obtener cada actuador por su ID específico
      const bombaSensor = await sensorService.getSensorById(ACTUADORES.bomba);
      const ev1Sensor = await sensorService.getSensorById(ACTUADORES.ev1);
      const ev2Sensor = await sensorService.getSensorById(ACTUADORES.ev2);
      const ev3Sensor = await sensorService.getSensorById(ACTUADORES.ev3);

      // Función auxiliar para convertir estado
      const isOn = (estado) => estado === 'ARRANCADO' || estado === 'on' || estado === true;

      // Mapear los estados de los sensores
      const actuadores = {
        pump: { estado: isOn(bombaSensor.estado), topicMQTT: bombaSensor.topicMQTT || 'actuadores/bomba' },
        ev1: { estado: isOn(ev1Sensor.estado), topicMQTT: ev1Sensor.topicMQTT || `actuadores/ev1/cmd` },
        ev2: { estado: isOn(ev2Sensor.estado), topicMQTT: ev2Sensor.topicMQTT || `actuadores/ev2/cmd` },
        ev3: { estado: isOn(ev3Sensor.estado), topicMQTT: ev3Sensor.topicMQTT || `actuadores/ev3/cmd` }
      };

      setState(actuadores);
    } catch (error) {
      console.error('Error loading actuadores:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSensores = async () => {
    try {
      setLoading(true);

      // Obtener cada sensor de nivel por su ID específico
      const mainTankSensor = await sensorService.getSensorById(SENSORES_NIVEL.mainTank);
      const mainTankReading = await sensorService.getLastSensorReading(SENSORES_NIVEL.mainTank);
      const b1Sensor = await sensorService.getSensorById(SENSORES_NIVEL.b1);
      const b1Reading = await sensorService.getLastSensorReading(SENSORES_NIVEL.b1);
      const b2Sensor = await sensorService.getSensorById(SENSORES_NIVEL.b2);
      const b2Reading = await sensorService.getLastSensorReading(SENSORES_NIVEL.b2);
      const b3Sensor = await sensorService.getSensorById(SENSORES_NIVEL.b3);
      const b3Reading = await sensorService.getLastSensorReading(SENSORES_NIVEL.b3);

      // El valor de la BBDD es directamente la distancia en cm
      const sensores = {
        mainTank: {
          ...mainTankSensor,
          distanceCm: mainTankReading.valor,
          maxDistanceCm: 100
        },
        tanks: {
          b1: {
            ...b1Sensor,
            distanceCm: b1Reading.valor,
            maxDistanceCm: 100
          },
          b2: {
            ...b2Sensor,
            distanceCm: b2Reading.valor,
            maxDistanceCm: 100
          },
          b3: {
            ...b3Sensor,
            distanceCm: b3Reading.valor,
            maxDistanceCm: 100
          }
        }
      };

      setSensorData(sensores);
    } catch (error) {
      console.error('Error loading sensores:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePumpToggle = async (newValue) => {
    try {
      const nuevoEstado = newValue ? 'ARRANCADO' : 'PARADO';
      await sensorService.updateActuadorState(ACTUADORES.bomba, nuevoEstado);
      setState({ ...state, pump: { ...state.pump, estado: newValue } });
      setPopup({ visible: false });
    } catch (error) {
      console.error('Error updating pump:', error);
    }
  };

  const handleValveToggle = async (valveId, newValue) => {
    try {
      const sensorId = ACTUADORES[valveId];
      const nuevoEstado = newValue ? 'ARRANCADO' : 'PARADO';
      await sensorService.updateActuadorState(sensorId, nuevoEstado);
      setState({ ...state, [valveId]: { ...state[valveId], estado: newValue } });
      setPopup({ visible: false });
    } catch (error) {
      console.error(`Error updating ${valveId}:`, error);
    }
  };

  const principalPct = pctFromLevel(sensorData.mainTank.distanceCm, sensorData.mainTank.maxDistanceCm);
  const b1Pct = pctFromLevel(sensorData.tanks.b1.distanceCm, sensorData.tanks.b1.maxDistanceCm);
  const b2Pct = pctFromLevel(sensorData.tanks.b2.distanceCm, sensorData.tanks.b2.maxDistanceCm);
  const b3Pct = pctFromLevel(sensorData.tanks.b3.distanceCm, sensorData.tanks.b3.maxDistanceCm);


  const openPopup = (type, id) => {
    setPopup({ visible: true, type, id, title: '' });
  };

  const closePopup = () => {
    setPopup({ visible: false });
  };

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '800px', margin: '0 auto' }}>
      <style>{`
        .scada-lbl { font-family: sans-serif; font-size: 11px; fill: #2C2C2A; }
        .scada-lbl-sm { font-family: sans-serif; font-size: 10px; fill: #5F5E5A; }
        .scada-lbl-bold { font-family: sans-serif; font-size: 11px; font-weight: 600; fill: #2C2C2A; }
        .scada-val-ok { font-family: sans-serif; font-size: 10px; font-weight: 700; fill: #3B6D11; }
        .scada-val-warn { font-family: sans-serif; font-size: 10px; font-weight: 700; fill: #854F0B; }
        .scada-pipe { fill: none; stroke: #185FA5; stroke-width: 6; stroke-linecap: round; stroke-linejoin: round; }
        .scada-sig { fill: none; stroke: #888780; stroke-width: 1; stroke-dasharray: 4 3; stroke-linecap: round; }
        .scada-tank-bg { fill: #F1EFE8; stroke: #888780; stroke-width: 1.2; }
        .scada-water { fill: #85B7EB; opacity: 0.6; }
        .scada-sensor-cone { fill: #E6F1FB; stroke: #185FA5; stroke-width: 1; }
        .scada-hov { cursor: pointer; }
        .scada-hov:hover { opacity: 0.82; }
        @media (prefers-color-scheme: dark) {
          .scada-lbl, .scada-lbl-bold { fill: #D3D1C7; }
          .scada-lbl-sm { fill: #B4B2A9; }
          .scada-tank-bg { fill: #444441; stroke: #888780; }
          .scada-sensor-cone { fill: #0C447C; stroke: #85B7EB; }
        }
      `}</style>

      <svg id="scada-svg" width="100%" viewBox="0 0 680 480" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <marker id="arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M2 1L8 5L2 9" fill="none" stroke="#185FA5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </marker>
          <clipPath id="cp-bp"><rect x="41" y="111" width="138" height="178" rx="5"/></clipPath>
          <clipPath id="cp-b1"><rect x="481" y="61" width="98" height="68" rx="4"/></clipPath>
          <clipPath id="cp-b2"><rect x="481" y="201" width="98" height="68" rx="4"/></clipPath>
          <clipPath id="cp-b3"><rect x="481" y="341" width="98" height="68" rx="4"/></clipPath>
        </defs>

        {/* BALSA PRINCIPAL */}
        <rect x="40" y="110" width="140" height="180" rx="6" className="scada-tank-bg"/>
        <rect x="41" y={111 + (178 * (100 - principalPct) / 100)} width="138" height={178 * principalPct / 100} className="scada-water" clipPath="url(#cp-bp)"/>
        <rect x="40" y="110" width="140" height="180" rx="6" fill="none" stroke="#888780" strokeWidth="1.2"/>
        <text className="scada-lbl-bold" x="110" y="265" textAnchor="middle">Balsa principal</text>

        {/* Sensor BP */}
        <g className="scada-hov" onClick={() => openPopup('sensor', 'bp')}>
          <line x1="110" y1="110" x2="110" y2="96" stroke="#888780" strokeWidth="1"/>
          <polygon points="103,80 117,80 114,94 106,94" className="scada-sensor-cone"/>
          <path d="M106,97 Q110,102 114,97" fill="none" stroke="#185FA5" strokeWidth="1" strokeLinecap="round"/>
          <path d="M103,101 Q110,107 117,101" fill="none" stroke="#185FA5" strokeWidth="0.6" strokeLinecap="round" opacity="0.5"/>
          <line x1="110" y1="80" x2="110" y2="52" className="scada-sig"/>
          <rect x="78" y="38" width="64" height="18" rx="4" fill="#EAF3DE" stroke="#639922" strokeWidth="0.8"/>
          <text className="scada-val-ok" x="110" y="50" textAnchor="middle">{sensorData.mainTank.distanceCm} cm</text>
          <text className="scada-lbl-sm" x="110" y="28" textAnchor="middle">Sensor nivel US</text>
        </g>

        {/* TUBERÍA BALSA→BOMBA */}
        <line x1="180" y1="200" x2="228" y2="200" className="scada-pipe"/>
        <line x1="196" y1="197" x2="208" y2="200" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" markerEnd="url(#arr)"/>
        <line x1="212" y1="197" x2="224" y2="200" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" markerEnd="url(#arr)"/>

        {/* BOMBA */}
        <g className="scada-hov" onClick={() => openPopup('pump', null)}>
          <circle cx="252" cy="200" r="24" fill="#F1EFE8" stroke="#444441" strokeWidth="1.2"/>
          <circle cx="252" cy="200" r="16" fill="none" stroke="#185FA5" strokeWidth="1"/>
          <polygon points={`243,195 264,200 243,205`} fill={state.pump.estado ? '#185FA5' : '#B4B2A9'}/>
          <text className="scada-lbl-sm" x="252" y="234" textAnchor="middle">Bomba</text>
          <rect x="232" y="238" width="40" height="14" rx="3" fill={state.pump.estado ? '#EAF3DE' : '#FCEBEB'} stroke={state.pump.estado ? '#639922' : '#A32D2D'} strokeWidth="0.8"/>
          <text className={state.pump.estado ? 'scada-val-ok' : 'scada-val-warn'} x="252" y="248" textAnchor="middle">{state.pump.estado ? 'ON' : 'OFF'}</text>
        </g>

        {/* TUBERÍA BOMBA→COLECTOR */}
        <line x1="276" y1="200" x2="348" y2="200" className="scada-pipe"/>
        <line x1="292" y1="197" x2="304" y2="200" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" markerEnd="url(#arr)"/>
        <line x1="318" y1="197" x2="330" y2="200" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" markerEnd="url(#arr)"/>

        {/* COLECTOR VERTICAL */}
        <line x1="348" y1="95" x2="348" y2="375" className="scada-pipe"/>
        <circle cx="348" cy="235" r="7" fill="#185FA5"/>

        {/* RAMAL 1 */}
        <line x1="348" y1="95" x2="425" y2="95" className="scada-pipe"/>
        <line x1="366" y1="92" x2="378" y2="95" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" markerEnd="url(#arr)"/>
        <line x1="398" y1="92" x2="410" y2="95" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" markerEnd="url(#arr)"/>

        {/* EV1 */}
        <g className="scada-hov" onClick={() => openPopup('valve', 'ev1')}>
          <rect x="425" y="82" width="26" height="26" rx="5" fill={state.ev1.estado ? '#EAF3DE' : '#FCEBEB'} stroke={state.ev1.estado ? '#3B6D11' : '#A32D2D'} strokeWidth="1.2"/>
          <line x1="431" y1="86" x2="445" y2="104" stroke={state.ev1.estado ? '#3B6D11' : '#A32D2D'} strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="445" y1="86" x2="431" y2="104" stroke={state.ev1.estado ? '#3B6D11' : '#A32D2D'} strokeWidth="1.5" strokeLinecap="round"/>
          <rect x="434" y="73" width="8" height="10" rx="2" fill={state.ev1.estado ? '#3B6D11' : '#A32D2D'}/>
          <text className="scada-lbl-sm" x="438" y="118" textAnchor="middle">EV1</text>
          <rect x="414" y="121" width="48" height="14" rx="3" fill={state.ev1.estado ? '#EAF3DE' : '#FCEBEB'} stroke={state.ev1.estado ? '#639922' : '#BA7517'} strokeWidth="0.8"/>
          <text className={state.ev1.estado ? 'scada-val-ok' : 'scada-val-warn'} x="438" y="131" textAnchor="middle">{state.ev1.estado ? 'ABIERTA' : 'CERRADA'}</text>
        </g>

        <line x1="451" y1="95" x2="480" y2="95" className="scada-pipe"/>

        {/* BALSA 1 */}
        <g className="scada-hov" onClick={() => openPopup('sensor', 'b1')}>
          <rect x="480" y="60" width="100" height="70" rx="5" className="scada-tank-bg"/>
          <rect x="481" y={61 + (68 * (100 - b1Pct) / 100)} width="98" height={68 * b1Pct / 100} className="scada-water" clipPath="url(#cp-b1)"/>
          <rect x="480" y="60" width="100" height="70" rx="5" fill="none" stroke="#888780" strokeWidth="1.2"/>
          <text className="scada-lbl-bold" x="530" y="108" textAnchor="middle">Balsa 1</text>
          <line x1="530" y1="60" x2="530" y2="48" stroke="#888780" strokeWidth="1"/>
          <polygon points="524,34 536,34 533,47 527,47" className="scada-sensor-cone"/>
          <path d="M526,50 Q530,55 534,50" fill="none" stroke="#185FA5" strokeWidth="1" strokeLinecap="round"/>
          <line x1="530" y1="34" x2="530" y2="16" className="scada-sig"/>
          <rect x="498" y="4" width="64" height="16" rx="3" fill={sensorData.tanks.b1.distanceCm < 25 ? '#FAEEDA' : '#EAF3DE'} stroke={sensorData.tanks.b1.distanceCm < 25 ? '#BA7517' : '#639922'} strokeWidth="0.8"/>
          <text className={sensorData.tanks.b1.distanceCm < 25 ? 'scada-val-warn' : 'scada-val-ok'} x="530" y="16" textAnchor="middle">{sensorData.tanks.b1.distanceCm} cm</text>
        </g>

        {/* RAMAL 2 */}
        <line x1="348" y1="235" x2="425" y2="235" className="scada-pipe"/>
        <line x1="366" y1="232" x2="378" y2="235" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" markerEnd="url(#arr)"/>
        <line x1="398" y1="232" x2="410" y2="235" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" markerEnd="url(#arr)"/>

        {/* EV2 */}
        <g className="scada-hov" onClick={() => openPopup('valve', 'ev2')}>
          <rect x="425" y="222" width="26" height="26" rx="5" fill={state.ev2.estado ? '#EAF3DE' : '#FCEBEB'} stroke={state.ev2.estado ? '#3B6D11' : '#A32D2D'} strokeWidth="1.2"/>
          <line x1="431" y1="226" x2="445" y2="244" stroke={state.ev2.estado ? '#3B6D11' : '#A32D2D'} strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="445" y1="226" x2="431" y2="244" stroke={state.ev2.estado ? '#3B6D11' : '#A32D2D'} strokeWidth="1.5" strokeLinecap="round"/>
          <rect x="434" y="213" width="8" height="10" rx="2" fill={state.ev2.estado ? '#3B6D11' : '#A32D2D'}/>
          <text className="scada-lbl-sm" x="438" y="258" textAnchor="middle">EV2</text>
          <rect x="414" y="261" width="48" height="14" rx="3" fill={state.ev2.estado ? '#EAF3DE' : '#FCEBEB'} stroke={state.ev2.estado ? '#639922' : '#BA7517'} strokeWidth="0.8"/>
          <text className={state.ev2.estado ? 'scada-val-ok' : 'scada-val-warn'} x="438" y="271" textAnchor="middle">{state.ev2.estado ? 'ABIERTA' : 'CERRADA'}</text>
        </g>

        <line x1="451" y1="235" x2="480" y2="235" className="scada-pipe"/>

        {/* BALSA 2 */}
        <g className="scada-hov" onClick={() => openPopup('sensor', 'b2')}>
          <rect x="480" y="200" width="100" height="70" rx="5" className="scada-tank-bg"/>
          <rect x="481" y={201 + (68 * (100 - b2Pct) / 100)} width="98" height={68 * b2Pct / 100} className="scada-water" clipPath="url(#cp-b2)"/>
          <rect x="480" y="200" width="100" height="70" rx="5" fill="none" stroke="#888780" strokeWidth="1.2"/>
          <text className="scada-lbl-bold" x="530" y="244" textAnchor="middle">Balsa 2</text>
          <line x1="530" y1="200" x2="530" y2="188" stroke="#888780" strokeWidth="1"/>
          <polygon points="524,174 536,174 533,187 527,187" className="scada-sensor-cone"/>
          <path d="M526,190 Q530,195 534,190" fill="none" stroke="#185FA5" strokeWidth="1" strokeLinecap="round"/>
          <line x1="530" y1="174" x2="530" y2="156" className="scada-sig"/>
          <rect x="498" y="144" width="64" height="16" rx="3" fill={sensorData.tanks.b2.distanceCm < 25 ? '#FAEEDA' : '#EAF3DE'} stroke={sensorData.tanks.b2.distanceCm < 25 ? '#BA7517' : '#639922'} strokeWidth="0.8"/>
          <text className={sensorData.tanks.b2.distanceCm < 25 ? 'scada-val-warn' : 'scada-val-ok'} x="530" y="155" textAnchor="middle">{sensorData.tanks.b2.distanceCm} cm</text>
        </g>

        {/* RAMAL 3 */}
        <line x1="348" y1="375" x2="425" y2="375" className="scada-pipe"/>
        <line x1="366" y1="372" x2="378" y2="375" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" markerEnd="url(#arr)"/>
        <line x1="398" y1="372" x2="410" y2="375" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" markerEnd="url(#arr)"/>

        {/* EV3 */}
        <g className="scada-hov" onClick={() => openPopup('valve', 'ev3')}>
          <rect x="425" y="362" width="26" height="26" rx="5" fill={state.ev3.estado ? '#EAF3DE' : '#FCEBEB'} stroke={state.ev3.estado ? '#3B6D11' : '#A32D2D'} strokeWidth="1.2"/>
          <line x1="431" y1="366" x2="445" y2="384" stroke={state.ev3.estado ? '#3B6D11' : '#A32D2D'} strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="445" y1="366" x2="431" y2="384" stroke={state.ev3.estado ? '#3B6D11' : '#A32D2D'} strokeWidth="1.5" strokeLinecap="round"/>
          <rect x="434" y="353" width="8" height="10" rx="2" fill={state.ev3.estado ? '#3B6D11' : '#A32D2D'}/>
          <text className="scada-lbl-sm" x="438" y="398" textAnchor="middle">EV3</text>
          <rect x="414" y="401" width="48" height="14" rx="3" fill={state.ev3.estado ? '#EAF3DE' : '#FCEBEB'} stroke={state.ev3.estado ? '#639922' : '#BA7517'} strokeWidth="0.8"/>
          <text className={state.ev3.estado ? 'scada-val-ok' : 'scada-val-warn'} x="438" y="411" textAnchor="middle">{state.ev3.estado ? 'ABIERTA' : 'CERRADA'}</text>
        </g>

        <line x1="451" y1="375" x2="480" y2="375" className="scada-pipe"/>

        {/* BALSA 3 */}
        <g className="scada-hov" onClick={() => openPopup('sensor', 'b3')}>
          <rect x="480" y="340" width="100" height="70" rx="5" className="scada-tank-bg"/>
          <rect x="481" y={341 + (68 * (100 - b3Pct) / 100)} width="98" height={68 * b3Pct / 100} className="scada-water" clipPath="url(#cp-b3)"/>
          <rect x="480" y="340" width="100" height="70" rx="5" fill="none" stroke="#888780" strokeWidth="1.2"/>
          <text className="scada-lbl-bold" x="530" y="383" textAnchor="middle">Balsa 3</text>
          <line x1="530" y1="340" x2="530" y2="328" stroke="#888780" strokeWidth="1"/>
          <polygon points="524,314 536,314 533,327 527,327" className="scada-sensor-cone"/>
          <path d="M526,330 Q530,335 534,330" fill="none" stroke="#185FA5" strokeWidth="1" strokeLinecap="round"/>
          <line x1="530" y1="314" x2="530" y2="296" className="scada-sig"/>
          <rect x="498" y="284" width="64" height="16" rx="3" fill={sensorData.tanks.b3.distanceCm < 25 ? '#FAEEDA' : '#EAF3DE'} stroke={sensorData.tanks.b3.distanceCm < 25 ? '#BA7517' : '#639922'} strokeWidth="0.8"/>
          <text className={sensorData.tanks.b3.distanceCm < 25 ? 'scada-val-warn' : 'scada-val-ok'} x="530" y="295" textAnchor="middle">{sensorData.tanks.b3.distanceCm} cm</text>
        </g>

        {/* LEYENDA */}
        <rect x="40" y="330" width="156" height="100" rx="6" fill="#F1EFE8" stroke="#D3D1C7" strokeWidth="0.8"/>
        <text className="scada-lbl-bold" x="52" y="348">Leyenda</text>
        <line x1="52" y1="362" x2="80" y2="362" stroke="#185FA5" strokeWidth="5" strokeLinecap="round"/>
        <text className="scada-lbl-sm" x="88" y="366">Tubería</text>
        <line x1="52" y1="378" x2="80" y2="378" stroke="#888780" strokeWidth="1" strokeDasharray="4 3" strokeLinecap="round"/>
        <text className="scada-lbl-sm" x="88" y="382">Señal sensor</text>
        <rect x="52" y="390" width="16" height="12" rx="3" fill="#EAF3DE" stroke="#3B6D11" strokeWidth="1"/>
        <text className="scada-lbl-sm" x="76" y="400">EV abierta</text>
        <rect x="52" y="408" width="16" height="12" rx="3" fill="#FCEBEB" stroke="#A32D2D" strokeWidth="1"/>
        <text className="scada-lbl-sm" x="76" y="418">EV cerrada</text>

        <text className="scada-lbl-sm" x="40" y="462">Sistema distribución · Agrotech DAW 2025</text>
      </svg>

      {/* POPUP MODAL */}
      {popup.visible && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.35)',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            background: '#fff',
            border: '0.5px solid #ccc',
            borderRadius: '12px',
            padding: '20px 24px',
            minWidth: '220px',
            maxWidth: '280px',
            position: 'relative'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <span style={{ fontSize: '14px', fontWeight: 500, color: '#222' }}>
                {popup.type === 'pump' && 'Bomba centrífuga'}
                {popup.type === 'valve' && `Electroválvula ${popup.id.toUpperCase().replace('EV', 'EV')}`}
                {popup.type === 'sensor' && `Sensor — ${popup.id === 'bp' ? 'Balsa principal' : popup.id === 'b1' ? 'Balsa 1' : popup.id === 'b2' ? 'Balsa 2' : 'Balsa 3'}`}
              </span>
              <button onClick={closePopup} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: '#888', padding: '0 4px' }}>✕</button>
            </div>

            {popup.type === 'pump' && (
              <div>
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '0.5px solid #e0e0e0' }}>
                    <span style={{ fontSize: '12px', color: '#888' }}>Estado</span>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: state.pump.estado ? '#3B6D11' : '#A32D2D' }}>{state.pump.estado ? 'EN MARCHA' : 'PARADA'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0' }}>
                    <span style={{ fontSize: '12px', color: '#888' }}>Topic MQTT</span>
                    <code style={{ fontSize: '10px', background: '#f5f5f5', padding: '2px 6px', borderRadius: '4px' }}>{state.pump.topicMQTT}</code>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => handlePumpToggle(true)} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '0.5px solid #639922', background: state.pump.estado ? '#EAF3DE' : 'transparent', color: '#3B6D11', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>Arrancar</button>
                  <button onClick={() => handlePumpToggle(false)} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '0.5px solid #A32D2D', background: !state.pump.estado ? '#FCEBEB' : 'transparent', color: '#A32D2D', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>Parar</button>
                </div>
              </div>
            )}

            {popup.type === 'valve' && (
              <div>
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '0.5px solid #e0e0e0' }}>
                    <span style={{ fontSize: '12px', color: '#888' }}>Estado</span>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: state[popup.id].estado ? '#3B6D11' : '#A32D2D' }}>{state[popup.id].estado ? 'ABIERTA' : 'CERRADA'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0' }}>
                    <span style={{ fontSize: '12px', color: '#888' }}>Topic MQTT</span>
                    <code style={{ fontSize: '10px', background: '#f5f5f5', padding: '2px 6px', borderRadius: '4px' }}>{state[popup.id].topicMQTT}</code>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => handleValveToggle(popup.id, true)} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '0.5px solid #639922', background: state[popup.id].estado ? '#EAF3DE' : 'transparent', color: '#3B6D11', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>Abrir</button>
                  <button onClick={() => handleValveToggle(popup.id, false)} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '0.5px solid #A32D2D', background: !state[popup.id].estado ? '#FCEBEB' : 'transparent', color: '#A32D2D', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>Cerrar</button>
                </div>
              </div>
            )}

            {popup.type === 'sensor' && (
              <div>
                <div style={{ marginBottom: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '10px' }}>
                    <span style={{ fontSize: '28px', fontWeight: 500, color: (popup.id === 'bp' ? sensorData.mainTank : sensorData.tanks[popup.id])?.distanceCm < 25 ? '#854F0B' : '#3B6D11' }}>
                      {(popup.id === 'bp' ? sensorData.mainTank : sensorData.tanks[popup.id])?.distanceCm} <span style={{ fontSize: '14px', fontWeight: 400, color: '#888' }}>cm</span>
                    </span>
                    <span style={{ fontSize: '12px', padding: '3px 10px', borderRadius: '20px', background: (popup.id === 'bp' ? sensorData.mainTank : sensorData.tanks[popup.id])?.distanceCm < 25 ? '#FAEEDA' : '#EAF3DE', color: (popup.id === 'bp' ? sensorData.mainTank : sensorData.tanks[popup.id])?.distanceCm < 25 ? '#854F0B' : '#3B6D11', fontWeight: 600 }}>
                      {(popup.id === 'bp' ? sensorData.mainTank : sensorData.tanks[popup.id])?.distanceCm < 25 ? 'ALERTA' : 'NORMAL'}
                    </span>
                  </div>
                  <div style={{ background: '#f0f0f0', borderRadius: '6px', height: '10px', overflow: 'hidden', marginBottom: '4px' }}>
                    <div style={{ height: '100%', width: `${((popup.id === 'bp' ? sensorData.mainTank.distanceCm : sensorData.tanks[popup.id].distanceCm) / (popup.id === 'bp' ? sensorData.mainTank.maxDistanceCm : sensorData.tanks[popup.id].maxDistanceCm)) * 100}%`, background: (popup.id === 'bp' ? sensorData.mainTank : sensorData.tanks[popup.id])?.distanceCm < 25 ? '#BA7517' : '#639922', borderRadius: '6px', transition: 'width .3s' }}></div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#888' }}>
                    <span style={{ fontWeight: 600, color: (popup.id === 'bp' ? sensorData.mainTank : sensorData.tanks[popup.id])?.distanceCm < 25 ? '#BA7517' : '#639922' }}>{Math.round(((popup.id === 'bp' ? sensorData.mainTank.distanceCm : sensorData.tanks[popup.id].distanceCm) / (popup.id === 'bp' ? sensorData.mainTank.maxDistanceCm : sensorData.tanks[popup.id].maxDistanceCm)) * 100)}%</span>
                    <span>Máx {popup.id === 'bp' ? sensorData.mainTank.maxDistanceCm : sensorData.tanks[popup.id].maxDistanceCm} cm</span>
                  </div>
                </div>
                <div style={{ borderTop: '0.5px solid #e0e0e0', paddingTop: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: '12px' }}>
                    <span style={{ color: '#888' }}>Nombre</span>
                    <span style={{ fontWeight: 500, color: '#222' }}>{(popup.id === 'bp' ? sensorData.mainTank : sensorData.tanks[popup.id])?.nombre}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: '12px' }}>
                    <span style={{ color: '#888' }}>Tipo</span>
                    <span style={{ fontWeight: 500, color: '#222' }}>{(popup.id === 'bp' ? sensorData.mainTank : sensorData.tanks[popup.id])?.tipo}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: '12px' }}>
                    <span style={{ color: '#888' }}>Ubicación</span>
                    <span style={{ fontWeight: 500, color: '#222' }}>{(popup.id === 'bp' ? sensorData.mainTank : sensorData.tanks[popup.id])?.ubicacion}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: '12px' }}>
                    <span style={{ color: '#888' }}>Topic MQTT</span>
                    <code style={{ fontSize: '10px', background: '#f5f5f5', padding: '2px 6px', borderRadius: '4px' }}>{(popup.id === 'bp' ? sensorData.mainTank : sensorData.tanks[popup.id])?.topicMQTT}</code>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export const ejemploDatos = {
  mainTank: { distanceCm: 72, maxDistanceCm: 100 },
  tanks: {
    b1: { distanceCm: 45, maxDistanceCm: 100 },
    b2: { distanceCm: 18, maxDistanceCm: 100 },
    b3: { distanceCm: 61, maxDistanceCm: 100 }
  },
  valves: { ev1Open: true, ev2Open: false, ev3Open: true }
};
