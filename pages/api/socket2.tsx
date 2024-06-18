import { Server } from 'socket.io'
//https://codedamn.com/news/nextjs/how-to-use-socket-io
//https://codedamn.com/news/nextjs/how-to-use-socket-io - this has some wrong stuff but the outline from here. next link filled in gaps.
//https://medium.com/@mohammadaliasghar523/creating-a-real-time-chat-app-with-next-js-and-websockets-e41fd131949c

const SocketHandler = (req:any, res:any) => {
  if (res.socket.server.io) {
    console.log('Socket is already running')
  } else {
    console.log('Socket is initializing')
    const io = new Server(res.socket.server)
    res.socket.server.io = io

    io.on('connection', socket => {
        console.log("Someone connected")
        socket.on('input-change', msg => {
            console.log("socketoninputchange")
            io.emit('hello', "hello world");
        })
    })
  }
  res.end()
}

export default SocketHandler