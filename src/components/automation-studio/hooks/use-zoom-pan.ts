"use client";

import { useState, useCallback, useRef, useEffect } from "react";

interface ZoomPanState {
  scale: number;
  offsetX: number;
  offsetY: number;
}

const MIN_SCALE = 0.25;
const MAX_SCALE = 2;
const ZOOM_STEP = 0.1;
const WHEEL_ZOOM_SENSITIVITY = 0.001;

export function useZoomPan(initialScale = 1) {
  const [state, setState] = useState<ZoomPanState>({
    scale: initialScale,
    offsetX: 0,
    offsetY: 0,
  });

  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement | null>(null);

  const setScale = useCallback((scale: number) => {
    setState((prev) => ({
      ...prev,
      scale: Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale)),
    }));
  }, []);

  const zoomIn = useCallback(() => {
    setState((prev) => ({
      ...prev,
      scale: Math.min(MAX_SCALE, prev.scale + ZOOM_STEP),
    }));
  }, []);

  const zoomOut = useCallback(() => {
    setState((prev) => ({
      ...prev,
      scale: Math.max(MIN_SCALE, prev.scale - ZOOM_STEP),
    }));
  }, []);

  const zoomToFit = useCallback((contentWidth: number, contentHeight: number, viewportWidth: number, viewportHeight: number) => {
    const padding = 80;
    const availableW = viewportWidth - padding * 2;
    const availableH = viewportHeight - padding * 2;
    const scaleX = availableW / Math.max(contentWidth, 1);
    const scaleY = availableH / Math.max(contentHeight, 1);
    const newScale = Math.min(scaleX, scaleY, 1);
    const offsetX = (viewportWidth - contentWidth * newScale) / 2;
    const offsetY = (viewportHeight - contentHeight * newScale) / 2;
    setState({ scale: newScale, offsetX, offsetY });
  }, []);

  const resetView = useCallback(() => {
    setState({ scale: 1, offsetX: 0, offsetY: 0 });
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = -e.deltaY * WHEEL_ZOOM_SENSITIVITY;
      setState((prev) => ({
        ...prev,
        scale: Math.min(MAX_SCALE, Math.max(MIN_SCALE, prev.scale + delta)),
      }));
    }
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
      isPanning.current = true;
      panStart.current = { x: e.clientX - state.offsetX, y: e.clientY - state.offsetY };
      e.preventDefault();
    }
  }, [state.offsetX, state.offsetY]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning.current) return;
    setState((prev) => ({
      ...prev,
      offsetX: e.clientX - panStart.current.x,
      offsetY: e.clientY - panStart.current.y,
    }));
  }, []);

  const handleMouseUp = useCallback(() => {
    isPanning.current = false;
  }, []);

  useEffect(() => {
    const handleGlobalMouseUp = () => isPanning.current = false;
    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => window.removeEventListener("mouseup", handleGlobalMouseUp);
  }, []);

  return {
    scale: state.scale,
    offsetX: state.offsetX,
    offsetY: state.offsetY,
    setScale,
    zoomIn,
    zoomOut,
    zoomToFit,
    resetView,
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    containerRef,
  };
}
