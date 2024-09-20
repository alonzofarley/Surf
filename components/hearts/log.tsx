import { CardType, HandHistory, Log, RoundHistory } from "@/utils/hearts/types";
import { createContext, useContext, useState } from "react";
import styles from "./../../styles/hearts.module.css";
import { HandSortPanel } from "./handSortPanel";
import { DisplayHand } from "./displayHand";
import {
  displayPlayerNumberFromId,
  getPoolPids,
  reverseList,
  sortPlayersByLeadingPlayer,
  textOfCard
} from "@/utils/hearts/cardHelpers";
import { Accordion } from "react-bootstrap";

type LogViewProps = {
  log: Log;
};

export const LogView = (props: LogViewProps) => {
  let log = props.log;
  if (log.history.length == 0) {
    return <></>;
  }

  let gameHistory: HandHistory[] = reverseList(log.history);

  return (
    <div className={styles.log}>
      <h4>Log</h4>

      <ul>
        {gameHistory.map((handHistory, j) => {
          let roundHistories = reverseList(handHistory.roundHistories);
          let handNumber = handHistory.handNumber;
          return (
            <li key={j}>
              <Accordion>
                <Accordion.Header className={styles.accordionButton}>
                  Hand: {handNumber}
                </Accordion.Header>
                <Accordion.Body className={styles.accordianBody}>
                  <ul>
                    {roundHistories.map((roundHistory, i) => {
                      if (roundHistory.roundInfo.leading.player == undefined) {
                        console.error(roundHistory);
                        throw Error(
                          "round history, leading player is undefined"
                        );
                      }
                      let sortedPool = sortPlayersByLeadingPlayer(
                        getPoolPids(roundHistory.roundInfo.pool),
                        roundHistory.roundInfo.leading.player
                      );

                      return (
                        <li key={i}>
                          <Accordion>
                            <Accordion.Header
                              className={styles.accordionButton}
                            >
                              Round {roundHistory.roundInfo.roundNumber + 1}
                            </Accordion.Header>
                            <Accordion.Body
                              className={`${styles.accordianBody} ${styles.accordianBodyRound}`}
                            >
                              {sortedPool.map((pid, j) => {
                                let card = roundHistory.roundInfo.pool[pid];
                                if (!card) {
                                  console.error(roundHistory, pid);
                                  throw Error("round history is wrong");
                                }
                                let displayMessage = `Player ${displayPlayerNumberFromId(pid)} played ${textOfCard(card)}`;
                                if (
                                  roundHistory.roundInfo.leading.player == pid
                                ) {
                                  displayMessage = `Player ${displayPlayerNumberFromId(pid)} led with the ${textOfCard(card)}`;
                                }

                                return (
                                  <div key={j}>
                                    <p
                                      className={styles.logRoundCardPlayedEntry}
                                    >
                                      {displayMessage}
                                    </p>
                                  </div>
                                );
                              })}
                              <p>
                                Winner: Player{" "}
                                {
                                  displayPlayerNumberFromId(
                                    roundHistory.roundInfo.winner!
                                  ) //TODO: check for better way to account for maybe winner being undefined
                                }
                              </p>
                            </Accordion.Body>
                          </Accordion>
                        </li>
                      );
                    })}
                  </ul>
                </Accordion.Body>
              </Accordion>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
