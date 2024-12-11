// components/docs/note.tsx

import { ReactNode } from 'react';

interface NoteProps {
  children: ReactNode;
}

export function Note({ children }: NoteProps) {
  return (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded-md my-4">
      <strong className="text-blue-700">Note:</strong> {children}
    </div>
  );
}