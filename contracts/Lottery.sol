//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";

/**
 * @title Контракт простой одноразовой лотереи.
 * Администратор запускает лотерею. Пользователи вносят эфир.
 * Через некоторое заданное администратором время администратор запускает розыгрыш, один из счетов получает выигрыш, остальные деньги перечисляются администратору, контракт ликвидируется.
 */
contract Lottery {
    // Длительность лотереи
    uint public lotteryDuration;

    // Стоимость билета
    uint public ticketPrice;

    // Размер приза
    uint public prizeAmount;

    // Дата начала лотереи
    uint public start;

    // Дата конца лотереи
    uint public end;

    // Адрес менеджера. 
    address private manager;

    // Список адресов игроков.
    address[] private players;


    event LotteryTicketPurchased(address player);
    event LotteryFinish(address winner);
    // event 

    /**
     * @notice Модификатор, проверка, что функции под этим модификатормо может выполнять только мэнеджер лотереи.
     */
    modifier managerOnly() {
        require(msg.sender == manager, "manager Only");
        _;
    }

    /**
     * @notice Конструктор лотереи. Кто делоит контракт, тот становится администратором.
     *
     * @param _lotteryDuration Длительность лотереи в днях.
     * @param _ticketPrice Стоимость билета в wei.
     * @param _prizeAmount Размер приза в лотерее в wei.
     */
    constructor(uint _lotteryDuration, uint _ticketPrice, uint _prizeAmount) {
        manager = msg.sender;
        lotteryDuration = _lotteryDuration;
        ticketPrice = _ticketPrice;
        prizeAmount = _prizeAmount;
        start = block.timestamp;
        end = start + _lotteryDuration * 1 days;

        // console.log("\t %cDeploying a Lottery:", "font-style: bold");
        // console.log("\t   manager:", manager);
        // console.log("\t   lotteryDuration:", _lotteryDuration);
        // console.log("\t   ticketPrice:", _ticketPrice);
        // console.log("\t   prizeAmount:", _prizeAmount);
        // console.log("\t   start:", start);
        // console.log("\t   end:", end);
    }

    /**
     * @notice Покупка лотерейного билета при помощи вызова функции.
     */
    function buyLotteryTicket() public payable {
        // console.log("Try buy ticket for ", msg.value, msg.sender);
        require(msg.value == ticketPrice, "Price is wrong");
        require(!isEnded(), "Lottery is over");

        // console.log("Contract's money is ", address(this).balance);
        players.push(msg.sender);
        // console.log("%s is added to players/ Player's count is %s", msg.sender, players.length);
        emit LotteryTicketPurchased(msg.sender);
    }

    /**
     * @notice Покупка лотерейного билета просто при помощи кидания денег на адрес лотереи.
     */
    receive() external payable {
        buyLotteryTicket();
    }

    /**
     * @notice Закончить лотерею. 
     */
    function finishLottery() public managerOnly {
        // console.log("try finishLottery");
        require(block.timestamp >= end, "is not over yet");

        address payable winnerAddress;

        // На счету до начала лотереи могут быть уже деньги, поэтому проверка на баланс может не сработать.
        if (players.length > 0) {
            uint winnerIndex = pseudoRandom() % players.length;
            winnerAddress = payable(players[winnerIndex]);

            emit LotteryFinish(winnerAddress);
            // console.log("winner is %s %s", winnerAddress, address(winnerAddress).balance);
            players = new address[](0); // Если лотерея одноразовая, строчка не нужна. Если буду переделывать на многоразовую, то оставить

            // На счету лотереи должно быть чуть больше денег, чем для выирыша, потому что нужно заплатить за транзацию.
            // Я не знаю, сколько стоит транзация, поэтому считаю, что в среднем тратится 2300 gas (есть мнение что 21000)
            // Альтернативный вариант - пусть победитель сам оплачивает транзакцию, то есть из выигрыша вычесть сумму за газ.
            if (address(this).balance > (prizeAmount + tx.gasprice*2300)) {
                winnerAddress.transfer(prizeAmount);
                // После выплаты выигрыша лотереи победителю, остаток переводим менеджеру.
                selfdestruct(payable(manager));
            } else {
                // Если менеджер не смог набрать достаточное количество участников, чтобы собрать выигрыш, все собранные деньги направляются победителю
                selfdestruct(winnerAddress);
            }
        } else {
            selfdestruct(payable(manager));   
        }
    }

    /**
     * @notice Получить псевдо-рандомное число.
     * @dev Этот метод не рекомендуется использовать в релизе.
     */
    function pseudoRandom() private view returns (uint) {
        return uint(
            keccak256(
                abi.encodePacked(block.difficulty, block.timestamp, players)
            )
        );
    }

    /**
     * @notice Способ узнать, является ли вызывающий эту функцию менеджером
     */
    function isManager() public view returns (bool) {
        return msg.sender == manager;
    }

    /**
     * @notice Получить список адресов участников.
     * @dev Не знаю, можно ли разглашать эту информацию, но пусть будет.
     */
    function getPlayers() public view returns (address[] memory) {
        return players;
    }

    /**
     * @notice Узнать, закончилась ли уже лотерея.
     */
    function isEnded() public view returns (bool) {
        return block.timestamp >= end;
    }
}