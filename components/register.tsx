import { useState } from "react";
import { SocketClientMessage, SocketClientMessageType, SocketType } from "../utils/socketTypes";

type RegisterProps = {
    socket: SocketType, 
    onRegistered: (name: string) => void
}

type State = {
    name: string
}

export function Register(props: RegisterProps) {

    let [state, setState] = useState({name: ""});

    let onChange = (e: any) => {
        let newState: State = {
            name: e.target.value
        }
        setState(newState);
    }

    let onFormSubmit = (e: any) => {
        e.preventDefault();
        let message: SocketClientMessage = {
            type: SocketClientMessageType.REGISTER, 
            data: {
                name: state.name
            }
        }
        props.socket.emit(message.type, message.data);
        console.log(message);
        props.onRegistered(state.name);
    }

    return <div>
            <form onSubmit={onFormSubmit}>
                <label>What is your name?</label>
                <input placeholder="Type Name Here" value={state.name} onChange={onChange}/>
                <input type="submit" value="Submit" />
            </form>
        </div>
}