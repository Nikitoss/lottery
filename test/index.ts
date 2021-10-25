import { equal } from "assert";
import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { addAbortSignal } from "stream";
import { Lottery } from "../typechain";
import { Web3Provider } from "@ethersproject/providers";

describe("Lottery", function () {
  const lotteryDuration = 1;
  const ticketPrice = 100;
  const prizeAmount = 200;

  let LotteryFactory;
  let lottery: Lottery;
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;
  let addr2: SignerWithAddress;
  let addr3: SignerWithAddress;
  let addr4: SignerWithAddress;
  let addr5: SignerWithAddress;
  let addr6: SignerWithAddress;
  let addrs: SignerWithAddress[];

  this.beforeAll(async function () {
    LotteryFactory = await ethers.getContractFactory("Lottery");
    [owner, addr1, addr2, addr3, addr4, addr5, addr6, ...addrs] = await ethers.getSigners();

    lottery = await LotteryFactory.deploy(lotteryDuration, ticketPrice, prizeAmount);
    await lottery.deployed();
  });

  describe("Deployment", function() {
    it("Should set the right owner", async function () {
      equal(await lottery.manager(), owner.address);
      // expect(await lottery.manager()).to.equal(owner.address);
    });

    it("Should set the right lotteryDuration", async function () {
      expect(await lottery.lotteryDuration()).to.equal(lotteryDuration);
    });

    it("Should set the right ticketPrice", async function () {
      expect(await lottery.ticketPrice()).to.equal(ticketPrice);
    });

    it("Should set the right prizeAmount", async function () {
      expect(await lottery.prizeAmount()).to.equal(prizeAmount);
    });
  });

  describe("Transactions: Buying lotteryTicket", function() {
    it("Should fail if sender doesn’t send enough wei", async function () {
      const initialAddr1Balance = await addr1.getBalance();
      // const initialAddr1Balance = await addr1.getBalance();
      await expect(
        lottery.connect(addr1).buyLotteryTicket({value: ticketPrice - 1})
      ).to.be.revertedWith("Price is higher");
      console.log("============Not Buy", initialAddr1Balance.sub(await addr1.getBalance()).toString())
    });

    it("HappyPath", async function () {
      const initialAddr1Balance = await addr1.getBalance();
      lottery.connect(addr1).buyLotteryTicket({value: ticketPrice});
      // expect(await addr1.getBalance()).to.equal(initialAddr1Balance.sub(ticketPrice));
      console.log("=========Buy", initialAddr1Balance.sub(await addr1.getBalance()).toString())
      console.log(lottery.players);
    })
  });
});
