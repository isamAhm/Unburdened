"use client";

import React from "react";

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Delete", cancelText = "Cancel", isDangerous = true }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[70] p-4">
            <div className="bg-[#1E1E1E] rounded-lg w-full max-w-md border border-[#2A2A2A] shadow-xl">
                <div className="p-6">
                    <h3 className="text-lg font-medium text-white mb-2">{title}</h3>
                    <p className="text-sm text-[#A4A4A4] mb-6">{message}</p>

                    <div className="flex gap-3 justify-end">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 rounded text-sm bg-[#2A2A2A] text-white hover:bg-[#353535] transition-colors"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                            className={`px-4 py-2 rounded text-sm transition-colors ${isDangerous
                                    ? "bg-red-600 text-white hover:bg-red-700"
                                    : "bg-[#3E7BFA] text-white hover:bg-[#4C86FF]"
                                }`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
