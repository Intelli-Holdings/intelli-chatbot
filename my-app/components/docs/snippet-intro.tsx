// components/docs/snippet-intro.tsx

interface SnippetIntroProps {
    children: React.ReactNode;
  }
  
  export function SnippetIntro({ children }: SnippetIntroProps) {
    return (
      <div className="snippet-intro">
        {children}
      </div>
    );
  }