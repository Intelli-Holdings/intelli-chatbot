// components/docs/info.tsx

interface InfoProps {
    children: React.ReactNode;
  }
  
  export function Info({ children }: InfoProps) {
    return (
      <div className="info">
        {children}
      </div>
    );
  }