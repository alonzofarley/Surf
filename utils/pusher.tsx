import PusherServer, { Options } from "pusher";
import Pusher from "pusher-js";

const clusterOptions: Options = {
    appId: process.env.NEXT_PUBLIC_PUSHER_APP_ID ?? "", 
    key: process.env.NEXT_PUBLIC_PUSHER_KEY ?? "", 
    secret: process.env.PUSHER_SECRET ?? "", 
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER ?? ""
}
export const pusherServer = new PusherServer(clusterOptions)

type CustomPusher = Pusher & {
    bindCustom: any
}

export const pusherClient = new Pusher(
    process.env.NEXT_PUBLIC_PUSHER_KEY ?? "",
    {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER ?? ""
    }
)


/* Because Pusher's data can come back as a string and not a json, this custom bind does the parsing */
export const customBind = (p: Pusher, event_name: string, callback: Function, context?: any) => {
    p.bind(event_name, (data: any) => callback(JSON.parse(data)), context);
}   