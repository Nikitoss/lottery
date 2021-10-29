import { equal } from "assert";
import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { addAbortSignal } from "stream";
import { Lottery } from "../typechain";
import { Web3Provider } from "@ethersproject/providers";
import {BigNumber} from "ethers";

describe("Lottery", function () {
  const lotteryDuration = 1;
  //                                    45500804539494 - average cost of empty transaction
  //                                  1129987031480624 - average cost of transaction
  const ticketPrice = BigNumber.from("1000000000000000");   
  const prizeAmount = BigNumber.from("6900000000000000");  

  // const ticketPrice = BigNumber.from("100");   
  // const prizeAmount = BigNumber.from("590"); 

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
    it("HappyPath", async function () {
      const initialAddr1Balance = await addr1.getBalance();
      await lottery.connect(addr1).buyLotteryTicket({value: ticketPrice});
      // expect(await addr1.getBalance()).to.equal(initialAddr1Balance.sub(ticketPrice));
      const endBalance = await addr1.getBalance();
      const diff = initialAddr1Balance.sub(endBalance);
      console.log("Buy %s - %s = %s", initialAddr1Balance.toString(), endBalance.toString(), diff.toString());
      console.log("players + ", await lottery.players(0));
    });
    
    it("Should fail if sender doesn’t send enough wei", async function () {
      const initialAddr1Balance = await addr1.getBalance();
      
      // const initialAddr1Balance = await addr1.getBalance();
      await expect(
        lottery.connect(addr1).buyLotteryTicket({value: ticketPrice.sub(1)})
      ).to.be.revertedWith("Price is higher");
      const endBalance = await addr1.getBalance();
      const diff = initialAddr1Balance.sub(endBalance);
      console.log("Not Buy %s - %s = %s", initialAddr1Balance.toString(), endBalance.toString(), diff.toString())
      console.log("players - ", await lottery.players(0));
    });
  });

  describe("finishLottery", function() {
    it("finishLottery", async function () {
      await Promise.all([
        lottery.connect(addr1).buyLotteryTicket({value: ticketPrice}),
        lottery.connect(addr2).buyLotteryTicket({value: ticketPrice}),
        lottery.connect(addr3).buyLotteryTicket({value: ticketPrice}),
        lottery.connect(addr4).buyLotteryTicket({value: ticketPrice}),
        lottery.connect(addr5).buyLotteryTicket({value: ticketPrice}),
        lottery.connect(addr6).buyLotteryTicket({value: ticketPrice})
      ]);

      const winnerAddress = await lottery.finishLottery();
    });
  })
});
