import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Lottery } from "../typechain";
import { ContractTransaction } from "ethers";
const { time } = require("@openzeppelin/test-helpers");

describe("Lottery", function () {
    const lotteryDuration = 1; //days
    //                                    40000000000000 - average cost of empty transaction
    //                                   130000000000000 - average cost of transaction
    const ticketPrice = ethers.utils.parseEther("0.01");
    const prizeAmount = ethers.utils.parseEther("0.12");
    let lottery: Lottery;
    let addrs: SignerWithAddress[];
    let [
        manager,
        addr1,
        addr2,
        addr3,
        addr4,
        addr5,
        addr6,
        ...addr
    ]: SignerWithAddress[] = [];
    let lotteryAddress: SignerWithAddress;

    this.beforeAll(async function () {
        const LotteryFactory = await ethers.getContractFactory("Lottery");
        [manager, addr1, addr2, addr3, addr4, addr5, addr6, ...addr] =
            await ethers.getSigners();
        lottery = await LotteryFactory.deploy(
            lotteryDuration,
            ticketPrice,
            prizeAmount,
        );
        await lottery.deployed();
        lotteryAddress = await ethers.getSigner(lottery.address);
        console.log("\t📍lottery.address: %s", lottery.address);
    });

    describe("Деплой", function () {
        it("Инициализация лотереи", async function () {
            expect(await lottery.isManager()).to.equal(
                true,
                "Менеджер установлен не верно",
            );
            expect(await lottery.lotteryDuration()).to.equal(
                lotteryDuration,
                "Длительность лотереи установлена не верно",
            );
            expect(await lottery.ticketPrice()).to.equal(
                ticketPrice,
                "Стоимость билета установлена не верно",
            );
            expect(await lottery.prizeAmount()).to.equal(
                prizeAmount,
                "Размер приза установлен не верно",
            );
            const players = await lottery.getPlayers();
            expect(players.length).to.equal(
                0,
                "Список участников в начале лотереи не пуст",
            );
            expect(await lottery.isEnded()).to.equal(
                false,
                "Лотерея неожидано кончилась",
            );
        });
    });

    describe("Покупка лотерейного билета", function () {
        it("HappyPath, покупка через функцию 'buyLotteryTicket'", async function () {
            // Смысла проверять, не закончилась ли лотерея не очень много, но пусть будет.
            expect(await lottery.isEnded()).to.equal(
                false,
                "Лотерея неожидано кончилась",
            );
            let players = await lottery.getPlayers();
            expect(players.length).to.equal(
                0,
                "Список участников в начале лотереи не пуст",
            );

            let request: ContractTransaction;

            // Здесь слишком много проверок.
            // Лучше бы разделить это на несколько тестов.
            // Проверяется
            // - Что вызывается событие LotteryTicketPurchased
            // - Что адрес лотереи получает стоимость билета
            // - Что с адреса игрока тратится стоимость билета (без учёта стоимости газа)
            await expect(
                await lottery
                    .connect(addr1)
                    .buyLotteryTicket({ value: ticketPrice }),
                "Лотерея получила отличное от цены билета количество эфира",
            )
                .to.changeEtherBalances(
                    [addr1, lotteryAddress],
                    [ticketPrice.mul("-1"), ticketPrice],
                )
                .to.emit(lottery, "LotteryTicketPurchased");

            expect(
                await lottery.isEnded(),
                "Лотерея неожидано кончилась",
            ).to.equal(false);
            players = await lottery.getPlayers();
            expect(players.length).to.equal(
                1,
                "Количество участников лотереи не верно",
            );
            expect(players[0]).to.equal(
                await addr1.getAddress(),
                "В списке игроков неожиданный участник",
            );
        });

        it("HappyPath, покупка через посылку денег на адрес контракта", async function () {
            expect(await lottery.isEnded()).to.equal(
                false,
                "Лотерея неожидано кончилась",
            );
            let players = await lottery.getPlayers();
            expect(players.length).to.equal(
                1,
                "Количество участников лотереи не верно",
            );

            // Проверяется
            // - Что вызывается событие LotteryTicketPurchased
            // - Что адрес лотереи получает стоимость билета
            // - Что с адреса игрока тратится стоимость билета (без учёта стоимости газа)
            await expect(
                await addr2.sendTransaction({
                    to: lottery.address,
                    value: ticketPrice,
                }),
                "Лотерея получила отличное от цены билета количество эфира",
            )
                .to.changeEtherBalances(
                    [addr2, lotteryAddress],
                    [ticketPrice.mul("-1"), ticketPrice],
                )
                .to.emit(lottery, "LotteryTicketPurchased");

            expect(await lottery.isEnded()).to.equal(
                false,
                "Лотерея неожидано кончилась",
            );
            players = await lottery.getPlayers();
            expect(players.length).to.equal(
                2,
                "Количество участников лотереи не верно",
            );
            expect(players[1]).to.equal(
                await addr2.getAddress(),
                "В списке игроков неожиданный участник",
            );
        });

        it("Должен упасть, если покупатель отправит недостаточную для билета сумму через функцию 'buyLotteryTicket'", async function () {
            expect(await lottery.isEnded()).to.equal(
                false,
                "Лотерея неожидано кончилась",
            );
            let players = await lottery.getPlayers();
            expect(players.length).to.equal(
                2,
                "Количество участников лотереи не верно",
            );

            // const initialAddr3Balance = await addr3.getBalance();

            await expect(
                lottery
                    .connect(addr3)
                    .buyLotteryTicket({ value: ticketPrice.sub(1) }),
            ).to.be.revertedWith("Price is wrong");

            expect(await lottery.isEnded()).to.equal(
                false,
                "Лотерея неожидано кончилась",
            );
            players = await lottery.getPlayers();
            expect(players.length).to.equal(
                2,
                "Количество участников лотереи не верно",
            );
        });

        it("Должен упасть, если покупатель отправит недостаточную для билета сумму через receive", async function () {
            expect(await lottery.isEnded()).to.equal(
                false,
                "Лотерея неожидано кончилась",
            );
            let players = await lottery.getPlayers();
            expect(players.length).to.equal(
                2,
                "Количество участников лотереи не верно",
            );

            expect(
                addr4.sendTransaction({
                    to: lottery.address,
                    value: ticketPrice.sub(1),
                }),
            ).to.be.revertedWith("Price is wrong");

            expect(await lottery.isEnded()).to.equal(
                false,
                "Лотерея неожидано кончилась",
            );
            players = await lottery.getPlayers();
            expect(players.length).to.equal(
                2,
                "Количество участников лотереи не верно",
            );
        });

        it("Проверка isEnded до и после конца лотереи", async function () {
            expect(await lottery.isEnded()).to.equal(
                false,
                "Лотерея неожидано кончилась",
            );
            await time.increase(time.duration.days(lotteryDuration));
            expect(await lottery.isEnded()).to.equal(
                true,
                "Время ещё не кончилось",
            );
        });
    });

    describe("Розыгрыш лотереи", function () {
        this.beforeEach(async function () {
            const LotteryFactory = await ethers.getContractFactory("Lottery");
            [manager, ...addr] = await ethers.getSigners();
            lottery = await LotteryFactory.deploy(
                lotteryDuration,
                ticketPrice,
                prizeAmount,
            );
            await lottery.deployed();
            lotteryAddress = await ethers.getSigner(lottery.address);
            console.log("\t📍lottery.address: %s", lottery.address);
        });

        it("HappyPath", async function () {
            expect(await lottery.isEnded()).to.equal(
                false,
                "Лотерея неожидано кончилась",
            );
            let players = await lottery.getPlayers();
            expect(players.length).to.equal(
                0,
                "Список участников в начале лотереи не пуст",
            );

            // const initialManagerBalance = await manager.getBalance();

            const contractTransactions: Promise<ContractTransaction>[] = [];

            for (const account of addr) {
                contractTransactions.push(
                    lottery
                        .connect(account)
                        .buyLotteryTicket({ value: ticketPrice }),
                );
            }

            await Promise.all(contractTransactions);

            expect(await lottery.isEnded()).to.equal(
                false,
                "Лотерея неожидано кончилась",
            );
            players = await lottery.getPlayers();
            expect(players.length).to.equal(
                addr.length,
                "Количество участников лотереи не верно",
            );

            await time.increase(time.duration.days(lotteryDuration));

            expect(await lottery.isEnded()).to.equal(
                true,
                "Время ещё не кончилось",
            );

            const startLotteryBalance = await ethers.provider.getBalance(
                lottery.address,
            );

            const transactionPromise = lottery.finishLottery();

            // Тупо, что адрес победителя я вытаскиваю на основе события, существование которого я проверяю позже.
            // Проверку стоит разделить на четыре expect с отдельными текстами ошибок.
            const transaction = await transactionPromise;
            const recept = await transaction.wait();
            const winnerAddress = await ethers.getSigner(
                recept.events?.[0].args?.winner,
            );

            // Проверяется
            // - Что вызывается событие LotteryFinish
            // - Что адрес победителя получает стоимость приза
            // - Что адрес менеджера получает остаточную стомость розыгрыша
            // - Что адрес лотереи лишается всего выигрыша
            await expect(
                transaction,
                "Баланс лотереи не обнулился или событие не вызвалось",
            )
                .to.changeEtherBalances(
                    [winnerAddress, manager, lotteryAddress],
                    [
                        prizeAmount,
                        startLotteryBalance.sub(prizeAmount),
                        startLotteryBalance.mul(-1),
                    ],
                )
                .to.emit(lottery, "LotteryFinish");

            const endLotteryBalance = await ethers.provider.getBalance(
                lottery.address,
            );

            expect(endLotteryBalance.toString()).to.equal(
                "0",
                "Баланс лотереи не обнулился",
            );

            expect(lottery.isEnded(), "Контракт лотереи не был удалён").to.be
                .reverted;
        });

        it("Окончание лотереи при недоборе суммы выигрыша", async function () {
            expect(await lottery.isEnded()).to.equal(
                false,
                "Лотерея неожидано кончилась",
            );
            let players = await lottery.getPlayers();
            expect(players.length).to.equal(
                0,
                "Список участников в начале лотереи не пуст",
            );

            await lottery
                .connect(addr1)
                .buyLotteryTicket({ value: ticketPrice });
            await lottery
                .connect(addr2)
                .buyLotteryTicket({ value: ticketPrice });
            await lottery
                .connect(addr3)
                .buyLotteryTicket({ value: ticketPrice });

            expect(await lottery.isEnded()).to.equal(false);
            players = await lottery.getPlayers();
            expect(players.length).to.equal(3);

            await time.increase(time.duration.days(lotteryDuration));

            expect(await lottery.isEnded()).to.equal(
                true,
                "Время ещё не кончилось",
            );

            const startLotteryBalance = await ethers.provider.getBalance(
                lottery.address,
            );

            const transactionPromise = lottery.finishLottery();

            // Тупо, что адрес победителя я вытаскиваю на основе события, существование которого я проверяю позже.
            const transaction = await transactionPromise;
            const recept = await transaction.wait();
            const winnerAddress = await ethers.getSigner(
                recept.events?.[0].args?.winner,
            );

            // Проверяется
            // - Что вызывается событие LotteryFinish
            // - Что адрес победителя получает весь выигрыш
            // - Что адрес лотереи лишается всего выигрыша
            await expect(
                transaction,
                "Баланс лотереи не обнулился или событие не вызвалось",
            )
                .to.changeEtherBalances(
                    [winnerAddress, lotteryAddress],
                    [startLotteryBalance, startLotteryBalance.mul(-1)],
                )
                .to.emit(lottery, "LotteryFinish");

            const endLotteryBalance = await ethers.provider.getBalance(
                lottery.address,
            );

            expect(endLotteryBalance.toString()).to.equal(
                "0",
                "Баланс лотереи не обнулился",
            );

            expect(lottery.isEnded(), "Контракт лотереи не был удалён").to.be
                .reverted;
        });

        it("Должен упасть, если менеджер попытается разыграть лотерею до её окончания", async function () {
            expect(await lottery.isEnded()).to.equal(
                false,
                "Лотерея неожидано кончилась",
            );
            let players = await lottery.getPlayers();
            expect(players.length).to.equal(
                0,
                "Список участников в начале лотереи не пуст",
            );

            const contractTransactions: Promise<ContractTransaction>[] = [];

            for (const account of addr) {
                contractTransactions.push(
                    lottery
                        .connect(account)
                        .buyLotteryTicket({ value: ticketPrice }),
                );
            }

            await Promise.all(contractTransactions);

            expect(await lottery.isEnded()).to.equal(
                false,
                "Лотерея неожидано кончилась",
            );
            players = await lottery.getPlayers();
            expect(players.length).to.equal(
                addr.length,
                "Количество участников лотереи не верно",
            );

            await expect(
                lottery.finishLottery(),
                "Можно разыграть не оконченную лотерею",
            ).to.be.revertedWith("is not over yet");
        });
    });
});
