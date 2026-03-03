export default function HUDButton({ children, onClick, active, variant = "default", className = "" }) {
  const base =
    "relative px-2 py-1.5 transition-all duration-200 uppercase font-black text-[9px] tracking-wider flex items-center justify-center gap-2 border rounded-sm disabled:opacity-50 disabled:cursor-not-allowed";

  const styles = {
    default: active
      ? "bg-orange-500 text-zinc-950 border-orange-600"
      : "bg-zinc-800 border-zinc-600 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200",
    action: "bg-orange-600 border-orange-500 text-white hover:bg-orange-500 shadow-md",
    danger: "bg-zinc-900 border-red-900/50 text-red-500 hover:bg-red-900/20 hover:border-red-500/50",
    warning: "bg-zinc-900 border-amber-600/50 text-amber-500 hover:bg-amber-900/20 hover:border-amber-500",
    success: "bg-zinc-900 border-emerald-600/50 text-emerald-500 hover:bg-emerald-900/20"
  };

  return (
    <button onClick={onClick} className={`${base} ${styles[variant]} ${className}`}>
      {children}
    </button>
  );
}