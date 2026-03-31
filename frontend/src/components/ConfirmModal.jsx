// components/ConfirmModal.jsx
import React from "react";
import { UserMinus } from "lucide-react";

const ConfirmModal = ({ isOpen, onConfirm, onCancel, friendName }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onCancel} // close on backdrop click
    >
      <div
        className="bg-base-300 rounded-xl p-6 w-full max-w-sm mx-4 space-y-4 shadow-xl"
        onClick={(e) => e.stopPropagation()} // prevent backdrop click from firing inside modal
      >
        <div className="space-y-1">
          <h3 className="text-lg font-semibold">Remove Friend</h3>
          <p className="text-sm text-base-content/60">
            Are you sure you want to remove{" "}
            <span className="text-base-content font-medium">{friendName}</span> from your friends?
          </p>
        </div>

        <div className="flex gap-3 justify-end pt-2">
          <button
            className="btn btn-ghost btn-sm"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="btn btn-error btn-sm"
            onClick={onConfirm}
          >
            <UserMinus className="size-3" />
            Remove
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
