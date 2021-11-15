import { Layout, Row, Space } from "antd";
import { useState } from "react";
import { getEthersProvider, getMetamaskProvider } from "utils";
import { LotteryAddressForm } from "./LotteryAddressForm";
import { NoWalletDetected } from "./NoWalletDetected";
import { Lottery, LotteryInterface } from '../typechain/Lottery';
import { LotteryInfo } from "./LotteryInfo";
import { ErrorList } from "./ErrorList";
import { ethers } from "ethers";
import LotteryArtefact from "Lottery.sol/Lottery.json";


interface IProps {
    address: string;
}

let lottery: Lottery | undefined = undefined;

export function Content({ address }: IProps) {
    // const [lotteryAddress, setLotteryAddress] = useState("0x5FbDB2315678afecb367f032d93F642f64180aa3");
    const [lotteryAddress, setLotteryAddress] = useState("");
    const [errorList, setErrorList] = useState<string[]>(["Пробная ошибка"]);

    const handleCreateNewLottery = async () => {

        // var _lotteryDuration = /* var of type uint256 here */ ;
        // var _ticketPrice = /* var of type uint256 here */ ;
        // var _prizeAmount = /* var of type uint256 here */ ;
        // var lotteryContract = new web3.eth.Contract([{ "inputs": [{ "internalType": "uint256", "name": "_lotteryDuration", "type": "uint256" }, { "internalType": "uint256", "name": "_ticketPrice", "type": "uint256" }, { "internalType": "uint256", "name": "_prizeAmount", "type": "uint256" }], "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "winner", "type": "address" }], "name": "LotteryFinish", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "player", "type": "address" }], "name": "LotteryTicketPurchased", "type": "event" }, { "inputs": [], "name": "buyLotteryTicket", "outputs": [], "stateMutability": "payable", "type": "function" }, { "inputs": [], "name": "end", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "finishLottery", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "getPlayers", "outputs": [{ "internalType": "address[]", "name": "", "type": "address[]" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "isAlive", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "isEnded", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "isManager", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "lotteryDuration", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "prizeAmount", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "start", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "ticketPrice", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "stateMutability": "payable", "type": "receive" }]);
        // var lottery = lotteryContract.deploy({
        //     data: '0x60806040526001600560006101000a81548160ff0219169083151502179055503480156200002c57600080fd5b506040516200116b3803806200116b8339818101604052810190620000529190620000e5565b33600560016101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508260008190555081600181905550806002819055504260038190555082600354620000bf919062000141565b600481905550505050620001f6565b600081519050620000df81620001dc565b92915050565b600080600060608486031215620001015762000100620001d7565b5b60006200011186828701620000ce565b93505060206200012486828701620000ce565b92505060406200013786828701620000ce565b9150509250925092565b60006200014e826200019e565b91506200015b836200019e565b9250827fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff03821115620001935762000192620001a8565b5b828201905092915050565b6000819050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b600080fd5b620001e7816200019e565b8114620001f357600080fd5b50565b610f6580620002066000396000f3fe6080604052600436106100a05760003560e01c80638b5b9ccc116100645780638b5b9ccc14610177578063a4fd6f56146101a2578063a56b21ae146101cd578063be9a6555146101d7578063c56a3e8814610202578063efbe1c1c1461022d576100af565b80631209b1f6146100b45780632c906ba2146100df5780632d97902f146100f65780634136aa3514610121578063785fa6271461014c576100af565b366100af576100ad610258565b005b600080fd5b3480156100c057600080fd5b506100c9610380565b6040516100d69190610b6f565b60405180910390f35b3480156100eb57600080fd5b506100f4610386565b005b34801561010257600080fd5b5061010b610658565b6040516101189190610b6f565b60405180910390f35b34801561012d57600080fd5b5061013661065e565b6040516101439190610ad4565b60405180910390f35b34801561015857600080fd5b50610161610671565b60405161016e9190610b6f565b60405180910390f35b34801561018357600080fd5b5061018c610677565b6040516101999190610ab2565b60405180910390f35b3480156101ae57600080fd5b506101b7610705565b6040516101c49190610ad4565b60405180910390f35b6101d5610258565b005b3480156101e357600080fd5b506101ec610712565b6040516101f99190610b6f565b60405180910390f35b34801561020e57600080fd5b50610217610718565b6040516102249190610ad4565b60405180910390f35b34801561023957600080fd5b50610242610770565b60405161024f9190610b6f565b60405180910390f35b600154341461029c576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161029390610b4f565b60405180910390fd5b6102a4610705565b156102e4576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016102db90610b2f565b60405180910390fd5b6006339080600181540180825580915050600190039060005260206000200160009091909190916101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055507f78f1fe1361ea33087a529164ff7e72628f02d1f91f74538ec8a77124eb943658336040516103769190610a7c565b60405180910390a1565b60015481565b600560019054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614610416576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161040d90610aef565b60405180910390fd5b60045442101561045b576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161045290610b0f565b60405180910390fd5b600080600680549050111561061d57600060068054905061047a610776565b6104849190610d7e565b90506006818154811061049a57610499610e0d565b5b9060005260206000200160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1691507fa1d3827f368523540ef9de63fc95fbde159608afc4a28327d34f5799c423a0df826040516104f69190610a97565b60405180910390a1600067ffffffffffffffff81111561051957610518610e3c565b5b6040519080825280602002602001820160405280156105475781602001602082028036833780820191505090505b506006908051906020019061055d9291906107ac565b506108fc3a61056c9190610c62565b6002546105799190610c0c565b471115610604578173ffffffffffffffffffffffffffffffffffffffff166108fc6002549081150290604051600060405180830381858888f193505050501580156105c8573d6000803e3d6000fd5b50600560019054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16ff5b8173ffffffffffffffffffffffffffffffffffffffff16ff5b600560019054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16ff5b60005481565b600560009054906101000a900460ff1681565b60025481565b606060068054806020026020016040519081016040528092919081815260200182805480156106fb57602002820191906000526020600020905b8160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190600101908083116106b1575b5050505050905090565b6000600454421015905090565b60035481565b6000600560019054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614905090565b60045481565b60004442600660405160200161078e93929190610a43565b6040516020818303038152906040528051906020012060001c905090565b828054828255906000526020600020908101928215610825579160200282015b828111156108245782518260006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550916020019190600101906107cc565b5b5090506108329190610836565b5090565b5b8082111561084f576000816000905550600101610837565b5090565b600061085f8383610892565b60208301905092915050565b600061087783836108b0565b60208301905092915050565b61088c81610d24565b82525050565b61089b81610cdc565b82525050565b6108aa81610cdc565b82525050565b6108b981610cdc565b82525050565b60006108ca82610baf565b6108d48185610bdf565b93506108df83610b8a565b8060005b838110156109105781516108f78882610853565b975061090283610bc5565b9250506001810190506108e3565b5085935050505092915050565b600061092882610bba565b6109328185610bf0565b935061093d83610b9a565b8060005b838110156109755761095282610e6b565b61095c888261086b565b975061096783610bd2565b925050600181019050610941565b5085935050505092915050565b61098b81610cee565b82525050565b600061099e600c83610bfb565b91506109a982610e8b565b602082019050919050565b60006109c1600f83610bfb565b91506109cc82610eb4565b602082019050919050565b60006109e4600f83610bfb565b91506109ef82610edd565b602082019050919050565b6000610a07600e83610bfb565b9150610a1282610f06565b602082019050919050565b610a2681610d1a565b82525050565b610a3d610a3882610d1a565b610d74565b82525050565b6000610a4f8286610a2c565b602082019150610a5f8285610a2c565b602082019150610a6f828461091d565b9150819050949350505050565b6000602082019050610a9160008301846108a1565b92915050565b6000602082019050610aac6000830184610883565b92915050565b60006020820190508181036000830152610acc81846108bf565b905092915050565b6000602082019050610ae96000830184610982565b92915050565b60006020820190508181036000830152610b0881610991565b9050919050565b60006020820190508181036000830152610b28816109b4565b9050919050565b60006020820190508181036000830152610b48816109d7565b9050919050565b60006020820190508181036000830152610b68816109fa565b9050919050565b6000602082019050610b846000830184610a1d565b92915050565b6000819050602082019050919050565b60008190508160005260206000209050919050565b600081519050919050565b600081549050919050565b6000602082019050919050565b6000600182019050919050565b600082825260208201905092915050565b600081905092915050565b600082825260208201905092915050565b6000610c1782610d1a565b9150610c2283610d1a565b9250827fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff03821115610c5757610c56610daf565b5b828201905092915050565b6000610c6d82610d1a565b9150610c7883610d1a565b9250817fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0483118215151615610cb157610cb0610daf565b5b828202905092915050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000610ce782610cfa565b9050919050565b60008115159050919050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000819050919050565b6000610d2f82610d36565b9050919050565b6000610d4182610d48565b9050919050565b6000610d5382610cfa565b9050919050565b6000610d6d610d6883610e7e565b610cbc565b9050919050565b6000819050919050565b6000610d8982610d1a565b9150610d9483610d1a565b925082610da457610da3610dde565b5b828206905092915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601260045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b6000610e778254610d5a565b9050919050565b60008160001c9050919050565b7f6d616e61676572204f6e6c790000000000000000000000000000000000000000600082015250565b7f6973206e6f74206f766572207965740000000000000000000000000000000000600082015250565b7f4c6f7474657279206973206f7665720000000000000000000000000000000000600082015250565b7f50726963652069732077726f6e6700000000000000000000000000000000000060008201525056fea26469706673582212200da9db6b656179caa2498edfb719347e37944cd8d3bd04e335a540c4a9b5689364736f6c63430008070033',
        //     arguments: [
        //         _lotteryDuration,
        //         _ticketPrice,
        //         _prizeAmount,
        //     ]
        // }).send({
        //     from: web3.eth.accounts[0],
        //     gas: '4700000'
        // }, function (e, contract) {
        //     console.log(e, contract);
        //     if (typeof contract.address !== 'undefined') {
        //         console.log('Contract mined! address: ' + contract.address + ' transactionHash: ' + contract.transactionHash);
        //     }
        // })

        // TODO

        const signer = getEthersProvider()?.getSigner(address || 0);

        const lotteryFactory = new ethers.ContractFactory(
            LotteryArtefact.abi,
            LotteryArtefact.bytecode,
            signer
        );

        const lottery = await lotteryFactory.deploy(5 * 60, ethers.utils.parseEther("0.01"), ethers.utils.parseEther("0.12"));
        await lottery.deployed();
        setLotteryAddress(lottery.address);
        console.log("\t📍lottery.address: %s", lottery.address);
    }

    const handleAddError = (error: any) => {
        debugger;
        let e = error?.message || error.toString();

        setErrorList((errorList: string[]) => {
            return [...errorList, e];
        });
    }

    const metamaskProvider = getMetamaskProvider();

    return (
        <Layout.Content
            className="site-layout-content"
        >
            <ErrorList errors={errorList} />
            {!metamaskProvider && (<NoWalletDetected />)}
            {metamaskProvider && !lotteryAddress && (
                <LotteryAddressForm
                    setLotteryAddress={setLotteryAddress}
                    createNewLottery={handleCreateNewLottery}
                />
            )}
            {metamaskProvider && lotteryAddress && (
                <LotteryInfo
                    signerAddress={address}
                    lotteryAddress={lotteryAddress}
                    addError={handleAddError}
                />

            )}

        </Layout.Content>
    );
}