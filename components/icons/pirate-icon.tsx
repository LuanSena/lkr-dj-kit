import { cn } from "@/lib/utils";

export function PirateIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("h-4 w-4", className)}
      aria-hidden
    >
      <path d="M12 4c-2.2 0-4 1.5-4 3.5 0 .8.3 1.5.8 2.1" />
      <path d="M12 4c2.2 0 4 1.5 4 3.5 0 .8-.3 1.5-.8 2.1" />
      <path d="M8.8 9.6C7.2 10.4 6 11.8 6 13.5V15h12v-1.5c0-1.7-1.2-3.1-2.8-3.9" />
      <circle cx="9.5" cy="12" r="0.8" fill="currentColor" stroke="none" />
      <circle cx="14.5" cy="12" r="0.8" fill="currentColor" stroke="none" />
      <path d="M10.5 14.5c.8.5 2.2.5 3 0" />
      <path d="M5 18l3.5-2" />
      <path d="M19 18l-3.5-2" />
      <path d="M8 18l2-1.5" />
      <path d="M16 18l-2-1.5" />
      <path d="M3 18h3" />
      <path d="M18 18h3" />
    </svg>
  );
}
