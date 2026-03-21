interface HeadingProps {
  title: string;
  description: string;
}

export const Heading: React.FC<HeadingProps> = ({ title, description }) => {
  return (
    <div>
      <h2 className="text-golden-heading font-bold tracking-golden-tight">{title}</h2>
      <p className="text-golden-body-sm text-muted-foreground">{description}</p>
    </div>
  );
};
