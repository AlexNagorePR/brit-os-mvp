import React, { useEffect, useRef, useState } from 'react';
import { PRESET_COLORS } from '../data/ui';

export default function ColorPickerDropdown({ activeColor, onSelect }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-4 h-4 rounded-full border border-zinc-600 transition-transform hover:scale-110 active:scale-95 shadow-sm"
        style={{ backgroundColor: activeColor }}
      />
      {isOpen && (
        <div className="absolute top-0 right-6 z-[130] bg-zinc-900 border border-zinc-700 p-2 shadow-2xl rounded-md grid grid-cols-4 gap-1.5 min-w-[100px] animate-in fade-in slide-in-from-right-2">
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              onClick={() => { onSelect(color); setIsOpen(false); }}
              className={`w-4 h-4 rounded-full border transition-all hover:scale-125 ${activeColor === color ? 'border-white scale-110 shadow-lg' : 'border-zinc-800'}`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      )}
    </div>
  );
}