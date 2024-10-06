import React from "react";
import { displayCard } from "./card";
import { RoundInfo } from "@/utils/hearts/types";
import styles from "./../../styles/hearts.module.css";
import { displayPlayerNumberFromId } from "@/utils/hearts/cardHelpers";
import {
  useCurrentHighlightedCardContext,
  useCurrentScoringActionContext
} from "./gameboard";

type PoolViewProps = {
  roundInfo: RoundInfo;
};

export const PoolView = (props: PoolViewProps) => {
  const pool = props.roundInfo.pool;
  const highlightedCardState = useCurrentHighlightedCardContext();
  const currentScoringActionState = useCurrentScoringActionContext();

  if (!(0 in pool)) {
    pool[0] = undefined;
  }
  if (!(1 in pool)) {
    pool[1] = undefined;
  }
  if (!(2 in pool)) {
    pool[2] = undefined;
  }

  if (!(3 in pool)) {
    pool[3] = undefined;
  }

  const winner = props.roundInfo.winner;
  const leadingPlayerId = props.roundInfo.leading.player;

  return (
    <div className={styles.pool}>
      <h4>Table</h4>
      <div>
        <ul>
          {Object.keys(pool).map((playerIdString, i) => {
            const playerId = Number(playerIdString);
            const displayedPlayerId = displayPlayerNumberFromId(playerId);

            const playedCard = pool[playerId];
            if (!playedCard) {
              return (
                <li key={i}>
                  Player {displayedPlayerId} has not played a card
                </li>
              );
            }

            let onMouseEnter = () => {
              highlightedCardState.setHighlightedCard(playedCard);
            };

            let onMouseLeave = () => {
              highlightedCardState.setHighlightedCard(undefined);
            };

            // let isCurrentlyBeingScored =
            //   playedCard.suit ==
            //     currentScoringCardState.currentScoringCard?.suit &&
            //   playedCard.value ==
            //     currentScoringCardState.currentScoringCard.value;

            if (leadingPlayerId == playerId) {
              return (
                <li key={i}>
                  {winner == playerId ? <>* Winner * </> : <></>}
                  Player {displayedPlayerId} led with
                  {displayCard(
                    playedCard,
                    undefined,
                    undefined,
                    onMouseEnter,
                    onMouseLeave,
                    currentScoringActionState.currentScoringAction
                  )}
                </li>
              );
            } else {
              return (
                <li key={i}>
                  {winner == playerId ? <>* Winner * </> : <></>}
                  Player {displayedPlayerId}{" "}
                  {displayCard(
                    playedCard,
                    undefined,
                    undefined,
                    onMouseEnter,
                    onMouseLeave,
                    currentScoringActionState.currentScoringAction
                  )}
                </li>
              );
            }
          })}
        </ul>
      </div>
    </div>
  );
};
