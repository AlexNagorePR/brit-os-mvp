import {
  Settings,
  Sliders,
  RefreshCw,
  RotateCcw,
  ChevronDown,
  Target,
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

  // logging
  addLog,
}) {
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
                activeRobot.status === "online"
                  ? "bg-emerald-500 shadow-[0_0_5px_#10b981]"
                  : "bg-red-500"
              }`}
            />
            <div className="flex flex-col items-start leading-none flex-1 text-left">
              <span className="text-[10px] font-black text-white uppercase">
                {activeRobot.name}
              </span>
              <span className="text-[8px] text-zinc-500 font-bold uppercase">
                {activeRobot.id}
              </span>
            </div>

            <RobotStatusGroup robot={activeRobot} />
            <ChevronDown
              size={14}
              className={`text-zinc-500 ml-2 ${isFleetOpen ? "rotate-180" : ""}`}
            />
          </button>

          {isFleetOpen && (
            <div className="absolute top-full left-0 mt-2 w-full bg-zinc-900 border border-zinc-600 z-[120] shadow-2xl p-1 rounded-sm">
              {fleetData.map((r) => (
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
              ))}
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
    </header>
  );
}