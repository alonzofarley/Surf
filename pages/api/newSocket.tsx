"use server"

import { pusherServer } from "@/utils/pusher"

let r = 4;
let interval = setInterval(() => {
  pusherServer.trigger("chat-app", "upcoming-message", {
    message: "test" + r
  })
  r += Math.round(Math.random() * 16);
}, 3000)

pusherServer.trigger("chat-app", "upcoming-message", {
  message: "jello World"
})
console.log("triggered");
console.log(process.env.NEXT_PUBLIC_PUSHER_APP_ID)
console.log(process.env.NEXT_PUBLIC_PUSHER_KEY)
console.log(process.env.NEXT_PUBLIC_PUSHER_CLUSTER)
console.log(process.env.PUSHER_SECRET)


const SHandler = (req:any, res:any) => {
  res.end()
}

// const createEmptyUser: (socketId: string) => User = (socketId) => {
//     return {
//       name: "", 
//       role: "unassigned", 
//       ready: false, 
//       recentGuess: NaN, 
//       score: 0, 
//       gameId: "",
//       socketId: socketId
//     }
// }

export default SHandler