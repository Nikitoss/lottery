import { MetaMaskInpageProvider } from "@metamask/providers";
import { ethers } from "ethers";
import { Lottery } from "../../typechain";

interface IProvider {
    ethereum?: MetaMaskInpageProvider;
    provider?: ethers.providers.Web3Provider;
    lottery?: Lottery;
    signer?: ethers.providers.JsonRpcSigner;
}

export const provider: IProvider = {};