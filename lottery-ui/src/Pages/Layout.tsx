import { Layout } from "antd";
import { Header } from "Components/Header";
import { Content } from "Components/Content";
import { Footer } from "Components/Footer";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import "@metamask/detect-provider";
import { getEthersProvider } from "utils";

const initialProvider = getEthersProvider()?.getSigner()?._address;

/**
 * 
 * @returns 
 */
export function LayoutApp() {
    const [address, setAddress] = useState<string>('');

    useEffect(() => {
        console.log("constructor LayoutApp")
        getEthersProvider()?.getSigner()?.getAddress().then(setAddress).catch(() => console.error);
    }
    );

    return (
        <Layout className="site-layout">
            <Header
                address={address}
                setAddress={setAddress}
            />
            <Content
                address={address}
            />
            <Footer />
        </Layout>
    );
}