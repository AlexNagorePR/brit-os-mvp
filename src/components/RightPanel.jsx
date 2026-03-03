import {
  Battery,
  Droplet,
  Wrench,
  Square,
  ChevronRight,
  ChevronLeft,
  Activity,
} from "lucide-react";
import HUDPanel from "./HUDPanel";
import HUDButton from "./HUDButton";
import Joystick from "./Joystick";

export default function RightPanel({
  isRightPanelOpen,
  setIsRightPanelOpen,

  activeRobot,
  controlType,
  setControlType,
  setMoveVector,

  addLog,
}) {
  return (
    <div
      className={`relative flex transition-all duration-300 ease-in-out ${
        isRightPanelOpen ? "w-64" : "w-0"
      }`}
    >
      <button
        onClick={() => setIsRightPanelOpen(!isRightPanelOpen)}
        className="absolute -left-6 top-1/2 -translate-y-1/2 w-6 h-20 bg-zinc-800 border-y border-l border-zinc-700 rounded-l-md flex items-center justify-center text-zinc-400 hover:text-orange-500 transition-colors z-[100] shadow-md"
      >
        {isRightPanelOpen ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      <aside
        className={`w-64 flex flex-col gap-2 shrink-0 h-full overflow-hidden transition-opacity duration-200 ${
          isRightPanelOpen ? "opacity-100" : "opacity-0"
        }`}
      >
        <HUDPanel title="Telemetría">
          <div className="space-y-2">
            <div className="flex justify-between items-center text-[8px] uppercase font-bold text-zinc-500">
              <span>Estado</span>
              <span className="text-emerald-500 tracking-wider font-black">
                {activeRobot.health}
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center text-[8px] uppercase font-bold text-zinc-500">
                <span>Carga</span>
                <span className="text-white">{activeRobot.load.toFixed(0)}%</span>
              </div>
              <div className="w-full h-1 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
                <div
                  className="h-full bg-orange-500 transition-all duration-300"
                  style={{ width: `${activeRobot.load}%` }}
                />
              </div>
            </div>
          </div>
        </HUDPanel>

        <div className="grid grid-cols-2 gap-2">
          <div className="aspect-square bg-zinc-900 border border-zinc-700 rounded-sm flex flex-col items-center justify-center gap-1 shadow-inner group">
            <Battery
              size={20}
              className={
                activeRobot.battery < 20
                  ? "text-red-500 animate-pulse"
                  : "text-emerald-500"
              }
            />
            <span className="text-[12px] font-black text-white">
              {activeRobot.battery.toFixed(0)}%
            </span>
          </div>

          <div className="aspect-square bg-zinc-900 border border-zinc-700 rounded-sm flex flex-col items-center justify-center gap-1 shadow-inner">
            <Droplet size={20} className="text-blue-500" />
            <span className="text-[12px] font-black text-white">
              {activeRobot.ink}%
            </span>
          </div>
        </div>

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

        <div className="mt-auto flex flex-col gap-1.5">
          <HUDButton variant="warning" className="w-full py-2 uppercase">
            <Wrench size={12} /> Mantenimiento
          </HUDButton>

          <button
            onClick={() =>
              addLog("¡PARADA DE EMERGENCIA ACTIVADA!", "error", "SYS")
            }
            className="w-full py-3 bg-red-600 text-white rounded-sm flex items-center justify-center gap-2 font-black text-[10px] uppercase border-b-4 border-red-800 active:border-b-0 active:translate-y-1 transition-all"
          >
            <Square size={14} fill="currentColor" /> Parada de Emergencia
          </button>
        </div>

        <div className="hidden">
          {/* Solo para que el bundler no “pierda” iconos si juegas con tree-shaking */}
          <Activity />
        </div>
      </aside>
    </div>
  );
}