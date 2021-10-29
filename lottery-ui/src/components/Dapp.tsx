import React from "react";
import { ConnectWallet } from "./ConnectWallet";
import { NoWalletDetected } from "./NoWalletDetected";
import detectEthereumProvider from '@metamask/detect-provider';
import { MetaMaskInpageProvider } from '@metamask/providers';
import {Maybe} from "@metamask/providers/dist/utils";
// We'll use ethers to interact with the Ethereum network and our contract
import {ethers, Contract} from "ethers";
import {ExternalProvider, Web3Provider, JsonRpcSigner} from "@ethersproject/providers";
import LotteryArtefact from "../contracts/Lottery.json";
// import LotteryArtefact from "../../../artifacts/contracts/Lottery.sol/Lottery.json";
// import { Lottery } from "../contracts/Lottery";
import { Lottery } from "../../../typechain/Lottery";
import { AdminPage } from "./AdminPage";
import { Account } from "./Account";
import { Accounts } from "./Accounts";


// При работе с rardHat window.ethereum.networkVersion === HARDHAT_NETWORK_ID 
const HARDHAT_NETWORK_ID = '31337';

const LOTTERY_ADDRESS = '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0';

interface IProps {

}

interface IState {
    selectedAddresses: string[];
    networkError?: string;

    isEthereumProviderDetected: boolean;
    
    manager?: string;
    lotteryDuration?: string;
    ticketPrice?: string;
    prizeAmount?: string;
    start?: string;
    isAdministrator?: boolean;

}

interface ILotteryData {

}

export class Dapp extends React.Component<IProps, IState> {

    _ethereum?: MetaMaskInpageProvider;
    _provider?: ethers.providers.Web3Provider;
    _lottery?: Lottery;
    _signer?: ethers.providers.JsonRpcSigner;

    state: IState = {
        selectedAddresses: [],
        isEthereumProviderDetected: false,
    };

    componentDidMount() {
        detectEthereumProvider().then(
            (provider) => {
                this._ethereum = provider as MetaMaskInpageProvider;
                this.setState({
                    isEthereumProviderDetected: !!provider 
                });
            }
        )
    }


    //TODO
    /**
     * Если ты владелец лотереи, то у тебя будут доступны кнопки "Запустить лоттерею, закончить лотерею"
     * @returns 
     */
    isAdministator = (): boolean => {
        return true;
        // return await this._lottery?.manager() === this.state.selectedAddresses?.[0];
    }

    /**
     * Хэндлер подключения кошелька.
     * @returns 
     */
    connectWallet = async () => {
        const ethereum = this._ethereum;

        if (!ethereum) return;

        // Получаем адреса, которые пользователь выберет в метамаске
        const selectedAddress = await ethereum.request<string[]>({ method: 'eth_requestAccounts' });

        // Проверили, что метамаск подключен к тестовой сети hardHeat
        if (!this.checkNetwork()) {
            return;
        }

        // Проверили, что список адресов не пуст
        if (!this.checkAddress(selectedAddress)) {
            return;
        }

        this.initialize(selectedAddress as string[]);

        // // We reinitialize it whenever the user changes their account.
        ethereum.on("accountsChanged", (newAddresses) => {
            console.log("accountsChanged");
            this.initialize(newAddresses as string[]);
        });
        
        // // We reset the dapp state if the network is changed
        // ethereum.on("networkChanged", ([networkId]) => {
        //     this._stopPollingData();
        //     this._resetState();
        // });
    }


    /**
     * Проверка, что пользователь выбрал не пустое множество адресов.
     * @param addresses 
     * @returns 
     */
    checkAddress(addresses: Maybe<string[]>): boolean {
        if (!addresses || addresses.length === 0) {
            this.setState({
                networkError: 'Список выбранных адресов пуст'
            });
            return false;
        }

        return true;
    }

    // Метод проверяет, что Metamask подключён к сети Localhost:8545 
    checkNetwork() {
        const ethereum = this._ethereum;

        if (ethereum?.networkVersion === HARDHAT_NETWORK_ID) {
            return true;
        }

        this.setState({ 
            networkError: 'Пожалуйста, подключите Metamask к Localhost:8545'
        });

        return false;
    }

