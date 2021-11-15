import { WalletTwoTone } from "@ant-design/icons";
import { Maybe } from "@metamask/providers/dist/utils";
import { Button, Divider, Layout, Space, Typography } from "antd";
import { ethers } from "ethers";
// import { EthereumContext } from "Contexts/EthereumContext";
// import { EthersContext } from "Contexts/EthersContext";
import { useEffect, useState } from "react";
import { getEthersProvider, getMetamaskProvider } from "utils";


interface IProps {
    address: string;
    setAddress: (address: string) => void;
} 

export function Header({address, setAddress}: IProps) {
    const [balance, setBalance] = useState('0');

    useEffect(() => {
        const af = async () => {
            const balance = await getEthersProvider()?.getBalance(address);
            setBalance((prevBalance) => balance?.toString() || prevBalance);
        }
        address && af();
    }, [address]);

    const connectWallet = async () => {
        const metaMaskProvider = getMetamaskProvider();
        if(metaMaskProvider === null) return;

        const selectedAddress: Maybe<string[]> = await metaMaskProvider.request?.({ method: 'eth_requestAccounts' });
        setAddress(selectedAddress?.[0] || '');

        metaMaskProvider.on("accountsChanged", (newAddresses) => {
            const adresses = newAddresses as Maybe<string[]>;
            //  TODO Как делать отписку от событий?
            setAddress && setAddress(adresses?.[0] || '');
        })
    }

    return (
        <Layout.Header
            className="site-layout-background site-header"
        >
            <Typography.Title level={2} className="logo">
                💸 Лотерея
            </Typography.Title>

            {
                address ?
                    (
                        <Space split={<Divider type="vertical" />}>
                            <Typography.Text className="monospace">{`💳 ${address}`}</Typography.Text>
                            <Typography.Text strong>{`ETH ${ethers.utils.formatEther(balance)}`}</Typography.Text>
                        </Space>
                    ) : (
                        <Button
                            type="primary"
                            icon={<WalletTwoTone />}
                            shape="round"
                            onClick={connectWallet}
                            disabled={!getMetamaskProvider()}
                        >
                            Указать счёт
                        </Button>
                    )
            }
        </Layout.Header>
    );
}