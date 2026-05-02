"use client";
import React from "react";

// Reusable button component
function Button({ text, keyboardCommand, onClick, disabled = false, className = "" }) {
  return (
    <button
      className={`inline-flex items-center justify-center px-4 py-2 bg-[#1E1E1E] text-white border border-[#2A2A2A] rounded-lg hover:bg-[#2A2A2A] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      onClick={onClick}
      disabled={disabled}
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

export default Button;