import { CardType, PlayerType } from "@/utils/hearts/types";
import styles from "./../../styles/hearts.module.css";
import Player from "./player";

type PlayersProps = {
  players: PlayerType[];
  currentTurn: PlayerType["id"];
  setHand: (p: PlayerType) => (h: CardType[]) => void;
};

export const Players = (props: PlayersProps) => {
  let players = props.players;
  return (
    <div className={styles.players}>
      {players.map((player, i) => {
        return (
          <Player
            key={i}
            // key={player.id}
            player={player}
            setHand={props.setHand(player)}
            isCurrentTurn={player.id == props.currentTurn}
          />
        );
      })}
    </div>
  );
};
