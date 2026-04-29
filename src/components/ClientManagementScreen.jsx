import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, RefreshCw, Plus, Trash2 } from "lucide-react";

function normalizeClient(raw) {
  return {
    id: raw?.id ?? "",
    name: raw?.name ?? "",
    raw,
  };
}

export default function ClientManagementScreen({ onBack, addLog }) {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creatingClient, setCreatingClient] = useState(false);
  const [deletingClientId, setDeletingClientId] = useState(null);
  const [error, setError] = useState("");
  const [newClientName, setNewClientName] = useState("");

  async function loadClients() {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("/admin/clients", {
        credentials: "include",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      const normalized = Array.isArray(data) ? data.map(normalizeClient) : [];
      setClients(normalized);

      addLog?.(`CLIENTES CARGADOS: ${normalized.length}`, "success", "ADMIN");
    } catch (err) {
      console.error("CLIENTS LOAD ERROR", err);
      setError("No se pudieron cargar los clientes.");
      addLog?.(`ERROR /admin/clients: ${String(err)}`, "error", "ADMIN");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadClients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCreateClient(e) {
    e.preventDefault();

    try {
      const trimmed = newClientName.trim();
      if (!trimmed) {
        setError("El nombre del cliente no puede estar vacío.");
        return;
      }

      setCreatingClient(true);
      setError("");

      const res = await fetch("/admin/clients", {
        method: "POST",
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

      setClients((prev) => [
        ...prev,
        {
          id: data.id,
          name: data.name,
          raw: data,
        },
      ]);

      addLog?.(`CLIENTE CREADO: ${trimmed}`, "success", "ADMIN");
      setNewClientName("");
    } catch (err) {
      console.error("CREATE CLIENT ERROR", err);
      setError(`No se pudo crear el cliente: ${String(err.message || err)}`);
      addLog?.(`ERROR create client: ${String(err)}`, "error", "ADMIN");
    } finally {
      setCreatingClient(false);
    }
  }

  async function handleDeleteClient(client) {
    if (!window.confirm(`¿Eliminar cliente "${client.name}"?`)) {
      return;
    }

    try {
      setDeletingClientId(client.id);
      setError("");

      const res = await fetch(`/admin/clients/${encodeURIComponent(client.id)}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || `HTTP ${res.status}`);
      }

      setClients((prev) => prev.filter((c) => c.id !== client.id));

      addLog?.(`CLIENTE ELIMINADO: ${client.name}`, "success", "ADMIN");
    } catch (err) {
      console.error("DELETE CLIENT ERROR", err);
      setError(`No se pudo eliminar el cliente: ${String(err.message || err)}`);
      addLog?.(`ERROR delete client ${client.id}: ${String(err)}`, "error", "ADMIN");
    } finally {
      setDeletingClientId(null);
    }
  }

  const orderedClients = useMemo(() => {
    return [...clients].sort((a, b) => a.name.localeCompare(b.name));
  }, [clients]);

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
                Gestión de clientes
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadClients}
              className="h-9 px-3 flex items-center gap-2 border rounded-sm bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-zinc-500"
            >
              <RefreshCw size={15} />
              <span className="text-[9px] font-black uppercase">Recargar</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="mx-4 mt-4 px-3 py-2 border border-red-900/50 bg-red-950/20 text-red-400 text-[11px] rounded-sm">
            {error}
          </div>
        )}

        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4">
          {/* Create new client form */}
          <div className="mb-6 border border-zinc-800 rounded-sm bg-zinc-900/40 p-4">
            <form onSubmit={handleCreateClient} className="space-y-3">
              <div className="text-[9px] font-black uppercase text-zinc-400 mb-3">
                Crear nuevo cliente
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  placeholder="Nombre del cliente"
                  className="flex-1 bg-zinc-900 border border-zinc-700 rounded-sm px-3 py-2 text-[12px] text-white outline-none focus:border-orange-500 placeholder:text-zinc-500"
                  disabled={creatingClient}
                />
                <button
                  type="submit"
                  disabled={creatingClient}
                  className="h-9 px-4 flex items-center gap-2 border rounded-sm bg-orange-500 border-orange-600 text-zinc-950 hover:bg-orange-400 disabled:opacity-50 text-[9px] font-black uppercase"
                >
                  <Plus size={16} />
                  Crear
                </button>
              </div>
            </form>
          </div>

          {/* Clients list */}
          <div className="border border-zinc-800 rounded-sm overflow-hidden">
            <div className="grid grid-cols-[1fr_200px_120px] gap-3 px-4 py-2 bg-zinc-950 text-[8px] font-black uppercase text-zinc-500 border-b border-zinc-800">
              <span>Nombre</span>
              <span>ID</span>
              <span>Acciones</span>
            </div>

            {loading ? (
              <div className="p-4 text-zinc-400 text-[12px]">Cargando clientes...</div>
            ) : orderedClients.length === 0 ? (
              <div className="p-4 text-zinc-400 text-[12px]">No hay clientes.</div>
            ) : (
              orderedClients.map((client) => (
                <div
                  key={client.id}
                  className="grid grid-cols-[1fr_200px_120px] gap-3 px-4 py-3 border-b border-zinc-800 bg-zinc-900/40 items-center"
                >
                  <div className="min-w-0 text-[12px] font-bold text-white truncate">
                    {client.name}
                  </div>

                  <div className="min-w-0 text-[11px] text-zinc-400 font-mono truncate">
                    {client.id}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDeleteClient(client)}
                      disabled={deletingClientId === client.id}
                      className="h-9 px-3 border rounded-sm text-[9px] font-black uppercase bg-zinc-900 border-red-900/50 text-red-400 hover:border-red-500 disabled:opacity-50 flex items-center gap-2"
                    >
                      <Trash2 size={14} />
                      Eliminar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
