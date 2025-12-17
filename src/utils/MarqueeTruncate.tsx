import { useEffect, useRef, useState } from "react";
import clsx from "clsx";

export default function MarqueeTruncate({
  text,
  width = 240,
  cycleMs = 7000,
}: {
  text: string;
  width?: number | string;
  cycleMs?: number;
}) {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLSpanElement>(null);
  const [shouldScroll, setShouldScroll] = useState(false);

  useEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;

    const overflow = Math.max(0, inner.scrollWidth - outer.clientWidth);
    setShouldScroll(overflow > 1);

    outer.style.setProperty("--scroll", `${overflow}px`);
    outer.style.setProperty("--cycle", `${cycleMs}ms`);
  }, [text, width, cycleMs]);

  return (
    <div
      ref={outerRef}
      style={{ width }}
      className={`relative overflow-hidden  ${shouldScroll} ? "animate-marquee-reveal" : "truncate"`}
    >
      <span
        ref={innerRef}
        className={`
          "block whitespace-nowrap transition-all duration-300",
          ${shouldScroll} ? "animate-marquee-reveal" : "truncate"
        `}
      >
        {text}
      </span>
    </div>
  );
}
