import React from "react";

const SupportActionsDropdown = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-4 max-w-lg w-full">
        <input
          type="text"
          className="w-full p-2 border rounded-lg mb-4"
          placeholder="Search actions"
        />
        <ul className="space-y-2">
          <li className="flex items-center justify-between py-2 px-4 hover:bg-gray-100 cursor-pointer">
            <span>Use macro</span>
            <span className="text-gray-400">\</span>
          </li>
          <li className="flex items-center justify-between py-2 px-4 hover:bg-gray-100 cursor-pointer">
            <span>Insert emoji</span>
            <span className="text-gray-400">:</span>
          </li>
          <li className="flex items-center justify-between py-2 px-4 hover:bg-gray-100 cursor-pointer">
            <span>Write a note</span>
            <span className="text-gray-400">N</span>
          </li>
          <li className="flex items-center justify-between py-2 px-4 hover:bg-gray-100 cursor-pointer">
            <span>Close</span>
            <span className="text-gray-400">Esc</span>
          </li>
          <li className="flex items-center justify-between py-2 px-4 hover:bg-gray-100 cursor-pointer">
            <span>Snooze</span>
            <span className="text-gray-400">Z</span>
          </li>
          <li className="flex items-center justify-between py-2 px-4 hover:bg-gray-100 cursor-pointer">
            <span>Upload attachment</span>
            <span className="text-gray-400">Ctrl + A</span>
          </li>
          <li className="flex items-center justify-between py-2 px-4 hover:bg-gray-100 cursor-pointer">
            <span>Insert GIF</span>
            <span className="text-gray-400">G</span>
          </li>
        </ul>
        <div className="flex justify-between items-center text-gray-400 mt-4">
          <span>↑↓ to navigate</span>
          <span>Enter to select</span>
          <span>Esc to close</span>
        </div>
      </div>
    </div>
  );
};

export default SupportActionsDropdown;
