"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface NavItem {
  id: string;
  num: string;
  label: string;
  color: string;
}

interface CompanySidebarNavProps {
  items: NavItem[];
}

export function CompanySidebarNav({ items }: CompanySidebarNavProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number>(0);

  const handleScroll = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const viewportHeight = window.innerHeight;
      const scrollY = window.scrollY;
      const triggerPoint = scrollY + viewportHeight * 0.3;

      let currentId: string | null = null;
      let currentProgress = 0;

      for (let i = items.length - 1; i >= 0; i--) {
        const el = document.getElementById(items[i].id);
        if (!el) continue;

        const rect = el.getBoundingClientRect();
        const elTop = rect.top + scrollY;
        const elBottom = elTop + rect.height;

        if (triggerPoint >= elTop && triggerPoint <= elBottom) {
          currentId = items[i].id;
          const elapsed = triggerPoint - elTop;
          currentProgress = Math.min(Math.max(elapsed / rect.height, 0), 1);
          break;
        }
      }

      if (currentId !== activeId) setActiveId(currentId);
      setProgress(currentProgress);
    });
  }, [items, activeId]);

  useEffect(() => {
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, [handleScroll]);

  return (
    <nav className="hidden lg:block w-[180px] shrink-0">
      <div className="sticky top-28 space-y-1">
        {items.map((item) => {
          const isActive = activeId === item.id;
          return (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="relative flex items-center gap-2.5 w-full text-left py-2 text-xs tracking-[0.08em] font-medium transition-colors"
              style={{
                color: isActive
                  ? "rgba(26,26,26,0.85)"
                  : "rgba(26,26,26,0.4)",
              }}
            >
              <span className="tabular-nums">{item.num}</span>
              <span>{item.label}</span>

              {/* Progress underline */}
              <span
                className="absolute bottom-0 left-0 h-[2px] transition-[width] duration-100 ease-linear"
                style={{
                  width: isActive ? `${progress * 100}%` : "0%",
                  backgroundColor: isActive ? item.color : "transparent",
                }}
              />
            </a>
          );
        })}
      </div>
    </nav>
  );
}
