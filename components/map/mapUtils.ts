import type { MapElement, HandleId, ToolId } from "./mapTypes";

export const LOT_W    = 67;
export const LOT_H    = 283;
export const PAD      = 36;
export const HANDLE_PX = 8;

export const SWATCHES = ["#f5f0e7","#e1dccb","#d8cc9a","#f0dcc0","#cbb4a3","#cba5a3","#746a25","#6c663d"];
export const COMPASS_ROTATION: Record<string, number> = { South: 0, North: 180, East: -90, West: 90 };
export const RECT_DRAW_TOOLS = new Set<ToolId>(["building", "zone", "custom"]);
export const IMPERIAL_GRID   = [0, 5, 10, 25];
export const METRIC_GRID     = [0, 2, 5, 10];

export const TOOL_LIST = [
  { id: "select",   label: "Select",   icon: "↖" },
  { id: "building", label: "Building", icon: "⬜" },
  { id: "zone",     label: "Yard",     icon: "▭" },
  { id: "plant",    label: "Plant",    icon: "●" },
  { id: "text",     label: "Text",     icon: "T" },
  { id: "custom",   label: "Custom",   icon: "✦" },
];

export function darkenHex(hex: string, amount = 0.22): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const d = (v: number) => Math.max(0, Math.round(v * (1 - amount))).toString(16).padStart(2, "0");
  return `#${d(r)}${d(g)}${d(b)}`;
}

const mk = (
  id: string, type: MapElement["type"], name: string,
  x: number, y: number, w: number, h: number, fill: string
): MapElement => ({ id, type, name, x, y, w, h, fill, stroke: darkenHex(fill) });

export const INITIAL_ELEMENTS: MapElement[] = [
  mk("house",    "building", "House",          29,  13, 32, 70, "#e1dccb"),
  mk("carriage", "building", "Carriage House",  4, 114, 20, 35, "#d8cc9a"),
  mk("shed",     "building", "Shed",            8, 159, 12, 12, "#d8cc9a"),
  mk("barn",     "building", "Barn",            5, 194, 43, 28, "#cbb4a3"),
  mk("z-front",  "zone",     "Front yard",      0, 228, 67, 55, "#d8cc9a"),
  mk("z-back",   "zone",     "Back yard",       0,   0, 67, 13, "#cbb4a3"),
  mk("z-side-w", "zone",     "Side yard",       0,  13, 29, 70, "#cba5a3"),
  mk("z-side-e", "zone",     "Side yard",      61,  13,  6, 70, "#cba5a3"),
];

export function hitTest(el: MapElement, fx: number, fy: number): boolean {
  if (el.type === "plant") return Math.hypot(fx - el.x, fy - el.y) < 3;
  if (el.type === "text")  return fx >= el.x && fx <= el.x + 22 && fy >= el.y - 4 && fy <= el.y + 2;
  return fx >= el.x && fx <= el.x + el.w && fy >= el.y && fy <= el.y + el.h;
}

export interface HandlePos { id: HandleId; fx: number; fy: number; }

export function getHandles(el: MapElement): HandlePos[] {
  if (el.type === "plant" || el.type === "text") return [];
  const { x, y, w, h } = el;
  return [
    { id: "TL", fx: x,       fy: y       }, { id: "T",  fx: x + w/2, fy: y       },
    { id: "TR", fx: x + w,   fy: y       }, { id: "R",  fx: x + w,   fy: y + h/2 },
    { id: "BR", fx: x + w,   fy: y + h   }, { id: "B",  fx: x + w/2, fy: y + h   },
    { id: "BL", fx: x,       fy: y + h   }, { id: "L",  fx: x,       fy: y + h/2 },
  ];
}

export function hitTestHandle(
  el: MapElement, cx: number, cy: number,
  scale: number, off: { x: number; y: number }
): HandleId | null {
  const HALF = HANDLE_PX / 2 + 2;
  for (const h of getHandles(el)) {
    const sx = off.x + h.fx * scale;
    const sy = off.y + h.fy * scale;
    if (Math.abs(cx - sx) <= HALF && Math.abs(cy - sy) <= HALF) return h.id;
  }
  return null;
}

export function applyResize(el: MapElement, handle: HandleId, dxFt: number, dyFt: number): Partial<MapElement> {
  const MIN = 4;
  const { x, y, w, h } = el;
  const right = x + w, bottom = y + h;
  if (handle === "TL") { const nx = Math.min(x + dxFt, right - MIN), ny = Math.min(y + dyFt, bottom - MIN); return { x: nx, y: ny, w: right - nx, h: bottom - ny }; }
  if (handle === "TR") { const ny = Math.min(y + dyFt, bottom - MIN); return { y: ny, w: Math.max(MIN, w + dxFt), h: bottom - ny }; }
  if (handle === "BL") { const nx = Math.min(x + dxFt, right - MIN); return { x: nx, w: right - nx, h: Math.max(MIN, h + dyFt) }; }
  if (handle === "BR") return { w: Math.max(MIN, w + dxFt), h: Math.max(MIN, h + dyFt) };
  if (handle === "T")  { const ny = Math.min(y + dyFt, bottom - MIN); return { y: ny, h: bottom - ny }; }
  if (handle === "B")  return { h: Math.max(MIN, h + dyFt) };
  if (handle === "L")  { const nx = Math.min(x + dxFt, right - MIN); return { x: nx, w: right - nx }; }
  return { w: Math.max(MIN, w + dxFt) }; // R
}

export function handleCursor(h: HandleId): string {
  if (h === "TL" || h === "BR") return "nwse-resize";
  if (h === "TR" || h === "BL") return "nesw-resize";
  if (h === "T"  || h === "B")  return "ns-resize";
  return "ew-resize";
}

export function gridLabel(val: number, metric: boolean): string {
  return val === 0 ? "No grid" : metric ? `${val}m` : `${val}ft`;
}

export function gridFt(val: number, metric: boolean): number {
  return val === 0 ? 0 : metric ? val * 3.28084 : val;
}
