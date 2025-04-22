"use client"

import * as React from "react";
import { createPortal } from "react-dom";

interface FloatingElementProps {
  children: React.ReactNode;
  triggerRect?: DOMRect | null;
  offset?: number;
  fullScreenOverlay?: boolean;
  align?: 'start' | 'center' | 'end';
  side?: 'top' | 'bottom' | 'left' | 'right';
  zIndex?: number;
  matchWidth?: boolean;
}

const FloatingElementsContext = React.createContext<{
  addFloatingElement: (element: React.ReactNode) => string;
  removeFloatingElement: (id: string) => void;
} | null>(null);

export function useFloatingElementsContext() {
  const context = React.useContext(FloatingElementsContext);
  if (!context) {
    throw new Error("useFloatingElementsContext must be used within a FloatingElementsProvider");
  }
  return context;
}

export function FloatingElementsProvider({ children }: { children: React.ReactNode }) {
  const [floatingElements, setFloatingElements] = React.useState<Record<string, React.ReactNode>>({});
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    // Create the fixed container for all floating elements
    if (!document.getElementById("floating-elements-container")) {
      const container = document.createElement("div");
      container.id = "floating-elements-container";
      container.style.position = "fixed";
      container.style.top = "0";
      container.style.left = "0";
      container.style.width = "100vw";
      container.style.height = "100vh";
      container.style.pointerEvents = "none";
      container.style.zIndex = "10000";
      container.style.overflow = "hidden";
      document.body.appendChild(container);
      containerRef.current = container;
      setIsMounted(true);
    } else {
      containerRef.current = document.getElementById("floating-elements-container") as HTMLDivElement;
      setIsMounted(true);
    }

    return () => {
      // Cleanup - we don't remove the container as other components might use it
    };
  }, []);

  const addFloatingElement = React.useCallback((element: React.ReactNode) => {
    const id = `floating-element-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    setFloatingElements((prev) => ({ ...prev, [id]: element }));
    return id;
  }, []);

  const removeFloatingElement = React.useCallback((id: string) => {
    setFloatingElements((prev) => {
      const newElements = { ...prev };
      delete newElements[id];
      return newElements;
    });
  }, []);

  return (
    <FloatingElementsContext.Provider value={{ addFloatingElement, removeFloatingElement }}>
      {children}
      {isMounted && containerRef.current && 
        createPortal(
          <div data-floating-elements-root>
            {Object.entries(floatingElements).map(([id, element]) => (
              <React.Fragment key={id}>{element}</React.Fragment>
            ))}
          </div>,
          containerRef.current
        )}
    </FloatingElementsContext.Provider>
  );
}

export function FloatingElement({ 
  children, 
  triggerRect, 
  offset = 5,
  fullScreenOverlay = false,
  align = 'start',
  side = 'bottom',
  zIndex = 9999,
  matchWidth = false
}: FloatingElementProps) {
  const elementRef = React.useRef<HTMLDivElement>(null);
  const [position, setPosition] = React.useState({ top: 0, left: 0 });
  const [dimensions, setDimensions] = React.useState({ width: undefined as undefined | number, height: undefined as undefined | number });

  // Position the floating element based on the trigger rect
  React.useEffect(() => {
    if (!triggerRect || !elementRef.current) return;
    
    const elementRect = elementRef.current.getBoundingClientRect();
    let top = 0;
    let left = 0;
    
    // Calculate the position based on side
    if (side === 'bottom') {
      top = triggerRect.bottom + offset;
    } else if (side === 'top') {
      top = triggerRect.top - elementRect.height - offset;
    } else if (side === 'right') {
      left = triggerRect.right + offset;
    } else if (side === 'left') {
      left = triggerRect.left - elementRect.width - offset;
    }
    
    // Apply alignment
    if (side === 'bottom' || side === 'top') {
      if (align === 'start') {
        left = triggerRect.left;
      } else if (align === 'center') {
        left = triggerRect.left + (triggerRect.width / 2) - (elementRect.width / 2);
      } else if (align === 'end') {
        left = triggerRect.right - elementRect.width;
      }
    } else if (side === 'left' || side === 'right') {
      if (align === 'start') {
        top = triggerRect.top;
      } else if (align === 'center') {
        top = triggerRect.top + (triggerRect.height / 2) - (elementRect.height / 2);
      } else if (align === 'end') {
        top = triggerRect.bottom - elementRect.height;
      }
    }
    
    // Ensure the element stays within viewport bounds
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };
    
    if (left < 0) left = 0;
    if (top < 0) top = 0;
    if (left + elementRect.width > viewport.width) {
      left = viewport.width - elementRect.width;
    }
    if (top + elementRect.height > viewport.height) {
      // Flip to the top if it overflows at the bottom
      if (side === 'bottom') {
        top = triggerRect.top - elementRect.height - offset;
      }
      if (top < 0) top = 0; // If still overflows, just cap at the top
    }
    
    setPosition({ top, left });
    setDimensions({
      width: matchWidth ? triggerRect.width : undefined,
      height: undefined
    });
  }, [triggerRect, offset, align, side, matchWidth]);

  return (
    <div 
      ref={elementRef}
      style={{
        position: 'absolute',
        top: `${position.top}px`,
        left: `${position.left}px`,
        width: dimensions.width !== undefined ? `${dimensions.width}px` : 'auto',
        height: dimensions.height !== undefined ? `${dimensions.height}px` : 'auto',
        pointerEvents: 'auto',
        zIndex: fullScreenOverlay ? zIndex - 1 : zIndex,
      }}
    >
      {fullScreenOverlay && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'transparent',
            pointerEvents: 'auto',
            zIndex: zIndex - 1
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        />
      )}
      <div style={{ position: 'relative', zIndex }}>
        {children}
      </div>
    </div>
  );
}

export function useFloatingElement() {
  const { addFloatingElement, removeFloatingElement } = useFloatingElementsContext();
  const [elementId, setElementId] = React.useState<string | null>(null);
  const triggerRef = React.useRef<HTMLElement | null>(null);
  const [triggerRect, setTriggerRect] = React.useState<DOMRect | null>(null);
  
  const updateTriggerRect = React.useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setTriggerRect({
        top: rect.top,
        left: rect.left,
        right: rect.right,
        bottom: rect.bottom,
        width: rect.width,
        height: rect.height,
        x: rect.x,
        y: rect.y,
        toJSON: rect.toJSON
      });
      return rect;
    }
    return null;
  }, []);
  
  const showFloatingElement = React.useCallback((content: React.ReactNode, options: Omit<FloatingElementProps, 'children' | 'triggerRect'> = {}) => {
    // Get the latest rect directly instead of using the state
    const currentRect = updateTriggerRect();
    
    if (elementId) {
      removeFloatingElement(elementId);
    }
    
    const newId = addFloatingElement(
      <FloatingElement triggerRect={currentRect || triggerRect} {...options}>
        {content}
      </FloatingElement>
    );
    
    setElementId(newId);
    return newId;
  }, [addFloatingElement, elementId, removeFloatingElement, triggerRect, updateTriggerRect]);
  
  const hideFloatingElement = React.useCallback(() => {
    if (elementId) {
      removeFloatingElement(elementId);
      setElementId(null);
    }
  }, [elementId, removeFloatingElement]);
  
  React.useEffect(() => {
    return () => {
      if (elementId) {
        removeFloatingElement(elementId);
      }
    };
  }, [elementId, removeFloatingElement]);
  
  return {
    triggerRef,
    updateTriggerRect,
    showFloatingElement,
    hideFloatingElement,
    isShowing: !!elementId
  };
}