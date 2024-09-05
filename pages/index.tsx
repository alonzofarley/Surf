import { useRouter } from "next/router";
import { useState } from "react";
import { Button, Col, Form, Row } from "react-bootstrap";


export default function Index(props: {}) {
    const router = useRouter();
    const launchStocks = () => {
        router.push(`/stocksGame`);
    }

    const launchWaves = () => {
        router.push(`/waves`);
    }

    return <div>
        <h1>Choose Project</h1>
        <br></br>
        <Row>
            <Col>
                <Button onClick={launchStocks}>Launch Stocks Game</Button>
            </Col>
        </Row>
        <br></br>
        <Row>
            <Col>
                <Button onClick={launchWaves}>Launch Waves</Button>
            </Col>
        </Row>

    </div>
}