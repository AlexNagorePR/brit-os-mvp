import { useState, useRef, useEffect } from 'react';
import {
  Clock,
  FolderOpen,
  Save,
  FileCode,
  Activity,
  LogOut,
} from 'lucide-react';
import SystemConsole from './components/SystemConsole';
import RobotMap from './components/RobotMap';
import AppHeader from './components/AppHeader';
import LeftPanelPrep from './components/LeftPanelPrep';
import LeftPanelTrack from './components/LeftPanelTrack';
import RightPanel from './components/RightPanel';
import LoginScreen from './components/LoginScreen';
import UserManagementScreen from './components/UserManagementScreen';
import RobotManagementScreen from './components/RobotManagementScreen';
import Joystick from "./components/Joystick";

import { STATIONS_DATA } from './data/stations';
import { LINE_STYLES } from './data/ui';
import { FAKE_ALARMS } from './data/alarms';

export default function App() {
  const [mode, setMode] = useState('prep');
  const [controlType, setControlType] = useState('MANUAL');
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isFleetOpen, setIsFleetOpen] = useState(false);
  const [isStationOpen, setIsStationOpen] = useState(false);
  const [isCalibOpen, setIsCalibOpen] = useState(true);
  const [isLayersOpen, setIsLayersOpen] = useState(true);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
  const [isTerminalOpen, setIsTerminalOpen] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [currentScreen, setCurrentScreen] = useState('dashboard');

  const [projectName] = useState('TORRE_NORTE_N3');
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  const [fleetData, setFleetData] = useState([]);
  const [selectedRobotId, setSelectedRobotId] = useState(null);
  const [fleetLoading, setFleetLoading] = useState(true);

  const [alarms, setAlarms] = useState(FAKE_ALARMS);

  const robotIdsKey = fleetData.map((r) => r.id).join('|');

  const [selectedStationId, setSelectedStationId] = useState('ST-01');
  const [moveVector, setMoveVector] = useState({ x: 0, y: 0 });
  const [logs, setLogs] = useState([
    { id: 1, time: '10:14:02', type: 'info', msg: 'SISTEMA BRIT_OS INICIADO', source: 'SYS' },
    { id: 2, time: '10:14:05', type: 'info', msg: 'CONEXIÓN ESTABLECIDA CON ST-01', source: 'RADIO' },
    { id: 3, time: '10:14:10', type: 'warn', msg: 'BATERÍA BAJA EN UNIDAD BRAVO (24%)', source: 'POWER' },
  ]);

  const activeRobot = fleetData.find((r) => r.id === selectedRobotId) || fleetData[0] || null;
  const activeStation = STATIONS_DATA.find((s) => s.id === selectedStationId) || STATIONS_DATA[0];
  const terminalRef = useRef(null);

  const [calibrationPoints, setCalibrationPoints] = useState([
    { id: '1', x: '10.552', y: '24.110' },
    { id: '2', x: '45.109', y: '12.884' },
  ]);

  const [layers, setLayers] = useState([
    { id: 'l1', name: 'PERIMETRO_EXT', color: '#f97316', visible: true, style: 'solid', progress: 100, status: 'done', d: 'M100,100 L900,100 L900,700 L100,700 Z' },
    { id: 'l2', name: 'MUROS_CARGA', color: '#eab308', visible: true, style: 'dashed', progress: 45, status: 'printing', d: 'M400,100 L400,700 M700,100 L700,400 L900,400' },
    { id: 'l3', name: 'TABIQUERIA', color: '#3b82f6', visible: true, style: 'dotted', progress: 0, status: 'pending', d: 'M400,300 L700,300 M100,400 L400,400' },
    { id: 'l4', name: 'INSTALACIONES', color: '#10b981', visible: false, style: 'solid', progress: 0, status: 'pending', d: 'M150,150 L350,150 L350,350 L150,350 Z' },
  ]);

  const addLog = (msg, type = 'info', source = 'UNIT') => {
    const newLog = {
      id: crypto.randomUUID() ,
      time: new Date().toLocaleTimeString('en-GB', { hour12: false }),
      type,
      msg,
      source,
    };
    setLogs((prev) => [...prev.slice(-49), newLog]);
  };

  async function fetchRobotTelemetry(deviceId) {
    const res = await fetch(`/api/data/${deviceId}`, {
      credentials: 'include',
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    console.log(`TELEMETRY [${deviceId}]:`, data);

    return {
      id: deviceId,
      battery: Number(data?.telemetry?.battery ?? null),
      voltage: Number(data?.telemetry?.voltage ?? null),
      ink: data?.telemetry?.inkLevel ?? null,
      health: data?.telemetry?.state ?? null,
      load: Number(data?.telemetry?.progress ?? null),
      topconBattery: Number(data?.telemetry?.topconBattery ?? null),
      leicaBattery: Number(data?.telemetry?.leicaBatteryPercentage ?? null),
    };
  }

  async function loadAllRobotsTelemetry() {
    try {
      const robotIds = fleetData
        .map((robot) => robot.id)
        .filter(Boolean);

      if (robotIds.length === 0) return;

      const results = await Promise.allSettled(
        robotIds.map((id) => fetchRobotTelemetry(id))
      );

      setFleetData((prev) =>
        prev.map((robot) => {
          const result = results.find(
            (r) => r.status === 'fulfilled' && r.value.id === robot.id
          );

          if (!result || result.status !== 'fulfilled') {
            return robot;
          }

          return {
            ...robot,
            battery: result.value.battery,
            voltage: result.value.voltage,
            ink: result.value.ink,
            health: result.value.health,
            load: result.value.load,
            topconBattery: result.value.topconBattery,
            leicaBattery: result.value.leicaBattery,
          };
        })
      );
    } catch (err) {
      console.error('LOAD ALL TELEMETRY ERROR', err);
      addLog?.(`ERROR cargando telemetría: ${String(err)}`, 'error', 'API');
    }
  }

  // Health check
  useEffect(() => {
    fetch('/api/health', { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => console.log('HEALTH OK:', data))
      .catch((err) => console.error('HEALTH ERROR:', err));
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadAuth() {
      try {
        setAuthLoading(true);

        const res = await fetch('/api/user', { credentials: 'include' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();

        if (cancelled) return;

        setIsAuthenticated(Boolean(data?.isAuthenticated));
        setUserInfo(data?.userInfo || null);
      } catch {
        if (cancelled) return;
        setIsAuthenticated(false);
        setUserInfo(null);
      } finally {
        if (!cancelled) setAuthLoading(false);
      }
    }

    loadAuth();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    let cancelled = false;

    async function loadDevices() {
      try {
        setFleetLoading(true);

        const res = await fetch('/api/devices/', { credentials: 'include' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        let devices = await res.json();
        console.log('DEVICES:', devices);

        const normalized = (devices || []).map((d, idx) => ({
          id: d.id ?? "",
          name: d.name ?? d.id,
          hostname: d.hostname ?? null,
          status: d.status ?? null,
          health: d.health ?? null,
          battery: d.battery ?? null,
          voltage: d.voltage ?? null,
          topconBattery: d.topconBattery ?? null,
          leicaBattery: d.leicaBattery ?? null,
          signal: d.signal ?? null,
          temp: d.temp ?? null,
          load: d.load ?? null,
          ink: d.ink ?? null,
          hardware: d.hardware ?? null,
          pos: d.pos ?? { x: 250 + idx * 200, y: 250 + (idx % 2) * 200 },
          heading: d.heading ?? 0,
        }));

        console.log('Normalized devices:', normalized);

        if (cancelled) return;

        setFleetData(normalized);

        if (!selectedRobotId && normalized.length > 0) {
          setSelectedRobotId(normalized[0].id);
        }

        addLog(`DEVICES CARGADOS: ${normalized.length}`, 'success', 'API');
      } catch (e) {
        if (cancelled) return;
        setFleetData([]);
        addLog(`ERROR /api/devices: ${String(e)}`, 'error', 'API');
      } finally {
        if (!cancelled) setFleetLoading(false);
      }
    }

    loadDevices();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || fleetData.length === 0) return;
    loadAllRobotsTelemetry();

    const interval = setInterval(() => {
      loadAllRobotsTelemetry();
    }, 15000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, robotIdsKey]);

  // Log Auto-scroll
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  // Simulación / tick
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());

      if (mode === 'track') {
        setLayers((prev) =>
          prev.map((l) => {
            if (l.status === 'printing') {
              const newProgress = Math.min(100, l.progress + 0.1);
              if (l.progress < 100 && newProgress >= 100) {
                addLog(`IMPRESIÓN FINALIZADA: ${l.name}`, 'success', 'PROC');
              }
              return { ...l, progress: newProgress };
            }
            return l;
          })
        );
      }
    }, 100);

    return () => clearInterval(interval);
  }, [selectedRobotId, controlType, moveVector, mode]);

  const toggleLayerStyle = (id) => {
    setLayers(
      layers.map((l) => {
        if (l.id === id) {
          const idx = LINE_STYLES.indexOf(l.style);
          return { ...l, style: LINE_STYLES[(idx + 1) % LINE_STYLES.length] };
        }
        return l;
      })
    );
  };

  const updateLayerColor = (id, newColor) => {
    setLayers(layers.map((l) => (l.id === id ? { ...l, color: newColor } : l)));
  };

  const addCalibrationPoint = () => {
    const newPoint = {
      id: crypto.randomUUID(),
      x: (Math.random() * 100).toFixed(3),
      y: (Math.random() * 100).toFixed(3),
    };
    setCalibrationPoints([...calibrationPoints, newPoint]);
    addLog(`PUNTO CALIBRACIÓN AÑADIDO: ${newPoint.id.substring(0, 8)}`, 'info', 'SURV');
  };

  const removeCalibrationPoint = (id) => {
    if (calibrationPoints.length > 1) {
      setCalibrationPoints(calibrationPoints.filter((p) => p.id !== id));
      addLog('PUNTO CALIBRACIÓN ELIMINADO', 'warn', 'SURV');
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-zinc-950 text-zinc-400">
        Comprobando sesión...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  if (fleetLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-zinc-950 text-zinc-400">
        Cargando devices...
      </div>
    );
  }

  if (!activeRobot) {
    return (
      <div className="flex items-center justify-center h-screen bg-zinc-950 text-zinc-400">
        No hay devices
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-zinc-300 font-sans overflow-hidden select-none text-[10px]">
      <AppHeader
        isConfigOpen={isConfigOpen}
        setIsConfigOpen={setIsConfigOpen}
        isFleetOpen={isFleetOpen}
        setIsFleetOpen={setIsFleetOpen}
        fleetData={fleetData}
        selectedRobotId={selectedRobotId}
        setSelectedRobotId={setSelectedRobotId}
        activeRobot={activeRobot}
        isStationOpen={isStationOpen}
        setIsStationOpen={setIsStationOpen}
        stations={STATIONS_DATA}
        selectedStationId={selectedStationId}
        setSelectedStationId={setSelectedStationId}
        activeStation={activeStation}
        userInfo={userInfo}
        onOpenUserManagement={() => setCurrentScreen('users')}
        onOpenRobotManagement={() => setCurrentScreen('robots')}
        alarms={alarms}
        addLog={addLog}
      />

      {currentScreen === 'users' ? (
        <UserManagementScreen
          onBack={() => setCurrentScreen('dashboard')}
          addLog={addLog}
          userInfo={userInfo}
        />
      ) : currentScreen === 'robots' ? (
        <RobotManagementScreen
          onBack={() => setCurrentScreen('dashboard')}
          addLog={addLog}
        />
      ) : (
        <div className="flex-1 flex overflow-hidden p-2 gap-2 relative">
          <aside className="w-64 flex flex-col gap-2 z-10 shrink-0 h-full">
            <div className="bg-zinc-900 border border-zinc-700 p-2 rounded-sm flex items-center justify-between group">
              <div className="flex items-center gap-2 overflow-hidden flex-1">
                <FileCode size={14} className="text-orange-500 shrink-0" />
                <span className="text-[9px] font-black text-white uppercase truncate tracking-tight">
                  {projectName}
                </span>
              </div>
              <div className="flex items-center gap-1.5 ml-2 border-l border-zinc-800 pl-2">
                <button title="Abrir" className="p-1 text-zinc-500 hover:text-orange-500 transition-colors">
                  <FolderOpen size={13} />
                </button>
                <button title="Guardar" className="p-1 text-zinc-500 hover:text-emerald-500 transition-colors">
                  <Save size={13} />
                </button>
                <button
                  title="Cerrar"
                  className="p-1 text-zinc-500 hover:text-red-500 transition-colors"
                >
                  <LogOut size={13} />
                </button>
              </div>
            </div>

            <div className="flex bg-zinc-900 p-0.5 rounded-sm border border-zinc-700">
              <button
                onClick={() => {
                  setMode('prep');
                  addLog('MODO: TOPOGRAFÍA ACTIVADO', 'info', 'SYS');
                }}
                className={`flex-1 py-1.5 rounded-sm text-[8px] font-black uppercase ${
                  mode === 'prep'
                    ? 'bg-zinc-800 text-orange-500 border border-zinc-600 shadow-inner'
                    : 'text-zinc-500'
                }`}
              >
                Topografía
              </button>
              <button
                onClick={() => {
                  setMode('track');
                  addLog('MODO: EJECUCIÓN ACTIVADO', 'warn', 'SYS');
                }}
                className={`flex-1 py-1.5 rounded-sm text-[8px] font-black uppercase ${
                  mode === 'track'
                    ? 'bg-orange-500 text-zinc-950 border border-orange-600'
                    : 'text-zinc-500'
                }`}
              >
                Ejecución
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-2 min-h-0">
              {mode === 'prep' ? (
                <LeftPanelPrep
                  isCalibOpen={isCalibOpen}
                  setIsCalibOpen={setIsCalibOpen}
                  isLayersOpen={isLayersOpen}
                  setIsLayersOpen={setIsLayersOpen}
                  calibrationPoints={calibrationPoints}
                  layers={layers}
                  addCalibrationPoint={addCalibrationPoint}
                  removeCalibrationPoint={removeCalibrationPoint}
                  toggleLayerStyle={toggleLayerStyle}
                  setLayers={setLayers}
                  updateLayerColor={updateLayerColor}
                />
              ) : (
                <LeftPanelTrack layers={layers} />
              )}
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-2 min-h-0">
              <div className="flex bg-zinc-900 p-0.5 rounded-sm border border-zinc-700">
                <button
                  onClick={() => {
                    setControlType("AUTO");
                    addLog("MODO NAVEGACIÓN: AUTÓNOMO", "info", "CTRL");
                  }}
                  className={`flex-1 py-2 rounded-sm text-[9px] font-black transition-all ${
                    controlType === "AUTO"
                      ? "bg-zinc-800 text-orange-500"
                      : "text-zinc-600 hover:text-zinc-400"
                  }`}
                >
                  AUTO
                </button>

                <button
                  onClick={() => {
                    setControlType("MANUAL");
                    addLog("MODO NAVEGACIÓN: MANUAL (RC_READY)", "warn", "CTRL");
                  }}
                  className={`flex-1 py-2 rounded-sm text-[9px] font-black transition-all ${
                    controlType === "MANUAL"
                      ? "bg-orange-500 text-zinc-950 shadow-md"
                      : "text-zinc-600 hover:text-zinc-400"
                  }`}
                >
                  MANUAL
                </button>
              </div>

              <div className="p-3 bg-zinc-900 rounded-sm border border-zinc-800 flex flex-col items-center">
                <Joystick onMove={setMoveVector} />
                <span className="text-[7px] font-bold text-zinc-600 mt-2 uppercase">
                  Joystick Remoto
                </span>
              </div>
            </div>
          </aside>

          <div className="flex-1 flex flex-col gap-2 overflow-hidden">
            <RobotMap
              mode={mode}
              controlType={controlType}
              layers={layers}
              fleetData={fleetData}
              selectedRobotId={selectedRobotId}
            />

            <SystemConsole
              logs={logs}
              isOpen={isTerminalOpen}
              onToggle={() => setIsTerminalOpen(!isTerminalOpen)}
            />
          </div>

          <RightPanel
            isRightPanelOpen={isRightPanelOpen}
            setIsRightPanelOpen={setIsRightPanelOpen}
            activeRobot={activeRobot}
            controlType={controlType}
            setControlType={setControlType}
            setMoveVector={setMoveVector}
            alarms={alarms}
            addLog={addLog}
          />
        </div>
      )}

      <footer className="h-6 border-t border-zinc-800 flex items-center justify-between px-4 text-[8px] font-bold text-zinc-500 bg-zinc-900 shrink-0 uppercase tracking-widest">
        <div className="flex items-center gap-1.5 text-emerald-500">
          <Activity size={10} />
          <span>Sistema Operativo OK</span>
        </div>
        <div className="flex gap-2 items-center text-zinc-400">
          <Clock size={10} />
          <span>{currentTime}</span>
        </div>
      </footer>
    </div>
  );
}