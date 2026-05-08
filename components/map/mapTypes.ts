export type ToolId = "select" | "building" | "zone" | "plant" | "text" | "custom";
export type HandleId = "TL" | "T" | "TR" | "R" | "BR" | "B" | "BL" | "L";

export interface MapElement {
  id: string;
  type: "building" | "zone" | "plant" | "text";
  name: string;
  x: number; y: number; w: number; h: number;
  fill: string; stroke: string;
  text?: string;
}

export interface PendingDraw {
  drawType: "building" | "zone" | "plant" | "custom";
  x: number; y: number; w: number; h: number;
  promptCx: number; promptCy: number;
}

export interface ResizeDragState {
  handle: HandleId;
  startEl: MapElement;
  startMx: number;
  startMy: number;
}

export interface TextInputState {
  cx: number; cy: number; fx: number; fy: number; value: string;
}

export interface RenameState {
  id: string; name: string; cx: number; cy: number;
}

export interface DimSpec {
  widthStr: string;
  depthStr: string;
  preferMetric: boolean;
}
