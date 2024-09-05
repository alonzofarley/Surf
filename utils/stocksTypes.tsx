export type Controls = {
    stop: () => void, 
    cont: () => void, 
    restart: () => void, 
    score: () => void, 
    shopEnded: () => void, 
    submitBet: (n: number) => void,
}


export type State = {
    data: number[][],
    stats: Statistics,
    hasStopped: boolean, 
    changeScalar: number, 
    changeScalarAcceleration: number, 
}


export type Statistics = {
    currentValue: number,
    maxValue: number, 
    minValue: number, 
    initialValue: number,
    netGain: number,
    currentShopBalance: number, 
    potentialShopBalanceGain: number, 
    currentTotalPoints: number, 
    round: number
}
