"use client";

import type { ToolId, DimSpec } from "./mapTypes";
import { TOOL_LIST, IMPERIAL_GRID, METRIC_GRID, gridLabel } from "./mapUtils";

interface Props {
  activeTool: ToolId;
  onTool: (id: string) => void;
  gridSize: number;
  onGridSize: (ft: number) => void;
  preferMetric: boolean;
  dimSpec: DimSpec;
  onDimSpec: (d: DimSpec) => void;
}

export function MapToolbar({ activeTool, onTool, gridSize, onGridSize, preferMetric, dimSpec, onDimSpec }: Props) {
  const showDimPrompt = activeTool === "building" || activeTool === "zone";
  const gridOptions   = preferMetric ? METRIC_GRID : IMPERIAL_GRID;

  return (
    <div className="flex-shrink-0 bg-paper border-b border-linen">
      {/* Tool row */}
      <div className="flex items-center gap-1 px-3 py-2 overflow-x-auto">
        {TOOL_LIST.map(t => {
          const active = activeTool === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onTool(t.id)}
              title={t.label}
              className="flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded border text-xs transition-colors whitespace-nowrap"
              style={{
                background:  active ? "#d8cc9a" : "#f5f0e7",
                borderColor: "#e1dccb",
                color:       active ? "#746a25" : "#6b6456",
              }}
            >
              <span className="text-sm leading-none">{t.icon}</span>
              <span>{t.label}</span>
            </button>
          );
        })}

        {/* Grid dropdown — right side */}
        <div className="ml-auto flex-shrink-0 flex items-center gap-1.5">
          <label className="text-xs text-muted whitespace-nowrap">Grid</label>
          <select
            value={gridSize}
            onChange={e => onGridSize(Number(e.target.value))}
            className="text-xs border border-linen rounded px-1.5 py-1 bg-parchment text-ink focus:outline-none focus:ring-1 focus:ring-olive"
          >
            {gridOptions.map(v => (
              <option key={v} value={v}>{gridLabel(v, preferMetric)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Dimension prompt — shown when Building or Yard tool active */}
      {showDimPrompt && (
        <div className="flex items-center gap-3 px-3 py-2 border-t border-linen bg-parchment/60 text-xs text-muted">
          <span className="flex-shrink-0">Know your dimensions?</span>
          <div className="flex items-center gap-1.5">
            <label className="text-xs text-muted">W</label>
            <input
              type="number"
              min="1"
              value={dimSpec.widthStr}
              onChange={e => onDimSpec({ ...dimSpec, widthStr: e.target.value })}
              placeholder="ft"
              className="w-14 text-xs border border-linen rounded px-1.5 py-0.5 bg-paper text-ink placeholder:text-lichen focus:outline-none focus:ring-1 focus:ring-olive"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <label className="text-xs text-muted">D</label>
            <input
              type="number"
              min="1"
              value={dimSpec.depthStr}
              onChange={e => onDimSpec({ ...dimSpec, depthStr: e.target.value })}
              placeholder="ft"
              className="w-14 text-xs border border-linen rounded px-1.5 py-0.5 bg-paper text-ink placeholder:text-lichen focus:outline-none focus:ring-1 focus:ring-olive"
            />
          </div>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={dimSpec.preferMetric}
              onChange={e => onDimSpec({ ...dimSpec, preferMetric: e.target.checked })}
              className="rounded border-linen"
            />
            <span>Metres</span>
          </label>
          {(dimSpec.widthStr || dimSpec.depthStr) && (
            <button
              onClick={() => onDimSpec({ widthStr: "", depthStr: "", preferMetric: dimSpec.preferMetric })}
              className="text-xs text-muted hover:text-ink transition-colors"
            >Clear</button>
          )}
          <span className="text-lichen">or just draw to estimate</span>
        </div>
      )}
    </div>
  );
}
