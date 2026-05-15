import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';

export default function RobotDetail({ robotId, onClose, addLog }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [robot, setRobot] = useState(null);
  const [expandedWorks, setExpandedWorks] = useState({});
  const [expandedCleans, setExpandedCleans] = useState({});
  const [editingField, setEditingField] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [saving, setSaving] = useState(false);
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

  const formatSeconds = (seconds) => {
    if (!seconds) return '-';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h`;
    if (minutes > 0) return `${minutes}m`;
    return `${seconds}s`;
  };

  const startEdit = (field) => {
    setEditingField(field);
    setEditValues({
      [field]: robot?.[field] || null,
    });
  };

  const cancelEdit = () => {
    setEditingField(null);
    setEditValues({});
  };

  const saveFieldEdit = async (field) => {
    try {
      setSaving(true);
      setError(null);

      const payload = {
        [field]: editValues[field] === '' ? null : editValues[field],
      };

      const res = await fetch(`/admin/robots/${encodeURIComponent(robotId)}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      setRobot((prev) => ({ ...prev, ...data }));
      addLogRef.current?.(`ROBOT ACTUALIZADO: ${field}`, 'success', 'ADMIN');
      setEditingField(null);
      setEditValues({});
    } catch (err) {
      console.error('SAVE FIELD ERROR', err);
      setError(String(err));
      addLogRef.current?.(`ERROR actualizar ${field}: ${String(err)}`, 'error', 'ADMIN');
    } finally {
      setSaving(false);
    }
  };

  const toggleWork = (workId) => {
    setExpandedWorks((prev) => ({
      ...prev,
      [workId]: !prev[workId],
    }));
  };

  const toggleCleaning = (cleanId) => {
    setExpandedCleans((prev) => ({
      ...prev,
      [cleanId]: !prev[cleanId],
    }));
  };

  const works = Array.isArray(robot?.works) ? robot.works : [];
  const cleans = Array.isArray(robot?.cleans) ? robot.cleans : [];

  return (
    <div className="flex-1 overflow-hidden">
      <div className="h-full bg-zinc-900 border border-zinc-800 rounded-sm shadow-xl flex flex-col">
        <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="h-9 px-3 flex items-center gap-2 border rounded-sm bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-orange-500 hover:text-orange-400"
            >
              <ArrowLeft size={16} />
              <span className="text-[9px] font-black uppercase">Volver</span>
            </button>

            <div>
              <div className="text-[8px] text-zinc-500 font-bold uppercase tracking-[0.2em]">
                Detalles del robot
              </div>
              <div className="text-sm text-white font-black uppercase">
                {robot?.robotName || robot?.hostName || robotId}
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mx-4 mt-4 px-3 py-2 border border-red-900/50 bg-red-950/20 text-red-400 text-[11px] rounded-sm">
            {error}
          </div>
        )}

        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4 space-y-4">
          {loading ? (
            <div className="text-zinc-400 text-[12px]">Cargando...</div>
          ) : !robot ? (
            <div className="text-zinc-400 text-[12px]">Sin datos.</div>
          ) : (
            <>
              {/* Info General */}
              <div className="border border-zinc-800 rounded-sm overflow-hidden">
                <div className="bg-zinc-950 px-4 py-2 text-[8px] font-black uppercase text-zinc-500 border-b border-zinc-800">
                  Información General
                </div>
                <div className="grid grid-cols-4 gap-3 px-4 py-3 bg-zinc-900/40">
                  <div>
                    <div className="text-[10px] text-zinc-400 uppercase font-bold mb-1">Nombre</div>
                    <div className="text-[12px] font-bold text-white truncate">
                      {robot.robotName || robot.hostName || '-'}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-zinc-400 uppercase font-bold mb-1">Cliente</div>
                    <div className="text-[12px] font-bold text-white truncate">
                      {robot.clientName || '-'}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-zinc-400 uppercase font-bold mb-1">Usuarios</div>
                    <div className="text-[12px] font-bold text-white truncate">
                      {Array.isArray(robot.userEmails) ? (robot.userEmails.length > 0 ? robot.userEmails.length : 0) : 0}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-zinc-400 uppercase font-bold mb-1">Trabajos</div>
                    <div className="text-[12px] font-bold text-white truncate">
                      {robot.worksCount ?? 0}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-zinc-400 uppercase font-bold mb-1">Fecha Entrega</div>
                    {editingField === 'deliveryDate' ? (
                      <div className="flex gap-2 items-center">
                        <input
                          type="date"
                          value={editValues.deliveryDate ? new Date(editValues.deliveryDate).toISOString().split('T')[0] : ''}
                          onChange={(e) => setEditValues({ deliveryDate: e.target.value ? new Date(e.target.value).toISOString() : '' })}
                          className="flex-1 bg-zinc-900 border border-zinc-700 rounded-sm px-2 py-1 text-[11px] text-white outline-none focus:border-orange-500"
                        />
                        <button
                          onClick={() => saveFieldEdit('deliveryDate')}
                          disabled={saving}
                          className="px-2 py-1 border rounded-sm text-[9px] font-bold bg-emerald-900/30 border-emerald-700 text-emerald-400 hover:border-emerald-500 disabled:opacity-50"
                        >
                          ✓
                        </button>
                        <button
                          onClick={cancelEdit}
                          disabled={saving}
                          className="px-2 py-1 border rounded-sm text-[9px] font-bold bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600 disabled:opacity-50"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="text-[12px] font-bold text-white truncate">
                          {robot.deliveryDate ? new Date(robot.deliveryDate).toLocaleDateString() : '-'}
                        </div>
                        <button
                          onClick={() => startEdit('deliveryDate')}
                          className="text-[9px] px-2 py-1 text-zinc-400 hover:text-orange-400 ml-2"
                        >
                          ✎
                        </button>
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-[10px] text-zinc-400 uppercase font-bold mb-1">Último Mantenimiento</div>
                    {editingField === 'lastMaint' ? (
                      <div className="flex gap-2 items-center">
                        <input
                          type="date"
                          value={editValues.lastMaint ? new Date(editValues.lastMaint).toISOString().split('T')[0] : ''}
                          onChange={(e) => setEditValues({ lastMaint: e.target.value ? new Date(e.target.value).toISOString() : '' })}
                          className="flex-1 bg-zinc-900 border border-zinc-700 rounded-sm px-2 py-1 text-[11px] text-white outline-none focus:border-orange-500"
                        />
                        <button
                          onClick={() => saveFieldEdit('lastMaint')}
                          disabled={saving}
                          className="px-2 py-1 border rounded-sm text-[9px] font-bold bg-emerald-900/30 border-emerald-700 text-emerald-400 hover:border-emerald-500 disabled:opacity-50"
                        >
                          ✓
                        </button>
                        <button
                          onClick={cancelEdit}
                          disabled={saving}
                          className="px-2 py-1 border rounded-sm text-[9px] font-bold bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600 disabled:opacity-50"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="text-[12px] font-bold text-white truncate">
                          {robot.lastMaint ? new Date(robot.lastMaint).toLocaleDateString() : '-'}
                        </div>
                        <button
                          onClick={() => startEdit('lastMaint')}
                          className="text-[9px] px-2 py-1 text-zinc-400 hover:text-orange-400 ml-2"
                        >
                          ✎
                        </button>
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-[10px] text-zinc-400 uppercase font-bold mb-1">Última Limpieza</div>
                    <div className="text-[12px] font-bold text-white truncate">
                      {robot.lastClean ? new Date(robot.lastClean).toLocaleDateString() : '-'}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-zinc-400 uppercase font-bold mb-1">Último Trabajo</div>
                    <div className="text-[12px] font-bold text-white truncate">
                      {robot.lastWork ? new Date(robot.lastWork).toLocaleDateString() : '-'}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-zinc-400 uppercase font-bold mb-1">Tiempo Encendido</div>
                    <div className="text-[12px] font-bold text-white truncate">
                      {formatSeconds(robot.timeOn)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-zinc-400 uppercase font-bold mb-1">Tiempo Trabajando</div>
                    <div className="text-[12px] font-bold text-white truncate">
                      {formatSeconds(robot.timeWork)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Trabajos */}
              <div className="border border-zinc-800 rounded-sm overflow-hidden">
                <div className="bg-zinc-950 px-4 py-2 text-[8px] font-black uppercase text-zinc-500 border-b border-zinc-800">
                  Trabajos ({works.length})
                </div>
                {works.length === 0 ? (
                  <div className="px-4 py-3 text-zinc-400 text-[12px]">No hay trabajos registrados.</div>
                ) : (
                  <div className="divide-y divide-zinc-800">
                    {works.map((work) => (
                      <div key={work.id} className="bg-zinc-900/40">
                        <button
                          onClick={() => toggleWork(work.id)}
                          className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-zinc-800/50"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="text-[12px] font-bold text-white truncate">
                              {work.filePath || `Trabajo ${work.id?.slice(0, 8)}`}
                            </div>
                            <div className="text-[11px] text-zinc-400 mt-1">
                              {work.startTime && work.endTime ? `${work.startTime} → ${work.endTime}` : 'Información horaria no disponible'}
                            </div>
                          </div>
                          <button
                            className="ml-3 p-1 text-zinc-400 hover:text-white flex-shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleWork(work.id);
                            }}
                          >
                            {expandedWorks[work.id] ? (
                              <ChevronUp size={16} />
                            ) : (
                              <ChevronDown size={16} />
                            )}
                          </button>
                        </button>

                        {expandedWorks[work.id] && (
                          <div className="px-4 py-3 border-t border-zinc-800 bg-zinc-950/50 space-y-2 text-[11px]">
                            <div className="grid grid-cols-2 gap-3">
                              {work.estimatedTime !== undefined && (
                                <div>
                                  <span className="text-zinc-400">Tiempo estimado:</span>
                                  <span className="ml-2 text-white font-bold">{work.estimatedTime} min</span>
                                </div>
                              )}
                              {work.totalTime !== undefined && (
                                <div>
                                  <span className="text-zinc-400">Tiempo total:</span>
                                  <span className="ml-2 text-white font-bold">{work.totalTime} min</span>
                                </div>
                              )}
                              <div>
                                <span className="text-zinc-400">Alarmas:</span>
                                <span className="ml-2 text-white font-bold">{work.alarms || 0}</span>
                              </div>
                              <div>
                                <span className="text-zinc-400">Interrupciones:</span>
                                <span className="ml-2 text-white font-bold">
                                  {Array.isArray(work.interruptions) ? work.interruptions.length : 0}
                                </span>
                              </div>
                              <div>
                                <span className="text-zinc-400">Warnings:</span>
                                <span className="ml-2 text-white font-bold">
                                  {Array.isArray(work.warnings) ? work.warnings.length : 0}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Limpiezas */}
              <div className="border border-zinc-800 rounded-sm overflow-hidden">
                <div className="bg-zinc-950 px-4 py-2 text-[8px] font-black uppercase text-zinc-500 border-b border-zinc-800">
                  Limpiezas ({cleans.length})
                </div>
                {cleans.length === 0 ? (
                  <div className="px-4 py-3 text-zinc-400 text-[12px]">No hay limpiezas registradas.</div>
                ) : (
                  <div className="divide-y divide-zinc-800">
                    {cleans.map((clean) => (
                      <div key={clean.id} className="bg-zinc-900/40">
                        <button
                          onClick={() => toggleCleaning(clean.id)}
                          className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-zinc-800/50"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="text-[12px] font-bold text-white truncate">
                              {clean.name || `Limpieza ${clean.id?.slice(0, 8)}`}
                            </div>
                            <div className="text-[11px] text-zinc-400 mt-1">
                              {clean.startTime && clean.endTime ? `${clean.startTime} → ${clean.endTime}` : 'Información horaria no disponible'}
                            </div>
                          </div>
                          <button
                            className="ml-3 p-1 text-zinc-400 hover:text-white flex-shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleCleaning(clean.id);
                            }}
                          >
                            {expandedCleans[clean.id] ? (
                              <ChevronUp size={16} />
                            ) : (
                              <ChevronDown size={16} />
                            )}
                          </button>
                        </button>

                        {expandedCleans[clean.id] && (
                          <div className="px-4 py-3 border-t border-zinc-800 bg-zinc-950/50 space-y-2 text-[11px]">
                            <div className="grid grid-cols-2 gap-2">
                              {clean.type !== undefined && (
                                <div>
                                  <span className="text-zinc-400">Tipo:</span>
                                  <span className="ml-2 text-white font-bold">{clean.type || '-'}</span>
                                </div>
                              )}
                              {clean.status !== undefined && (
                                <div>
                                  <span className="text-zinc-400">Estado:</span>
                                  <span className="ml-2 text-white font-bold">{clean.status || '-'}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
