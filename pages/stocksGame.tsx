import { useState } from "react"
import Stocks from "../components/stocks/stocks"
import { StocksHomePage } from "@/components/stocks/stocksHomePage"
//https://echarts.apache.org/en/option.html#xAxis

//https://echarts.apache.org/en/option.html#animation
import Modal from 'react-bootstrap/Modal';
import { StocksShop } from "@/components/stocks/stocksShop";
import { StocksGamePage } from "@/components/stocks/stocksGamePage";

type State = {

}

type StocksGameProps = {

}

export default function StocksGame(props: StocksGameProps) {
    const [started, setStarted] = useState(false)
    if(!started){
        return <StocksHomePage onStart={() => setStarted(true)} />
    }
    return <StocksGamePage/>
}



