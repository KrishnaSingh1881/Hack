import React, { useState, useRef, useCallback } from "react";
import {
  getReactComponentHierarchy,
  formatReactComponentHierarchy,
} from "./getReactComponentHierarchy";

import { snapdom } from "@zumer/snapdom";

const HIGHLIGHT_CLASS = "vly-toolbar-highlight";

// Add highlight style to the document
const injectHighlightStyle = () => {
  if (document.getElementById("vly-toolbar-style")) return;
  const style = document.createElement("style");
  style.id = "vly-toolbar-style";
  style.innerHTML = `
    .${HIGHLIGHT_CLASS} {
      outline: 2px solid #0070f3;
      cursor: pointer;
      background: rgba(0,112,243,0.08);
    }
  `;
  document.head.appendChild(style);
};

function getDomSelector(el: HTMLElement): string {
  if (el.id) return `#${el.id}`;
  if (el.className && typeof el.className === "string") {
    return (
      el.tagName.toLowerCase() + "." + el.className.trim().replace(/\s+/g, ".")
    );
  }
  return el.tagName.toLowerCase();
}

const Overlay: React.FC<{
  ignoreList: HTMLElement[];
  onSelect: (el: HTMLElement) => void;
  onHover: (el: HTMLElement) => void;
  onUnhover: () => void;
  selectMode: boolean;
}> = ({ ignoreList, onSelect, onHover, onUnhover, selectMode }) => {
  const lastHovered = useRef<HTMLElement | null>(null);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!selectMode) return;
      const overlay = e.currentTarget;
      overlay.style.pointerEvents = "none";
      const el = document.elementFromPoint(
        e.clientX,
        e.clientY,
      ) as HTMLElement | null;
      overlay.style.pointerEvents = "auto";
      if (!el || ignoreList.includes(el)) return;
      if (lastHovered.current !== el) {
        if (lastHovered.current)
          lastHovered.current.classList.remove(HIGHLIGHT_CLASS);
        lastHovered.current = el;
        el.classList.add(HIGHLIGHT_CLASS);
        onHover(el);
      }
    },
    [ignoreList, onHover, selectMode],
  );

  const handleMouseLeave = useCallback(() => {
    if (!selectMode) return;
    if (lastHovered.current) {
      lastHovered.current.classList.remove(HIGHLIGHT_CLASS);
      lastHovered.current = null;
    }
    onUnhover();
  }, [onUnhover]);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      const overlay = e.currentTarget;
      overlay.style.pointerEvents = "none";
      const el = document.elementFromPoint(
        e.clientX,
        e.clientY,
      ) as HTMLElement | null;
      overlay.style.pointerEvents = "auto";
      if (!el || ignoreList.includes(el)) return;
      if (lastHovered.current)
        lastHovered.current.classList.remove(HIGHLIGHT_CLASS);
      onSelect(el);
    },
    [ignoreList, onSelect],
  );

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9998,
        cursor: "copy",
        pointerEvents: "auto",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      tabIndex={0}
      role="button"
    />
  );
};

export const VlyToolbar: React.FC = () => {
  const [selectMode, setSelectMode] = useState(false);
  const toolbarRef = useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    injectHighlightStyle();
  }, []);

  // Listen for postMessage from parent to enable/disable select mode
  React.useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data && event.data.type === "vly-toolbar-enable-select") {
        setSelectMode(true);
      }
      if (event.data && event.data.type === "vly-toolbar-disable-select") {
        setSelectMode(false);
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // Callbacks for overlay
  const handleSelect = useCallback(async (el: HTMLElement) => {
    setSelectMode(false);
    const selector = getDomSelector(el);
    const hierarchy = getReactComponentHierarchy(el);
    const formatted = formatReactComponentHierarchy(hierarchy);

    let imageDataUrl: string | undefined = undefined;
    try {
      // Optionally, preload resources for best results
      // await preCache(el);
      const canvas = await snapdom.toCanvas(el, { fast: true, compress: true });
      imageDataUrl = canvas.toDataURL("image/png");
    } catch (e) {
      console.error("Failed to snapshot element", e);
    }

    window.parent.postMessage(
      {
        type: "vly-toolbar-select",
        selector,
        reactHierarchy: hierarchy,
        reactHierarchyFormatted: formatted,
        image: imageDataUrl,
      },
      "*",
    );
  }, []);

  const handleHover = useCallback(() => {
    // Optionally do something on hover
  }, []);

  const handleUnhover = useCallback(() => {
    // Optionally do something on unhover
  }, []);

  // Build ignore list (toolbar itself)
  const ignoreList = React.useMemo(() => {
    const arr: HTMLElement[] = [];
    if (toolbarRef.current) arr.push(toolbarRef.current);
    return arr;
  }, []);

  return (
    <>
      {selectMode && (
        <Overlay
          ignoreList={ignoreList}
          onSelect={handleSelect}
          onHover={handleHover}
          onUnhover={handleUnhover}
          selectMode={selectMode}
        />
      )}
      {/* Hide toolbar if there are no buttons or controls to show */}
      {/* If toolbar has no children, render nothing */}
      {/* <div ref={toolbarRef} ... /> is now hidden if empty */}
      {/* If you add controls in the future, restore this div */}
    </>
  );
};

export default VlyToolbar;
