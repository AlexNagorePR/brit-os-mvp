import { useEffect, useState } from "react";
import { ArrowLeft, RefreshCw, Plus, Trash2, Pencil, Save, X, Battery } from "lucide-react";

function normalizeBattery(raw) {
  return {
    id: raw?.id ?? "",
    clientId: raw?.clientId ?? "",
    serialNumber: raw?.serialNumber ?? "",
    stateOfHealth: raw?.stateOfHealth ?? null,
    raw,
  };
}

export default function BatteryManagementScreen({ onBack, addLog, clients = [] }) {
  const [batteries, setBatteries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [savingBatteryId, setSavingBatteryId] = useState(null);
  const [editingBatteryId, setEditingBatteryId] = useState(null);
  const [editingSerialNumber, setEditingSerialNumber] = useState("");
  const [error, setError] = useState("");
  const [creatingBattery, setCreatingBattery] = useState(false);
  const [newBatteryClientId, setNewBatteryClientId] = useState("");
  const [newBatterySerialNumber, setNewBatterySerialNumber] = useState("");
  const [selectedClientId, setSelectedClientId] = useState("all");
  const [deletingBatteryId, setDeletingBatteryId] = useState(null);

  async function loadBatteries(clientId = null) {
    try {
      setLoading(true);
      setError("");

      let url = "/admin/batteries";
      if (clientId && clientId !== "all") {
        url += `?clientId=${encodeURIComponent(clientId)}`;
      }

      const res = await fetch(url, {
        credentials: "include",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      const normalized = Array.isArray(data) ? data.map(normalizeBattery) : [];
      setBatteries(normalized);

      addLog?.(`BATERÍAS CARGADAS: ${normalized.length}`, "success", "ADMIN");
    } catch (err) {
      console.error("BATTERIES LOAD ERROR", err);
      setError("No se pudieron cargar las baterías.");
      addLog?.(`ERROR /admin/batteries: ${String(err)}`, "error", "ADMIN");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBatteries(selectedClientId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClientId]);

  async function createBattery() {
    try {
      if (!newBatteryClientId) {
        setError("Debe seleccionar un cliente.");
        return;
      }

      setCreatingBattery(true);
      setError("");

      const res = await fetch("/admin/batteries", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clientId: newBatteryClientId,
          serialNumber: newBatterySerialNumber || undefined,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || `HTTP ${res.status}`);
      }

      setBatteries((prev) => [
        ...prev,
        normalizeBattery({
          id: data.id,
          clientId: data.clientId,
          serialNumber: data.serialNumber,
          stateOfHealth: data.stateOfHealth,
        }),
      ]);

      setNewBatteryClientId("");
      setNewBatterySerialNumber("");

      addLog?.(`BATERÍA CREADA: ${data.id}`, "success", "ADMIN");
    } catch (err) {
      console.error("CREATE BATTERY ERROR", err);
      setError(`No se pudo crear la batería: ${String(err.message || err)}`);
      addLog?.(`ERROR crear batería: ${String(err)}`, "error", "ADMIN");
    } finally {
      setCreatingBattery(false);
    }
  }

  async function updateBattery(battery) {
    try {
      setSavingBatteryId(battery.id);
      setError("");

      const res = await fetch(`/admin/batteries/${encodeURIComponent(battery.id)}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          serialNumber: editingSerialNumber,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || `HTTP ${res.status}`);
      }

      const data = await res.json();

      setBatteries((prev) =>
        prev.map((b) =>
          b.id === battery.id
            ? {
              ...b,
              serialNumber: data.serialNumber ?? editingSerialNumber,
            }
            : b
        )
      );

      setEditingBatteryId(null);
      setEditingSerialNumber("");

      addLog?.(`BATERÍA ACTUALIZADA: ${battery.id}`, "success", "ADMIN");
    } catch (err) {
      console.error("UPDATE BATTERY ERROR", err);
      setError(`No se pudo actualizar la batería: ${String(err.message || err)}`);
      addLog?.(`ERROR actualizar batería ${battery.id}: ${String(err)}`, "error", "ADMIN");
    } finally {
      setSavingBatteryId(null);
    }
  }

  async function deleteBattery(batteryId) {
    try {
      setDeletingBatteryId(batteryId);
      setError("");

      const res = await fetch(`/admin/batteries/${encodeURIComponent(batteryId)}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || `HTTP ${res.status}`);
      }

      setBatteries((prev) => prev.filter((b) => b.id !== batteryId));
      addLog?.(`BATERÍA ELIMINADA: ${batteryId}`, "success", "ADMIN");
    } catch (err) {
      console.error("DELETE BATTERY ERROR", err);
      setError(`No se pudo eliminar la batería: ${String(err.message || err)}`);
      addLog?.(`ERROR eliminar batería ${batteryId}: ${String(err)}`, "error", "ADMIN");
    } finally {
      setDeletingBatteryId(null);
    }
  }

  function startEdit(battery) {
    setEditingBatteryId(battery.id);
    setEditingSerialNumber(battery.serialNumber || "");
    setEditingStateOfHealth(battery.stateOfHealth ? String(battery.stateOfHealth) : "");
  }

  function cancelEdit() {
    setEditingBatteryId(null);
    setEditingSerialNumber("");
    setEditingStateOfHealth("");
  }

  const getClientName = (clientId) => {
    const client = clients.find((c) => c.id === clientId);
    return client?.name || clientId;
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-zinc-950 text-zinc-300">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-zinc-800 rounded-sm text-zinc-400 hover:text-orange-500 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-2">
            <Battery size={20} className="text-orange-500" />
            <h1 className="text-lg font-bold uppercase">Gestión de Baterías</h1>
          </div>
        </div>
        <button
          onClick={() => loadBatteries(selectedClientId)}
          disabled={loading}
          className="p-2 hover:bg-zinc-800 rounded-sm text-zinc-400 hover:text-emerald-500 disabled:opacity-50 transition-colors"
        >
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-950 border border-red-800 text-red-200 text-[10px] font-bold uppercase">
          {error}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-auto custom-scrollbar">
        <div className="p-4 space-y-4">
          {/* Filter by Client */}
          <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-sm">
            <label className="block text-[9px] font-bold text-zinc-400 uppercase mb-2">
              Filtrar por cliente
            </label>
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 text-zinc-300 px-3 py-2 rounded-sm text-[10px] font-bold focus:outline-none focus:border-orange-500"
            >
              <option value="all">Todos los clientes</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Create Battery Form */}
          <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-sm">
            <h2 className="text-[10px] font-bold text-orange-500 uppercase mb-3">
              + Nueva Batería
            </h2>
            <div className="space-y-2">
              <div>
                <label className="block text-[8px] font-bold text-zinc-400 uppercase mb-1">
                  Cliente
                </label>
                <select
                  value={newBatteryClientId}
                  onChange={(e) => setNewBatteryClientId(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 text-zinc-300 px-3 py-2 rounded-sm text-[10px] font-bold focus:outline-none focus:border-orange-500"
                >
                  <option value="">Seleccionar cliente...</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[8px] font-bold text-zinc-400 uppercase mb-1">
                  Número de Serie (opcional)
                </label>
                <input
                  type="text"
                  value={newBatterySerialNumber}
                  onChange={(e) => setNewBatterySerialNumber(e.target.value)}
                  placeholder="Ej: BAT-2024-001"
                  className="w-full bg-zinc-800 border border-zinc-700 text-zinc-300 px-3 py-2 rounded-sm text-[10px] font-bold focus:outline-none focus:border-orange-500"
                />
              </div>

              <button
                onClick={createBattery}
                disabled={!newBatteryClientId || creatingBattery}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-700 text-white font-bold uppercase text-[9px] rounded-sm transition-colors"
              >
                <Plus size={14} className="inline mr-2" />
                Crear Batería
              </button>
            </div>
          </div>

          {/* Batteries List */}
          {loading ? (
            <div className="flex items-center justify-center p-6 text-zinc-400">
              Cargando baterías...
            </div>
          ) : batteries.length === 0 ? (
            <div className="flex items-center justify-center p-6 text-zinc-400">
              No hay baterías
            </div>
          ) : (
            <div className="space-y-2">
              {batteries.map((battery) => (
                <div
                  key={battery.id}
                  className="bg-zinc-900 border border-zinc-800 p-3 rounded-sm hover:border-zinc-700 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1">
                      <div className="text-[9px] font-bold text-orange-500 uppercase">
                        {battery.id}
                      </div>
                      <div className="text-[8px] text-zinc-400 mt-1">
                        Cliente: <span className="text-zinc-300">{getClientName(battery.clientId)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {editingBatteryId === battery.id ? (
                        <>
                          <button
                            onClick={() => updateBattery(battery)}
                            disabled={savingBatteryId === battery.id}
                            className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-sm transition-colors"
                          >
                            <Save size={14} />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded-sm transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEdit(battery)}
                            className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-orange-400 rounded-sm transition-colors"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => deleteBattery(battery.id)}
                            disabled={deletingBatteryId === battery.id}
                            className="p-1.5 bg-zinc-800 hover:bg-red-900 text-zinc-400 hover:text-red-400 rounded-sm transition-colors disabled:opacity-50"
                          >
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {editingBatteryId === battery.id ? (
                    <div className="space-y-2 mt-3 pt-3 border-t border-zinc-800">
                      <div>
                        <label className="text-[8px] font-bold text-zinc-400 uppercase block mb-1">
                          Número de Serie
                        </label>
                        <input
                          type="text"
                          value={editingSerialNumber}
                          onChange={(e) => setEditingSerialNumber(e.target.value)}
                          placeholder="Ej: BAT-2024-001"
                          className="w-full bg-zinc-800 border border-zinc-700 text-zinc-300 px-2 py-1.5 rounded-sm text-[9px] font-bold focus:outline-none focus:border-orange-500"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="text-[8px] text-zinc-400 space-y-1 mt-2">
                      {battery.serialNumber && (
                        <div>
                          Número de Serie: <span className="text-zinc-300">{battery.serialNumber}</span>
                        </div>
                      )}
                      {battery.stateOfHealth !== null && (
                        <div>
                          Estado de Salud:{" "}
                          <span
                            className={
                              battery.stateOfHealth >= 80
                                ? "text-emerald-400"
                                : battery.stateOfHealth >= 50
                                ? "text-amber-400"
                                : "text-red-400"
                            }
                          >
                            {battery.stateOfHealth}%
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
