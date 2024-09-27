import React, { createContext, useContext, useState } from "react";
import { CardType, PlayerType } from "@/utils/hearts/types";
import styles from "./../../styles/hearts.module.css";
import { Hand } from "./hand";
import { usePlayCardStateContext } from "./gameboard";
import { MAX_HEALTH, displayPlayerNumber } from "@/utils/hearts/cardHelpers";

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
  const playCardState = usePlayCardStateContext();
  const playCard = playCardState.playCardCallback;
  const leadingSuit = playCardState.leadingSuit;

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

      //If player could play a card of the leading suit but decides not to
      if (
        leadingSuit != undefined &&
        selectedCard.suit != leadingSuit &&
        player.hand.some((card) => card.suit == leadingSuit)
      ) {
        alert(`You must play a card of suit ${leadingSuit}.`);
        console.log(`You must play a card of suit ${leadingSuit}.`);
        cardSelectionControl.unselectCard(selectedCard);
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
        <div className={styles.playerHeader}>
          <h2>Player {displayPlayerNumber(player)}</h2>
          <div className={styles.playerHeaderPlayerInfo}>
            <h6>
              Health: {player.health}/{MAX_HEALTH}
            </h6>
            <h6>Coins: {player.coins}</h6>
          </div>
        </div>
        {player.hand.length > 0 && player.typeOfPlayer == "User" ? (
          <Hand />
        ) : (
          <></>
        )}
        {selectedCard &&
        props.isCurrentTurn &&
        props.player.typeOfPlayer == "User" ? (
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
