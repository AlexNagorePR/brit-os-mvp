export default function RobotMap({ mode, controlType, layers, fleetData, selectedRobotId }) {
  return (
    <main className={`flex-1 relative rounded-sm border-2 transition-all duration-700 overflow-hidden flex items-center justify-center ${mode === 'prep' ? 'bg-zinc-900 border-zinc-800' : 'bg-black border-orange-900/30 shadow-inner'}`}>
      {controlType === 'MANUAL' && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-orange-500/90 text-zinc-950 px-4 py-1.5 rounded-full border border-orange-600 shadow-lg animate-pulse">
          <span className="text-[10px] font-black uppercase tracking-widest text-shadow">Control Manual Activo</span>
        </div>
      )}

      <div
        className={`absolute inset-0 pointer-events-none transition-opacity duration-700 ${mode === 'prep' ? 'opacity-[0.03]' : 'opacity-[0.05]'}`}
        style={{
          backgroundImage: `linear-gradient(${mode === 'prep' ? '#fff' : '#f97316'} 1px, transparent 1px), linear-gradient(90deg, ${mode === 'prep' ? '#fff' : '#f97316'} 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      <svg className="w-[95%] h-[95%]" viewBox="0 0 1000 800" preserveAspectRatio="xMidYMid meet">
        {layers.map((l) => l.visible && (
          <g key={l.id}>
            {mode === 'track' && (
              <path d={l.d} stroke="#18181b" strokeWidth="6" fill="none" strokeLinecap="round" />
            )}
            <path
              d={l.d}
              stroke={mode === 'prep' ? l.color : (l.status === 'done' ? '#10b981' : l.status === 'printing' ? '#f59e0b' : '#27272a')}
              strokeWidth={mode === 'prep' ? "3" : "4"}
              fill="none"
              strokeDasharray={mode === 'prep' ? (l.style === 'dashed' ? '12,8' : l.style === 'dotted' ? '2,6' : 'none') : 'none'}
              className={l.status === 'printing' && mode === 'track' ? 'animate-printing-flow' : ''}
              strokeLinecap="round"
              opacity={mode === 'track' && l.status === 'pending' ? '0.3' : '1'}
            />
            {mode === 'track' && l.status === 'printing' && (
              <path d={l.d} stroke="#f59e0b" strokeWidth="10" fill="none" opacity="0.1" className="animate-pulse" />
            )}
          </g>
        ))}

        {fleetData.map(robot => robot.status !== 'offline' && (
          <g key={robot.id} transform={`translate(${robot.pos.x}, ${robot.pos.y}) rotate(${robot.heading || 0})`}>
            {mode === 'track' ? (
              <g>
                <path d="M 0 0 L 40 -15 L 40 15 Z" fill="rgba(249,115,22,0.1)" />
                <rect x="-15" y="-12" width="30" height="24" rx="2" fill="#000" stroke="#f97316" strokeWidth="2" />
                <rect x="8" y="-4" width="4" height="8" rx="1" fill="#f97316" />
                <circle cx="12" cy="-8" r="1.5" fill="white" opacity="0.8" />
                <circle cx="12" cy="8" r="1.5" fill="white" opacity="0.8" />
              </g>
            ) : (
              <g>
                <circle r="8" fill="#18181b" stroke={robot.id === selectedRobotId ? "#f97316" : "#52525b"} strokeWidth="2" />
                <text y="-15" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold" transform={`rotate(${-robot.heading || 0})`} className="uppercase drop-shadow-md">
                  {robot.name}
                </text>
              </g>
            )}
          </g>
        ))}
      </svg>
    </main>
  );
}