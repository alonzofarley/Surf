import { Controls } from "@/utils/stocksTypes";
import { useState } from "react";
import { Button, Card, Col, Form, Modal, Row } from "react-bootstrap"

type StocksChooseBetProps = {
    maxPossibleBet: number, 
    controls: Controls, 
    visible: boolean,
}

let minBet = 10;

export function StocksChooseBet(props:StocksChooseBetProps) {
    let [bet, setBet] = useState(props.maxPossibleBet);
    let submitBet = props.controls.submitBet;

    let onChange = (e: any) => {
        setBet(Number(e.target.value));
    }

    let onSubmit = () => {
        submitBet(bet);
    }

    return <Modal show={props.visible} onHide={() => {}} backdrop="static" centered>
            <Modal.Header closeButton>
                <Modal.Title>Bet</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Card>
                    <Card.Body>
                        <label>Choose an amount to bet</label>
                        <Row>
                            <Col>
                                <Form.Range value={bet} onChange={onChange} min={minBet} max={props.maxPossibleBet} step="10" />
                            </Col>
                            <Col>
                                <p>{bet} points </p>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={onSubmit}>Bet</Button>
            </Modal.Footer>
        </Modal>
}