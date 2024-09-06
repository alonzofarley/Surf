import { StocksGraph } from "@/components/stocks/stocksGraph"
import { Controls, State, Statistics } from "@/utils/stocksTypes";
import { stat } from "fs";
import next from "next";
import { GraphHelpers } from "next/dist/compiled/webpack/webpack"
import { use, useEffect, useRef, useState } from "react";
import { Accordion, Button, Col, Modal, Row } from "react-bootstrap";

type StocksProps = {
    state: State, 
    setState: (s: State) => void, 
    controls: Controls
}

const defaultValue = 0;
let initialTriggersPerSecond = 3;

export default function Stocks(props: StocksProps) {
    let state = props.state;
    let setState = props.setState;
    let controls = props.controls;
    let data = state.data;
    let changeScalar = state.changeScalar;
    let stats = state.stats
    let hasStopped = state.hasStopped
    let startingVal = stats.initialValue ?? defaultValue;
    let currentValue = data.length > 0 ? data[data.length - 1][1] : startingVal;
    let triggersPerSecond = state.triggersPerSecond;

    let generateNextValue = (dataSet: number[][]) => {
        let latestDataPoint = dataSet[dataSet.length - 1];
        let [lDPX, lDPY] = latestDataPoint;
        let randomChange = changeScalar * (Math.random() - 0.5)
        let newPoint = [
            lDPX + 1,
            lDPY + randomChange
        ];
        return newPoint;
    }

    let calculateBalanceGain = (_currVal: number, _netGain: number, stats: Statistics) => {
        if(_netGain > 0){
            return 0;
        }

        let thresholds = [
            {proportion: 0.0, gain: 1},
            {proportion: 0.1, gain: 2},
            {proportion: 0.25, gain: 3},
            {proportion: 0.5, gain: 4},
            {proportion: 1.0, gain: 5},
            {proportion: 5.0, gain: 7}
        ]

        let proportionalGain = (-_netGain / stats.initialValue)

        for(var i = thresholds.length - 1; i >= 0; i--){
            if(proportionalGain > thresholds[i].proportion){
                return thresholds[i].gain;
            }
        }
        return 0;
    }

    let updateStats = (_state: State, _currVal: number) => {
        let netGain = _currVal - _state.stats.initialValue;

        return {
            minValue: Math.min(_state.stats.minValue, _currVal), 
            maxValue: Math.max(_state.stats.maxValue, _currVal), 
            currentValue: _currVal, 
            initialValue: isNaN(_state.stats.initialValue) 
                ? startingVal
                : _state.stats.initialValue, 
            netGain: netGain, 
            currentShopBalance: _state.stats.currentShopBalance,
            potentialShopBalanceGain: calculateBalanceGain(_currVal, netGain, _state.stats),
            currentTotalPoints: _state.stats.currentTotalPoints, 
            round: _state.stats.round
        } as Statistics
    }

    let fetchNewData = () => {
        console.log("fetchNewData")
        if(hasStopped){
            console.log(state);
            console.log("fetchNewData hasStopped=true");
            return;
        }
        let nextState = {
            ...state
        }

        if(data.length == 0){
            console.log("fetchNewData, data length 0")

            nextState.data = [[0, startingVal]];
            nextState.stats = updateStats(nextState, startingVal)
            setState(nextState);
            return;
        }
        
        console.log("fetchNewData, data length > 0")
        let newPoint = generateNextValue(data);
        nextState.changeScalar = nextState.changeScalar + nextState.changeScalarAcceleration;
        nextState.data = [...nextState.data, newPoint];
        nextState.stats = updateStats(nextState, newPoint[1]);
        setState(nextState)
    }

    useEffect(() => {
        let _tps = 1000 / triggersPerSecond;
        let timer = setInterval(() => {
            console.log("run");
            fetchNewData();
        }, _tps);

        return () => {
            if(timer != null)
            clearInterval(timer)
        };
    });

    let changeTPS = (tps: number) => {
        controls.changeTPS(tps);
    }

    let skip = (num: number) => {
        let newState = {...state,
            hasStopped: true
        }
        setState(newState);
        let additions = [...newState.data];
        for(var i = 0; i < num; i++) {
            let newPoint = generateNextValue(additions);
            newState.changeScalar = newState.changeScalar + newState.changeScalarAcceleration
            newState.stats = updateStats(newState, newPoint[1]);
            //setState(newState);
            additions.push(newPoint);
        }
        newState.data = additions;
        newState.hasStopped = false;
        setState(newState);
    }



    let statsInfo = <div className="card">
        <div className="card-body">
            <h5 className="card-title">Stats</h5>
            <p></p>
            <Row>
                <Col>
                    <p>Banked Points: {stats.currentTotalPoints.toFixed(0)}</p>
                </Col>
            </Row>
            <Row>
                <Col sm={2}>
                    <p>Round {stats.round.toString()}</p>
                </Col>
                <Col sm={2}>
                    <p>Bet: {isNaN(stats.initialValue) ?? ""}</p>
                </Col>
            </Row>
            <Row>
                <Col sm={2}>
                    <p>Shop Balance: {state.stats.currentShopBalance}</p>
                </Col>
                <Col sm={2}>
                    <p>Bet: {isNaN(stats.initialValue) ?? ""}</p>
                </Col>
            </Row>
            
            <Accordion>
                <Accordion.Item eventKey="0">
                    <Accordion.Header>{hasStopped ? "Final Round Score: " : "Current Round Score: "} {currentValue.toFixed(2)}</Accordion.Header>
                    <Accordion.Body>
                        <ul className="list-group list-group-flush">
                            <Row>
                                <Col>
                                    <li className= { stats.netGain >= 0 ? "list-group-item border-success" : "list-group-item border-danger" }>
                                        <label>Net Gain</label>
                                        <p>{stats.netGain.toFixed(2)}</p>
                                    </li>
                                    <li className="list-group-item">
                                        <label>Initial Value</label>
                                        <p>{stats.initialValue.toFixed(2)}</p>
                                    </li>
                                </Col>
                                <Col>
                                    <li className="list-group-item">
                                        <label>Highest Value</label>
                                        <p>{stats.maxValue.toFixed(2)}</p>
                                    </li>
                                    <li className="list-group-item">
                                        <label>Lowest Value</label>
                                        <p>{stats.minValue.toFixed(2)}</p>
                                    </li>
                                </Col>
                                <Col>
                                    <li className="list-group-item">
                                        <label>Change Scalar</label>
                                        <p>{changeScalar.toFixed(2)}</p>
                                    </li>
                                </Col>
                                <Col>
                                    <li className="list-group-item">
                                        <label>Current Shop Balance</label>
                                        <p>${state.stats.currentShopBalance}</p>
                                    </li>
                                    <li className="list-group-item">
                                        <label>Potential Gain This Round</label>
                                        <p>${state.stats.potentialShopBalanceGain}</p>
                                    </li>
                                </Col>
                            </Row>
                        </ul>
                    </Accordion.Body>
                </Accordion.Item>
            </Accordion>
        </div>
        {hasStopped ?
            <div className="card-footer">
                <Button className="btn btn-success" onClick={() => controls.score()}>Score & Go to Shop</Button>
            </div>
        : <></>}    
    </div>

    return <div style={{width: "80%"}}>
        <Row>
            <Col></Col>
        </Row>
        <div id="header"> 
            {statsInfo}
        </div>
        <div style={{overflow: "scroll"}}>
            <StocksGraph data={data}/>
        </div>
        <div id="footer" className="container">
            <Row>
                <div className="btn-group " role="group">
                    <button className="btn btn-outline-primary" onClick={() => skip(10)}>Skip 10</button>
                    <button className="btn btn-outline-primary" onClick={() => skip(100)}>Skip 100</button>
                    <button className="btn btn-outline-primary" onClick={() => skip(1000)}>Skip 1000</button>
                </div>
            </Row>
            <Row>
            <div className="btn-group" role="group">
                    <button className="btn btn-danger" onClick={() => controls.stop()}>Stop</button>
                    <button className="btn btn-success" onClick={() => controls.cont()}>Continue</button>
                </div>
            </Row>
            <Row>
                <p>{state.triggersPerSecond}</p>
                <input type="range" value={state.triggersPerSecond} max={1000 / 5} min={0.01} onChange={(e) => {changeTPS(Number(e.target.value))}}/>
            </Row>
        </div>
    </div>

}