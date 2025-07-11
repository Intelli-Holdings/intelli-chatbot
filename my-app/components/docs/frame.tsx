// components/docs/frame.tsx

interface FrameProps {
    children: React.ReactNode;
  }
  
  export function Frame({ children }: FrameProps) {
    return (
      <div className="border p-4 rounded-md shadow-sm">
        {children}
      </div>
    );
  }