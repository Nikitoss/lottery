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
    uint256 public lotteryDuration;

    // Стоимость билета
    uint256 public ticketPrice;

    // Размер приза
    uint256 public prizeAmount;

    // Дата начала лотереи
    uint256 public start;

    // Дата конца лотереи
    uint256 public end;

    // Флаг доступности лотереи
    bool public isAlive = true;

    // Адрес менеджера.
    address private manager;

    // Список адресов игроков.
    address[] private players;

    event LotteryTicketPurchased(address player);
    event LotteryFinish(address winner);

    /**
     * @notice Модификатор, проверка, что функции под этим модификатормо может выполнять только менеджер лотереи.
     */
    modifier managerOnly() {
        require(msg.sender == manager, "manager Only");
        _;
    }

    /**
     * @notice Конструктор лотереи. Кто делоит контракт, тот становится администратором.
     *
     * @param _lotteryDuration Длительность лотереи в секундах.
     * @param _ticketPrice Стоимость билета в wei.
     * @param _prizeAmount Размер приза в лотерее в wei.
     */
    constructor(
        uint256 _lotteryDuration,
        uint256 _ticketPrice,
        uint256 _prizeAmount
    ) {
        manager = msg.sender;
        lotteryDuration = _lotteryDuration;
        ticketPrice = _ticketPrice;
        prizeAmount = _prizeAmount;
        start = block.timestamp;
        end = start + _lotteryDuration;

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
        require(isEnded(), "is not over yet");

        address payable winnerAddress;

        // На счету до начала лотереи могут быть уже деньги, поэтому проверка на баланс может не сработать.
        if (players.length > 0) {
            uint256 winnerIndex = pseudoRandom() % players.length;
            winnerAddress = payable(players[winnerIndex]);

            emit LotteryFinish(winnerAddress);
            // console.log("winner is %s %s", winnerAddress, address(winnerAddress).balance);
            players = new address[](0); // Если лотерея одноразовая, строчка не нужна. Если буду переделывать на многоразовую, то оставить

            if (address(this).balance >= prizeAmount) {
                winnerAddress.transfer(prizeAmount);
                // После выплаты выигрыша лотереи победителю, остаток переводим менеджеру.
                selfdestruct(payable(manager));
            } else {
                // Если менеджер не смог набрать достаточное количество участников, чтобы собрать выигрыш, все собранные деньги направляются победителю
                selfdestruct(winnerAddress);
            }
        } else {
            emit LotteryFinish(address(0));
            selfdestruct(payable(manager));
        }
    }

    /**
     * @notice Получить псевдо-рандомное число.
     * @dev Этот метод не рекомендуется использовать в релизе.
     */
    function pseudoRandom() private view returns (uint256) {
        return
            uint256(
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
        // console.log("block.timestamp(%s) end(%s)", block.timestamp, end);
        return block.timestamp >= end;
    }

    /**
        Только для дебага. Потом удалить
     */
    function getTimeStamp() public view returns (uint256) {
        return block.timestamp;
    }
}
