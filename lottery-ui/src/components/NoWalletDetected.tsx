import React from "react";

export function NoWalletDetected() {
  return (
    <div className="min-h-screen flex flex-col justify-center">
      <div className="row justify-content-md-center">
        <div className="col-6 p-4 text-center">
          <p>
            Не обнаружен кошелек Ethereum. <br />
            Пожалуйста, установите{" "}
            <a
              href="http://metamask.io"
              target="_blank"
              rel="noopener noreferrer"
            >
              MetaMask
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
