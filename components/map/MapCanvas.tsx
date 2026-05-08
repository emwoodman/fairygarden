"use client";

import { useEffect } from "react";
import type { MapElement, ToolId } from "./mapTypes";
import { getHandles, HANDLE_PX, SWATCHES, RECT_DRAW_TOOLS, darkenHex, LOT_W, LOT_H } from "./mapUtils";

interface Props {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  scale: number;
  offset: { x: number; y: number };
  elements: MapElement[];
  selectedId: string | null;
  drawStart: { x: number; y: number } | null;
  drawCurrent: { x: number; y: number } | null;
  activeTool: ToolId;
  gridFtSize: number;
  canvasSize: { w: number; h: number };
  fitScale: number;
  cursor: string;
  onWheel: (e: React.WheelEvent<HTMLCanvasElement>) => void;
  onMouseDown: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  onMouseMove: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  onMouseUp: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  onMouseLeave: () => void;
  onDoubleClick: (e: React.MouseEvent<HTMLCanvasElement>) => void;
}

export function MapCanvas({
  canvasRef, scale, offset, elements, selectedId,
  drawStart, drawCurrent, activeTool, gridFtSize, canvasSize, fitScale,
  cursor, onWheel, onMouseDown, onMouseMove, onMouseUp, onMouseLeave, onDoubleClick,
}: Props) {

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = canvas.width, H = canvas.height;
    if (W === 0 || H === 0) return;

    ctx.fillStyle = "#faf9f5";
    ctx.fillRect(0, 0, W, H);
    ctx.save();
    ctx.translate(offset.x, offset.y);
    ctx.scale(scale, scale);

    // Grid
    if (gridFtSize > 0) {
      ctx.strokeStyle = "#e1dccb";
      ctx.lineWidth   = 0.5 / scale;
      for (let gx = 0; gx <= LOT_W; gx += gridFtSize) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, LOT_H); ctx.stroke(); }
      for (let gy = 0; gy <= LOT_H; gy += gridFtSize) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(LOT_W, gy); ctx.stroke(); }
    }

    // Grid labels when zoomed in
    if (scale >= fitScale * 2 && gridFtSize > 0) {
      ctx.fillStyle    = "#6b6456";
      ctx.font         = `${9 / scale}px system-ui`;
      ctx.textBaseline = "top";
      ctx.textAlign    = "center";
      for (let gx = gridFtSize; gx < LOT_W; gx += gridFtSize)
        ctx.fillText(`${gx}`, gx, 1 / scale);
      ctx.textAlign    = "right";
      ctx.textBaseline = "middle";
      for (let gy = gridFtSize; gy < LOT_H; gy += gridFtSize)
        ctx.fillText(`${LOT_H - gy}ft`, -1.5 / scale, gy);
    }

    // Lot border
    ctx.strokeStyle = "#bcbb9c";
    ctx.lineWidth   = 2 / scale;
    ctx.strokeRect(0, 0, LOT_W, LOT_H);

    const zones     = elements.filter(el => el.type === "zone");
    const buildings = elements.filter(el => el.type === "building");
    const plants    = elements.filter(el => el.type === "plant");
    const texts     = elements.filter(el => el.type === "text");

    for (const el of zones) {
      ctx.save();
      ctx.globalAlpha = 0.35;
      ctx.fillStyle   = el.fill;
      ctx.fillRect(el.x, el.y, el.w, el.h);
      ctx.globalAlpha = 1;
      ctx.strokeStyle = el.stroke;
      ctx.lineWidth   = 1 / scale;
      ctx.setLineDash([3 / scale, 3 / scale]);
      ctx.strokeRect(el.x, el.y, el.w, el.h);
      ctx.setLineDash([]);
      if (scale > 3) {
        ctx.fillStyle = el.stroke; ctx.font = `${10 / scale}px system-ui`;
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(el.name, el.x + el.w / 2, el.y + el.h / 2);
      }
      ctx.restore();
    }

    for (const el of buildings) {
      ctx.fillStyle = el.fill; ctx.fillRect(el.x, el.y, el.w, el.h);
      ctx.strokeStyle = el.stroke; ctx.lineWidth = 1.5 / scale;
      ctx.strokeRect(el.x, el.y, el.w, el.h);
      const mx = el.x + el.w / 2, my = el.y + el.h / 2;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      if (scale > 4) {
        ctx.fillStyle = "#443e34"; ctx.font = `600 ${11 / scale}px system-ui`;
        ctx.fillText(el.name, mx, my - 5 / scale);
        ctx.fillStyle = "rgba(68,62,52,0.6)"; ctx.font = `${9 / scale}px system-ui`;
        ctx.fillText(`${Math.round(el.w)} × ${Math.round(el.h)} ft`, mx, my + 6 / scale);
      } else {
        ctx.fillStyle = "#443e34"; ctx.font = `${11 / scale}px system-ui`;
        ctx.fillText(el.name.split(" ")[0], mx, my);
      }
    }

    for (const el of plants) {
      ctx.fillStyle = el.fill; ctx.strokeStyle = el.stroke; ctx.lineWidth = 1 / scale;
      ctx.beginPath(); ctx.arc(el.x, el.y, Math.max(2 / scale, 0.5), 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
      if (scale > 5) {
        ctx.fillStyle = "#443e34"; ctx.font = `${6 / scale}px system-ui`;
        ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
        ctx.fillText(el.name, el.x, el.y - 3 / scale);
      }
    }

    for (const el of texts) {
      ctx.fillStyle = "#443e34"; ctx.font = `${12 / scale}px system-ui`;
      ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
      ctx.fillText(el.text || el.name, el.x, el.y);
    }

    // Selection ring + resize handles
    if (selectedId) {
      const el = elements.find(e => e.id === selectedId);
      if (el) {
        ctx.save();
        ctx.strokeStyle = "#746a25"; ctx.lineWidth = 2 / scale;
        ctx.setLineDash([4 / scale, 3 / scale]);
        if (el.type === "plant") {
          ctx.beginPath(); ctx.arc(el.x, el.y, 4.5 / scale, 0, Math.PI * 2); ctx.stroke();
        } else if (el.type === "text") {
          ctx.strokeRect(el.x - 2/scale, el.y - 14/scale, 26/scale, 16/scale);
        } else {
          ctx.strokeRect(el.x - 2/scale, el.y - 2/scale, el.w + 4/scale, el.h + 4/scale);
        }
        ctx.setLineDash([]);
        // Draw 8 resize handles for rect elements
        const hw = HANDLE_PX / scale;
        for (const h of getHandles(el)) {
          ctx.fillStyle = "#faf9f5";
          ctx.fillRect(h.fx - hw/2, h.fy - hw/2, hw, hw);
          ctx.lineWidth = 1.5 / scale;
          ctx.strokeRect(h.fx - hw/2, h.fy - hw/2, hw, hw);
        }
        ctx.restore();
      }
    }

    // Draw preview
    if (drawStart && drawCurrent) {
      const x = Math.min(drawStart.x, drawCurrent.x);
      const y = Math.min(drawStart.y, drawCurrent.y);
      const w = Math.abs(drawCurrent.x - drawStart.x);
      const h = Math.abs(drawCurrent.y - drawStart.y);
      ctx.save();
      const isZone = activeTool === "zone" || activeTool === "custom";
      ctx.globalAlpha = isZone ? 0.25 : 0.55;
      ctx.fillStyle   = SWATCHES[2];
      ctx.fillRect(x, y, w, h);
      ctx.globalAlpha = 1;
      ctx.strokeStyle = darkenHex(SWATCHES[2]);
      ctx.lineWidth   = 1.5 / scale;
      if (isZone) ctx.setLineDash([3 / scale, 3 / scale]);
      ctx.strokeRect(x, y, w, h);
      ctx.setLineDash([]);
      ctx.restore();
    }

    ctx.restore();
  }, [scale, offset, elements, selectedId, drawStart, drawCurrent, activeTool, canvasSize, gridFtSize, fitScale, canvasRef]);

  return (
    <canvas
      ref={canvasRef}
      style={{ display: "block", cursor, touchAction: "none", userSelect: "none" }}
      onWheel={onWheel}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
      onDoubleClick={onDoubleClick}
      onContextMenu={e => e.preventDefault()}
    />
  );
}
