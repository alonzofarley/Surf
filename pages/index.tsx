import { useEffect, useState } from "react";
import { ConceptInputs } from "./conceptInputs";
import { fetchWithType } from "./utils/misc";
import { GameResponseData } from "./utils/types";

import io from "socket.io-client";

let socket = io('http://localhost:3000/socket');

type State = {
    conceptsSubmitted: boolean, 
    view: View, 
    gameId?: string
}

const initialState: State = {
    conceptsSubmitted: false, 
    view: "Input", 
}

type View = "Input" | "Play" | "Home" | "Load Game";

export default function Wave(props: {}) {
    const [state, setState] = useState(initialState);
    
    useEffect(() => {
        socket.on('connect', () => {
            console.log('Connected to the server');
        });
        return () => {
            socket.disconnect();
        };
    }, []);

    const onConceptsSubmitted = () => {
        setState({...state, conceptsSubmitted: true, view: "Load Game"});
    }

    const loadGame = async () => {
        let gameResponseData: GameResponseData = await fetchWithType<GameResponseData>("api/game");

    }

    switch(state.view){
        case("Input"):
            return <div>
                <ConceptInputs onSubmit={onConceptsSubmitted}/>
            </div>
        case("Load Game"):
            loadGame();
            return <div>
                <p>Loading...</p>
            </div>
        case("Play"):
            //Create new Game and get gameId
            //Send both Guessgiver and guesser the gameId

        default: 
            return <div>
                <p>Not Yet Implemented</p>
            </div>
    }
}



