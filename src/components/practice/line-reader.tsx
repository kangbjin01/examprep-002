"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface LineReaderProps {
  active: boolean;
}

export function LineReader({ active }: LineReaderProps) {
  const [y, setY] = useState(300);
  const dragging = useRef(false);
  const slotHeight = 80;

  const handleMouseDown = useCallback(() => {
    dragging.current = true;
    document.body.style.cursor = "ns-resize";
    document.body.style.userSelect = "none";
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      setY(Math.max(60, Math.min(window.innerHeight - 60, e.clientY)));
    };

    const handleMouseUp = () => {
      dragging.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  if (!active) return null;

  return (
    <div className="fixed inset-0 z-40 pointer-events-none">
      {/* Top mask */}
      <div
        className="absolute inset-x-0 top-0 bg-black/50 transition-none"
        style={{ height: y - slotHeight / 2 }}
      />
      {/* Reading slot (transparent) */}
      <div
        className="absolute inset-x-0 pointer-events-auto cursor-ns-resize"
        style={{ top: y - slotHeight / 2, height: slotHeight }}
        onMouseDown={handleMouseDown}
      >
        <div className="absolute inset-x-0 top-0 h-px bg-foreground/30" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-foreground/30" />
        {/* Drag handle */}
        <div className="absolute left-1/2 bottom-1 -translate-x-1/2">
          <div className="h-1 w-8 rounded-full bg-foreground/30" />
        </div>
      </div>
      {/* Bottom mask */}
      <div
        className="absolute inset-x-0 bottom-0 bg-black/50 transition-none"
        style={{ top: y + slotHeight / 2 }}
      />
    </div>
  );
}
