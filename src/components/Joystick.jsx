import { useEffect, useRef, useState } from 'react';

export default function Joystick({ onMove }) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleMove = (e) => {
      if (!isDragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const x = clientX - rect.left - centerX;
      const y = clientY - rect.top - centerY;

      const dist = Math.sqrt(x * x + y * y);
      const maxDist = 35;

      let finalX = x;
      let finalY = y;

      if (dist > maxDist) {
        const angle = Math.atan2(y, x);
        finalX = Math.cos(angle) * maxDist;
        finalY = Math.sin(angle) * maxDist;
      }

      setPos({ x: finalX, y: finalY });
      onMove?.({ x: finalX / maxDist, y: finalY / maxDist });
    };

    const stopDragging = () => {
      setIsDragging(false);
      setPos({ x: 0, y: 0 });
      onMove?.({ x: 0, y: 0 });
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', stopDragging);
      window.addEventListener('touchmove', handleMove);
      window.addEventListener('touchend', stopDragging);
    }
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', stopDragging);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', stopDragging);
    };
  }, [isDragging, onMove]);

  return (
    <div className="relative w-24 h-24 flex items-center justify-center" ref={containerRef}>
      <div className="absolute inset-2 border-2 border-zinc-700 bg-zinc-800/50 rounded-full flex items-center justify-center shadow-inner overflow-hidden">
        <div className="w-full h-[1px] bg-zinc-700/50 absolute"></div>
        <div className="h-full w-[1px] bg-zinc-700/50 absolute"></div>
      </div>
      <div
        className="relative w-10 h-10 bg-zinc-700 border-2 border-orange-500 rounded-full cursor-grab active:cursor-grabbing shadow-[0_4px_10px_rgba(0,0,0,0.5)] flex items-center justify-center transition-transform duration-75 ease-out z-20"
        style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}
        onMouseDown={() => setIsDragging(true)}
        onTouchStart={() => setIsDragging(true)}
      >
        <div className="w-2 h-2 bg-orange-400 rounded-full shadow-[0_0_5px_#fb923c]"></div>
      </div>
    </div>
  );
}