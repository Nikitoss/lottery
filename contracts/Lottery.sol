//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract Lottery {
    address public manager;
    address[] public players;
    uint public lotteryDuration;
    uint public ticketPrice;
    uint public prizeAmount;
    uint public start;

    modifier managerOnly() {
        require(msg.sender == manager, "manager Only");
        _;
    }

    constructor(uint _lotteryDuration, uint _ticketPrice, uint _prizeAmount) {
        manager = msg.sender;
        lotteryDuration = _lotteryDuration;
        ticketPrice = _ticketPrice;
        prizeAmount = _prizeAmount;
        start = block.timestamp;

        console.log("Deploying a Lottery:");
        console.log("manager:", manager);
        console.log("lotteryDuration:", _lotteryDuration);
        console.log("ticketPrice:", _ticketPrice);
        console.log("prizeAmount:", _prizeAmount);
        console.log("start:", start);
    }

    function buyLotteryTicket() public payable {
        console.log("try buy ticket by ", msg.value);
        if (msg.value < ticketPrice) {
            revert("Price is higher");
        }

        console.log("Contract's money is ", address(this).balance);
        console.log("%s is added to players", msg.sender);
        players.push(msg.sender);
    }

    function finishLottery() public managerOnly {
        console.log("try finishLottery");
        require(block.timestamp >= start + lotteryDuration * 1 days, "is not over yet");
        require(address(this).balance > prizeAmount, "doesn't have enough money in the bank");

        uint winnerIndex = pseudoRandom() % players.length;
        address payable winnerAddress = payable(players[winnerIndex]);
        winnerAddress.transfer(prizeAmount);
        players = new address[](0);
    }

    function pseudoRandom() private view returns (uint) {
        return uint(
            keccak256(
                abi.encodePacked(block.difficulty, block.timestamp, players)
            )
        );
    }
}