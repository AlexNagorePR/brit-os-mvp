import { CheckCircle2, Activity, Clock } from "lucide-react";
import HUDPanel from "./HUDPanel";

export default function LeftPanelTrack({ layers }) {
  return (
    <HUDPanel title="Progreso de Producción" className="flex-1">
      <div className="space-y-2">
        {layers.map((l) => (
          <div
            key={l.id}
            className={`p-2 rounded-sm border transition-all ${
              l.status === "printing"
                ? "border-orange-500 bg-orange-500/5 shadow-[0_0_10px_rgba(249,115,22,0.1)]"
                : "border-zinc-800 bg-zinc-900/30"
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2 overflow-hidden">
                {l.status === "done" ? (
                  <CheckCircle2 size={12} className="text-emerald-500" />
                ) : l.status === "printing" ? (
                  <Activity size={12} className="text-orange-500 animate-pulse" />
                ) : (
                  <Clock size={12} className="text-zinc-600" />
                )}

                <span className="text-[8px] font-black uppercase truncate tracking-tight text-zinc-300">
                  {l.name}
                </span>
              </div>

              <span
                className={`text-[8px] font-mono font-black ${
                  l.status === "done" ? "text-emerald-500" : "text-orange-500"
                }`}
              >
                {l.progress.toFixed(0)}%
              </span>
            </div>

            <div className="w-full h-1 bg-zinc-950 rounded-full overflow-hidden flex">
              <div
                className={`h-full transition-all duration-500 ${
                  l.status === "done"
                    ? "bg-emerald-500 shadow-[0_0_5px_#10b981]"
                    : "bg-orange-500 animate-pulse"
                }`}
                style={{ width: `${l.progress}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </HUDPanel>
  );
}