export function TagBadge({ label }: { label: string }) {
  return (
    <span className="inline-block px-4 py-1.5 rounded-full bg-dreamBlue/[0.08] text-dreamBlue text-[13px] font-semibold tracking-[0.02em]">
      {label}
    </span>
  );
}
