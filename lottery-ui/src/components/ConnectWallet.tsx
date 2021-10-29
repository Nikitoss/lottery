import React from "react";

import { NetworkErrorMessage } from "./NetworkErrorMessage";

interface IProps {
    connectWallet: () => void;
    networkError?: string;
    dismiss: () => void;
}

export function ConnectWallet({ connectWallet, networkError, dismiss }: IProps) {
  return (
    <div className="min-h-screen flex flex-col justify-center">
        <div className="text-center mx-auto">
          {/* Metamask network should be set to Localhost:8545. */}
          {networkError && (
            <NetworkErrorMessage 
              message={networkError} 
              dismiss={dismiss} 
            />
          )}
        </div>
        <div className="col-6 p-4 text-center">
          <p>Пожалуйста, подключите кошелёк</p>
          <button
            className="py-2 px-4 my-1 font-semibold rounded-lg shadow-md text-white bg-green-500 hover:bg-green-700"
            type="button"
            onClick={connectWallet}
          >
            Подключить кошелёк
          </button>
        </div>
    </div>
  );
}
