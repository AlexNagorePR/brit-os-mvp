export default function LoginScreen() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300 flex items-center justify-center">
      <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-sm p-6 shadow-xl">
        <div className="text-[10px] text-orange-500 font-black tracking-[0.2em] uppercase">
          Control Industrial
        </div>
        <div className="mt-2 text-2xl font-black text-white uppercase leading-none">
          BRIT<span className="text-orange-500">_OS</span>
        </div>

        <div className="mt-4 text-[12px] text-zinc-400">
          Necesitas iniciar sesión para acceder al dashboard.
        </div>

        <button
          onClick={() => (window.location.href = "/auth/login")}
          className="mt-6 w-full py-3 bg-orange-500 text-zinc-950 rounded-sm font-black text-[10px] uppercase border-b-4 border-orange-700 active:border-b-0 active:translate-y-1 transition-all"
        >
          Iniciar sesión
        </button>
      </div>
    </div>
  );
}