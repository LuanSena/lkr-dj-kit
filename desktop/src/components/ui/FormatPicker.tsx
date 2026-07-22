import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

type FormatOption<T extends string> = { id: T; label: string };

type FormatPickerProps<T extends string> = {
  label: string;
  value: T;
  options: FormatOption<T>[];
  onChange: (value: T) => void;
  columns?: 2 | 4;
};

export function FormatPicker<T extends string>({
  label,
  value,
  options,
  onChange,
  columns = 2,
}: FormatPickerProps<T>) {
  return (
    <div>
      <label className="mb-2.5 block text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40">
        {label}
      </label>
      <div className={cn("grid gap-2", columns === 4 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-2")}>
        {options.map((opt) => {
          const active = value === opt.id;
          return (
            <motion.button
              key={opt.id}
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => onChange(opt.id)}
              className={cn(
                "cursor-pointer rounded-xl border py-3 text-sm font-semibold uppercase tracking-wider transition-colors",
                active
                  ? "border-cyan-400/50 bg-gradient-to-b from-cyan-500/20 to-violet-500/10 text-cyan-100"
                  : "border-white/10 bg-black/25 text-white/40 hover:border-white/20 hover:text-white/70"
              )}
            >
              {opt.label}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
