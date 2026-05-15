import { useState } from "react";
import { Star } from "lucide-react";

interface Props { value: number; onChange: (rating: number) => void; size?: number; }

export function ReviewStarInput({ value, onChange, size = 24 }: Props) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex gap-1" dir="ltr" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map(star => (
        <button key={star} type="button" onClick={() => onChange(star)} onMouseEnter={() => setHover(star)} className="focus:outline-none">
          <Star style={{ width: size, height: size }} className={`transition-colors ${star <= (hover || value) ? "fill-[var(--color-primary)] text-[var(--color-primary)]" : "text-[var(--color-border)]"}`} /> {/* ds-ignore */}
        </button>
      ))}
    </div>
  );
}
