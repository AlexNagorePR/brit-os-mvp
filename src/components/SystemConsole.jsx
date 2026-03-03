import HUDPanel from './HUDPanel';
import { Terminal, AlertTriangle, Info } from 'lucide-react';
import { useEffect, useRef } from 'react';

export default function SystemConsole({ logs, isOpen, onToggle }) {
  const terminalRef = useRef(null);

  useEffect(() => {
    if (terminalRef.current) terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
  }, [logs]);

  return (
    <HUDPanel
      title="Consola de Sistema BRIT_OS"
      className={`transition-all duration-300 ${isOpen ? 'h-40' : 'h-8'}`}
      collapsible={true}
      isOpen={isOpen}
      onToggle={onToggle}
      extraHeader={
        <div className="flex items-center gap-2">
          <Terminal size={10} className="text-orange-500" />
          <span className="text-[7px] text-zinc-500 font-mono">RT_KERNEL: ACTIVE</span>
        </div>
      }
    >
      <div ref={terminalRef} className="font-mono text-[9px] h-full overflow-y-auto custom-scrollbar flex flex-col gap-0.5">
        {logs.map((log) => (
          <div key={log.id} className="flex items-start gap-2 border-l border-zinc-800 pl-2 py-0.5 hover:bg-zinc-800/30 transition-colors">
            <span className="text-zinc-600 shrink-0">[{log.time}]</span>
            <span className={`shrink-0 w-10 font-black ${log.type === 'warn' ? 'text-amber-500' : log.type === 'error' ? 'text-red-500' : log.type === 'success' ? 'text-emerald-500' : 'text-blue-500'}`}>
              {log.source}
            </span>
            <span className={`flex-1 ${log.type === 'warn' ? 'text-zinc-300 italic' : 'text-zinc-400'}`}>
              {log.msg}
            </span>
            {log.type === 'warn' && <AlertTriangle size={8} className="text-amber-500 mt-0.5" />}
            {log.type === 'info' && <Info size={8} className="text-blue-500 mt-0.5" />}
          </div>
        ))}
        <div className="flex items-center gap-2 text-orange-500 animate-pulse mt-1">
          <span className="text-[10px]">_</span>
        </div>
      </div>
    </HUDPanel>
  );
}