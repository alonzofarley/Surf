import { useState } from "react";
import Stocks from "./stocks";
import { StocksShop } from "./stocksShop";
import { Controls, State } from "@/utils/stocksTypes";
import { StocksChooseBet } from "./stocksChooseBet";

type StocksGamePageProps = {

}

const initialChangeScalar = 2;
const initialChangeScalarAcceleration = 0.04;
const initialStartingPoints = 250;
const initialTriggersPerSeconds = 3;

const initialState: State = {
    data: [], 
    hasStopped: true, 
    changeScalar: initialChangeScalar, 
    changeScalarAcceleration: initialChangeScalarAcceleration, 
    triggersPerSecond: initialTriggersPerSeconds,
    stats: {
        currentValue: NaN, 
        maxValue: Number.NEGATIVE_INFINITY, 
        minValue: Number.POSITIVE_INFINITY, 
        initialValue: NaN, 
        netGain: 0, 
        currentShopBalance: 0, 
        potentialShopBalanceGain: 0, 
        currentTotalPoints: initialStartingPoints, 
        round: 1
    }
}

export function StocksGamePage(props: StocksGamePageProps) {
    let [shopVisible, setShopVisible] = useState(false);
    let [stocksState, setStocksState] = useState(initialState);
    let [betViewVisible, setBetViewVisible] = useState(true);

    let controls: Controls = {
        stop: () => {
            let newState = {...stocksState,
                hasStopped: true
            }
            setStocksState(newState);
        },
        cont: () => {
            let newState = {...stocksState,
                hasStopped: false
            }
            setStocksState(newState);
        }, 
        restart: () => {
            let newState = {...stocksState,
                hasStopped: false, 
                data: [], 
                changeScalar: initialChangeScalar
            }
            setStocksState(newState);
        }, 
        score: () => {
            let newState = {
                ...stocksState, 
                stats: {
                    ...stocksState.stats, 
                    currentTotalPoints: stocksState.stats.currentTotalPoints + stocksState.stats.netGain,
                    currentShopBalance: stocksState.stats.currentShopBalance + stocksState.stats.potentialShopBalanceGain,
                    potentialShopBalanceGain: 0,
                }
            }
            setStocksState(newState);
            setShopVisible(true);
        }, 
        shopEnded: function() {
            setShopVisible(false);
            setBetViewVisible(true);
            let newState = {...stocksState,
                data: [], 
                changeScalar: initialChangeScalar, 
                stats: {
                    ...stocksState.stats,
                    round: stocksState.stats.round + 1,
                }
            }
            setStocksState(newState);
        }, 
        submitBet: (bet: number) => {
            setBetViewVisible(false);
            let newState = {...stocksState,
                hasStopped: false,
                stats: {
                    ...stocksState.stats,
                    initialValue: bet, 
                    currentValue: bet
                }
            }
            setStocksState(newState);
        }, 
        changeTPS: (tps: number) => {
            let newState = {...stocksState,
                triggersPerSecond: tps
            }
            setStocksState(newState);
        }
    }
    
    return <div className="container">
                <div className="row">
                    <div className="col">
                        <Stocks 
                            state={stocksState} 
                            setState={setStocksState}
                            controls={controls}
                        />
                    </div>
                </div>
                <StocksChooseBet 
                    controls={controls}
                    maxPossibleBet={stocksState.stats.currentTotalPoints}
                    visible={betViewVisible}
                />
                <StocksShop 
                    visible={shopVisible} 
                    controls={controls}
                    state={stocksState}
                />
            </div>
}