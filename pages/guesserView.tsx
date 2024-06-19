import { useEffect, useState } from "react";
import { PercentSliderInput } from "../components/percentSliderInput";
import { fetchWithType, scoreGuess } from "../utils/misc";
import { GuesserData, GuesserResults, GuesserSubmission, PlayerColors, supportedColors } from "../utils/types";
import { displayPlayers } from "../components/displayPlayers";
import { ClientSideUserView, SocketClientMessage, SocketClientMessageType, SocketType } from "../utils/socketTypes";
import { platform } from "os";

type GuesserViewProps = {
    gameId: string, 
    players: ClientSideUserView[], 
    socket: SocketType,
    name: string
}

type State = {
    gameId: string, 
    concept1: string, 
    concept2: string, 
    loaded: boolean, 
    guess: number, 
    targetPercent: number, 
    submittedGuess: boolean, 
    score: number, 
}

export function GuesserView(props: GuesserViewProps) {
    const role = "guesser";

    const [state, setState] = useState({
        gameId: props.gameId,
        concept1: "", 
        concept2: "",
        loaded: false, 
        guess: 50, 
        targetPercent: NaN, 
        submittedGuess: false, 
        score: NaN
    }); 

    let [colors, setColors] = useState({} as PlayerColors)

    useEffect(() => {
        async function getGuesserData() {
            const guesserData = await fetchWithType<GuesserData>(`api/guessPrompt?role=${role}&gameId=${state.gameId}`);
        
            const newState: State = {
                ...state,
                concept1: guesserData.concept1,
                concept2: guesserData.concept2,
                loaded: true
            }
            setState(newState);
        }
        getGuesserData();

        

        let startingColors:PlayerColors = {};
        for(let i = 0; i < props.players.length; i++){
            let player = props.players[i];
            let selectedColor = i < supportedColors.length ? supportedColors[i] : supportedColors[0];
            startingColors[player.name] = selectedColor
        }
        
        setColors(startingColors)
    }, [])

    const notifyGuessChanged = () => {
        let message: SocketClientMessage = {
            type: SocketClientMessageType.GUESS_CHANGED,
            data: {
                playerName: props.name, 
                potentialGuess: state.guess
            }
        }
        props.socket.emit(message.type, message.data);
    }

    const notifyGuessSubmitted = () => {
        let message: SocketClientMessage = {
            type: SocketClientMessageType.GUESS_SUBMITTED,
            data: {
                playerName: props.name, 
                finalGuess: state.guess
            }
        }
        props.socket.emit(message.type, message.data);
    }

    const onSubmit = async (event: any) => {
        event.preventDefault();
        const guesserSubmission: GuesserSubmission = {guessedPercent: state.guess};
        const results: GuesserResults = 
            await fetchWithType<GuesserResults>(
                `api/guessPrompt?role=${role}&gameId=${state.gameId}`,
                {
                    method: "POST", 
                    body: JSON.stringify(guesserSubmission) ,
                })

        setState({
            ...state,
            targetPercent: results.targetPercent, 
            submittedGuess: true,
            score: scoreGuess(results.targetPercent, state.guess)
        })
        notifyGuessSubmitted()
    }

    const onChange = (event: any) => {
        event.preventDefault();
        const value = parseFloat(event.target.value);
        setState({...state, guess: value})
        notifyGuessChanged()
    }

    let concepts = {
        concept1: state.concept1,
        concept2: state.concept2
    }

    if(!Number.isNaN(state.targetPercent) && state.submittedGuess){
        let scoreDisplay = 
            state.score != 1 ? <p>{state.score} points</p> : <p>{state.score} point</p>;

        return <div>
            <p>Guess Results</p>
            <form>
                <div>
                    <label>Guess:</label>
                    <PercentSliderInput value={state.guess} disabled={true}  players={props.players} colors={colors} concepts={concepts}/>
                </div>
                <div>
                    <label>Actual:</label>
                    <PercentSliderInput value={state.targetPercent} disabled={true}  players={props.players} colors={colors} concepts={concepts}/>
                </div>
                <div>
                    <label>Score:</label>
                    {scoreDisplay}
                </div>
            </form>
            {displayPlayers(props.players, colors)}
        </div>
    } else {
        let otherPlayers = 
            props.players
                .filter(player => player.name != props.name)
                .filter(player => player.role != "guessGiver");

        return <div>
            <p>Choose a value on the slider</p>
            <form onSubmit={onSubmit}>
                <div>
                    <PercentSliderInput value={state.guess} onChange={onChange} players={otherPlayers} colors={colors} concepts={concepts}/>
                </div>
                <input type="submit" value="Submit" />
            </form>
            {displayPlayers(props.players, colors)}
        </div>
    }
}

export async function getServerSideProps() {
    return {
        props: {
            gameId: "test"
        }
    }
}

export default function GuesserViewPreview(props: GuesserViewProps){
    return <GuesserView {...props} />
}