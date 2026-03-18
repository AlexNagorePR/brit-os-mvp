import { useMemo, useState } from "react";
import { AlertTriangle, AlertCircle, Clock3, ChevronDown, ChevronUp } from "lucide-react";
import HUDPanel from "./HUDPanel";

function getLevelStyles(level) {
  switch (level) {
    case "ERROR":
      return {
        badge: "bg-red-950/40 text-red-400 border-red-700/50",
        border: "border-red-900/50",
        accent: "bg-red-500",
        icon: <AlertCircle size={13} className="text-red-400" />,
      };
    case "WARN":
      return {
        badge: "bg-amber-950/40 text-amber-400 border-amber-700/50",
        border: "border-amber-900/50",
        accent: "bg-amber-500",
        icon: <AlertTriangle size={13} className="text-amber-400" />,
      };
    case "STALE":
      return {
        badge: "bg-zinc-800 text-zinc-300 border-zinc-700",
        border: "border-zinc-700",
        accent: "bg-zinc-500",
        icon: <Clock3 size={13} className="text-zinc-400" />,
      };
    default:
      return {
        badge: "bg-zinc-800 text-zinc-300 border-zinc-700",
        border: "border-zinc-700",
        accent: "bg-zinc-500",
        icon: <AlertTriangle size={13} className="text-zinc-400" />,
      };
  }
}

function formatTime(iso) {
  if (!iso) return "--:--:--";
  const d = new Date(iso);
  return d.toLocaleTimeString("en-GB", { hour12: false });
}

export default function AlarmPanel({ alarms = [] }) {
  const [openIds, setOpenIds] = useState([]);

  const orderedAlarms = useMemo(() => {
    const priority = { ERROR: 0, WARN: 1, STALE: 2, OK: 3 };

    return [...alarms]
      .filter((a) => a.active && a.level !== "OK")
      .sort((a, b) => {
        const byLevel = (priority[a.level] ?? 99) - (priority[b.level] ?? 99);
        if (byLevel !== 0) return byLevel;
        return new Date(b.timestamp) - new Date(a.timestamp);
      });
  }, [alarms]);

  function toggleOpen(id) {
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  return (
    <HUDPanel title="Alarmas activas" className="max-h-[320px]">
      {orderedAlarms.length === 0 ? (
        <div className="text-[11px] text-zinc-500">No hay alarmas activas.</div>
      ) : (
        <div className="space-y-2">
          {orderedAlarms.map((alarm) => {
            const styles = getLevelStyles(alarm.level);
            const isOpen = openIds.includes(alarm.id);

            return (
              <div
                key={alarm.id}
                className={`relative border rounded-sm bg-zinc-950/50 ${styles.border}`}
              >
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${styles.accent}`} />

                <button
                  onClick={() => toggleOpen(alarm.id)}
                  className="w-full text-left px-3 py-2 pl-4 hover:bg-zinc-900/50 transition-colors"
                >
                  <div className="flex items-start gap-2">
                    <div className="mt-0.5 shrink-0">{styles.icon}</div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`text-[8px] px-2 py-0.5 border rounded-full font-black uppercase ${styles.badge}`}
                        >
                          {alarm.level}
                        </span>

                        <span className="text-[8px] text-zinc-500 font-mono">
                          {formatTime(alarm.timestamp)}
                        </span>
                      </div>

                      <div className="mt-1 text-[11px] font-bold text-white">
                        {alarm.title}
                      </div>

                      <div className="mt-1 text-[9px] text-zinc-500">
                        {alarm.source?.label || "Origen desconocido"}
                      </div>

                      <div className="mt-1 text-[9px] text-orange-400 font-bold uppercase">
                        Acción: {alarm.action || "-"}
                      </div>
                    </div>

                    <div className="shrink-0 text-zinc-500">
                      {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </div>
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-zinc-800 px-3 py-2 pl-4 bg-zinc-900/40">
                    <div className="space-y-1">
                      {(alarm.details || []).map((item, idx) => (
                        <div
                          key={`${alarm.id}-${idx}`}
                          className="grid grid-cols-[90px_1fr] gap-2 text-[10px]"
                        >
                          <span className="text-zinc-500 font-bold uppercase">
                            {item.key}
                          </span>
                          <span className="text-zinc-300">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </HUDPanel>
  );
}