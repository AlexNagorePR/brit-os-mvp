import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, RefreshCw, Bot, Pencil, Save, X, Users } from "lucide-react";

function normalizeRobot(raw) {
  return {
    id: raw?.id ?? "",
    hostname: raw?.hostname ?? "",
    name: raw?.name ?? raw?.hostname ?? raw?.id ?? "",
    clientId: raw?.clientId ?? "",
    clientName: raw?.clientName ?? "",
    raw,
  };
}

export default function RobotManagementScreen({ onBack, addLog, clients = [] }) {
  const [robots, setRobots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [savingRobotId, setSavingRobotId] = useState(null);
  const [editingRobotId, setEditingRobotId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [error, setError] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [editingUsersRobotId, setEditingUsersRobotId] = useState(null);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [savingUsersRobotId, setSavingUsersRobotId] = useState(null);
  const [loadingUsersRobotId, setLoadingUsersRobotId] = useState(null);

  async function loadRobots() {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("/admin/robots", {
        credentials: "include",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      const normalized = Array.isArray(data) ? data.map(normalizeRobot) : [];
      setRobots(normalized);

      addLog?.(`ROBOTS CARGADOS: ${normalized.length}`, "success", "ADMIN");
    } catch (err) {
      console.error("ROBOTS LOAD ERROR", err);
      setError("No se pudieron cargar los robots.");
      addLog?.(`ERROR /admin/robots: ${String(err)}`, "error", "ADMIN");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRobots();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function saveRobotClient(robot, clientName) {
    try {
      setSavingRobotId(robot.id);
      setError("");

      const res = await fetch(
        `/admin/robots/${encodeURIComponent(robot.id)}/client`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            clientName: clientName || null,
          }),
        }
      );

      const data = await res.json().catch(() => null);
      
      if (!res.ok) {
        throw new Error(data?.error || `HTTP ${res.status}`);
      }

      setRobots((prev) =>
        prev.map((r) =>
          r.id === robot.id
            ? {
              ...r,
              clientId: data?.clientId ?? null,
              clientName: data?.clientName ?? null,
            }
            : r
        )
      );

      addLog?.(`ROBOT ACTUALIZADO: ${robot.id} -> ${clientName || "Sin cliente"}`, "success", "ADMIN");
    } catch (err) {
      console.error("SAVE ROBOT CLIENT ERROR", err);
      setError(`No se pudo actualizar el cliente del robot: ${String(err.message || err)}`);
      addLog?.(`ERROR save robot client ${robot.id}: ${String(err)}`, "error", "ADMIN");
    } finally {
      setSavingRobotId(null);
    }
  }
  
  async function handleSyncRobots() {
    try {
      setSyncing(true);
      setError("");

      const res = await fetch("/admin/robots/sync", {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      addLog?.(`SYNC ROBOTS OK: ${data?.count ?? 0}`, "success", "ADMIN");

      await loadRobots();
    } catch (err) {
      console.error("SYNC ROBOTS ERROR", err);
      setError(`No se pudieron sincronizar los robots: ${String(err.message || err)}`);
      addLog?.(`ERROR sync robots: ${String(err)}`, "error", "ADMIN");
    } finally {
      setSyncing(false);
    }
  }

  function startRename(robot) {
    setEditingRobotId(robot.id);
    setEditingName(robot.name || "");
  }

  function cancelRename() {
    setEditingRobotId(null);
    setEditingName("");
  }

  async function loadAllUsers() {
    try {
      setError("");
      
      const res = await fetch("/admin/db-users", {
        credentials: "include",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      
      const usersArray = Array.isArray(data)
        ? data
        : Array.isArray(data?.users)
        ? data.users
        : [];
        
      const normalized = usersArray.map((u)=>({
        id: u.id,
        username: u.id,
        email: u.email,
        clientId: u.clientId,
      }));

      setAllUsers(normalized);
    } catch (err) {
      console.error("LOAD ALL USERS ERROR", err);
      setError(`No se pudieron cargar los usuarios: ${String(err.message || err)}`);
    }
  }

  useEffect(() => {
    loadRobots();
    loadAllUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function startEditUsers(robot) {
    try {
      setLoadingUsersRobotId(robot.id);
      setError("");

      const res = await fetch(`/admin/robots/${encodeURIComponent(robot.id)}/users`, {
        credentials: "include",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || `HTTP ${res.status}`);
      }

      const data = await res.json();

      console.log(`ROBOT USERS DATA [${robot.id}]:`, data);
      addLog?.(`USUARIOS DEL ROBOT: ${JSON.stringify(data)}`, "info", "ADMIN");

      setEditingUsersRobotId(robot.id);
      setSelectedUserIds(Array.isArray(data?.userIds) ? data.userIds : []);
    } catch (err) {
      console.error("LOAD ROBOT USERS ERROR", err);
      setError(`No se pudieron cargar los usuarios del robot: ${String(err.message || err)}`);
      addLog?.(`ERROR robot users ${robot.id}: ${String(err)}`, "error", "ADMIN");
    } finally {
      setLoadingUsersRobotId(null);
    }
  }

  function toggleUserSelection(userId) {
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  }

  async function saveRobotUsers(robot) {
    try {
      setSavingUsersRobotId(robot.id);
      setError("");

      const res = await fetch(`/admin/robots/${encodeURIComponent(robot.id)}/users`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userIds: selectedUserIds,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || `HTTP ${res.status}`);
      }

      await res.json();

      addLog?.(`USUARIOS ACTUALIZADOS EN ROBOT: ${robot.id}`, "success", "ADMIN");

      setEditingUsersRobotId(null);
      setSelectedUserIds([]);
    } catch (err) {
      console.error("SAVE ROBOT USERS ERROR", err);
      setError(`No se pudieron guardar los usuarios del robot: ${String(err.message || err)}`);
      addLog?.(`ERROR guardar usuarios robot ${robot.id}: ${String(err)}`, "error", "ADMIN");
    } finally {
      setSavingUsersRobotId(null);
    }
  }

  function cancelEditUsers() {
    setEditingUsersRobotId(null);
    setSelectedUserIds([]);
  }

  async function saveRename(robot) {
    try {
      const trimmed = editingName.trim();
      if (!trimmed) {
        setError("El nombre no puede estar vacío.");
        return;
      }

      setSavingRobotId(robot.id);
      setError("");

      const res = await fetch(`/api/robots/${encodeURIComponent(robot.id)}/rename`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: trimmed,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || `HTTP ${res.status}`);
      }

      const data = await res.json();

      setRobots((prev) =>
        prev.map((r) =>
          r.id === robot.id
            ? { ...r, name: data?.name ?? trimmed }
            : r
        )
      );

      addLog?.(`ROBOT RENOMBRADO: ${robot.id} -> ${trimmed}`, "success", "ADMIN");
      cancelRename();
    } catch (err) {
      console.error("RENAME ROBOT ERROR", err);
      setError(`No se pudo renombrar el robot: ${String(err.message || err)}`);
      addLog?.(`ERROR rename robot ${robot.id}: ${String(err)}`, "error", "ADMIN");
    } finally {
      setSavingRobotId(null);
    }
  }

  const orderedRobots = useMemo(() => {
    return [...robots].sort((a, b) => a.name.localeCompare(b.name));
  }, [robots]);

  return (
    <div className="flex-1 overflow-hidden p-2">
      <div className="h-full bg-zinc-900 border border-zinc-800 rounded-sm shadow-xl flex flex-col">
        <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="h-9 px-3 flex items-center gap-2 border rounded-sm bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-orange-500 hover:text-orange-400"
            >
              <ArrowLeft size={16} />
              <span className="text-[9px] font-black uppercase">Volver</span>
            </button>

            <div>
              <div className="text-[8px] text-zinc-500 font-bold uppercase tracking-[0.2em]">
                Administración
              </div>
              <div className="text-sm text-white font-black uppercase">
                Gestión de robots
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadRobots}
              className="h-9 px-3 flex items-center gap-2 border rounded-sm bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-zinc-500"
            >
              <RefreshCw size={15} />
              <span className="text-[9px] font-black uppercase">Recargar</span>
            </button>

            <button
              onClick={handleSyncRobots}
              disabled={syncing}
              className="h-9 px-3 flex items-center gap-2 border rounded-sm bg-orange-500 border-orange-600 text-zinc-950 hover:bg-orange-400 disabled:opacity-50"
            >
              <Bot size={15} />
              <span className="text-[9px] font-black uppercase">
                {syncing ? "Sincronizando..." : "Sync robots"}
              </span>
            </button>
          </div>
        </div>

        {error && (
          <div className="mx-4 mt-4 px-3 py-2 border border-red-900/50 bg-red-950/20 text-red-400 text-[11px] rounded-sm">
            {error}
          </div>
        )}

        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4">
          <div className="border border-zinc-800 rounded-sm overflow-hidden">
            <div className="grid grid-cols-[180px_1.1fr_1.1fr_220px_300px_220px] gap-3 px-4 py-2 bg-zinc-950 text-[8px] font-black uppercase text-zinc-500 border-b border-zinc-800">
              <span>ID</span>
              <span>Hostname</span>
              <span>Nombre visible</span>
              <span>Cliente</span>
              <span>Usuarios asignados</span>
              <span>Acciones</span>
            </div>

            {loading ? (
              <div className="p-4 text-zinc-400 text-[12px]">Cargando robots...</div>
            ) : orderedRobots.length === 0 ? (
              <div className="p-4 text-zinc-400 text-[12px]">No hay robots.</div>
            ) : (
              orderedRobots.map((robot) => {
                const isEditing = editingRobotId === robot.id;
                const isSaving = savingRobotId === robot.id;

                const assignableUsers = robot.clientId
                  ? allUsers.filter((u) => u.clientId === robot.clientId)
                  : [];

                return (
                  <div
                    key={robot.id}
                    className="grid grid-cols-[180px_1.1fr_1.1fr_220px_300px_220px] gap-3 px-4 py-3 border-b border-zinc-800 bg-zinc-900/40 items-center"
                  >
                    <div className="min-w-0 text-[11px] text-zinc-300 font-mono truncate">
                      {robot.id}
                    </div>

                    <div className="min-w-0 text-[12px] text-zinc-300 truncate">
                      {robot.hostname || "-"}
                    </div>

                    <div className="min-w-0">
                      {isEditing ? (
                        <input
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-700 rounded-sm px-3 py-2 text-[12px] text-white outline-none focus:border-orange-500"
                        />
                      ) : (
                        <div className="text-[12px] font-bold text-white truncate">
                          {robot.name || "-"}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <select
                        value={robot.clientName || ""}
                        disabled={savingRobotId === robot.id}
                        onChange={(e) => saveRobotClient(robot, e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-sm px-3 py-2 text-[11px] text-white outline-none focus:border-orange-500 disabled:opacity-50"
                      >
                        <option value="">Sin cliente</option>
                        {clients.map((client) => (
                          <option key={client.id} value={client.name}>
                            {client.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="min-w-0">
                      {editingUsersRobotId === robot.id ? (
                        <div className="border border-zinc-700 rounded-sm bg-zinc-950 p-2 max-h-40 overflow-y-auto custom-scrollbar space-y-2">
                          {assignableUsers.length === 0 ? (
                            <div className="text-[11px] text-zinc-500">No hay usuarios disponibles.</div>
                          ) : (
                            assignableUsers.map((user) => {
                              const userId = user.email || user.username;
                              const checked = selectedUserIds.includes(userId);

                              return (
                                <label
                                  key={userId}
                                  className="flex items-center gap-2 text-[11px] text-zinc-300"
                                >
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => toggleUserSelection(userId)}
                                  />
                                  <span className="truncate">{user.email || user.username}</span>
                                </label>
                              );
                            })
                          )}
                        </div>
                      ) : (
                        <div className="text-[11px] text-zinc-500">
                          {loadingUsersRobotId === robot.id
                            ? "Cargando..."
                            : "Pulsa gestionar"}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {isEditing ? (
                        <>
                          <button
                            onClick={() => saveRename(robot)}
                            disabled={isSaving}
                            className="h-9 px-3 border rounded-sm text-[9px] font-black uppercase bg-zinc-900 border-emerald-900/50 text-emerald-400 hover:border-emerald-500 disabled:opacity-50 flex items-center gap-2"
                          >
                            <Save size={14} />
                            Guardar
                          </button>

                          <button
                            onClick={cancelRename}
                            disabled={isSaving}
                            className="h-9 px-3 border rounded-sm text-[9px] font-black uppercase bg-zinc-900 border-zinc-700 text-zinc-300 hover:border-zinc-500 disabled:opacity-50 flex items-center gap-2"
                          >
                            <X size={14} />
                            Cancelar
                          </button>
                        </>
                      ) : editingUsersRobotId === robot.id ? (
                        <>
                          <button
                            onClick={() => saveRobotUsers(robot)}
                            disabled={savingUsersRobotId === robot.id}
                            className="h-9 px-3 border rounded-sm text-[9px] font-black uppercase bg-zinc-900 border-emerald-900/50 text-emerald-400 hover:border-emerald-500 disabled:opacity-50 flex items-center gap-2"
                          >
                            <Save size={14} />
                            Guardar usuarios
                          </button>

                          <button
                            onClick={cancelEditUsers}
                            disabled={savingUsersRobotId === robot.id}
                            className="h-9 px-3 border rounded-sm text-[9px] font-black uppercase bg-zinc-900 border-zinc-700 text-zinc-300 hover:border-zinc-500 disabled:opacity-50 flex items-center gap-2"
                          >
                            <X size={14} />
                            Cancelar
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startRename(robot)}
                            className="h-9 px-3 border rounded-sm text-[9px] font-black uppercase bg-zinc-900 border-zinc-700 text-zinc-300 hover:border-orange-500 hover:text-orange-400 flex items-center gap-2"
                          >
                            <Pencil size={14} />
                            Renombrar
                          </button>

                          <button
                            onClick={() => startEditUsers(robot)}
                            disabled={loadingUsersRobotId === robot.id}
                            className="h-9 px-3 border rounded-sm text-[9px] font-black uppercase bg-zinc-900 border-zinc-700 text-zinc-300 hover:border-orange-500 hover:text-orange-400 flex items-center gap-2 disabled:opacity-50"
                          >
                            <Users size={14} />
                            Gestionar
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}