"use client";

import { ReactNode, useEffect, useId, useMemo, useRef, useState } from "react";

export interface TabItem {
  id: string;
  label: ReactNode;
  disabled?: boolean;
  panel: ReactNode;
}

export interface TabsProps {
  items: TabItem[];
  defaultTabId?: string;
  currentTabId?: string;
  onTabChange?: (id: string) => void;
  className?: string;
}

export function Tabs({ items, defaultTabId, currentTabId, onTabChange, className = "" }: TabsProps) {
  const autoId = useId();
  const [internalId, setInternalId] = useState<string>(defaultTabId || items[0]?.id);
  const activeId = currentTabId ?? internalId;

  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentTabId === undefined && defaultTabId) setInternalId(defaultTabId);
  }, [defaultTabId, currentTabId]);

  const indexById = useMemo(() => {
    const map = new Map<string, number>();
    items.forEach((it, idx) => map.set(it.id, idx));
    return map;
  }, [items]);

  function setActive(id: string) {
    if (currentTabId === undefined) setInternalId(id);
    onTabChange?.(id);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    const currentIndex = indexById.get(activeId) ?? 0;
    let nextIndex = currentIndex;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") nextIndex = (currentIndex + 1) % items.length;
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") nextIndex = (currentIndex - 1 + items.length) % items.length;
    if (nextIndex !== currentIndex) {
      e.preventDefault();
      const next = items[nextIndex];
      if (!next.disabled) setActive(next.id);
    }
  }

  return (
    <div className={className}>
      <div
        ref={listRef}
        role="tablist"
        aria-orientation="horizontal"
        className="flex items-center gap-2"
        onKeyDown={onKeyDown}
      >
        {items.map((it) => {
          const selected = it.id === activeId;
          return (
            <button
              key={it.id}
              role="tab"
              aria-selected={selected}
              aria-controls={`${autoId}-${it.id}-panel`}
              id={`${autoId}-${it.id}-tab`}
              disabled={it.disabled}
              onClick={() => !it.disabled && setActive(it.id)}
              className={
                "rounded-[10px] px-4 py-2 font-medium transition-colors " +
                (selected
                  ? "bg-core-prim-500 text-invert-high"
                  : "text-main-high hover:bg-card border border-transparent")
              }
            >
              {it.label}
            </button>
          );
        })}
      </div>

      {items.map((it) => {
        const selected = it.id === activeId;
        return (
          <div
            key={it.id}
            role="tabpanel"
            id={`${autoId}-${it.id}-panel`}
            aria-labelledby={`${autoId}-${it.id}-tab`}
            hidden={!selected}
            className="mt-4"
          >
            {it.panel}
          </div>
        );
      })}
    </div>
  );
}


