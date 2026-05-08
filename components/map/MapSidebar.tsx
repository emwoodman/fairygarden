"use client";

import { useState } from "react";
import type { MapElement } from "./mapTypes";

interface Props {
  elements: MapElement[];
  selectedId: string | null;
  open: boolean;
  onToggle: () => void;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const GROUP_ORDER = ["building", "zone", "plant", "text"] as const;
const GROUP_LABEL: Record<string, string> = {
  building: "Buildings",
  zone:     "Yards",
  plant:    "Plants",
  text:     "Text",
};

export function MapSidebar({
  elements, selectedId, open, onToggle, onSelect, onDelete,
  onUndo, onRedo, onClear, canUndo, canRedo,
}: Props) {
  const [clearConfirm, setClearConfirm] = useState(false);

  const grouped = GROUP_ORDER.map(type => ({
    type,
    items: elements.filter(el => el.type === type),
  })).filter(g => g.items.length > 0);

  return (
    <div
      className="flex-shrink-0 flex flex-col border-l border-linen bg-paper transition-all overflow-hidden"
      style={{ width: open ? 200 : 32 }}
    >
      {/* Toggle button */}
      <button
        onClick={onToggle}
        title={open ? "Collapse layers" : "Expand layers"}
        className="flex-shrink-0 flex items-center justify-center py-2 border-b border-linen text-xs text-muted hover:text-ink transition-colors"
        style={{ minHeight: 36 }}
      >
        {open ? "›" : "‹"}
      </button>

      {open && (
        <>
          {/* Layer list */}
          <div className="flex-1 overflow-y-auto py-1">
            {grouped.length === 0 && (
              <p className="px-3 py-4 text-xs text-muted text-center">No elements yet</p>
            )}
            {grouped.map(({ type, items }) => (
              <div key={type} className="mb-1">
                <div className="px-3 py-1 text-[10px] font-semibold text-muted uppercase tracking-wide flex items-center justify-between">
                  <span>{GROUP_LABEL[type]}</span>
                  <span className="text-lichen">{items.length}</span>
                </div>
                {items.map(el => (
                  <div
                    key={el.id}
                    className={`flex items-center gap-2 px-3 py-1.5 cursor-pointer transition-colors ${
                      selectedId === el.id ? "bg-grass/30" : "hover:bg-parchment"
                    }`}
                    onClick={() => onSelect(el.id)}
                  >
                    <span
                      className="flex-shrink-0 w-3.5 h-3.5 rounded-sm border"
                      style={{ background: el.fill, borderColor: el.stroke }}
                    />
                    <span className="flex-1 text-xs text-ink truncate">{el.name}</span>
                    <button
                      onClick={e => { e.stopPropagation(); onDelete(el.id); }}
                      className="flex-shrink-0 text-xs text-muted hover:text-rose transition-colors"
                      title="Remove"
                    >×</button>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Bottom controls */}
          <div className="flex-shrink-0 border-t border-linen p-2 space-y-1">
            <div className="flex gap-1">
              <button
                onClick={onUndo}
                disabled={!canUndo}
                className="flex-1 py-1.5 text-xs rounded border border-linen text-muted hover:bg-linen disabled:opacity-40 transition-colors"
              >↩ Undo</button>
              <button
                onClick={onRedo}
                disabled={!canRedo}
                className="flex-1 py-1.5 text-xs rounded border border-linen text-muted hover:bg-linen disabled:opacity-40 transition-colors"
              >↪ Redo</button>
            </div>

            {!clearConfirm ? (
              <button
                onClick={() => setClearConfirm(true)}
                className="w-full py-1.5 text-xs rounded border border-linen text-muted hover:bg-linen transition-colors"
              >✕ Clear all</button>
            ) : (
              <div className="space-y-1 bg-parchment rounded border border-linen p-2">
                <p className="text-[10px] text-ink leading-snug">Remove everything? This cannot be undone.</p>
                <div className="flex gap-1">
                  <button
                    onClick={() => setClearConfirm(false)}
                    className="flex-1 py-1 text-xs rounded border border-linen text-muted hover:bg-linen transition-colors"
                  >Cancel</button>
                  <button
                    onClick={() => { onClear(); setClearConfirm(false); }}
                    className="flex-1 py-1 text-xs rounded text-parchment hover:opacity-90 transition-opacity"
                    style={{ background: "#746a25" }}
                  >Clear</button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
