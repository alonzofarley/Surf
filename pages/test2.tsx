
import { DefaultEventsMap } from "@socket.io/component-emitter";
import { use, useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";

let socket: Socket<DefaultEventsMap, DefaultEventsMap>;

export default function Test(props: {}) {
    const [input, setInput] = useState('')

    const [text, setText]= useState('no');
    useEffect(() => {
        socketInitializer()
    }, [])

    
    const socketInitializer = async () => {
        await fetch('/api/socket')
        socket = io()

        socket.on('connect', () => {
            console.log('connected')
        })
        socket.on('hello', msg => {
            console.log("got input change message");
            setText(msg)
        })
    }

    const onChangeHandler = (e: any) => {
        setInput(e.target.value)
        socket.emit('input-change', e.target.value)
    }

    return (<div>
    <input
        placeholder="Type something"
        value={input}
        onChange={onChangeHandler}
        />
        <p>{text}</p>
    </div>
        
    )
}
