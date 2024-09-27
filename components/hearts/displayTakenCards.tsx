import { Offcanvas } from "react-bootstrap";
import styles from "./../../styles/hearts.module.css";
import { HandHistory, Log } from "@/utils/hearts/types";
import {
  getWonCardByEachPlayer,
  getWonCardByEachPlayerByRound,
  reverseList
} from "@/utils/hearts/cardHelpers";
import { displayCard } from "./card";
import { useState } from "react";

type DisplayTakenCardsProps = {
  showDisplayTakenCards: boolean;
  setShowDisplayTakenCards: (b: boolean) => void;
  log: Log;
};

type DisplayType = "all_cards" | "cardsByRound";

export const DisplayTakenCards = (props: DisplayTakenCardsProps) => {
  let [displayType, setDisplayType] = useState("cardsByRound" as DisplayType);

  let log = props.log;
  if (log.history.length == 0) {
    return <></>;
  }
  let currentHandHistory: HandHistory = (
    reverseList(log.history) as HandHistory[]
  ).slice(-1)[0];
  let cardsWonByEachPlayer = getWonCardByEachPlayer(currentHandHistory);
  let cardsWonByEachPlayerByRound =
    getWonCardByEachPlayerByRound(currentHandHistory);

  let display =
    displayType == "all_cards" ? (
      <div className={styles.setDisplayTakenCardsCards}>
        {cardsWonByEachPlayer[0]?.map((card) => {
          return displayCard(card);
        })}
      </div>
    ) : (
      <div className={styles.setDisplayTakenCardsCardsByRound}>
        {cardsWonByEachPlayerByRound[0]?.map((roundData) => {
          return (
            <div className={styles.setDisplayTakenCardsCardsByRoundEntry}>
              <p>Round {roundData.roundNumber}</p>
              <div
                className={styles.setDisplayTakenCardsCardsByRoundEntryCards}
              >
                {roundData.cards.map((card) =>
                  displayCard(
                    card,
                    `${styles.card} ${styles.setDisplayTakenCardsCardsByRoundEntryCard}`
                  )
                )}
              </div>
            </div>
          );
        })}
      </div>
    );

  return (
    <>
      <button
        onClick={() => props.setShowDisplayTakenCards(true)}
        className={styles.setDisplayTakenCardsButton}
      >
        Display Taken Cards
      </button>
      <Offcanvas
        show={props.showDisplayTakenCards}
        className={`${styles.displayTakenCards} ${styles.offCanvasDiv}`}
      >
        <Offcanvas.Header>
          <h4>Taken Card</h4>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <div className={styles.displayTakenCardsDisplay}>{display}</div>
          <button
            onClick={() => props.setShowDisplayTakenCards(false)}
            className={styles.setDisplayTakenCardsButton}
          >
            Hide
          </button>
          <button
            onClick={() =>
              setDisplayType(
                displayType == "all_cards" ? "cardsByRound" : "all_cards"
              )
            }
            className={styles.setDisplayTakenCardsButton}
          >
            {displayType == "all_cards"
              ? "Display By Round"
              : "Display All Cards"}
          </button>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};
