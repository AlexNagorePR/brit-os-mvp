import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, RefreshCw, UserPlus, Shield, ShieldCheck } from "lucide-react";

function normalizeUser(raw) {
  const attrs = Array.isArray(raw?.attributes)
    ? Object.fromEntries(
        raw.attributes
          .filter((a) => a?.name)
          .map((a) => [a.name, a.value])
      )
    : raw?.attributes && typeof raw.attributes === "object"
    ? raw.attributes
    : {};

  return {
    username:
      raw?.username ??
      raw?.Username ??
      raw?.userName ??
      raw?.email ??
      attrs.email ??
      "",
    email:
      raw?.email ??
      attrs.email ??
      raw?.Username ??
      raw?.username ??
      "",
    enabled:
      raw?.enabled ??
      raw?.Enabled ??
      raw?.status === "ENABLED",
    groups: Array.isArray(raw?.groups) ? raw.groups : [],
    givenName: raw?.givenName ?? attrs.given_name ?? "",
    familyName: raw?.familyName ?? attrs.family_name ?? "",
    raw,
  };
}

export default function UserManagementScreen({ onBack, addLog, userInfo }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingGroupsFor, setSavingGroupsFor] = useState(null);
  const [togglingUser, setTogglingUser] = useState(null);
  const [creatingUser, setCreatingUser] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    email: "",
    givenName: "",
    familyName: "",
    temporaryPassword: "",
    allowed: true,
    admin: false,
  });

  async function loadUsers() {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("/admin/users", {
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      const normalized = Array.isArray(data) ? data.map(normalizeUser) : [];
      setUsers(normalized);
      addLog?.(`USUARIOS CARGADOS: ${normalized.length}`, "success", "ADMIN");
    } catch (err) {
      console.error("USERS LOAD ERROR", err);
      setError("No se pudieron cargar los usuarios.");
      addLog?.(`ERROR /admin/users: ${String(err)}`, "error", "ADMIN");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCreateUser(e) {
    e.preventDefault();

    try {
      setCreatingUser(true);
      setError("");

      const groups = [];
      if (form.allowed) groups.push("allowed");
      if (form.admin) groups.push("admin");

      const res = await fetch("/admin/users", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.email,
          givenName: form.givenName || undefined,
          familyName: form.familyName || undefined,
          temporaryPassword: form.temporaryPassword || undefined,
          groups,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || `HTTP ${res.status}`);
      }

      setForm({
        email: "",
        givenName: "",
        familyName: "",
        temporaryPassword: "",
        allowed: true,
        admin: false,
      });

      addLog?.(`USUARIO CREADO: ${form.email}`, "success", "ADMIN");
      await loadUsers();
    } catch (err) {
      console.error("CREATE USER ERROR", err);
      setError(`No se pudo crear el usuario: ${String(err.message || err)}`);
      addLog?.(`ERROR creando usuario: ${String(err)}`, "error", "ADMIN");
    } finally {
      setCreatingUser(false);
    }
  }

  async function saveGroups(user, groups) {
    try {
      setSavingGroupsFor(user.username);
      setError("");

      const res = await fetch(`/admin/users/${encodeURIComponent(user.username)}/groups`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ groups }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || `HTTP ${res.status}`);
      }

      const updated = normalizeUser(await res.json());

      setUsers((prev) =>
        prev.map((u) => (u.username === user.username ? updated : u))
      );

      addLog?.(`GRUPOS ACTUALIZADOS: ${user.username}`, "success", "ADMIN");
    } catch (err) {
      console.error("SET GROUPS ERROR", err);
      setError(`No se pudieron actualizar grupos: ${String(err.message || err)}`);
      addLog?.(`ERROR grupos ${user.username}: ${String(err)}`, "error", "ADMIN");
    } finally {
      setSavingGroupsFor(null);
    }
  }

  function isCurrentUser(user) {
    const currentEmail = String(userInfo?.email || "").toLowerCase();
    const username = String(user?.username || "").toLowerCase();
    const email = String(user?.email || "").toLowerCase();

    return currentEmail && (currentEmail === username || currentEmail === email);
  }

  async function deleteUser(user) {
    const username = user.email;
    const confirmed = window.confirm(`¿Eliminar usuario ${username}?`);
    if (!confirmed) return;

    try {
        const res = await fetch(`/admin/users/${encodeURIComponent(username)}`, {
            method: 'DELETE',
            credentials: 'include',
        });

        const data = await res.json().catch(() => null);
        
        if (!res.ok) {
            if (data?.error === "cannot_delete_self") {
                throw new Error("No puedes eliminar tu propio usuario.");
            }
            throw new Error(data?.error || `HTTP ${res.status}`);
        }

        addLog?.(`USUARIO ELIMINADO: ${username}`, "warn", "ADMIN");
        await loadUsers();
    } catch (err) {
        console.error('DELETE USER ERROR', err);
        setError(`No se pudo eliminar el usuario: ${String(err.message || err)}`);
        addLog?.(`USUARIO ELIMINADO: ${username}`, "warn", "ADMIN");
    }
  }

  async function toggleEnabled(user) {
    const endpoint = user.enabled ? "disable" : "enable";

    try {
      setTogglingUser(user.username);
      setError("");

      const res = await fetch(
        `/admin/users/${encodeURIComponent(user.username)}/${endpoint}`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || `HTTP ${res.status}`);
      }

      setUsers((prev) =>
        prev.map((u) =>
          u.username === user.username ? { ...u, enabled: !user.enabled } : u
        )
      );

      addLog?.(
        `${user.enabled ? "USUARIO DESHABILITADO" : "USUARIO HABILITADO"}: ${user.username}`,
        "warn",
        "ADMIN"
      );
    } catch (err) {
      console.error("TOGGLE USER ERROR", err);
      setError(`No se pudo cambiar el estado: ${String(err.message || err)}`);
      addLog?.(`ERROR estado usuario ${user.username}: ${String(err)}`, "error", "ADMIN");
    } finally {
      setTogglingUser(null);
    }
  }

  const orderedUsers = useMemo(() => {
    return [...users].sort((a, b) => a.email.localeCompare(b.email));
  }, [users]);

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
                Gestión de usuarios
              </div>
            </div>
          </div>

          <button
            onClick={loadUsers}
            className="h-9 px-3 flex items-center gap-2 border rounded-sm bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-zinc-500"
          >
            <RefreshCw size={15} />
            <span className="text-[9px] font-black uppercase">Recargar</span>
          </button>
        </div>

        {error && (
          <div className="mx-4 mt-4 px-3 py-2 border border-red-900/50 bg-red-950/20 text-red-400 text-[11px] rounded-sm">
            {error}
          </div>
        )}

        <div className="flex-1 min-h-0 grid grid-cols-[380px_1fr] gap-4 p-4 overflow-hidden">
          {/* FORM CREACIÓN */}
          <div className="min-h-0 overflow-y-auto custom-scrollbar">
            <div className="border border-zinc-800 rounded-sm bg-zinc-950/40">
              <div className="px-3 py-2 border-b border-zinc-800 flex items-center gap-2">
                <UserPlus size={14} className="text-orange-500" />
                <span className="text-[9px] font-black uppercase text-zinc-300">
                  Crear usuario
                </span>
              </div>

              <form onSubmit={handleCreateUser} className="p-3 space-y-3">
                <div>
                  <label className="block mb-1 text-[8px] font-bold uppercase text-zinc-500">
                    Email
                  </label>
                  <input
                    value={form.email}
                    onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                    type="email"
                    required
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-sm px-3 py-2 text-[12px] text-white outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-[8px] font-bold uppercase text-zinc-500">
                    Nombre
                  </label>
                  <input
                    value={form.givenName}
                    onChange={(e) => setForm((p) => ({ ...p, givenName: e.target.value }))}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-sm px-3 py-2 text-[12px] text-white outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-[8px] font-bold uppercase text-zinc-500">
                    Apellidos
                  </label>
                  <input
                    value={form.familyName}
                    onChange={(e) => setForm((p) => ({ ...p, familyName: e.target.value }))}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-sm px-3 py-2 text-[12px] text-white outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-[8px] font-bold uppercase text-zinc-500">
                    Contraseña temporal
                  </label>
                  <input
                    value={form.temporaryPassword}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, temporaryPassword: e.target.value }))
                    }
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-sm px-3 py-2 text-[12px] text-white outline-none focus:border-orange-500"
                  />
                </div>

                <div className="space-y-2 pt-1">
                  <label className="flex items-center gap-2 text-[11px] text-zinc-300">
                    <input
                      type="checkbox"
                      checked={form.allowed}
                      onChange={(e) => setForm((p) => ({ ...p, allowed: e.target.checked }))}
                    />
                    Grupo allowed
                  </label>

                  <label className="flex items-center gap-2 text-[11px] text-zinc-300">
                    <input
                      type="checkbox"
                      checked={form.admin}
                      onChange={(e) => setForm((p) => ({ ...p, admin: e.target.checked }))}
                    />
                    Grupo admin
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={creatingUser}
                  className="w-full h-10 border rounded-sm bg-orange-500 border-orange-600 text-zinc-950 font-black text-[10px] uppercase disabled:opacity-50"
                >
                  {creatingUser ? "Creando..." : "Crear usuario"}
                </button>
              </form>
            </div>
          </div>

          {/* LISTADO */}
          <div className="min-h-0 overflow-y-auto custom-scrollbar">
            <div className="border border-zinc-800 rounded-sm overflow-hidden">
              <div className="grid grid-cols-[2fr_1fr_1fr_220px] gap-3 px-4 py-2 bg-zinc-950 text-[8px] font-black uppercase text-zinc-500 border-b border-zinc-800">
                <span>Usuario</span>
                <span>Estado</span>
                <span>Grupos</span>
                <span>Acciones</span>
              </div>

              {loading ? (
                <div className="p-4 text-zinc-400 text-[12px]">Cargando usuarios...</div>
              ) : orderedUsers.length === 0 ? (
                <div className="p-4 text-zinc-400 text-[12px]">No hay usuarios.</div>
              ) : (
                orderedUsers.map((user) => {
                  const isAllowed = user.groups.includes("allowed");
                  const isAdmin = user.groups.includes("admin");

                  return (
                    <div
                      key={user.username}
                      className="grid grid-cols-[2fr_1fr_1fr_220px] gap-3 px-4 py-3 border-b border-zinc-800 bg-zinc-900/40 items-center"
                    >
                      <div className="min-w-0">
                        <div className="text-[12px] font-bold text-white truncate">
                          {user.email || user.username}
                        </div>
                        <div className="text-[10px] text-zinc-500 truncate">
                          {user.givenName || user.familyName
                            ? `${user.givenName} ${user.familyName}`.trim()
                            : user.username}
                        </div>
                      </div>

                      <div>
                        <span
                          className={`text-[10px] font-bold uppercase ${
                            user.enabled ? "text-emerald-400" : "text-red-400"
                          }`}
                        >
                          {user.enabled ? "Activo" : "Deshabilitado"}
                        </span>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="flex items-center gap-2 text-[10px] text-zinc-300">
                          <input
                            type="checkbox"
                            checked={isAllowed}
                            onChange={(e) => {
                              const next = new Set(user.groups);
                              if (e.target.checked) next.add("allowed");
                              else next.delete("allowed");
                              saveGroups(user, [...next]);
                            }}
                            disabled={savingGroupsFor === user.username}
                          />
                          <Shield size={12} className="text-zinc-400" />
                          allowed
                        </label>

                        <label className="flex items-center gap-2 text-[10px] text-zinc-300">
                          <input
                            type="checkbox"
                            checked={isAdmin}
                            onChange={(e) => {
                              const next = new Set(user.groups);
                              if (e.target.checked) next.add("admin");
                              else next.delete("admin");
                              saveGroups(user, [...next]);
                            }}
                            disabled={savingGroupsFor === user.username}
                          />
                          <ShieldCheck size={12} className="text-orange-400" />
                          admin
                        </label>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                            onClick={() => toggleEnabled(user)}
                            disabled={togglingUser === user.username}
                            className={`h-9 px-3 border rounded-sm text-[9px] font-black uppercase ${
                            user.enabled
                                ? "bg-zinc-900 border-red-900/50 text-red-400 hover:border-red-500"
                                : "bg-zinc-900 border-emerald-900/50 text-emerald-400 hover:border-emerald-500"
                            } disabled:opacity-50`}
                        >
                            {user.enabled ? "Deshabilitar" : "Habilitar"}
                        </button>

                        {!isCurrentUser(user) && (
                            <button
                            onClick={() => deleteUser(user)}
                            className="h-9 px-3 border rounded-sm text-[9px] font-black uppercase bg-zinc-900 border-red-900/50 text-red-400 hover:border-red-500 disabled:opacity-50"
                            >
                            Eliminar
                            </button>
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
    </div>
  );
}