import React, { useState } from "react";
import Card, { displayCard } from "./card";
import {
  CardType,
  PlayerType,
  PoolType,
  RoundInfo
} from "@/utils/hearts/types";
import { Accordion, Button } from "react-bootstrap";
import styles from "./../../styles/hearts.module.css";
import { Hand } from "./hand";
import { displayPlayerNumberFromId } from "@/utils/hearts/cardHelpers";

type PoolViewProps = {
  roundInfo: RoundInfo;
};

export const PoolView = (props: PoolViewProps) => {
  const pool = props.roundInfo.pool;
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

            if (leadingPlayerId == playerId) {
              return (
                <li key={i}>
                  {winner == playerId ? <>* Winner * </> : <></>}
                  Player {displayedPlayerId} led with
                  {displayCard(playedCard)}
                </li>
              );
            } else {
              return (
                <li key={i}>
                  {winner == playerId ? <>* Winner * </> : <></>}
                  Player {displayedPlayerId} {displayCard(playedCard)}
                </li>
              );
            }
          })}
        </ul>
      </div>
    </div>
  );
};
