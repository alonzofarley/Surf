// src/components/GameBoard.js
import React, { Dispatch, createContext, useContext, useState } from "react";
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
import { aiPlay, delay } from "@/utils/hearts/aiControl";

const NUM_OF_PLAYERS = 4;
export type PlayCardCallback = (
  pid: PlayerType["id"]
) => (card: CardType) => void;

export const GameBoard = () => {
  const [deck, setDeck] = useState(shuffleDeck(createDeck()));
  const [players, setPlayers]: [
    PlayerType[],
    Dispatch<React.SetStateAction<PlayerType[]>>
  ] = useState(createPlayers(NUM_OF_PLAYERS)); // 4 players for Hearts
  const [currentTurn, setCurrentTurn] = useState(0);
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

  const stepPlayCard = async (pid: PlayerType["id"], card: CardType) => {
    let { updatedPlayers, updatedRoundInfo, updatedCurrentTurn, updatedLog } =
      await playCardHelper(pid, card)(roundInfo, players, currentTurn, log);

    while (updatedCurrentTurn != 0) {
      console.log(
        "Ai Turn - data before they choose",
        updatedCurrentTurn,
        updatedPlayers,
        updatedRoundInfo,
        updatedLog
      );
      let aiPlayer = updatedPlayers[updatedCurrentTurn];
      let playedCard = aiPlay(aiPlayer, updatedRoundInfo);
      let updates = await playCardHelper(aiPlayer.id, playedCard)(
        updatedRoundInfo,
        updatedPlayers,
        updatedCurrentTurn,
        updatedLog
      );
      updatedPlayers = updates.updatedPlayers;
      updatedRoundInfo = updates.updatedRoundInfo;
      updatedCurrentTurn = updates.updatedCurrentTurn;
      updatedLog = updates.updatedLog;
      console.log(
        "Ai Turn - data after they choose",
        updatedCurrentTurn,
        updatedPlayers,
        updatedRoundInfo,
        updatedLog
      );
      //alert("waiting a second");
      //await delay(2000);
    }

    console.log(
      "Player Turn",
      updatedCurrentTurn,
      updatedPlayers,
      updatedRoundInfo,
      updatedLog
    );

    setCurrentTurn(updatedCurrentTurn);
    setPlayers(updatedPlayers);
    setRoundInfo(updatedRoundInfo);
    setLog(updatedLog);
  };

  const playCard: PlayCardCallback = (pid) => async (card) => {
    await stepPlayCard(pid, card);
  };

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

const playCardHelper =
  (pid: PlayerType["id"], card: CardType) =>
  async (
    previousRoundInfo: RoundInfo,
    previousPlayers: PlayerType[],
    previousTurn: number,
    previousLog: RoundHistory[]
  ) => {
    let isLeadingPlay = Object.values(previousRoundInfo.pool).every(
      (playedCard) => playedCard == undefined
    );
    const newPool = { ...previousRoundInfo.pool, [pid]: card };
    console.log(
      `Player ${displayPlayerNumberFromId(pid)} played ${textOfCard(card)}`
    );
    let updatedRoundInfo = {
      ...previousRoundInfo,
      pool: newPool
    };

    if (isLeadingPlay) {
      updatedRoundInfo = {
        ...updatedRoundInfo,
        leading: {
          player: pid,
          card: card
        }
      };
    }
    let updatedPlayers = previousPlayers.map((player) => {
      if (pid != player.id) return player;

      let playedCard = updatedRoundInfo.pool[pid];
      if (playedCard == undefined) {
        throw Error("Played Card is undefined");
      }

      return removeCardFromPlayer(player, playedCard);
    });

    let winner = Object.values(updatedRoundInfo.pool).every(
      (playedCard) => playedCard != undefined
    )
      ? determinePoolWinner(updatedRoundInfo)
      : undefined;

    let updatedCurrentTurn = (previousTurn + 1) % 4;
    let updatedLog = previousLog;
    if (winner != undefined) {
      updatedCurrentTurn = winner.playerId;
      updatedLog = [
        ...previousLog,
        {
          roundInfo: {
            ...updatedRoundInfo
          },
          winner: winner.playerId
        }
      ];
      updatedRoundInfo = createNewRoundInfo(
        NUM_OF_PLAYERS,
        updatedRoundInfo.roundNumber + 1
      );
    }

    return {
      updatedPlayers: updatedPlayers,
      updatedRoundInfo: updatedRoundInfo,
      updatedCurrentTurn: updatedCurrentTurn,
      updatedLog: updatedLog
    };
  };
