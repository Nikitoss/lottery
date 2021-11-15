import { Alert, Card, Col, Row } from "antd";

interface IProps {
    errors: string[];
}

export function ErrorList({ errors }: IProps) {

    if (!errors || errors.length === 0) return null;

    return (
        <Row gutter={[16, 16]}>

            {errors.map((error, index) => {
                return (
                    <Col key={`${error}${index}`} span={24}>
                        <Alert  message={error} type="error" showIcon closable />
                    </Col>
                );
            })}
        </Row>
    );

}