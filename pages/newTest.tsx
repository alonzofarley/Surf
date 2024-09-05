// 'use server';
import { ServerPusherWrapper } from "@/components/server-pusher-wrapper";
import { WaitingRoom } from "@/components/waitingRoom";
import { pusherClient } from "@/utils/pusher";
import { ClientSideUserView, SocketServerMessageType, SocketServerMessageTypeUpdateUsers, SocketType, UserRole } from "@/utils/socketTypes";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

// type State = {
//     socketReady: boolean
//     registered: boolean, 
//     players: ClientSideUserView[], 
//     role: UserRole, 
//     gameId: string, 
//     name: string, 
//     testMessage: string
// }

export default function Test(props: {}) {
    // let initialState: State = {
    //     socketReady: false, 
    //     registered: false,
    //     players: [],
    //     role: 'unassigned', 
    //     gameId: '', 
    //     name: '', 
    //     testMessage: ''
    // }
    // let [state, setState] = useState(initialState);
    // useEffect(() => {
    //     pusherClient.subscribe("chat-app")
    //     pusherClient.bind('upcoming-message', (msg: { message: string; }) => {
    //         setState({
    //             ...state, 
    //             testMessage: msg.message
    //         })
    //         console.log(msg);
    //         console.log(msg.message);
    //         console.log(JSON.parse(msg));
    //     })
    // }, [])
    // let s = {emit: (s:any) => console.log(s)};
    // return <div>
    //     <WaitingRoom socket={s} players={[]}/>
    // </div>

    return <div>
        <ServerPusherWrapper />
    </div>

}