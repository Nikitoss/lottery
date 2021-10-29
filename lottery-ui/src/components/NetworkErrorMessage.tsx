import React from "react";

type TProps = {
    message?: string;
    dismiss: () => void;
}

export function NetworkErrorMessage({ message, dismiss }: TProps) {
  return (
    <div className="p-2 px-4 my-1 rounded-lg text-xs text-black bg-red-100" role="alert">
      {message}
      <button
        type="button"
        className="close"
        data-dismiss="alert"
        aria-label="Close"
        onClick={dismiss}
      >
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
  );
}
