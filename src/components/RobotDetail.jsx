import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';

export default function RobotDetail({ robotId, onClose, addLog }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [robot, setRobot] = useState(null);
  const addLogRef = useRef(addLog);

  useEffect(() => {
    addLogRef.current = addLog;
  }, [addLog]);

  useEffect(() => {
    if (!robotId) return;

    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`/admin/robots/${encodeURIComponent(robotId)}`, {
          credentials: 'include',
        });

        if (!res.ok) {
          const data = await res.json().catch(() => null);
          throw new Error(data?.error || `HTTP ${res.status}`);
        }

        const data = await res.json();

        if (cancelled) return;
        setRobot(data);
        addLogRef.current?.(`DETALLES ROBOT CARGADOS: ${robotId}`, 'success', 'ADMIN');
      } catch (err) {
        console.error('LOAD ROBOT DETAIL ERROR', err);
        if (!cancelled) setError(String(err));
        addLogRef.current?.(`ERROR cargar robot ${robotId}: ${String(err)}`, 'error', 'ADMIN');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [robotId]);

  if (!robotId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-6">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      <div className="relative max-w-4xl w-full max-h-[80vh] overflow-auto bg-zinc-900 border border-zinc-800 rounded shadow-lg p-4 text-sm text-zinc-200 z-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs text-zinc-400 uppercase font-black">Detalles robot</div>
            <div className="text-lg font-extrabold text-white truncate">{robotId}</div>
          </div>
          <button onClick={onClose} title="Cerrar" className="p-2 text-zinc-400 hover:text-zinc-200">
            <X />
          </button>
        </div>

        <div className="mt-3">
          {loading ? (
            <div className="text-zinc-400">Cargando...</div>
          ) : error ? (
            <div className="text-red-400">{error}</div>
          ) : robot ? (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div className="p-2 bg-zinc-950 border border-zinc-800 rounded">
                  <div className="text-[10px] text-zinc-400">Nombre</div>
                  <div className="font-bold text-white truncate">{robot.robotName || robot.hostName || '-'}</div>
                </div>

                <div className="p-2 bg-zinc-950 border border-zinc-800 rounded">
                  <div className="text-[10px] text-zinc-400">Cliente</div>
                  <div className="font-bold text-white truncate">{robot.clientName || '-'}</div>
                </div>

                <div className="p-2 bg-zinc-950 border border-zinc-800 rounded">
                  <div className="text-[10px] text-zinc-400">Usuarios</div>
                  <div className="font-bold text-white truncate">{Array.isArray(robot.userEmails) ? robot.userEmails.join(', ') : '-'}</div>
                </div>
              </div>

              <div>
                <div className="text-[11px] text-zinc-400 font-bold uppercase mb-2">Trabajos</div>
                {Array.isArray(robot.works) && robot.works.length > 0 ? (
                  robot.works.map((w) => (
                    <div key={w.id} className="mb-2 p-3 bg-zinc-950 border border-zinc-800 rounded">
                      <div className="text-[12px] font-bold text-white">{w.filePath || w.id}</div>
                      <div className="text-[11px] text-zinc-400">{w.startTime} → {w.endTime}</div>
                      <div className="text-[11px] text-zinc-300 mt-1">Estimado: {w.estimatedTime} min • Total: {w.totalTime} min • Alarmas: {w.alarms}</div>
                      <div className="text-[11px] text-zinc-400 mt-2">Interrupciones: {Array.isArray(w.interruptions) ? w.interruptions.length : 0} • Warnings: {Array.isArray(w.warnings) ? w.warnings.length : 0}</div>
                    </div>
                  ))
                ) : (
                  <div className="text-zinc-400">No hay trabajos registrados.</div>
                )}
              </div>

              <div>
                <div className="text-[11px] text-zinc-400 font-bold uppercase mb-2">JSON completo</div>
                <pre className="whitespace-pre-wrap text-[11px] bg-zinc-950 border border-zinc-800 rounded p-3 overflow-auto">{JSON.stringify(robot, null, 2)}</pre>
              </div>
            </div>
          ) : (
            <div className="text-zinc-400">Sin datos.</div>
          )}
        </div>
      </div>
    </div>
  );
}
