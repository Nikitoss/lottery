import { Card, Skeleton, Statistic } from "antd";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { getEthersProvider } from "utils";

interface IProps {
    address: string;
    addError: (error: string) => void;
}

export const AccountCard = ({ address, addError }: IProps) => {
    const [balance, setBalance] = useState('0');
    const [loading, setLoading] = useState(true);
    const color1 = address.substr(2, 6);
    const color2 = address.substring(address.length - 6, address.length);

    // console.log(color1, color2);

    useEffect(() => {
        console.log(`AccountCard setInterval ${address}`);
        const id = setInterval(() => {
            const ether = getEthersProvider();
            ether?.getBalance(address).then((newBalance) => {
                setBalance(ethers.utils.formatEther(newBalance));
                setLoading(false);
            }, addError);
        }, 1000);

        return () => {
            console.log(`AccountCard clearInterval ${address}`);
            clearInterval(id);
        };
    })

    // useEffect(() => {
    //     const ether = getEthersProvider();
    //     ether?.getBalance(address).then((newBalance) => {
    //         setBalance(ethers.utils.formatEther(newBalance));
    //         setLoading(false);
    //     }, addError);
    // });

    return (
        <Card
            title={`💳 ${address}`}
            headStyle={{
                color: "white",
                background: `linear-gradient(to bottom right, #${color1}, #${color2})`,
                fontFamily: 'monospace'
                // background: `linear-gradient(to bottom right, #${color1}, #888)`
                // background: `#${color1}`
            }}
        // style={{minWidth:"300px", minHeight:"100px"}}
        // style={{maxWidth: "480px"}}
        >
            <Skeleton loading={loading} active>
                <Statistic title="Баланс" prefix="ETH" value={balance} />
            </Skeleton>
        </Card>
    );
}