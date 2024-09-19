import React, { createContext, useContext, useState } from "react";
import Card from "./card";
import { CardType, PlayerType } from "@/utils/hearts/types";
import { Accordion, Button } from "react-bootstrap";
import styles from "./../../styles/hearts.module.css";
import { Hand } from "./hand";
import { usePlayCardContext } from "./gameboard";
import { displayPlayerNumber } from "@/utils/hearts/cardHelpers";

type PlayerProps = {
  player: PlayerType;
  isCurrentTurn: boolean;
};

type SelectCard = (c: CardType) => void;
type CardSelectionControl = {
  selectCard: SelectCard;
  selectedCard: CardType | undefined;
  unselectCard: SelectCard;
};

const Player = (props: PlayerProps) => {
  const player = props.player;
  const playCard = usePlayCardContext();

  const [selectedCard, setSelectedCard] = useState(
    undefined as CardType | undefined
  );

  const cardSelectionControl: CardSelectionControl = {
    selectCard: (card: CardType) => setSelectedCard(card),
    selectedCard: selectedCard,
    unselectCard: (card: CardType) => setSelectedCard(undefined)
  };

  const handlePlayCard = () => {
    if (props.isCurrentTurn) {
      if (!selectedCard) {
        alert("Must select a card");
        return;
      }
      playCard(player.id)(selectedCard);
      cardSelectionControl.unselectCard(selectedCard);
    } else {
      console.log(`It's not Player ${displayPlayerNumber(player)}'s turn`);
    }
  };

  return (
    <CardSelectionControlContext.Provider value={cardSelectionControl}>
      <div
        className={
          styles.player +
          (props.isCurrentTurn ? ` ${styles.playerCurrentTurn}` : "")
        }
      >
        <h2>Player {displayPlayerNumber(player)}</h2>
        {player.hand.length > 1 ? <Hand /> : <></>}
        {selectedCard && props.isCurrentTurn ? (
          <button
            className={styles.playerPlayCardButton}
            onClick={handlePlayCard}
          >
            Play Card
          </button>
        ) : (
          <></>
        )}
      </div>
    </CardSelectionControlContext.Provider>
  );
};

export const CardSelectionControlContext = createContext<
  CardSelectionControl | undefined
>(undefined);

export const useCardSelectionControl = () => {
  const cardSelectionControl = useContext(CardSelectionControlContext);
  if (cardSelectionControl == undefined) {
    throw Error(
      "cardSelectionControl must be used within a CardSelectionControlContext.Provider"
    );
  }
  return cardSelectionControl;
};

export default Player;
