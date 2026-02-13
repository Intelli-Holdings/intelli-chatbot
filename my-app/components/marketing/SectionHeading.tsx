import { TagBadge } from "./TagBadge";

export function SectionHeading({
  tag,
  title,
  description,
  className,
}: {
  tag?: string;
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      {tag && <TagBadge label={tag} />}
      <h2 className="font-display text-[clamp(28px,4vw,44px)] font-normal text-foreground leading-[1.2] max-w-[700px] mt-5 mb-4">
        {title}
      </h2>
      {description && (
        <p className="text-[17px] text-muted-foreground max-w-[600px] leading-[1.65] mb-6">
          {description}
        </p>
      )}
    </div>
  );
}
