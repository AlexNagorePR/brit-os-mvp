import { PlusCircle, Trash2, Eye, EyeOff } from "lucide-react";
import HUDPanel from "./HUDPanel";
import ColorPickerDropdown from "./ColorPickerDropdown";

export default function LeftPanelPrep({
  // panels open/close
  isCalibOpen,
  setIsCalibOpen,
  isLayersOpen,
  setIsLayersOpen,

  // data
  calibrationPoints,
  layers,

  // actions
  addCalibrationPoint,
  removeCalibrationPoint,
  toggleLayerStyle,
  setLayers,
  updateLayerColor,
}) {
  return (
    <>
      <HUDPanel
        title="Puntos de Calibración"
        collapsible={true}
        isOpen={isCalibOpen}
        onToggle={() => setIsCalibOpen(!isCalibOpen)}
        extraHeader={
          <button
            onClick={addCalibrationPoint}
            className="text-orange-500 hover:text-orange-400 transition-colors"
          >
            <PlusCircle size={14} />
          </button>
        }
      >
        <div className="space-y-1.5">
          {calibrationPoints.map((p, idx) => (
            <div key={p.id} className="flex items-center gap-1 group">
              <span className="text-[7px] font-bold text-zinc-600 w-4">
                #{idx + 1}
              </span>
              <div className="flex-1 bg-zinc-950 border border-zinc-800 px-1.5 py-1 text-orange-500 font-mono text-[9px]">
                {p.x}
              </div>
              <div className="flex-1 bg-zinc-950 border border-zinc-800 px-1.5 py-1 text-orange-500 font-mono text-[9px]">
                {p.y}
              </div>
              <button
                onClick={() => removeCalibrationPoint(p.id)}
                className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-500/10 rounded"
              >
                <Trash2 size={10} />
              </button>
            </div>
          ))}
        </div>
      </HUDPanel>

      <HUDPanel
        title="Capas de Diseño"
        collapsible={true}
        isOpen={isLayersOpen}
        onToggle={() => setIsLayersOpen(!isLayersOpen)}
        className="flex-1"
      >
        <div className="space-y-1">
          {layers.map((l) => (
            <div
              key={l.id}
              className="flex items-center gap-2 p-1.5 bg-zinc-900/50 border border-transparent hover:border-zinc-700 rounded-sm"
            >
              <button
                onClick={() =>
                  setLayers(
                    layers.map((ly) =>
                      ly.id === l.id ? { ...ly, visible: !ly.visible } : ly
                    )
                  )
                }
                className="shrink-0"
              >
                {l.visible ? (
                  <Eye size={12} className="text-orange-500" />
                ) : (
                  <EyeOff size={12} className="text-zinc-600" />
                )}
              </button>

              <span className="text-[9px] font-bold text-zinc-300 flex-1 uppercase truncate tracking-tighter">
                {l.name}
              </span>

              <button
                onClick={() => toggleLayerStyle(l.id)}
                className="text-zinc-500 hover:text-white px-1 border border-zinc-700 rounded bg-zinc-950 text-[7px] font-mono uppercase"
              >
                {l.style}
              </button>

              <ColorPickerDropdown
                activeColor={l.color}
                onSelect={(newColor) => updateLayerColor(l.id, newColor)}
              />
            </div>
          ))}
        </div>
      </HUDPanel>
    </>
  );
}