import React, { useState } from "react";
import Card, { displayCard } from "./card";
import { CardType, PlayerType, PoolType } from "@/utils/hearts/types";
import { Accordion, Button } from "react-bootstrap";
import styles from "./../../styles/hearts.module.css";
import { Hand } from "./hand";
import { displayPlayerNumberFromId } from "@/utils/hearts/cardHelpers";

type PoolViewProps = {
  pool: PoolType;
};

export const PoolView = (props: PoolViewProps) => {
  const pool = props.pool;

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
            return (
              <li key={i}>
                Player {displayedPlayerId}
                {displayCard(playedCard)}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};
