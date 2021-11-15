import { LikeOutlined, WalletOutlined, WalletTwoTone } from "@ant-design/icons";
import { Card, Typography, Space, Button, Descriptions, Statistic } from "antd";
import { ethers } from "ethers";
const { Countdown } = Statistic;

interface IProps {
    lotteryAddress: string;
    isManager: boolean;
    isOver: boolean;
    prizeAmount: string;
    ticketPrice: string;
    start: string;
    end: string;
    lotteryDuration: string;
    onBuyTicket: () => void;
    onEndLottery: () => void;
}

export const LotteryCard = ({ lotteryAddress, onBuyTicket, onEndLottery, isManager, isOver, prizeAmount, ticketPrice, start, end, lotteryDuration}: IProps) => {
    const startDate = new Date(parseInt(start || '0') * 1000).toLocaleDateString();
    const endDate = new Date(parseInt(end || '0') * 1000).toLocaleDateString();

    return (
        <Card
            title={<Typography.Text>{`Лотерея ${lotteryAddress}`}</Typography.Text>}
            extra={(
                <Space>
                    <Button
                        type="primary"
                        shape="round"
                        onClick={onBuyTicket}
                    >
                        Купить билет
                    </Button>
                    {
                        isManager && (
                            <Button
                                key="2"
                                type="dashed"
                                shape="round"
                                // disabled={!isOver}
                                onClick={onEndLottery}
                            >
                                💰 Закончить лотерею
                            </Button>
                        )
                    }

                </Space>
            )}
        >
            <div className="content" style={{ display: 'flex' }}>
                <div className="main">
                    <Descriptions size="small" column={2}>
                        <Descriptions.Item label="Лотерея окончена">{isOver ? 'Да' : 'Нет'}</Descriptions.Item>
                        <Descriptions.Item label="Размер приза">
                            ETH {prizeAmount && ethers.utils.formatEther(prizeAmount)}
                        </Descriptions.Item>
                        <Descriptions.Item label="Стоимость билета">
                            ETH {ticketPrice && ethers.utils.formatEther(ticketPrice)}
                        </Descriptions.Item>
                        <Descriptions.Item label="Старт лотереи">
                            {startDate}
                        </Descriptions.Item>
                        <Descriptions.Item label="Конец лотереи">
                            {endDate}
                        </Descriptions.Item>
                        <Descriptions.Item label="Длительность">
                            {lotteryDuration}
                        </Descriptions.Item>
                    </Descriptions>
                </div>
                <div className="extra">
                    <div
                        style={{
                            display: 'flex',
                            width: 'max-content',
                            justifyContent: 'flex-end',
                        }}
                    >
                        <Countdown
                            title="Countdown"
                            style={{
                                marginRight: 32,
                            }}
                            value={parseInt(end) * 1000} // 10 секунд
                        />

                        <Statistic
                            title="Статус"
                            value={isOver ? "Окончена" : "Продолжается"}
                            style={{
                                marginRight: 32,
                            }}
                        />

                        <Statistic title="Price" prefix="ETH" value={ticketPrice && ethers.utils.formatEther(ticketPrice)} />
                    </div>
                </div>
            </div>
        </Card>
    );
}