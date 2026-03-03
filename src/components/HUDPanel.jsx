import { Minus, ChevronDown } from 'lucide-react';

export default function HUDPanel({
  children,
  title,
  className = "",
  extraHeader = null,
  collapsible = false,
  isOpen = true,
  onToggle = () => {}
}) {
  return (
    <div className={`bg-zinc-900 rounded-sm border border-zinc-700 flex flex-col shadow-sm ${className}`}>
      {(title || extraHeader) && (
        <div className="px-3 py-1.5 bg-zinc-800 border-b border-zinc-700 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[8px] font-bold uppercase tracking-[0.1em] text-slate-500">{title}</span>
          </div>
          <div className="flex items-center gap-1.5">
            {extraHeader}
            {collapsible && (
              <button onClick={onToggle} className="text-slate-500 hover:text-amber-400 p-0.5 transition-colors">
                {isOpen ? <Minus size={10} /> : <ChevronDown size={10} />}
              </button>
            )}
          </div>
        </div>
      )}
      {isOpen && <div className="p-2 overflow-y-auto custom-scrollbar flex-1">{children}</div>}
    </div>
  );
}