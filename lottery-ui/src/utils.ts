import { Web3Provider, ExternalProvider} from "@ethersproject/providers";
import {MetaMaskInpageProvider} from "@metamask/providers";
import { ethers } from "ethers";

let ethersProvider: Web3Provider | null = null;

export function getMetamaskProvider(): MetaMaskInpageProvider | null {
    if (window.ethereum) return window.ethereum as MetaMaskInpageProvider;
    return null;
}

export function getEthersProvider(): Web3Provider | null {
    if (ethersProvider) return ethersProvider;

    /**
     * Да, тут довольно криво. Но других способов я не знаю
     */
    const metamaskProvider = getMetamaskProvider() as unknown;
    if (metamaskProvider === null) return null;
    ethersProvider = new Web3Provider(metamaskProvider as ExternalProvider);
    return ethersProvider;
}

/**
 * Unit  wei value  wei  ether value
 *  wei  1 wei  1  10^-18 ETH
 *  kwei  10^3 wei  1,000  10^-15 ETH
 *  mwei  10^6 wei  1,000,000  10^-12 ETH
 *  gwei  10^9 wei  1,000,000,000  10^-9 ETH
 *  microether  10^12 wei  1,000,000,000,000  10^-6 ETH
 *  milliether  10^15 wei  1,000,000,000,000,000  10^-3 ETH
 *  ether  10^18 wei  1,000,000,000,000,000,000  1 ETH
 * @param count 
 */
// export function formatAmount(count: string): string {

// }