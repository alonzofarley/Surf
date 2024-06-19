import { Server } from 'socket.io'
import { SocketClientMessage, SocketClientMessageType, SocketClientMessageTypeGuessChanged, SocketClientMessageTypeGuessSubmitted, SocketClientMessageTypeRegister, SocketServerMessage, SocketServerMessageType, User, UserRole } from '../../utils/socketTypes'
import { use } from 'react';
import { setUncaughtExceptionCaptureCallback } from 'process';
import { fetchWithType, scoreGuess } from '../../utils/misc';
import { GameResponseData } from '../../utils/types';


//https://codedamn.com/news/nextjs/how-to-use-socket-io - this has some wrong stuff but the outline from here. next link filled in gaps.
//https://medium.com/@mohammadaliasghar523/creating-a-real-time-chat-app-with-next-js-and-websockets-e41fd131949c

//io.sockets.socket(savedSocketId).emit(...) 
// let users: User[] = [];

type SocketMap = {
    [id: string]: User
}
let sockets: SocketMap = {}; 
let disconnectedSockets: SocketMap = {};

const getGuesserRoomName = (gameId: string) => {
    return `${gameId}_guesser`
}

const getGuessGiverRoomName = (gameId: string) => {
    return `${gameId}_guessGiver`
}

const SocketHandler = (req:any, res:any) => {
  if (res.socket.server.io) {
    console.log('Socket is already running')
    console.log(`SocketId ${res.socket.id}`)
    //console.log(`User registered: ${data.name}`);

  } else {
    console.log('Socket is initializing')
    const io = new Server(res.socket.server)
    res.socket.server.io = io

    io.on('connection', socket => {
        console.log("Someone connected")
        console.log("Current socket", socket.id);

        if(disconnectedSockets[socket.id]){
            sockets[socket.id] = disconnectedSockets[socket.id];
            delete disconnectedSockets[socket.id];
            console.log("socket grabbed data back")

        } else {          
            sockets[socket.id] = {
                name: "", 
                role: "unassigned", 
                ready: false, 
                gameId: '',
                recentGuess: NaN, 
                score: 0
            }
            console.log("socket created new data")

        }

        socket.on(SocketClientMessageType.REGISTER, (data: SocketClientMessageTypeRegister) => {            
            let userData = sockets[socket.id]
            let newUserData: User = {
                ...userData, 
                name: data.name
            }
            sockets[socket.id] = newUserData;

            let message: SocketServerMessage = {
                type: SocketServerMessageType.UPDATE_USERS, 
                data: {
                    users: Object.values(sockets).map(user => {
                        return {
                            name: user.name, 
                            ready: user.ready, 
                            role: user.role, 
                            guess: 50, 
                            score: 0
                        }
                    })
                }
            }
            io.emit(message.type, message.data);
            console.log(`User registered: ${data.name}`);
        })


        socket.on(SocketClientMessageType.READY, async () => {
            let userData = sockets[socket.id]
            let newUserData: User = {
                ...userData, 
                ready: true
            }
            sockets[socket.id] = newUserData;

            console.log(`User readied: ${userData.name}`);
            let socketRecord = Object.keys(sockets).map(key => {
                return {
                    id: key, 
                    user: sockets[key]
                }
            })

            if(socketRecord.every(record => record.user.ready)){
                let newGameData = await fetchWithType<GameResponseData>("/api/game");
                let newGameId = newGameData.gameId;

                let numberOfUsers = socketRecord.length;
                let guessGiverChoiceIndex = Math.floor(Math.random() * numberOfUsers);
                for(let i = 0; i < numberOfUsers; i++){
                    let role: UserRole = i == guessGiverChoiceIndex ? "guessGiver" : "guesser";
                    socketRecord[i].user.role = role;
                    socketRecord[i].user.gameId = newGameId;
                    const current_socket = io.sockets.sockets.get(socketRecord[i].id);
                    if(current_socket != undefined){
                        current_socket.join(`${newGameId}_${role}`);
                        console.log(`${socketRecord[i].user.name} joined room ${newGameId}_${role}`);
                    }
                }
            
                let users = Object.values(sockets);
                users.forEach(user => {
                    user.ready = false;   
                });
                let message: SocketServerMessage = {
                    type: SocketServerMessageType.UPDATE_USERS, 
                    data: {
                        users: users.map(user => {
                            return {
                                name: user.name, 
                                ready: user.ready, 
                                role: user.role,
                                guess: 50, 
                                score: user.score
                            }
                        })
                    }
                }
                io.emit(message.type, message.data);

                io.to(getGuesserRoomName(newGameId)).emit(SocketServerMessageType.TO_GUESSER, { gameId: newGameId});
                io.to(getGuessGiverRoomName(newGameId)).emit(SocketServerMessageType.TO_GUESSGIVER, { gameId: newGameId});
                return;
            }
            
            let users = Object.values(sockets);
            let message: SocketServerMessage = {
                type: SocketServerMessageType.UPDATE_USERS, 
                data: {
                    users: users.map(user => {
                        return {
                            name: user.name, 
                            ready: user.ready, 
                            role: user.role, 
                            guess: 50, 
                            score: user.score
                        }
                    })
                }
            }
            io.emit(message.type, message.data);
            
        })

        socket.on(SocketClientMessageType.UNREADY, () => {
            let userData = sockets[socket.id]
            let newUserData: User = {
                ...userData, 
                ready: false
            }
            sockets[socket.id] = newUserData;

            let message: SocketServerMessage = {
                type: SocketServerMessageType.UPDATE_USERS, 
                data: {
                    users: Object.values(sockets).map(user => {
                        return {
                            name: user.name, 
                            ready: user.ready, 
                            role: user.role, 
                            guess: 50, 
                            score: user.score
                        }
                    })
                }
            }
            io.emit(message.type, message.data);

            console.log(`User unreadied: ${userData.name}`);

        })

        socket.on(SocketClientMessageType.NEXT_ROUND, async () => {
            let userData = sockets[socket.id];
            let gameId = userData.gameId;
            let newGameData = await fetchWithType<GameResponseData>(`/api/game?nextRound=true&gameId=${gameId}`);
            //Now Clients should grab the information from the game api
            let message: SocketServerMessage = {
                type: SocketServerMessageType.NEXT_ROUND, 
            }
            io.emit(message.type);
        })

        socket.on(SocketClientMessageType.GUESS_CHANGED, (msg: SocketClientMessageTypeGuessChanged) => {            
            let user = Object.values(sockets).find(user => user.name == msg.playerName)

            if(user != undefined){
                user.recentGuess = msg.potentialGuess;

                let message: SocketServerMessage = {
                    type: SocketServerMessageType.UPDATE_USERS, 
                    data: {
                        users: Object.values(sockets).map(user => {
                            return {
                                name: user.name, 
                                ready: user.ready, 
                                role: user.role, 
                                guess: user.recentGuess, 
                                score: user.score
                            }
                        })
                    }
                }
                io.emit(message.type, message.data);
            }else{
                console.log(`Update skipped. User ${msg.playerName} not found`);
            }
        })

        socket.on(SocketClientMessageType.GUESS_SUBMITTED, (msg: SocketClientMessageTypeGuessSubmitted) => {
            let user = Object.values(sockets).find(user => user.name = msg.playerName)

            if(user != undefined){
                user.recentGuess = msg.finalGuess;

                let message: SocketServerMessage = {
                    type: SocketServerMessageType.UPDATE_USERS, 
                    data: {
                        users: Object.values(sockets).map(user => {
                            return {
                                name: user.name, 
                                ready: user.ready, 
                                role: user.role, 
                                guess: user.recentGuess, 
                                score: user.score
                            }
                        })
                    }
                }
                io.emit(message.type, message.data);
            }else{
                console.log(`Update skipped. User ${msg.playerName} not found`);
            }
        })

        socket.on('disconnect', () => {
            console.log(`A user disconnected`);
            if(sockets[socket.id].name != ""){
                console.log(`User disconnected: ${sockets[socket.id].name}`);
            }

            disconnectedSockets[socket.id] = sockets[socket.id];
            delete sockets[socket.id];
        });
    })
  }
  res.end()
}

export default SocketHandler