import { DefaultEventsMap } from "@socket.io/component-emitter";
import { Socket } from "socket.io-client";

// export type SocketClientMessageType = `${SocketClientMessage}` ;

export enum SocketClientMessageType {
    INPUT_CHANGED = 'input-change',
    REGISTER = 'register', 
    READY = 'ready', 
    UNREADY = 'unready',
    NEXT_ROUND = 'next_round', 
    GUESS_CHANGED = 'guess_changed',
    GUESS_SUBMITTED = 'guess_submitted'
}

export type SocketClientMessageTypeRegister = {
    name: string
}

export type SocketClientMessageTypeGuessChanged = {
    playerName: string, 
    potentialGuess: number
}

export type SocketClientMessageTypeGuessSubmitted = {
    playerName: string, 
    finalGuess: number
}

export type SocketClientMessage = 
    {
        type: SocketClientMessageType.REGISTER, 
        data: SocketClientMessageTypeRegister
    } | {
        type: SocketClientMessageType.READY
    } | {
        type: SocketClientMessageType.UNREADY
    } | {
        type: SocketClientMessageType.NEXT_ROUND
    } | {
        type: SocketClientMessageType.GUESS_CHANGED,
        data: SocketClientMessageTypeGuessChanged
    } | {
        type: SocketClientMessageType.GUESS_SUBMITTED,
        data: SocketClientMessageTypeGuessSubmitted
    }

export enum SocketServerMessageType {
    UPDATE_USERS = 'updateUsers', 
    TO_GUESSER = 'to_guesser', 
    TO_GUESSGIVER = 'to_guess_giver', 
    GUESS_GIVER_GUESS_SUBMITTED = 'guess_giver_guess_submitted', 
    GUESS_GIVER_GUESS_CHANGED = 'guess_giver_guess_changed'
}

export type ClientSideUserView = {
    name: string, 
    ready: boolean, 
    role: UserRole, 
    guess: number, 
    score: number
}

export type SocketServerMessageTypeUpdateUsers = {
    users: ClientSideUserView[]
}

export type SocketServerMessageTypeToGuesser = {
    gameId: string
}

export type SocketServerMessageTypeToGuessGiver = {
    gameId: string
}

export type SocketServerMessageTypeGuessGiverGuessChanged = {
    name: string, 
    guess: number
}

export type SocketServerMessageTypeGuessGiverGuessSubmitted = {
    name: string, 
    guess: number
}

export type SocketServerMessage = {
    type: SocketServerMessageType.UPDATE_USERS, 
    data: SocketServerMessageTypeUpdateUsers
} | {
    type: SocketServerMessageType.TO_GUESSER
    data: SocketServerMessageTypeToGuesser
} | {
    type: SocketServerMessageType.TO_GUESSGIVER
    data: SocketServerMessageTypeToGuessGiver
} | {
    type: SocketServerMessageType.GUESS_GIVER_GUESS_CHANGED
    data: SocketServerMessageTypeGuessGiverGuessChanged
} | {
    type: SocketServerMessageType.GUESS_GIVER_GUESS_SUBMITTED
    data: SocketServerMessageTypeGuessGiverGuessSubmitted
}

export type SocketType = Socket<DefaultEventsMap, DefaultEventsMap>


export type UserRole = "guesser" | "guessGiver" | "unassigned"

export type User = {
    name: string, 
    role: UserRole, 
    ready: boolean, 
    gameId: string, 
    recentGuess: number,
    score: number
}