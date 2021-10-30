import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Lottery } from "../typechain";
import { ContractTransaction } from "ethers";

const { time } = require('@openzeppelin/test-helpers');


describe("Lottery", function() {
  const lotteryDuration = 1; //days
  //                                    40000000000000 - average cost of empty transaction
  //                                   130000000000000 - average cost of transaction
  const ticketPrice = ethers.utils.parseEther("0.01");
  const prizeAmount = ethers.utils.parseEther("0.12");  
  let lottery: Lottery;
  let addrs: SignerWithAddress[];
  let [manager, addr1, addr2, addr3, addr4, addr5, addr6, ...addr]: SignerWithAddress[] = [];
  let lotteryAddress: SignerWithAddress;


  this.beforeAll(async function () {
    const LotteryFactory = await ethers.getContractFactory("Lottery");
    [manager, addr1, addr2, addr3, addr4, addr5, addr6, ...addr] = await ethers.getSigners();
    lottery = await LotteryFactory.deploy(lotteryDuration, ticketPrice, prizeAmount);
    await lottery.deployed();
    lotteryAddress = await ethers.getSigner(lottery.address);
    console.log("\t%clottery.address: %s", "font-style: bold", lottery.address);
    // const balance = await ethers.provider.getBalance(lottery.address);
    // console.log("lottery balance: ", balance.toString());
  });

  describe("Деплой", function() {
    it("Инициализация лотереи", async function () {
      expect(await lottery.isManager()).to.equal(true, "Менеджер установлен не верно");
      expect(await lottery.lotteryDuration()).to.equal(lotteryDuration, "Длительность лотереи установлена не верно");
      expect(await lottery.ticketPrice()).to.equal(ticketPrice, "Стоимость билета установлена не верно");
      expect(await lottery.prizeAmount()).to.equal(prizeAmount, "Размер приза установлен не верно");
      const players = await lottery.getPlayers();
      expect(players.length).to.equal(0, "Список участников в начале лотереи не пуст");
      expect(await lottery.isEnded()).to.equal(false, "Лотерея неожидано кончилась");
    })
  });

  describe("Покупка лотерейного билета", function() {
    it("HappyPath, покупка через функцию 'buyLotteryTicket'", async function () {
      // Смысла проверять, не закончилась ли лотерея не очень много, но пусть будет.
      expect(await lottery.isEnded()).to.equal(false, "Лотерея неожидано кончилась");
      let players = await lottery.getPlayers();
      expect(players.length).to.equal(0, "Список участников в начале лотереи не пуст");

      // const initialAddr1Balance = await addr1.getBalance();
      await expect(await lottery.connect(addr1).buyLotteryTicket({value: ticketPrice}), "Лотерея получила отличное от цены билета количество эфира").to.changeEtherBalance(lotteryAddress, ticketPrice);

      // const endBalance = await addr1.getBalance();
      // const diff = initialAddr1Balance.sub(endBalance);
      // const tax = diff.sub(ticketPrice);
      // console.log("Buy %s - %s = %s, tax = %s", ethers.utils.formatEther(initialAddr1Balance), ethers.utils.formatEther(endBalance), ethers.utils.formatEther(diff), ethers.utils.formatEther(tax));

      expect(await lottery.isEnded(), "Лотерея неожидано кончилась").to.equal(false);
      players = await lottery.getPlayers();
      expect(players.length).to.equal(1, "Количество участников лотереи не верно");
      expect(players[0]).to.equal(await addr1.getAddress(), "В списке игроков неожиданный участник");

      await expect(await lottery.connect(addr1).buyLotteryTicket({value: ticketPrice}), "С игрока снято отличное от цены билета количество эфира").to.changeEtherBalance(addr1, ticketPrice.mul("-1"));
    });

    it("HappyPath, покупка через посылку денег на адрес контракта", async function () {
      expect(await lottery.isEnded()).to.equal(false, "Лотерея неожидано кончилась");
      let players = await lottery.getPlayers();
      expect(players.length).to.equal(2, "Количество участников лотереи не верно");

      // const initialAddr2Balance = await addr2.getBalance();
      await expect(await addr2.sendTransaction({to: lottery.address, value: ticketPrice}), "Лотерея получила отличное от цены билета количество эфира").to.changeEtherBalance(lotteryAddress, ticketPrice);

      // const endBalance = await addr2.getBalance();
      // const diff = initialAddr2Balance.sub(endBalance);
      // const tax = diff.sub(ticketPrice);
      // console.log("Buy %s - %s = %s, tax = %s", initialAddr2Balance.toString(), endBalance.toString(), diff.toString(), tax.toString());

      expect(await lottery.isEnded()).to.equal(false, "Лотерея неожидано кончилась");
      players = await lottery.getPlayers();
      expect(players.length).to.equal(3, "Количество участников лотереи не верно");
      expect(players[2]).to.equal(await addr2.getAddress());

      await expect(await addr2.sendTransaction({to: lottery.address, value: ticketPrice}), "С игрока снято отличное от цены билета количество эфира").to.changeEtherBalance(addr2, ticketPrice.mul("-1"));
    });

    
    it("Должен упасть, если покупатель отправит недостаточную для билета сумму через функцию 'buyLotteryTicket'", async function () {
      expect(await lottery.isEnded()).to.equal(false, "Лотерея неожидано кончилась");
      let players = await lottery.getPlayers();
      expect(players.length).to.equal(4, "Количество участников лотереи не верно");

      // const initialAddr3Balance = await addr3.getBalance();
      
      await expect(
        lottery.connect(addr3).buyLotteryTicket({value: ticketPrice.sub(1)})
      ).to.be.revertedWith("Price is wrong");
      // const endBalance = await addr3.getBalance();
      // const diff = initialAddr3Balance.sub(endBalance);
      // console.log("Not Buy %s - %s = %s", initialAddr3Balance.toString(), endBalance.toString(), diff.toString());

      expect(await lottery.isEnded()).to.equal(false, "Лотерея неожидано кончилась");
      players = await lottery.getPlayers();
      expect(players.length).to.equal(4, "Количество участников лотереи не верно");
    });

    it("Должен упасть, если покупатель отправит недостаточную для билета сумму через receive", async function () {
      expect(await lottery.isEnded()).to.equal(false, "Лотерея неожидано кончилась");
      let players = await lottery.getPlayers();
      expect(players.length).to.equal(4, "Количество участников лотереи не верно");

      // const initialAddr4Balance = await addr3.getBalance();
      
      expect(
        addr4.sendTransaction({to: lottery.address, value: ticketPrice.sub(1)})
      ).to.be.revertedWith("Price is wrong");
      // const endBalance = await addr4.getBalance();
      // const diff = initialAddr4Balance.sub(endBalance);
      // console.log("Not Buy %s - %s = %s", initialAddr4Balance.toString(), endBalance.toString(), diff.toString());

      expect(await lottery.isEnded()).to.equal(false, "Лотерея неожидано кончилась");
      players = await lottery.getPlayers();
      expect(players.length).to.equal(4, "Количество участников лотереи не верно");
    });

    it("Проверка isEnded до и после конца лотереи", async function () {
      expect(await lottery.isEnded()).to.equal(false, "Лотерея неожидано кончилась");
      await time.increase(time.duration.days(lotteryDuration));
      expect(await lottery.isEnded()).to.equal(true, "Время ещё не кончилось");
    })
  });

  describe("Розыгрыш лотереи", function() {

    this.beforeEach(async function () {
      const LotteryFactory = await ethers.getContractFactory("Lottery");
      [manager, ...addr] = await ethers.getSigners();
      lottery = await LotteryFactory.deploy(lotteryDuration, ticketPrice, prizeAmount);
      await lottery.deployed();
    });

    it("HappyPath", async function () {
      expect(await lottery.isEnded()).to.equal(false, "Лотерея неожидано кончилась");
      let players = await lottery.getPlayers();
      expect(players.length).to.equal(0, "Список участников в начале лотереи не пуст");

      // const initialManagerBalance = await manager.getBalance();

      const contractTransactions: Promise<ContractTransaction>[] = [];

      for (const account of addr) {
        contractTransactions.push(lottery.connect(account).buyLotteryTicket({value: ticketPrice}));
      }

      await Promise.all(contractTransactions);
      
      expect(await lottery.isEnded()).to.equal(false, "Лотерея неожидано кончилась");
      players = await lottery.getPlayers();
      expect(players.length).to.equal(addr.length, "Количество участников лотереи не верно");

      await time.increase(time.duration.days(lotteryDuration));

      expect(await lottery.isEnded()).to.equal(true, "Время ещё не кончилось");
      await lottery.finishLottery();
      const endLotteryBalance = await ethers.provider.getBalance(lottery.address);

      expect(endLotteryBalance.toString()).to.equal('0', "Баланс лотереи не обнулился");

      expect(lottery.isEnded(), "Контракт лотереи не был удалён").to.be.reverted;

      // console.log("WinnerAddress: ", winnerAddress);
      // TODO Проверить, что баланс победителя увеличился
      // const managerEndBalance = await manager.getBalance();
      // const diff = managerEndBalance.sub(initialManagerBalance);
      // const endWinnerBalance = await ethers.getDefaultProvider().getBalance(winnerAddress);
      // console.log("Finish lottery. manager %s - %s = %s, lottery %s", ethers.utils.formatEther(managerEndBalance), ethers.utils.formatEther(initialManagerBalance), ethers.utils.formatEther(diff), endLotteryBalance.toString());
    });

    it("Окончание лотереи при недоборе суммы выигрыша", async function () {
      expect(await lottery.isEnded()).to.equal(false, "Лотерея неожидано кончилась");
      let players = await lottery.getPlayers();
      expect(players.length).to.equal(0, "Список участников в начале лотереи не пуст");

      await lottery.connect(addr1).buyLotteryTicket({value: ticketPrice});
      await lottery.connect(addr2).buyLotteryTicket({value: ticketPrice});
      await lottery.connect(addr3).buyLotteryTicket({value: ticketPrice});
      
      expect(await lottery.isEnded()).to.equal(false);
      players = await lottery.getPlayers();
      expect(players.length).to.equal(3);

      await time.increase(time.duration.days(lotteryDuration));

      expect(await lottery.isEnded()).to.equal(true);
      
      await expect(
        lottery.finishLottery(),
        "Не сработала проверка на размер выигрыша"
      ).to.be.revertedWith("doesn't have enough money in the bank");
    });

    it("Должен упасть, если менеджер попытается разыграть лотерею до её окончания", async function() {
      expect(await lottery.isEnded()).to.equal(false, "Лотерея неожидано кончилась");
      let players = await lottery.getPlayers();
      expect(players.length).to.equal(0, "Список участников в начале лотереи не пуст");

      const contractTransactions: Promise<ContractTransaction>[] = [];

      for (const account of addr) {
        contractTransactions.push(lottery.connect(account).buyLotteryTicket({value: ticketPrice}));
      }

      await Promise.all(contractTransactions);
      
      expect(await lottery.isEnded()).to.equal(false, "Лотерея неожидано кончилась");
      players = await lottery.getPlayers();
      expect(players.length).to.equal(addr.length, "Количество участников лотереи не верно");
      
      await expect(
        lottery.finishLottery(),
        "Можно разыграть не оконченную лотерею"
      ).to.be.revertedWith("is not over yet");
    })
  })
});