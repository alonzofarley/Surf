
import { DefaultEventsMap } from "@socket.io/component-emitter";
import { use, useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";
import { ClientSideUserView, SocketClientMessage, SocketClientMessageType, SocketServerMessage, SocketServerMessageType, SocketServerMessageTypeUpdateUsers, SocketType, UserRole } from "./utils/socketTypes";
import { Register } from "./components/register";
import { displayPlayers } from "./components/displayPlayers";
import { get } from "http";
import { alignStates } from "./utils/misc";
import { WaitingRoom } from "./components/waitingRoom";
import { GuessGiverView } from "./guessGiverView";
import { GuesserView } from "./guesserView";
import { GameResponseData } from "./utils/types";

let socket: SocketType;

type State = {
    socketReady: boolean
    registered: boolean, 
    players: ClientSideUserView[], 
    changes: number, 
    role: UserRole, 
    gameId: string, 
    name: string
}

export default function Test(props: {}) {

    let initialState: State = {
        socketReady: false, 
        registered: false,
        players: [],
        changes: 0, 
        role: 'unassigned', 
        gameId: '', 
        name: ''
    }
    let [state, setState] = useState(initialState)
    /*  
        This players variable is separated because I realized that when declaring the socket below, 
        any updates to the state that are dependent on the current state will instead take from
        the initial state (when the socket connection was declared). Therfore, overwriting data into a state 
        seems to work fine. Which might be the route I need to go. 
    */
    let [players, setPlayers] = useState([] as ClientSideUserView[]);
    let [role, setRole] = useState('unassigned' as UserRole);
    let [gameId, setGameId] = useState('');

    /* This ugly function forces a rerender by immediately changing the state if the properties that get 
        updated by the socket connection are ever out of sync with the component state.
    */
    alignStates(setState, state, [
        {propertyName: "players", propertyValue: players},
        {propertyName: "role", propertyValue: role}, 
        {propertyName: "gameId", propertyValue: gameId}
    ]);

    useEffect(() => {
        socketInitializer().then(() => {
            updateSocketReady();
        })
    }, [])


    const updateSocketReady = () => {
        setState({
            ...state,
            socketReady: true, 
            changes: state.changes+1
        })
    }

    const socketInitializer = async () => {
        await fetch('/api/socket')
        socket = io()

        socket.on('connect', () => {
            console.log('connected');
        })

        socket.on(SocketServerMessageType.UPDATE_USERS, (msg: SocketServerMessageTypeUpdateUsers) => {
            setPlayers(msg.users);
            console.log(SocketServerMessageType.UPDATE_USERS, msg)
        })

        socket.on(SocketServerMessageType.TO_GUESSER, (gameData: GameResponseData) => {
            console.log("I'm a guesser")
            setRole('guesser');
            setGameId(gameData.gameId)
        })

        socket.on(SocketServerMessageType.TO_GUESSGIVER, (gameData: GameResponseData) => {
            console.log("I'm a guess giver")
            setRole('guessGiver');
            setGameId(gameData.gameId)
        })
    }

    const onRegistered = (name: string) => {
        setState({
            ...state, 
            registered: true,
            changes: state.changes+1, 
            name: name
        })
    }


    if(state.socketReady){
        if(!state.registered){
            return <div>
                <Register socket={socket} onRegistered={onRegistered}/>
            </div>
        }

        switch(state.role){
            case('guesser'):
                return <div>
                    <GuesserView gameId={state.gameId} players={players} name={state.name} socket={socket}/>
                </div>
            case('guessGiver'):
                return <div>
                    <GuessGiverView gameId={state.gameId} players={players} name={state.name} />
                </div>
            default:
                return <div>
                    <WaitingRoom players={players} socket={socket}/>
                </div>
        }
    }

    return <div>Waiting to connect...</div>
}
