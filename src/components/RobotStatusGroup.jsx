import { Battery, Wifi, Thermometer, Cpu } from 'lucide-react';

export default function RobotStatusGroup({ robot, compact = false }) {
  const iconSize = compact ? 10 : 12;
  const textSize = compact ? 'text-[8px]' : 'text-[9px]';
  const displaySignal = Math.min(99, Math.round(robot.signal));

  return (
    <div className={`flex items-center ${compact ? 'gap-2' : 'gap-3'} text-zinc-400`}>
      <div className="flex items-center gap-1" title="Batería">
        <Battery size={iconSize} className={robot.battery < 20 ? 'text-red-500 animate-pulse' : 'text-emerald-500'} />
        <span className={`font-mono font-bold ${textSize} ${robot.battery < 20 ? 'text-red-500' : 'text-zinc-300'}`}>
          {Math.round(robot.battery)}%
        </span>
      </div>
      <div className="flex items-center gap-1" title="Señal">
        <Wifi size={iconSize} className={robot.signal < 40 ? 'text-amber-500' : 'text-blue-500'} />
        <span className={`font-mono font-bold ${textSize} text-zinc-300`}>{displaySignal}</span>
      </div>
      <div className="flex items-center gap-1" title="Temperatura">
        <Thermometer size={iconSize} className={robot.temp > 45 ? 'text-orange-600' : 'text-amber-500'} />
        <span className={`font-mono font-bold ${textSize} ${robot.temp > 45 ? 'text-orange-500' : 'text-zinc-300'}`}>
          {Math.round(robot.temp)}°
        </span>
      </div>
      <div className="flex items-center gap-1" title="CPU">
        <Cpu size={iconSize} className={robot.hardware.includes('ERR') ? 'text-red-500' : 'text-purple-500'} />
        <span className={`font-mono font-bold ${textSize} text-zinc-300 uppercase`}>{robot.hardware}</span>
      </div>
    </div>
  );
}