// 'use server';
import { pusherServer } from "@/utils/pusher";
import { ClientPusher } from "./client-pusher";
import { displayPlayers } from "./displayPlayers";

 

type ServerPusherWrapperProps = {
    
}


export function ServerPusherWrapper(props: ServerPusherWrapperProps) {
    
    // pusherServer.
    // pusherServer.trigger("chat-app", 'upcoming-message', {
    //     message: "hello world"
    // });
    

    // pusherServer

    return <div>
        <ClientPusher testMessage="test" />
    </div>
}