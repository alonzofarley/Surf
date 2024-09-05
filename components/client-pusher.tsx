'use client';
import { customBind, pusherClient } from "@/utils/pusher";
import { useEffect, useState } from "react";

type ClientPusherProps = {
    testMessage?: string
}


export function ClientPusher(props: ClientPusherProps) {
    let [state, setState] = useState(props);

    useEffect(() => {
        pusherClient.subscribe("chat-app")
        customBind(pusherClient, 'upcoming-message', (msg: { message: string; }) => {
            setState({
                ...state, 
                testMessage: msg.message
            })
            console.log(msg);
            console.log(msg.message);
            console.log(JSON.parse(msg as any));
        })
    }, [])

    let onClick = (e: any) => {
        pusherClient.send_event('test',{ message: "test from Client" });
    }

    return <div>
        <div>
            <p>{state.testMessage ?? ""}</p>
        </div>
        <button onClick={onClick} />
    </div>
}