    /**
     * Здесь идёт инициализация приложения данными.
     * 
     * @param userAddresses Список счётов подключенных пользователем.
     */
    initialize(userAddresses: string[]) {
        // This method initializes the dapp
    
        // We first store the user's address in the component's state
        this.setState({
          selectedAddresses: userAddresses,
        });

        // Точно ли нужно обновлять?
        this.intializeEthers().then(() => this.getLotteryData());
    }

    /**
     * Инициализация библиотеки ethers.
     */
    async intializeEthers() {
        // Та как window.ethereum не типизирован, а я его попытался типизировать, то приходится кастовать тип через unknown
        const proxy_provider = this._ethereum as unknown;

        this._provider = new ethers.providers.Web3Provider(proxy_provider as ExternalProvider) ;
        this._signer = this._provider.getSigner();

        
        // Это проверка, что LOTTERY_ADDRESS - это контракт, а не просто адрес
        // console.log("this.state.selectedAddresses[0]", await this._provider.getCode(this.state.selectedAddresses[0]));
        // console.log(await this._provider.getCode(LOTTERY_ADDRESS));

        // When, we initialize the contract using that provider and the token's
        // artifact. You can do this same thing with your contracts.
        this._lottery = new ethers.Contract(
          LOTTERY_ADDRESS,
          LotteryArtefact.abi,
          this._provider.getSigner(0)
        ) as Lottery;
      }


     getLotteryData = async () => {

         this._lottery?.manager().then((manager) => {
            console.log(manager);
            this.setState({manager: manager});
        }, (error) => {
            debugger;
            console.error(error);
        });

        const lotteryDuration = await this._lottery?.lotteryDuration();
        console.log("lotteryDuration ", lotteryDuration?.toNumber());
        this.setState({lotteryDuration: lotteryDuration?.toString()});

        const ticketPrice = await this._lottery?.ticketPrice();
        console.log("ticketPrice: ", ticketPrice?.toNumber());
        this.setState({ticketPrice: ticketPrice?.toString()});

        const prizeAmount = await this._lottery?.prizeAmount();
        console.log("prizeAmount: ", prizeAmount?.toNumber());
        this.setState({prizeAmount: prizeAmount?.toString()});

        const start = await this._lottery?.start();
        console.log("start: ", start?.toNumber());
        this.setState({start: start?.toString()});

        const manager = await this._lottery?.manager();
        const isAdministrator = manager === this.state.selectedAddresses?.[0];
        console.log("isAdministrator: ", isAdministrator, manager);
        this.setState({isAdministrator})
    }

    dismissNetworkError = () => {
        this.setState({networkError: ''});
    }

    buyTicket = async() => {
        await this._lottery?.buyLotteryTicket({value: this.state.ticketPrice});
        console.log("LOTTERY_BALANCE: ", (await this._provider?.getBalance(LOTTERY_ADDRESS))?.toNumber());
    }

    endLottery = async() => {
        await this._lottery?.finishLottery();
    }

    render() {

        const {selectedAddresses} = this.state;
        
        // @ts-ignore
        if (!this._ethereum) {
            return <NoWalletDetected />;
        }

        if (!selectedAddresses || selectedAddresses.length === 0) {
            return (
                <ConnectWallet 
                    connectWallet={this.connectWallet} 
                    networkError={this.state.networkError}
                    dismiss={this.dismissNetworkError}
              />
            );
        }

        // if (this.state.selectedAddresses.length === 1) {
        //     return (<AdminPage/>);
        // }

        return (
            <>
                <Accounts addresses={this.state.selectedAddresses}/>


                <div>
                    {this.state.isAdministrator ? "Вы администратор" : "Вы можете купить лотерейный билет"}
                </div>

                <button
                    className="py-2 px-4 my-1 font-semibold rounded-lg shadow-md text-white bg-green-500 hover:bg-green-700"
                    type="button"
                    onClick={this.buyTicket}
                >
                    Купить билет
                </button>

                <button
                    className="py-2 px-4 my-1 font-semibold rounded-lg shadow-md text-white bg-green-500 hover:bg-green-700"
                    type="button"
                    onClick={this.endLottery}
                >
                    Закончить лотерею
                </button>
            </>
        );
    }
}