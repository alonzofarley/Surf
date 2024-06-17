import { useState } from "react";
import { ClientSideUserView, SocketClientMessage, SocketClientMessageType, SocketType } from "../utils/socketTypes";
import { displayPlayers } from "./displayPlayers";

type WaitingRoomProps = {
    socket: SocketType, 
    players: ClientSideUserView[]
}


export function WaitingRoom(props: WaitingRoomProps) {
    let [ready, setReady] = useState(false);

    const readyClick = () => {
        setReady(true);
        props.socket.emit(SocketClientMessageType.READY)
    }

    const unReadyClick = () => {
        setReady(false);
        props.socket.emit(SocketClientMessageType.UNREADY)
    }

    if(ready){
        return <div>
            {displayPlayers(props.players)}
            <button onClick={unReadyClick}>UnReady</button>
        </div> 
    }

    return <div>
            {displayPlayers(props.players)}
            <button onClick={readyClick}>Ready</button>
        </div>
}