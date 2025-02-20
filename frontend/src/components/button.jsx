"use client";
import React from "react";

// some comments reusable component
function Button({ text, keyboardCommand, onClick }) {
  return (
    <button
      className="inline-flex items-center justify-center px-4 py-2 bg-[#1E1E1E] text-white border border-[#2A2A2A] rounded-lg hover:bg-[#2A2A2A] transition-colors duration-200"
      onClick={onClick}
    >
      <span>{text}</span>
      {keyboardCommand && (
        <span className="ml-2 px-1.5 py-0.5 text-xs bg-[#2A2A2A] text-white rounded">
          {keyboardCommand}
        </span>
      )}
    </button>
  );
}

function ButtonStory() {
  return (
    <div className="p-4 space-y-4">
      <Button text="Click me" />
      <Button text="Save" keyboardCommand="⌘S" />
      <Button text="Open" keyboardCommand="⌘O" />
    </div>
  );
}

export default Button;