import { Col, Row } from "antd";
import { ethers } from "ethers";
import { useState, useEffect } from "react";
import { getEthersProvider } from "utils";
import LotteryArtefact from "Lottery.sol/Lottery.json";
import { Lottery } from 'typechain/Lottery';
import { AccountCard } from "./AccountCard";
import { LotteryCard } from "./LotteryCard";


interface IProps {
    signerAddress: string;
    lotteryAddress: string;
    addError: (error: string) => void;
}

let lottery: Lottery | undefined = undefined;

export function LotteryInfo({ signerAddress, lotteryAddress, addError }: IProps) {
    const [isManager, setIsManager] = useState(false);
    const [isOver, setIsOver] = useState(false);
    const [prizeAmount, setPrizeAmount] = useState<string>("");
    const [ticketPrice, setTicketPrice] = useState<string>("");
    const [start, setStart] = useState<string>("");
    const [end, setEnd] = useState<string>("");
    const [lotteryDuration, setLotteryDuration] = useState<string>("");
    const [timeStamp, setTimestamp] = useState<string>("");

    const [players, setPlayers] = useState<string[]>([]);

    useEffect(() => {
        if (lotteryAddress) {

            try {
                lottery = new ethers.Contract(
                    lotteryAddress,
                    LotteryArtefact.abi,
                    getEthersProvider()!.getSigner(0)
                ) as Lottery;

                lottery.isManager().then(setIsManager, addError);
                lottery.isEnded().then((_isOver) => {
                    debugger;
                    setIsOver(_isOver);
                }, addError);
                lottery.prizeAmount().then((prizeAmount) => {
                    setPrizeAmount(prizeAmount.toString());
                }, addError);
                lottery.ticketPrice().then((price) => {
                    setTicketPrice(price.toString());
                }, addError);
                lottery.start().then((start) => {
                    setStart(start.toString());
                }, addError);
                lottery.end().then((end) => {
                    setEnd(end.toString())
                }, addError);
                lottery.lotteryDuration().then((lotteryDuration) => {
                    setLotteryDuration(lotteryDuration.toString())
                }, addError);
                lottery.getPlayers().then(setPlayers, addError);

                debugger;

                // lottery.filters.LotteryFinish
                // await lottery.queryFilter(lottery.filters.LotteryTicketPurchased);
                
                lottery.on(lottery.filters.LotteryTicketPurchased(), (a, b) => {
                    debugger;
                    console.log(a, b);
                    lottery!.getPlayers().then(setPlayers, addError);
                })


                lottery.on(lottery.filters.LotteryFinish(), (winnerAddress, typedEvent) => {
                    debugger;
                    console.log(`winnerAddress: ${winnerAddress}`);

                    console.log(typedEvent);
                })

            } catch (e: any) {
                addError(e.toString());
            }

        }
    }, [lotteryAddress, signerAddress]);

    useEffect(() => {
        const id = setInterval(() => {
            lottery?.getTimeStamp().then((timeStamp) => {
                setTimestamp(timeStamp.toString())
            }, addError);
        }, 1000);
        return () => clearInterval(id);
    })

    const buyTicket = async () => {
        await lottery?.buyLotteryTicket({ value: ticketPrice }).catch(addError);
        lottery?.getPlayers().then(setPlayers, addError);
    }
    const endLottery = () => {
        lottery?.finishLottery().catch(addError);
    }

    // const isPlayersEmpty = !players || players.length === 0;

    return (
        <Row gutter={[16, 16]}>
            start: {new Date(parseInt(start) * 1000).toLocaleString()}
            <br/>
            end: {new Date(parseInt(end)*1000).toLocaleString()}
            <br/>
            timeStamp: {new Date(parseInt(timeStamp)*1000).toLocaleString()}

            <Col span={24}>
                <LotteryCard
                    lotteryAddress={lotteryAddress}
                    isManager={isManager}
                    isOver={isOver}
                    prizeAmount={prizeAmount}
                    ticketPrice={ticketPrice}
                    start={start}
                    end={end}
                    lotteryDuration={lotteryDuration}
                    onBuyTicket={buyTicket}
                    onEndLottery={endLottery}
                />
            </Col>

            {
                players.map((player, index) => {
                    return (
                        <Col
                            key={player + index}
                            xs={24}
                            sm={12}
                            // md={12}
                            lg={8}
                            // xl={8}
                            xxl={6}
                        >
                            <AccountCard
                                address={player}
                                addError={addError}
                            />
                        </Col>
                    )
                })
            }
        </Row>
    );

}