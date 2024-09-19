// src/components/GameBoard.js
import React, { createContext, useContext, useState } from "react";
import Player from "./player";
import styles from "./../../styles/hearts.module.css";
import {
  CardType,
  PlayerType,
  PoolType,
  RoundHistory,
  RoundInfo,
  Suit
} from "@/utils/hearts/types";
import { PoolView } from "./pool";
import {
  cardComparatorForRound,
  createDeck,
  createNewRoundInfo,
  createPlayers,
  determinePoolWinner,
  displayPlayerNumber,
  displayPlayerNumberFromId,
  distributeCardsFromDeck,
  getPoolPids,
  removeCardFromPlayer,
  shuffleDeck,
  textOfCard
} from "@/utils/hearts/cardHelpers";
import { LogView } from "./log";
import { Players } from "./players";

const NUM_OF_PLAYERS = 4;
export type PlayCardCallback = (
  pid: PlayerType["id"]
) => (card: CardType) => void;

export const GameBoard = () => {
  const [deck, setDeck] = useState(shuffleDeck(createDeck()));
  const [players, setPlayers] = useState(createPlayers(NUM_OF_PLAYERS)); // 4 players for Hearts
  const [currentTurn, setCurrentTurn] = useState(0);
  //const [pool, setPool] = useState(createInitialPool(NUM_OF_PLAYERS));
  //const [round, setRound] = useState(0);
  const [log, setLog] = useState([] as RoundHistory[]);
  const [roundInfo, setRoundInfo] = useState(
    createNewRoundInfo(NUM_OF_PLAYERS, 0)
  );

  let deal = () => {
    let { remainingDeck, updatedPlayers } = distributeCardsFromDeck(
      deck,
      players
    );
    setDeck(remainingDeck);
    setPlayers(updatedPlayers);
  };

  const nextTurn = () => {
    setCurrentTurn((prevTurn) => (prevTurn + 1) % players.length);
  };

  const setTurn = (n: number) => {
    setCurrentTurn(n);
  };

  const playCard: PlayCardCallback = (pid) => (card) => {
    let isLeadingPlay = Object.values(roundInfo.pool).every(
      (playedCard) => playedCard == undefined
    );

    const newPool = { ...roundInfo.pool, [pid]: card };
    console.log(
      `Player ${displayPlayerNumberFromId(pid)} played ${textOfCard(card)}`
    );

    let newRoundInfo = {
      ...roundInfo,
      pool: newPool
    };

    if (isLeadingPlay) {
      newRoundInfo = {
        ...newRoundInfo,
        leading: {
          player: pid,
          card: card
        }
      };
    }
    setRoundInfo(newRoundInfo);

    let updatedPlayers = players.map((player) => {
      if (pid != player.id) return player;

      let playedCard = newRoundInfo.pool[pid];
      if (playedCard == undefined) {
        throw Error("Played Card is undefined");
      }

      return removeCardFromPlayer(player, playedCard);
    });

    console.log([...updatedPlayers], [...players]);
    setPlayers([...updatedPlayers]);

    if (Object.values(newPool).every((playedCard) => playedCard != undefined)) {
      console.log(`Round ${newRoundInfo.roundNumber + 1} completed`);
      console.log({ ...newRoundInfo.pool });
      let winner = determinePoolWinner(newRoundInfo);
      setLog([
        ...log,
        {
          roundInfo: {
            ...newRoundInfo
          },
          winner: winner.playerId
        }
      ]);
      setRoundInfo(
        createNewRoundInfo(NUM_OF_PLAYERS, roundInfo.roundNumber + 1)
      );
      setTurn(winner.playerId);
    } else {
      nextTurn();
    }
  };

  players.forEach((p) => console.log(p));

  const setHand: (p: PlayerType) => (h: CardType[]) => void =
    (p: PlayerType) => (h: CardType[]) => {
      setPlayers(
        [...players].map((player) => {
          if (player.id != p.id) {
            return player;
          }
          return { ...player, hand: [...h] };
        })
      );
    };

  return (
    <div className={styles.gameboard}>
      <PlayCardContext.Provider value={playCard}>
        <div className={`${styles.playersPanel} ${styles.leftPanel}`}>
          <h1>Hearts Game</h1>
          <button onClick={deal}>Deal Cards</button>
          <div>Current Turn: Player {currentTurn + 1}</div>
          <Players
            currentTurn={currentTurn}
            players={players}
            setHand={setHand}
          />
        </div>
      </PlayCardContext.Provider>
      <div className={styles.rightPanel}>
        <h3>Round {roundInfo.roundNumber + 1}</h3>
        <PoolView pool={roundInfo.pool} />
        <LogView log={log} />
      </div>
    </div>
  );
};

export const PlayCardContext = createContext<PlayCardCallback | undefined>(
  undefined
);
export const usePlayCardContext = () => {
  const playCard = useContext(PlayCardContext);
  if (playCard == undefined) {
    throw Error(
      "usePlayCardContext must be used within a PlayCardContext.Provider"
    );
  }
  return playCard;
};

// //Might need to move this to player in the future, depending on how things go
// export const HandContext = createContext<CardType[] | undefined>(undefined);

// export const useHandContext = () => {
//   const hand = useContext(HandContext);
//   if (hand == undefined) {
//     throw Error("useHandContext must be used within a HandContext.Provider");
//   }
//   return hand;
// };
