import { useEffect, useState } from "react";
import { fetchWithType } from "../utils/misc";
import { PercentSliderInput } from "../components/percentSliderInput";
import { GameResponseData, GuessGiverData, PlayerColors, supportedColors } from "../utils/types";
import { displayPlayers } from "../components/displayPlayers";
import { ClientSideUserView, SocketClientMessageType, SocketType } from "../utils/socketTypes";

type GuessGiverViewProps = {
    gameId: string,
    players: ClientSideUserView[], 
    name: string, 
    socket: SocketType,
}

type State = {
    gameId: string,
    concept1: string,
    concept2: string,
    targetPercent: number, 
    loaded: boolean
}

export function GuessGiverView(props: GuessGiverViewProps) {
    const role = "guessGiver";

    const [state, setState] = useState({
        gameId: props.gameId,
        concept1: "", 
        concept2: "",
        targetPercent: NaN, 
        loaded: false
    }); 

    let [colors, setColors] = useState({} as PlayerColors)

    useEffect(() => {
        async function getGuessGiverData() {
            const guessGiverData = await fetchWithType<GuessGiverData>(`api/guessPrompt?role=${role}&gameId=${state.gameId}`);
        
            const newState: State = {
                gameId: state.gameId,
                concept1: guessGiverData.concept1,
                concept2: guessGiverData.concept2,
                targetPercent: guessGiverData.targetPercent, 
                loaded: true
            }
            setState(newState);
        }
        getGuessGiverData();

        let startingColors:PlayerColors = {};
        for(let i = 0; i < props.players.length; i++){
            let player = props.players[i];
            let selectedColor = i < supportedColors.length ? supportedColors[i] : supportedColors[0];
            startingColors[player.name] = selectedColor
        }
        
        setColors(startingColors)
    }, [])

    let concepts = {
        concept1: state.concept1, 
        concept2: state.concept2
    }

    if(state.loaded){
        let otherPlayers = props.players.filter(player => player.name != props.name);

        console.log(otherPlayers, colors);

        const nextRound = () => {
            props.socket.emit(SocketClientMessageType.NEXT_ROUND);
        }
        return <div>
            <p>This is the target value</p>
            <form>
                <PercentSliderInput value={state.targetPercent} disabled={true} players={otherPlayers} colors={colors} concepts={concepts}/>
                <button onClick={nextRound}>Next Round</button>
            </form>
            {displayPlayers(props.players, colors)}
        </div>
    }
    return <div>
        <p>Loading...</p>
    </div>
    
}

export async function getServerSideProps() {
    return {
        props: {
            gameId: "test"
        }
    }
}

export default function GuessGiverViewPreview(props: GuessGiverViewProps){
    return <GuessGiverView {...props} />
}