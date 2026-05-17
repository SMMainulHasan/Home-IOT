import { useEffect, useRef } from "react";

interface Props {
  label: string;
  values: (string | number)[];
  value: string | number;
  onChange: (val: any) => void;
}

export default function DialPicker({ label, values, value, onChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<any>(null);

  const ITEM_HEIGHT = 40;
  const VISIBLE_ITEMS = 5; // must be odd number

  // Scroll to selected value (only when value changes externally)
  useEffect(() => {
    const index = values.findIndex((v) => v === value);
    const container = containerRef.current;

    if (container && index !== -1) {
      container.scrollTo({
        top: index * ITEM_HEIGHT,
        behavior: "smooth",
      });
    }
  }, [value]);

  // Handle scroll end (debounced)
  const handleScroll = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      const container = containerRef.current;
      if (!container) return;

      const scrollTop = container.scrollTop;

      // Calculate centered item
      const index = Math.round(scrollTop / ITEM_HEIGHT);

      const newValue = values[index];
      if (newValue !== value) {
        onChange(newValue);
      }

      // Snap perfectly to position
      container.scrollTo({
        top: index * ITEM_HEIGHT,
        behavior: "smooth",
      });
    }, 100); // wait until scroll stops
  };

  return (
    <div className="flex flex-col items-center w-20">
      <p className="text-slate-400 text-sm mb-2">{label}</p>

      <div className="relative w-full">
        {/* Center highlight */}
        <div className="absolute top-1/2 left-0 w-full h-10 -translate-y-1/2 border-y border-green-500/40 pointer-events-none z-10" />

        <div
          ref={containerRef}
          onScroll={handleScroll}
          className="h-40 overflow-y-scroll snap-y snap-mandatory rounded-xl bg-slate-800 no-scrollbar scroll-smooth"
        >
          {/* Top spacer */}
          <div style={{ height: ITEM_HEIGHT * 1.5 }} />

          {values.map((val, index) => {
            const isActive = val === value;

            return (
              <div
                key={index}
                className={`h-10 flex items-center justify-center snap-center transition
                  ${
                    isActive
                      ? "text-green-400 text-lg font-bold"
                      : "text-slate-400"
                  }`}
              >
                {typeof val === "number"
                  ? val.toString().padStart(2, "0")
                  : val}
              </div>
            );
          })}

          {/* Bottom spacer */}
          <div style={{ height: ITEM_HEIGHT * 2 }} />
        </div>

        {/* Fade effects */}
        <div className="pointer-events-none absolute top-0 left-0 w-full h-8 bg-gradient-to-b from-slate-900 to-transparent rounded-t-xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-slate-900 to-transparent rounded-b-xl" />
      </div>
    </div>
  );
}
