import { useState } from "react";
import {
  Settings,
  Sliders,
  RefreshCw,
  RotateCcw,
  ChevronDown,
  Target,
  LogOut,
  Users,
  Bot,
  Siren,
  Building,
} from "lucide-react";
import RobotStatusGroup from "./RobotStatusGroup";

export default function AppHeader({
  // config
  isConfigOpen,
  setIsConfigOpen,

  // fleet
  isFleetOpen,
  setIsFleetOpen,
  fleetData,
  selectedRobotId,
  setSelectedRobotId,
  activeRobot,

  // station
  isStationOpen,
  setIsStationOpen,
  stations,
  selectedStationId,
  setSelectedStationId,
  activeStation,

  // auth
  userInfo,

  onOpenUserManagement,
  onOpenRobotManagement,
  onOpenClientManagement,
  alarms = [],

  // logging
  addLog,
}) {

  const activeAlarms = alarms.filter((a) => a.active && a.level !== "OK");
  const errorCount = activeAlarms.filter((a) => a.level === "ERROR").length;
  const warnCount = activeAlarms.filter((a) => a.level === "WARN").length;
  const staleCount = activeAlarms.filter((a) => a.level === "STALE").length;

  const [isManagementOpen, setIsManagementOpen] = useState(false);

  const alarmColor =
    errorCount > 0
      ? "text-red-400 border-red-900/50"
      : warnCount > 0
      ? "text-amber-400 border-amber-900/50"
      : staleCount > 0
      ? "text-zinc-300 border-zinc-700"
      : "text-emerald-400 border-emerald-900/50";

  return (
    <header className="h-16 border-b border-zinc-800 bg-zinc-900 flex items-center justify-between px-6 z-[110] shadow-md shrink-0">
      <div className="flex items-center gap-4 h-full">
        {/* BRAND */}
        <div className="flex flex-col border-r border-zinc-700 pr-6">
          <span className="text-[7px] text-orange-500 font-black tracking-[0.2em] uppercase">
            Control Industrial
          </span>
          <div className="flex items-baseline">
            <span className="text-lg font-black text-white uppercase leading-none">
              BRIT
            </span>
            <span className="text-lg font-black text-orange-500 uppercase leading-none">
              _OS
            </span>
          </div>
        </div>

        {/* CONFIG */}
        <div className="relative">
          <button
            onClick={() => setIsConfigOpen(!isConfigOpen)}
            className={`w-10 h-10 flex items-center justify-center border rounded-sm transition-colors ${
              isConfigOpen
                ? "bg-orange-500 text-zinc-900 border-orange-600"
                : "bg-zinc-800 border-zinc-700 hover:border-zinc-500"
            }`}
          >
            <Settings size={18} />
          </button>

          {isConfigOpen && (
            <div className="absolute top-full left-0 mt-2 w-56 bg-zinc-900 border border-zinc-700 z-[120] p-1 shadow-2xl rounded-sm">
              <div className="grid grid-cols-1 gap-0.5">
                <button className="w-full flex items-center gap-3 px-3 py-2 hover:bg-zinc-800 text-[9px] font-bold uppercase transition-colors group">
                  <Sliders
                    size={14}
                    className="text-zinc-500 group-hover:text-orange-500"
                  />
                  <span>Ajustes sistema</span>
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2 hover:bg-zinc-800 text-[9px] font-bold uppercase transition-colors group">
                  <RefreshCw
                    size={14}
                    className="text-zinc-500 group-hover:text-orange-500"
                  />
                  <span>Forzar render</span>
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2 hover:bg-zinc-800 text-[9px] font-bold uppercase transition-colors text-red-400 group mt-1 border-t border-zinc-800 pt-2">
                  <RotateCcw size={14} />
                  <span>Reset terminal</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* FLEET */}
        <div className="relative h-full flex items-center">
          <button
            onClick={() => setIsFleetOpen(!isFleetOpen)}
            className={`flex items-center gap-4 bg-zinc-900 border-2 rounded-sm transition-all h-11 px-4 ${
              isFleetOpen ? "border-orange-500" : "border-zinc-700"
            } min-w-[380px]`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                activeRobot?.online === true
                  ? "bg-emerald-500 shadow-[0_0_5px_#10b981]"
                  : activeRobot
                  ? "bg-red-500"
                  : "bg-zinc-600"
              }`}
            />
            <div className="flex flex-col items-start leading-none flex-1 text-left">
              <span className="text-[10px] font-black text-white uppercase">
                {activeRobot?.name || "Sin dispositivos"}
              </span>
              <span className="text-[8px] text-zinc-500 font-bold uppercase">
                {activeRobot?.id || "No hay robots disponibles"}
              </span>
            </div>

            {activeRobot && <RobotStatusGroup robot={activeRobot} />}
            <ChevronDown
              size={14}
              className={`text-zinc-500 ml-2 ${isFleetOpen ? "rotate-180" : ""}`}
            />
          </button>

          {isFleetOpen && (
            <div className="absolute top-full left-0 mt-2 w-full bg-zinc-900 border border-zinc-600 z-[120] shadow-2xl p-1 rounded-sm">
              {fleetData.length > 0 ? (
                fleetData.map((r) => (
                  <div
                    key={r.id}
                    onClick={() => {
                      setSelectedRobotId(r.id);
                      setIsFleetOpen(false);
                      addLog(`FOCO CAMBIADO A ${r.id}`, "info", "UI");
                    }}
                    className={`p-2.5 flex items-center gap-4 cursor-pointer hover:bg-zinc-800 ${
                      selectedRobotId === r.id ? "bg-zinc-800/50" : ""
                    }`}
                  >
                    <span
                      className={`text-[9px] font-bold w-20 ${
                        selectedRobotId === r.id
                          ? "text-orange-400"
                          : "text-zinc-300"
                      }`}
                    >
                      {r.name}
                    </span>
                    <div className="flex-1">
                      <RobotStatusGroup robot={r} compact={true} />
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-2.5 flex items-center justify-center text-zinc-500">
                  <span className="text-[9px] font-bold">Sin dispositivos disponibles</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* STATION */}
        <div className="relative h-full flex items-center">
          <button
            onClick={() => setIsStationOpen(!isStationOpen)}
            className={`flex items-center gap-3 bg-zinc-900 border-2 rounded-sm transition-all h-11 px-4 ${
              isStationOpen ? "border-orange-500" : "border-zinc-700"
            } min-w-[200px]`}
          >
            <Target
              size={16}
              className={
                activeStation.status === "linked"
                  ? "text-emerald-500"
                  : "text-zinc-500"
              }
            />
            <div className="flex flex-col items-start leading-none text-left flex-1">
              <span className="text-[10px] font-bold text-white uppercase">
                {activeStation.name}
              </span>
              <span className="text-[8px] text-zinc-500 font-bold uppercase mt-0.5">
                PREC: {activeStation.precision}
              </span>
            </div>
            <ChevronDown
              size={12}
              className={`text-zinc-500 transition-transform ${
                isStationOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isStationOpen && (
            <div className="absolute top-full left-0 mt-2 w-full bg-zinc-900 border border-zinc-600 z-[120] shadow-2xl p-1 rounded-sm">
              {stations.map((s) => (
                <div
                  key={s.id}
                  onClick={() => {
                    setSelectedStationId(s.id);
                    setIsStationOpen(false);
                    addLog(`ESTACIÓN SELECCIONADA: ${s.name}`, "info", "RADIO");
                  }}
                  className={`p-2.5 flex items-center justify-between cursor-pointer hover:bg-zinc-800 rounded-sm transition-colors ${
                    selectedStationId === s.id
                      ? "bg-zinc-800/80 border-l-2 border-orange-500"
                      : ""
                  }`}
                >
                  <div className="flex flex-col gap-0.5">
                    <span
                      className={`text-[9px] font-bold ${
                        selectedStationId === s.id
                          ? "text-orange-400"
                          : "text-zinc-300"
                      }`}
                    >
                      {s.name}
                    </span>
                    <span className="text-[7px] text-zinc-500 uppercase">
                      {s.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[8px] font-mono ${
                        s.status === "linked"
                          ? "text-emerald-500"
                          : s.status === "searching"
                          ? "bg-amber-500 animate-pulse"
                          : "bg-zinc-700"
                      }`}
                    >
                      {s.precision}
                    </span>
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${
                        s.status === "linked"
                          ? "bg-emerald-500"
                          : s.status === "searching"
                          ? "bg-amber-500 animate-pulse"
                          : "bg-zinc-700"
                      }`}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {/* USERS */}
      <div className="flex items-center gap-3 shrink-0">
        {userInfo?.email && (
          <div className="hidden md:flex flex-col items-end leading-none">
            <span className="text-[8px] text-zinc-500 font-bold uppercase">
              Usuario
            </span>
            <span className="text-[10px] text-zinc-300 font-bold">
              {userInfo.email}
            </span>
          </div>
        )}

        <div
          className={`h-10 px-3 flex items-center gap-2 border rounded-sm bg-zinc-800 ${alarmColor}`}
          title="Resumen de alarmas"
        >
          <Siren size={16} />
          <span className="text-[9px] font-black uppercase">
            {activeAlarms.length === 0
              ? "Sin alarmas"
              : `${activeAlarms.length} alarmas`}
          </span>
        </div>

        {userInfo?.admin && (
          <div className="relative">
            <button
              title="Menú de gestión"
              onClick={() => setIsManagementOpen(!isManagementOpen)}
              className={`h-10 px-3 flex items-center gap-2 border rounded-sm transition-colors ${
                isManagementOpen
                  ? "bg-orange-500 text-zinc-900 border-orange-600"
                  : "bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-orange-500 hover:text-orange-400"
              }`}
            >
              <span className="text-[9px] font-black uppercase">Gestión</span>
              <ChevronDown 
                size={14}
                className={`transition-transform ${isManagementOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isManagementOpen && (
              <div className="absolute top-full right-0 mt-2 w-40 bg-zinc-900 border border-zinc-700 z-[120] p-1 shadow-2xl rounded-sm">
                <div className="grid grid-cols-1 gap-0.5">
                  <button
                    title="Gestión de clientes"
                    onClick={() => {
                      onOpenClientManagement();
                      setIsManagementOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-zinc-800 text-[9px] font-bold uppercase transition-colors group"
                  >
                    <Building
                      size={14}
                      className="text-zinc-500 group-hover:text-orange-500"
                    />
                    <span>Clientes</span>
                  </button>

                  <button
                    title="Gestión de usuarios"
                    onClick={() => {
                      onOpenUserManagement();
                      setIsManagementOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-zinc-800 text-[9px] font-bold uppercase transition-colors group"
                  >
                    <Users
                      size={14}
                      className="text-zinc-500 group-hover:text-orange-500"
                    />
                    <span>Usuarios</span>
                  </button>

                  <button
                    title="Gestión de robots"
                    onClick={() => {
                      onOpenRobotManagement();
                      setIsManagementOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-zinc-800 text-[9px] font-bold uppercase transition-colors group"
                  >
                    <Bot
                      size={14}
                      className="text-zinc-500 group-hover:text-orange-500"
                    />
                    <span>Robots</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        
        <button
          title="Cerrar sesión"
          onClick={() => (window.location.href = "/auth/logout")}
          className="h-10 px-3 flex items-center gap-2 border rounded-sm transition-colors bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-red-500 hover:text-red-400"
        >
          <LogOut size={16} />
          <span className="text-[9px] font-black uppercase">Logout</span>
        </button>
      </div>
    </header>
  );
}