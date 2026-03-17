"use client";

import { useCallback, useRef, useEffect, useState } from "react";

interface SplitPaneProps {
  left: React.ReactNode;
  right: React.ReactNode;
  defaultRatio?: number;
}

export function SplitPane({
  left,
  right,
  defaultRatio = 50,
}: SplitPaneProps) {
  const [ratio, setRatio] = useState(defaultRatio);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const handleMouseDown = useCallback(() => {
    dragging.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const pct = ((e.clientX - rect.left) / rect.width) * 100;
      setRatio(Math.max(25, Math.min(75, pct)));
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

  return (
    <div ref={containerRef} className="flex h-full">
      {/* Left pane */}
      <div
        className="overflow-y-auto p-6"
        style={{ width: `${ratio}%` }}
      >
        {left}
      </div>

      {/* Resizer */}
      <div
        onMouseDown={handleMouseDown}
        className="flex w-px shrink-0 cursor-col-resize items-center bg-border hover:bg-foreground/20 active:bg-foreground/30"
      >
        <div className="mx-auto h-8 w-1 rounded-full bg-border" />
      </div>

      {/* Right pane */}
      <div
        className="overflow-y-auto p-6"
        style={{ width: `${100 - ratio}%` }}
      >
        {right}
      </div>
    </div>
  );
}
