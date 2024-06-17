import { ClientSideUserView } from "../utils/socketTypes"
import { PlayerColors } from "../utils/types"

export function displayPlayers(players: ClientSideUserView[], colors?: PlayerColors) {
    let playerUI = players.map((player, i) => {
        if(colors && player.role != "guessGiver"){
            return <li key={i}>
                <ul>
                    <li key="a">Name: {player.name}</li>
                    <li key="b">Role: {player.role}</li>
                    <li key="c">{player.ready ? "READY" : "NOT READY"}</li>
                    <div className={"colored-box " + colors[player.name]}></div>
                </ul> 
            </li>
        }
        
        return <li key={i}>
             <ul>
                <li key="a">Name: {player.name}</li>
                <li key="b">Role: {player.role}</li>
                <li key="c">{player.ready ? "READY" : "NOT READY"}</li>
            </ul>
        </li>
    })
    return <div>
        <ol>
            {playerUI}
        </ol>
    </div>
}