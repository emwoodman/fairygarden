"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import type { ToolId, MapElement, PendingDraw, ResizeDragState, TextInputState, RenameState, DimSpec, HandleId } from "./map/mapTypes";
import {
  LOT_W, LOT_H, PAD, SWATCHES, RECT_DRAW_TOOLS, INITIAL_ELEMENTS, COMPASS_ROTATION,
  hitTest, hitTestHandle, applyResize, handleCursor as getHandleCursor, darkenHex, gridFt,
} from "./map/mapUtils";
import { MapCanvas }   from "./map/MapCanvas";
import { MapToolbar }  from "./map/MapToolbar";
import { MapSidebar }  from "./map/MapSidebar";
import { MapControls } from "./map/MapControls";

export default function PropertyMap() {
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fitRef       = useRef(1);

  // View state
  const [canvasSize,   setCanvasSize]   = useState({ w: 0, h: 0 });
  const [scale,        setScale]        = useState(1);
  const [offset,       setOffset]       = useState({ x: 0, y: 0 });

  // Tool / interaction state
  const [activeTool,   setActiveTool]   = useState<ToolId>("select");
  const [isSpaceDown,  setIsSpaceDown]  = useState(false);
  const [isPanning,    setIsPanning]    = useState(false);
  const [lastPan,      setLastPan]      = useState({ x: 0, y: 0 });

  // Element state
  const [elements,     setElements]     = useState<MapElement[]>(INITIAL_ELEMENTS);
  const [history,      setHistory]      = useState<MapElement[][]>([]);
  const [redoStack,    setRedoStack]    = useState<MapElement[][]>([]);

  // Selection / drag / resize
  const [selectedId,   setSelectedId]   = useState<string | null>(null);
  const [isDragging,   setIsDragging]   = useState(false);
  const [dragElState,  setDragElState]  = useState<{ elX: number; elY: number; mx: number; my: number } | null>(null);
  const [resizeDrag,   setResizeDrag]   = useState<ResizeDragState | null>(null);
  const [hoveredHandle,setHoveredHandle]= useState<HandleId | null>(null);
  const [hoveringSel,  setHoveringSel]  = useState(false);

  // Draw state
  const [drawStart,    setDrawStart]    = useState<{ x: number; y: number } | null>(null);
  const [drawCurrent,  setDrawCurrent]  = useState<{ x: number; y: number } | null>(null);

  // Prompt / text / rename
  const [pending,      setPending]      = useState<PendingDraw | null>(null);
  const [pendingName,  setPendingName]  = useState("");
  const [pendingFill,  setPendingFill]  = useState(SWATCHES[1]);
  const [textInput,    setTextInput]    = useState<TextInputState | null>(null);
  const [renameEl,     setRenameEl]     = useState<RenameState | null>(null);

  // Compass / orientation
  const [compassRot,      setCompassRot]      = useState(0);
  const [showBanner,      setShowBanner]      = useState(false);
  const [showOrientModal, setShowOrientModal] = useState(false);

  // UI
  const [sidebarOpen,  setSidebarOpen]  = useState(true);
  const [gridRaw,      setGridRaw]      = useState(10);
  const [dimSpec,      setDimSpec]      = useState<DimSpec>({ widthStr: "", depthStr: "", preferMetric: false });

  // ── Refs for native event handlers ─────────────────────────────────────────────
  const scaleRef      = useRef(scale);
  const offsetRef     = useRef(offset);
  const activeToolRef = useRef(activeTool);
  const elementsRef   = useRef(elements);
  const selectedIdRef = useRef(selectedId);
  const drawStartRef  = useRef(drawStart);
  const isSpaceRef    = useRef(false);

  useEffect(() => { scaleRef.current      = scale;      }, [scale]);
  useEffect(() => { offsetRef.current     = offset;     }, [offset]);
  useEffect(() => { activeToolRef.current = activeTool; }, [activeTool]);
  useEffect(() => { elementsRef.current   = elements;   }, [elements]);
  useEffect(() => { selectedIdRef.current = selectedId; }, [selectedId]);
  useEffect(() => { drawStartRef.current  = drawStart;  }, [drawStart]);

  const touchRef = useRef<{
    mode:"none"|"pan"|"pinch"|"draw"; lastX:number; lastY:number; pinchDist:number;
    pinchMidX:number; pinchMidY:number; tapX:number; tapY:number; tapTime:number; moved:boolean;
  }>({ mode:"none",lastX:0,lastY:0,pinchDist:0,pinchMidX:0,pinchMidY:0,tapX:0,tapY:0,tapTime:0,moved:false });

  // ── Zoom helpers ───────────────────────────────────────────────────────────────
  const zoomMin = () => fitRef.current * 0.9;
  const zoomMax = () => fitRef.current * 10;

  const applyZoom = useCallback((rawNext: number, cx: number, cy: number) => {
    const clamped = Math.min(zoomMax(), Math.max(zoomMin(), rawNext));
    const prev = offsetRef.current, s = scaleRef.current;
    const newOff = { x: cx - (cx - prev.x) * (clamped / s), y: cy - (cy - prev.y) * (clamped / s) };
    scaleRef.current = clamped; offsetRef.current = newOff;
    setScale(clamped); setOffset(newOff);
  }, []);

  // ── Fit helpers ────────────────────────────────────────────────────────────────
  const computeFit = useCallback((w: number, h: number) => {
    const s = Math.min((w - PAD * 2) / LOT_W, (h - PAD * 2) / LOT_H);
    return { scale: s, offset: { x: (w - LOT_W * s) / 2, y: (h - LOT_H * s) / 2 } };
  }, []);

  const resetView = useCallback(() => {
    const c = containerRef.current; if (!c) return;
    const { width, height } = c.getBoundingClientRect();
    const fit = computeFit(width, height);
    fitRef.current = scaleRef.current = fit.scale;
    offsetRef.current = fit.offset;
    setScale(fit.scale); setOffset(fit.offset);
  }, [computeFit]);

  // ── Canvas sizing ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const container = containerRef.current, canvas = canvasRef.current;
    if (!container || !canvas) return;
    const ro = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      const w = Math.round(width), h = Math.round(height);
      canvas.width = w; canvas.height = h;
      setCanvasSize({ w, h });
      if (fitRef.current === 1 && w > 0 && h > 0) {
        const fit = computeFit(w, h);
        fitRef.current = scaleRef.current = fit.scale;
        offsetRef.current = fit.offset;
        setScale(fit.scale); setOffset(fit.offset);
      }
    });
    ro.observe(container);
    return () => ro.disconnect();
  }, [computeFit]);

  // ── Compass persistence ────────────────────────────────────────────────────────
  useEffect(() => {
    try {
      const saved = localStorage.getItem("fairy-garden-compass");
      if (saved) { const { rotation } = JSON.parse(saved) as { rotation: number }; setCompassRot(rotation); }
      else setShowBanner(true);
    } catch { setShowBanner(true); }
  }, []);

  const handleOrientSelect = useCallback((dir: string) => {
    const r = COMPASS_ROTATION[dir] ?? 0;
    setCompassRot(r); setShowOrientModal(false); setShowBanner(false);
    try { localStorage.setItem("fairy-garden-compass", JSON.stringify({ direction: dir, rotation: r })); }
    catch { /* ignore */ }
  }, []);

  // ── Keyboard ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !e.repeat) { e.preventDefault(); isSpaceRef.current = true; setIsSpaceDown(true); }
      if ((e.code === "Delete" || e.code === "Backspace") && selectedIdRef.current) {
        const snap = elementsRef.current;
        setHistory(h => [...h, snap]); setRedoStack([]);
        setElements(els => els.filter(el => el.id !== selectedIdRef.current));
        setSelectedId(null);
      }
    };
    const onUp = (e: KeyboardEvent) => { if (e.code === "Space") { isSpaceRef.current = false; setIsSpaceDown(false); } };
    document.addEventListener("keydown", onDown);
    document.addEventListener("keyup",   onUp);
    return () => { document.removeEventListener("keydown", onDown); document.removeEventListener("keyup", onUp); };
  }, []);

  // ── Coord helpers ──────────────────────────────────────────────────────────────
  const toFt = useCallback((cx: number, cy: number) => ({
    x: Math.max(0, Math.min(LOT_W, (cx - offset.x) / scale)),
    y: Math.max(0, Math.min(LOT_H, (cy - offset.y) / scale)),
  }), [offset, scale]);

  const toFtRaw = useCallback((cx: number, cy: number) => ({
    x: Math.max(0, Math.min(LOT_W, (cx - offsetRef.current.x) / scaleRef.current)),
    y: Math.max(0, Math.min(LOT_H, (cy - offsetRef.current.y) / scaleRef.current)),
  }), []);

  // ── Prompt helpers ─────────────────────────────────────────────────────────────
  const openPrompt = useCallback((
    drawType: PendingDraw["drawType"], x: number, y: number, w: number, h: number,
    promptCx: number, promptCy: number,
  ) => {
    setPending({ drawType, x, y, w, h, promptCx, promptCy }); setPendingName("");
    setPendingFill(drawType === "zone" ? SWATCHES[2] : drawType === "plant" ? SWATCHES[6] : SWATCHES[1]);
  }, []);

  const commitPending = useCallback(() => {
    if (!pending) return;
    const snap = elementsRef.current;
    const el: MapElement = {
      id: `el-${Date.now()}`, type: pending.drawType === "custom" ? "zone" : pending.drawType,
      name: pendingName.trim() || (pending.drawType === "building" ? "Building" : pending.drawType === "plant" ? "Plant" : "Yard zone"),
      x: pending.x, y: pending.y, w: pending.w, h: pending.h,
      fill: pendingFill, stroke: darkenHex(pendingFill),
    };
    setHistory(h => [...h, snap]); setRedoStack([]);
    setElements(prev => [...prev, el]); setPending(null);
  }, [pending, pendingName, pendingFill]);

  // ── Fixed dimensions from dim spec ─────────────────────────────────────────────
  const getFixedDims = useCallback(() => {
    const w = parseFloat(dimSpec.widthStr), d = parseFloat(dimSpec.depthStr);
    if (isNaN(w) || isNaN(d) || w <= 0 || d <= 0) return null;
    const f = dimSpec.preferMetric ? 3.28084 : 1;
    return { w: w * f, h: d * f };
  }, [dimSpec]);

  // ── Sidebar actions ────────────────────────────────────────────────────────────
  const selectAndCenter = useCallback((id: string) => {
    const el = elements.find(e => e.id === id); setSelectedId(id);
    if (!el || !canvasRef.current) return;
    const elCx = el.type === "plant" ? el.x : el.x + el.w / 2;
    const elCy = el.type === "plant" ? el.y : el.y + el.h / 2;
    const newOff = { x: canvasRef.current.width / 2 - elCx * scaleRef.current, y: canvasRef.current.height / 2 - elCy * scaleRef.current };
    setOffset(newOff); offsetRef.current = newOff;
  }, [elements]);

  const deleteElement = useCallback((id: string) => {
    const snap = elementsRef.current;
    setHistory(h => [...h, snap]); setRedoStack([]);
    setElements(els => els.filter(el => el.id !== id));
    if (selectedIdRef.current === id) setSelectedId(null);
  }, []);

  // ── History ────────────────────────────────────────────────────────────────────
  const undo = useCallback(() => {
    if (!history.length) return;
    setRedoStack(r => [...r, elements]); setElements(history[history.length - 1]); setHistory(h => h.slice(0, -1));
  }, [history, elements]);

  const redo = useCallback(() => {
    if (!redoStack.length) return;
    setHistory(h => [...h, elements]); setElements(redoStack[redoStack.length - 1]); setRedoStack(r => r.slice(0, -1));
  }, [redoStack, elements]);

  const clearAll = useCallback(() => {
    setHistory(h => [...h, elements]); setRedoStack([]);
    setElements(INITIAL_ELEMENTS); setSelectedId(null);
  }, [elements]);

  const handleTool = useCallback((id: string) => {
    setActiveTool(id as ToolId); setSelectedId(null); setPending(null); setTextInput(null); setRenameEl(null);
  }, []);

  const startPan = useCallback((clientX: number, clientY: number) => {
    setIsPanning(true); setLastPan({ x: clientX, y: clientY });
  }, []);

  // ── Mouse handlers ─────────────────────────────────────────────────────────────
  const handleWheel = useCallback((e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    applyZoom(scaleRef.current * (e.deltaY < 0 ? 1.04 : 1 / 1.04), e.nativeEvent.offsetX, e.nativeEvent.offsetY);
  }, [applyZoom]);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 1) { e.preventDefault(); startPan(e.clientX, e.clientY); return; }
    if (e.button !== 0 || pending) return;
    const r  = canvasRef.current!.getBoundingClientRect();
    const cx = e.clientX - r.left, cy = e.clientY - r.top;
    const ft = toFt(cx, cy);

    if (isSpaceRef.current) { startPan(e.clientX, e.clientY); return; }
    if (activeTool === "text")  { setTextInput({ cx, cy, fx: ft.x, fy: ft.y, value: "" }); return; }
    if (activeTool === "plant") {
      openPrompt("plant", ft.x, ft.y, 0, 0, Math.min(cx, (canvasRef.current?.width ?? 300) - 220), Math.max(8, cy - 160));
      return;
    }
    if (RECT_DRAW_TOOLS.has(activeTool)) { setDrawStart(ft); setDrawCurrent(ft); return; }
    if (activeTool === "select") {
      if (selectedId) {
        const selEl = elements.find(e => e.id === selectedId);
        if (selEl) {
          const hh = hitTestHandle(selEl, cx, cy, scale, offset);
          if (hh) {
            const snap = elementsRef.current;
            setHistory(h => [...h, snap]); setRedoStack([]);
            setResizeDrag({ handle: hh, startEl: selEl, startMx: ft.x, startMy: ft.y }); return;
          }
        }
      }
      const hit = [...elements].reverse().find(el => hitTest(el, ft.x, ft.y));
      if (hit) {
        const snap = elementsRef.current;
        setHistory(h => [...h, snap]); setRedoStack([]);
        setSelectedId(hit.id); setIsDragging(true);
        setDragElState({ elX: hit.x, elY: hit.y, mx: ft.x, my: ft.y }); return;
      }
      setSelectedId(null); startPan(e.clientX, e.clientY);
    }
  }, [activeTool, toFt, elements, selectedId, scale, offset, pending, openPrompt, startPan]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPanning) {
      const dx = e.clientX - lastPan.x, dy = e.clientY - lastPan.y;
      const newOff = { x: offsetRef.current.x + dx, y: offsetRef.current.y + dy };
      offsetRef.current = newOff; setOffset(newOff); setLastPan({ x: e.clientX, y: e.clientY }); return;
    }
    const r  = canvasRef.current!.getBoundingClientRect();
    const cx = e.clientX - r.left, cy = e.clientY - r.top;
    const ft = toFt(cx, cy);

    if (resizeDrag) {
      const { handle, startEl, startMx, startMy } = resizeDrag;
      const patch = applyResize(startEl, handle, ft.x - startMx, ft.y - startMy);
      setElements(els => els.map(el => el.id === startEl.id ? { ...el, ...patch } : el)); return;
    }
    if (isDragging && dragElState && selectedId) {
      const dx = ft.x - dragElState.mx, dy = ft.y - dragElState.my;
      setElements(els => els.map(el => el.id === selectedId ? { ...el, x: dragElState.elX + dx, y: dragElState.elY + dy } : el)); return;
    }
    if (drawStart && RECT_DRAW_TOOLS.has(activeTool)) {
      const fixed = getFixedDims();
      setDrawCurrent(fixed ? { x: drawStart.x + fixed.w, y: drawStart.y + fixed.h } : ft); return;
    }
    if (activeTool === "select") {
      if (selectedId) {
        const selEl = elements.find(e => e.id === selectedId);
        if (selEl) {
          const hh = hitTestHandle(selEl, cx, cy, scale, offset);
          setHoveredHandle(hh); setHoveringSel(!hh && hitTest(selEl, ft.x, ft.y)); return;
        }
      }
      setHoveredHandle(null); setHoveringSel(false);
    }
  }, [isPanning, lastPan, resizeDrag, isDragging, dragElState, selectedId, drawStart, activeTool, toFt, elements, scale, offset, getFixedDims]);

  const handleMouseUp = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPanning) { setIsPanning(false); return; }
    if (e.button === 1) return;
    if (resizeDrag) { setResizeDrag(null); return; }
    setIsDragging(false); setDragElState(null);
    if (drawStart && drawCurrent && RECT_DRAW_TOOLS.has(activeTool)) {
      let x: number, y: number, w: number, h: number;
      const fixed = getFixedDims();
      if (fixed) { x = drawStart.x; y = drawStart.y; w = fixed.w; h = fixed.h; }
      else { x = Math.min(drawStart.x, drawCurrent.x); y = Math.min(drawStart.y, drawCurrent.y); w = Math.abs(drawCurrent.x - drawStart.x); h = Math.abs(drawCurrent.y - drawStart.y); }
      if (w > 0.5 && h > 0.5) {
        const r  = canvasRef.current!.getBoundingClientRect();
        const cx = e.clientX - r.left, cy = e.clientY - r.top;
        openPrompt(activeTool as PendingDraw["drawType"], x, y, w, h,
          Math.min(cx, (canvasRef.current?.width ?? 300) - 220), Math.max(8, cy - 160));
      }
    }
    setDrawStart(null); setDrawCurrent(null);
  }, [isPanning, resizeDrag, drawStart, drawCurrent, activeTool, openPrompt, getFixedDims]);

  const handleMouseLeave = useCallback(() => {
    setIsPanning(false); setIsDragging(false); setDragElState(null);
    setDrawStart(null); setDrawCurrent(null); setHoveredHandle(null); setHoveringSel(false);
  }, []);

  const handleDoubleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const r = canvasRef.current!.getBoundingClientRect();
    const cx = e.clientX - r.left, cy = e.clientY - r.top;
    const ft = toFt(cx, cy);
    const hit = [...elements].reverse().find(el => hitTest(el, ft.x, ft.y));
    if (hit) { setRenameEl({ id: hit.id, name: hit.name, cx, cy }); setSelectedId(hit.id); }
  }, [toFt, elements]);

  // ── Touch events ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const dist = (a: Touch, b: Touch) => Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
    const xy   = (t: Touch) => { const r = canvas.getBoundingClientRect(); return { cx: t.clientX - r.left, cy: t.clientY - r.top }; };

    const onStart = (e: TouchEvent) => {
      e.preventDefault(); const ts = touchRef.current;
      if (e.touches.length === 2) {
        const r = canvas.getBoundingClientRect(); ts.mode = "pinch"; ts.pinchDist = dist(e.touches[0], e.touches[1]);
        ts.pinchMidX = (e.touches[0].clientX + e.touches[1].clientX) / 2 - r.left;
        ts.pinchMidY = (e.touches[0].clientY + e.touches[1].clientY) / 2 - r.top; return;
      }
      if (e.touches.length === 1) {
        const { cx, cy } = xy(e.touches[0]);
        ts.tapX=cx; ts.tapY=cy; ts.tapTime=Date.now(); ts.moved=false; ts.lastX=cx; ts.lastY=cy;
        const tool = activeToolRef.current;
        if (RECT_DRAW_TOOLS.has(tool)) { const ft=toFtRaw(cx,cy); ts.mode="draw"; drawStartRef.current=ft; setDrawStart(ft); setDrawCurrent(ft); }
        else ts.mode = "pan";
      }
    };

    const onMove = (e: TouchEvent) => {
      e.preventDefault(); const ts = touchRef.current;
      if (e.touches.length === 2 && ts.mode === "pinch") {
        const r=canvas.getBoundingClientRect(); const d=dist(e.touches[0],e.touches[1]);
        const midX=(e.touches[0].clientX+e.touches[1].clientX)/2-r.left;
        const midY=(e.touches[0].clientY+e.touches[1].clientY)/2-r.top;
        applyZoom(scaleRef.current*(d/ts.pinchDist), midX, midY); ts.pinchDist=d; return;
      }
      if (e.touches.length === 1) {
        const { cx,cy } = xy(e.touches[0]); const dx=cx-ts.lastX, dy=cy-ts.lastY;
        if (Math.abs(dx)>2||Math.abs(dy)>2) ts.moved=true;
        if (ts.mode==="pan") { const prev=offsetRef.current, next={x:prev.x+dx,y:prev.y+dy}; offsetRef.current=next; setOffset(next); }
        else if (ts.mode==="draw") setDrawCurrent(toFtRaw(cx,cy));
        ts.lastX=cx; ts.lastY=cy;
      }
    };

    const onEnd = (e: TouchEvent) => {
      e.preventDefault(); const ts=touchRef.current;
      if (e.touches.length === 0) {
        const isTap=!ts.moved&&(Date.now()-ts.tapTime)<300, tool=activeToolRef.current;
        if (ts.mode==="pan"&&isTap) {
          if (tool==="plant") { const ft=toFtRaw(ts.tapX,ts.tapY); openPrompt("plant",ft.x,ft.y,0,0,Math.min(ts.tapX,canvas.width-220),Math.max(8,ts.tapY-160)); }
          if (tool==="text")  { const ft=toFtRaw(ts.tapX,ts.tapY); setTextInput({cx:ts.tapX,cy:ts.tapY,fx:ft.x,fy:ft.y,value:""}); }
        }
        if (ts.mode==="draw"&&drawStartRef.current) {
          const ft=toFtRaw(ts.lastX,ts.lastY), s=drawStartRef.current;
          const x=Math.min(s.x,ft.x),y=Math.min(s.y,ft.y),w=Math.abs(ft.x-s.x),h=Math.abs(ft.y-s.y);
          if (w>0.5&&h>0.5) openPrompt(tool as PendingDraw["drawType"],x,y,w,h,Math.min(ts.lastX,canvas.width-220),Math.max(8,ts.lastY-160));
          setDrawStart(null); setDrawCurrent(null); drawStartRef.current=null;
        }
        ts.mode="none";
      }
      if (e.touches.length===1&&ts.mode==="pinch") {
        const {cx,cy}=xy(e.touches[0]); ts.mode="pan"; ts.lastX=cx; ts.lastY=cy; ts.moved=false; ts.tapX=cx; ts.tapY=cy; ts.tapTime=Date.now();
      }
    };

    canvas.addEventListener("touchstart",onStart,{passive:false});
    canvas.addEventListener("touchmove", onMove, {passive:false});
    canvas.addEventListener("touchend",  onEnd,  {passive:false});
    return () => { canvas.removeEventListener("touchstart",onStart); canvas.removeEventListener("touchmove",onMove); canvas.removeEventListener("touchend",onEnd); };
  }, [applyZoom, toFtRaw, openPrompt]);

  // ── Zoom buttons ───────────────────────────────────────────────────────────────
  const zoom = useCallback((factor: number) => {
    const canvas = canvasRef.current; if (!canvas) return;
    applyZoom(scaleRef.current * factor, canvas.width / 2, canvas.height / 2);
  }, [applyZoom]);

  // ── Cursor ─────────────────────────────────────────────────────────────────────
  const cursor =
    resizeDrag                        ? getHandleCursor(resizeDrag.handle)
    : isPanning                       ? "grabbing"
    : isSpaceDown                     ? "grab"
    : isDragging                      ? "move"
    : RECT_DRAW_TOOLS.has(activeTool) || activeTool === "plant" || activeTool === "text" ? "crosshair"
    : hoveredHandle                   ? getHandleCursor(hoveredHandle)
    : hoveringSel                     ? "move"
    : "default";

  const gridFtSize = gridFt(gridRaw, dimSpec.preferMetric);

  // ── Render ─────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full bg-parchment relative">

      {showBanner && (
        <div className="flex-shrink-0 flex items-center justify-between gap-3 px-4 py-2.5 bg-vellum border-b border-linen text-xs text-ink">
          <span>Is your map oriented correctly? North should be at the top — the back of your property.</span>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={() => setShowBanner(false)} className="px-2.5 py-1 rounded border border-linen bg-paper text-muted hover:bg-linen transition-colors">Looks right</button>
            <button onClick={() => setShowOrientModal(true)} className="px-2.5 py-1 rounded border border-olive bg-olive text-parchment hover:opacity-90 transition-opacity">Help me orient</button>
          </div>
        </div>
      )}

      <MapToolbar
        activeTool={activeTool} onTool={handleTool}
        gridSize={gridRaw} onGridSize={setGridRaw}
        preferMetric={dimSpec.preferMetric} dimSpec={dimSpec}
        onDimSpec={d => {
          if (d.preferMetric !== dimSpec.preferMetric) setGridRaw(d.preferMetric ? 5 : 10);
          setDimSpec(d);
        }}
      />

      <div className="flex flex-1 overflow-hidden" style={{ minHeight: 0 }}>
        <div ref={containerRef} className="flex-1 relative overflow-hidden" style={{ minHeight: 0 }}>
          <MapCanvas
            canvasRef={canvasRef} scale={scale} offset={offset}
            elements={elements} selectedId={selectedId}
            drawStart={drawStart} drawCurrent={drawCurrent}
            activeTool={activeTool} gridFtSize={gridFtSize}
            canvasSize={canvasSize} fitScale={fitRef.current} cursor={cursor}
            onWheel={handleWheel} onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave} onDoubleClick={handleDoubleClick}
          />

          <MapControls
            scale={scale} fitScale={fitRef.current} compassRot={compassRot}
            onZoomIn={() => zoom(1.25)} onZoomOut={() => zoom(1 / 1.25)}
            onReset={resetView} showOrientBanner={showBanner} onOrientClick={() => setShowOrientModal(true)}
          />

          {/* Pending name/colour prompt */}
          {pending && (
            <div className="absolute z-20 bg-paper border border-linen rounded-xl p-4 space-y-3"
              style={{ left: Math.min(pending.promptCx, (canvasSize.w || 320) - 220), top: Math.max(8, pending.promptCy), width: 210 }}>
              <p className="text-xs font-medium text-ink">Name this area</p>
              <input autoFocus type="text" value={pendingName} onChange={e => setPendingName(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") commitPending(); if (e.key === "Escape") setPending(null); }}
                placeholder="e.g. Rose border"
                className="w-full text-xs border border-linen rounded px-2 py-1.5 bg-parchment text-ink placeholder:text-lichen focus:outline-none focus:ring-1 focus:ring-olive"
              />
              <div className="flex flex-wrap gap-1.5">
                {SWATCHES.map(sw => (
                  <button key={sw} onClick={() => setPendingFill(sw)}
                    className="w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 flex-shrink-0"
                    style={{ background: sw, borderColor: pendingFill === sw ? "#746a25" : "transparent", boxShadow: pendingFill === sw ? "0 0 0 1px #746a25" : "none" }}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={commitPending} className="flex-1 py-1.5 rounded-lg text-xs font-medium text-parchment hover:opacity-90 transition-opacity" style={{ background: "#746a25" }}>Add to map</button>
                <button onClick={() => setPending(null)} className="px-2.5 py-1.5 rounded-lg text-xs border border-linen text-muted hover:bg-linen transition-colors">✕</button>
              </div>
            </div>
          )}

          {/* Floating text input */}
          {textInput && (
            <div className="absolute z-20" style={{ left: textInput.cx, top: textInput.cy - 20 }}>
              <input autoFocus type="text" value={textInput.value}
                onChange={e => setTextInput(ti => ti ? { ...ti, value: e.target.value } : ti)}
                onKeyDown={e => {
                  if (e.key === "Enter" && textInput.value.trim()) {
                    const snap = elementsRef.current;
                    const el: MapElement = { id: `el-${Date.now()}`, type: "text", name: textInput.value.trim(), text: textInput.value.trim(), x: textInput.fx, y: textInput.fy, w: 0, h: 0, fill: "#443e34", stroke: "transparent" };
                    setHistory(h => [...h, snap]); setRedoStack([]);
                    setElements(prev => [...prev, el]); setTextInput(null);
                  }
                  if (e.key === "Escape") setTextInput(null);
                }}
                onBlur={() => setTextInput(null)} placeholder="Type label…"
                className="text-xs border border-olive rounded px-2 py-1 bg-paper text-ink placeholder:text-lichen focus:outline-none"
                style={{ minWidth: 120 }}
              />
            </div>
          )}

          {/* Inline rename */}
          {renameEl && (
            <div className="absolute z-20 bg-paper border border-linen rounded-lg shadow-sm p-2 space-y-1.5"
              style={{ left: Math.min(renameEl.cx, (canvasSize.w || 300) - 180), top: Math.max(8, renameEl.cy - 60), width: 170 }}>
              <p className="text-[10px] text-muted">Rename element</p>
              <input autoFocus type="text" value={renameEl.name}
                onChange={e => setRenameEl(r => r ? { ...r, name: e.target.value } : r)}
                onKeyDown={e => {
                  if (e.key === "Enter") { setElements(els => els.map(el => el.id === renameEl!.id ? { ...el, name: renameEl!.name.trim() || el.name } : el)); setRenameEl(null); }
                  if (e.key === "Escape") setRenameEl(null);
                }}
                onBlur={() => { setElements(els => els.map(el => el.id === renameEl!.id ? { ...el, name: renameEl!.name.trim() || el.name } : el)); setRenameEl(null); }}
                className="w-full text-xs border border-linen rounded px-2 py-1 bg-parchment text-ink focus:outline-none focus:ring-1 focus:ring-olive"
              />
            </div>
          )}
        </div>

        <MapSidebar
          elements={elements} selectedId={selectedId} open={sidebarOpen}
          onToggle={() => setSidebarOpen(p => !p)}
          onSelect={selectAndCenter} onDelete={deleteElement}
          onUndo={undo} onRedo={redo} onClear={clearAll}
          canUndo={history.length > 0} canRedo={redoStack.length > 0}
        />
      </div>

      {showOrientModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-ink/20">
          <div className="bg-paper border border-linen rounded-xl p-6 mx-4 w-full max-w-xs space-y-5">
            <div className="space-y-1">
              <h2 className="font-serif text-lg text-ink">Orient your map</h2>
              <p className="text-xs text-muted leading-relaxed">Which direction does the front of your house face?</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {["North","South","East","West"].map(dir => (
                <button key={dir} onClick={() => handleOrientSelect(dir)}
                  className="py-2.5 rounded-lg border border-linen bg-parchment text-sm text-ink hover:bg-linen transition-colors"
                >{dir}</button>
              ))}
            </div>
            <button onClick={() => setShowOrientModal(false)} className="w-full text-xs text-muted hover:text-ink transition-colors">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
