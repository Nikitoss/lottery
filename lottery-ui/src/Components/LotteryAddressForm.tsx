import React, { ChangeEvent, SyntheticEvent, useState } from 'react';
import { Form, Input, message, Button, Space, Card} from 'antd';

interface IProps {
    setLotteryAddress: (address: string) => void;
    createNewLottery: () => void;
}

export const LotteryAddressForm = (props: IProps) => {
    const [form] = Form.useForm();

    const onFinish = () => {
        const address = form.getFieldValue("address");

        //check address

        props.setLotteryAddress(address);
    };

    const onFinishFailed = () => {
        message.error('Submit failed!');
    };

    // const onFill = () => {
    //     form.setFieldsValue({
    //         address: 'https://taobao.com/',
    //     });
    // };

    // const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    //     debugger;
    //     setAddress(event.target.value);
    // }

    const handleCreateLottery = () => {
        props.createNewLottery();
    };

    return (
        <Card
            title={"Подключение к контракту лотереи"}
        >
            <Form
                form={form}
                layout="horizontal"
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                autoComplete="off"
            >
                <Form.Item
                    name="address"
                    label="Адрес лотереи"
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 16 }}
                    rules={[
                        { required: true, },
                        { type: 'string', min: 6 },
                    ]}
                >
                    <Input placeholder="Введита адрес контракта лотереи" />
                </Form.Item>
                <Form.Item wrapperCol={{ span: 14, offset: 6 }}>
                    <Space>
                        <Button type="primary" shape="round" htmlType="submit">
                            Подключиться
                        </Button>
                        <Button type="link" onClick={handleCreateLottery}>
                            Создать собственную лотерею
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
        </Card>
    );
};
