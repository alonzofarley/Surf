import { ClientSideUserView, SocketServerMessageType, SocketServerMessageTypeUpdateUsers, SocketType, UserRole } from "@/utils/socketTypes";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { io } from "socket.io-client";

let socket: SocketType;
let socketApiRoute = '/api/newSocket';


type State = {
    socketReady: boolean
    registered: boolean, 
    players: ClientSideUserView[], 
    role: UserRole, 
    gameId: string, 
    name: string, 
    testMessage: string
}

export default function Test(props: {}) {
    let initialState: State = {
        socketReady: false, 
        registered: false,
        players: [],
        role: 'unassigned', 
        gameId: '', 
        name: '', 
        testMessage: ''
    }
    let [state, setState] = useState(initialState);
    useEffect(() => {
        socketInitializer(setState).then(() => {
            setState({
                ...state,
                socketReady: true, 
            })
        })
    }, [])

    const socketInitializer = async (setState: Dispatch<SetStateAction<State>>) => {
        await fetch(socketApiRoute)
        socket = io()

        socket.on('connect', () => {
            console.log('connected');
        })

        socket.on('testMessage', (msg: {message: string}) => {
            console.log('new message');
            console.log(msg.message);
            setState({
                ...state, 
                testMessage: msg.message
            })
        })

        socket.on(SocketServerMessageType.UPDATE_USERS, (msg: SocketServerMessageTypeUpdateUsers) => {
            setState({
                ...state,
                players: msg.users 
            })
            console.log(SocketServerMessageType.UPDATE_USERS, msg)
        })
    }


    return <div>
        Test Message: 
        <p>{state.testMessage}</p>
    </div>

}