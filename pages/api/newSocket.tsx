import { Server } from 'socket.io'
import { SocketClientMessage, SocketClientMessageType, SocketClientMessageTypeGuessChanged, SocketClientMessageTypeGuessSubmitted, SocketClientMessageTypeRegister, SocketServerMessage, SocketServerMessageType, User, UserRole } from '../../utils/socketTypes'
import { use } from 'react';
import { setUncaughtExceptionCaptureCallback } from 'process';
import { fetchWithType, scoreGuess } from '../../utils/misc';
import { GameResponseData } from '../../utils/types';


//https://codedamn.com/news/nextjs/how-to-use-socket-io - this has some wrong stuff but the outline from here. next link filled in gaps.
//https://medium.com/@mohammadaliasghar523/creating-a-real-time-chat-app-with-next-js-and-websockets-e41fd131949c

//io.sockets.socket(savedSocketId).emit(...) 

let socketList: SocketList = {};
let userList: UserList = [];
let interval: NodeJS.Timeout;
let testInterval = 4;

type SocketList = {
  [socketId: string] : User
}

type UserList = User[];

const SocketHandler = (req:any, res:any) => {
  if (res.socket.server.io) {
    console.log('Socket already exists')
  } else {
    
    console.log('Socket is initializing')
    const io = new Server(res.socket.server)
    res.socket.server.io = io

    io.on('connection', onConnection(io))

    if(!interval){
      interval = setInterval(() => {
        let m = "test: " + testInterval;
        console.log(m);
        io.emit("testMessage", {
          message: m
        })
        testInterval += Math.round(10 * Math.random())
      }, 3000)
    }
  }
  res.end()
}


const onConnection = (io: Server) => (socket: any) => {
    console.log("Someone connected");
    const socketId = socket.id;
    console.log(`Socket Id: ${socketId}`);

    const newUser = createEmptyUser(socketId)
    socketList[socketId] = newUser;
    userList.push(newUser);

    console.log(socketList);

    socket.on('disconnect', disconnect(socketId));
}

const disconnect = (socketId: any) => () => {
  //io.emit('hello', "hello world");
  console.log(`User with socket id ${socketId} disconnected`)
  delete socketList[socketId];
  userList.filter((user) => {
    return user.socketId != socketId;
  });
  if(interval && userList.length == 0){
    clearInterval(interval);
    console.log("clearing interval");
  }
}

const createEmptyUser: (socketId: string) => User = (socketId) => {
    return {
      name: "", 
      role: "unassigned", 
      ready: false, 
      recentGuess: NaN, 
      score: 0, 
      gameId: "",
      socketId: socketId
    }
}

export default SocketHandler