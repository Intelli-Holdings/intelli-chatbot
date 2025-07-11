import React from 'react';
import Workground from './Workground';

export function WorkgroundDialog({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[90vw] max-w-4xl max-h-[90vh] overflow-auto">
        <div className="flex justify-end">
          <button onClick={onClose} className="p-2">×</button>
        </div>
        <Workground />
      </div>
    </div>
  );
}