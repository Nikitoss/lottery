import { WalletTwoTone } from "@ant-design/icons";
import { Button, Card, Result } from "antd";
import React from "react";

export function NoWalletDetected() {
    return (
        <Card>
            <Result
                status="error"
                // icon={<WalletTwoTone />}
                title="Не обнаружен кошелек Ethereum"
                subTitle={(
                    <p>
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
                )}
            />
        </Card>
    );
}
