import { CardType, PlayerType } from "@/utils/hearts/types";
import styles from "./../../styles/hearts.module.css";
import Player from "./player";
import { createContext, useContext } from "react";

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
        let handControl = {
          hand: player.hand,
          setHand: props.setHand(player)
        };
        return (
          <HandControlContext.Provider value={handControl}>
            <Player
              key={i}
              // key={player.id}
              player={player}
              isCurrentTurn={player.id == props.currentTurn}
            />
          </HandControlContext.Provider>
        );
      })}
    </div>
  );
};

type HandControl = {
  hand: CardType[];
  setHand: (h: CardType[]) => void;
};

export const HandControlContext = createContext<HandControl | undefined>(
  undefined
);

export const useHandControlContext = () => {
  const handControl = useContext(HandControlContext);
  if (handControl == undefined) {
    throw Error("useHandContext must be used within a HandContext.Provider");
  }
  return handControl;
};
