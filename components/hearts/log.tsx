import { CardType, RoundHistory } from "@/utils/hearts/types";
import { createContext, useContext, useState } from "react";
import styles from "./../../styles/hearts.module.css";
import { HandSortPanel } from "./handSortPanel";
import { DisplayHand } from "./displayHand";
import {
  displayPlayerNumberFromId,
  getPoolPids,
  sortPlayersByLeadingPlayer,
  textOfCard
} from "@/utils/hearts/cardHelpers";
import { Accordion } from "react-bootstrap";

type LogViewProps = {
  log: RoundHistory[];
};

export const LogView = (props: LogViewProps) => {
  let log = props.log;
  if (log.length == 0) {
    return <></>;
  }

  return (
    <div className={styles.log}>
      <h4>Log</h4>

      <ul>
        {log.map((roundHistory, i) => {
          if (roundHistory.roundInfo.leading.player == undefined) {
            console.error(roundHistory);
            throw Error("round history, leading player is undefined");
          }
          let sortedPool = sortPlayersByLeadingPlayer(
            getPoolPids(roundHistory.roundInfo.pool),
            roundHistory.roundInfo.leading.player
          );

          return (
            <li key={i}>
              <Accordion>
                <Accordion.Header>
                  Round {roundHistory.roundInfo.roundNumber + 1}
                </Accordion.Header>
                <Accordion.Body>
                  {sortedPool.map((pid, j) => {
                    let card = roundHistory.roundInfo.pool[pid];
                    if (!card) {
                      console.error(roundHistory, pid);
                      throw Error("round history is wrong");
                    }
                    let displayMessage = `Player ${displayPlayerNumberFromId(pid)} played ${textOfCard(card)}`;
                    if (roundHistory.roundInfo.leading.player == pid) {
                      displayMessage = `Player ${displayPlayerNumberFromId(pid)} led with the ${textOfCard(card)}`;
                    }

                    return (
                      <div key={j}>
                        <p>{displayMessage}</p>
                      </div>
                    );
                  })}
                  <p>
                    Winner: Player{" "}
                    {displayPlayerNumberFromId(roundHistory.winner)}
                  </p>
                </Accordion.Body>
              </Accordion>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
