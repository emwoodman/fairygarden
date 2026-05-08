"use client";

import { COMPASS_ROTATION } from "./mapUtils";

function CompassRose({ rotation }: { rotation: number }) {
  return (
    <div style={{ width: 48, height: 56, transform: `rotate(${rotation}deg)`, transformOrigin: "24px 29px" }}>
      <svg width="48" height="56" viewBox="0 0 48 56" fill="none">
        <text x="24" y="7" textAnchor="middle" fontSize="9" fontWeight="700"
          fill="#443e34" style={{ fontFamily: "system-ui" }}>N</text>
        <path d="M24,10 L19,29 L24,26 L29,29 Z" fill="#746a25" />
        <path d="M24,54 L19,35 L24,38 L29,35 Z" fill="#e1dccb" />
        <path d="M46,29 L34,26 L34,32 Z" fill="#6b6456" opacity="0.65" />
        <path d="M2,29 L14,26 L14,32 Z" fill="#6b6456" opacity="0.65" />
        <circle cx="24" cy="29" r="2.5" fill="#bcbb9c" />
        <circle cx="24" cy="29" r="1.2" fill="#6b6456" />
      </svg>
    </div>
  );
}

interface Props {
  scale: number;
  fitScale: number;
  compassRot: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  showOrientBanner: boolean;
  onOrientClick: () => void;
}

export function MapControls({
  scale, fitScale, compassRot,
  onZoomIn, onZoomOut, onReset,
}: Props) {
  const zoomPct = Math.round((scale / (fitScale || 1)) * 100);

  return (
    <>
      {/* Compass rose */}
      <div className="absolute bottom-20 left-4 pointer-events-none select-none z-10">
        <CompassRose rotation={compassRot} />
      </div>

      {/* Zoom controls */}
      <div className="absolute bottom-4 right-4 flex flex-col items-center gap-1 z-10">
        <button
          onClick={onZoomIn}
          title="Zoom in"
          className="w-8 h-8 flex items-center justify-center rounded border border-linen bg-paper text-muted text-base hover:bg-linen transition-colors"
        >+</button>
        <span className="text-[10px] text-muted w-8 text-center tabular-nums">{zoomPct}%</span>
        <button
          onClick={onZoomOut}
          title="Zoom out"
          className="w-8 h-8 flex items-center justify-center rounded border border-linen bg-paper text-muted text-base hover:bg-linen transition-colors"
        >−</button>
        <button
          onClick={onReset}
          title="Fit to screen"
          className="w-8 h-8 flex items-center justify-center rounded border border-linen bg-paper text-muted text-base hover:bg-linen transition-colors mt-1"
        >⌂</button>
      </div>
    </>
  );
}

export { COMPASS_ROTATION };
