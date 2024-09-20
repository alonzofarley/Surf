// src/components/GameBoard.js
import React, { Dispatch, createContext, useContext, useState } from "react";
import Player from "./player";
import styles from "./../../styles/hearts.module.css";
import {
  CardType,
  Log,
  PlayerType,
  PoolType,
  RoundHistory,
  RoundInfo,
  Suit
} from "@/utils/hearts/types";
import { PoolView } from "./pool";
import {
  NUM_OF_PLAYERS,
  adjudicateFinishedRound,
  cardComparatorForRound,
  createDeck,
  createNewRoundInfo,
  createPlayers,
  determinePoolWinner,
  displayPlayerNumber,
  displayPlayerNumberFromId,
  distributeCardsFromDeck,
  getPoolPids,
  playCardHelper,
  removeCardFromPlayer,
  shuffleDeck,
  textOfCard
} from "@/utils/hearts/cardHelpers";
import { LogView } from "./log";
import { Players } from "./players";
import {
  AI_MOVE_DELAY,
  RESOLVE_WINNER_DELAY,
  aiPlay,
  delay
} from "@/utils/hearts/aiControl";
import { flushSync } from "react-dom";

export type PlayCardCallback = (
  pid: PlayerType["id"]
) => (card: CardType) => void;

export const GameBoard = () => {
  const [deck, setDeck] = useState([] as CardType[]);
  const [players, setPlayers]: [
    PlayerType[],
    Dispatch<React.SetStateAction<PlayerType[]>>
  ] = useState(createPlayers(NUM_OF_PLAYERS)); // 4 players for Hearts
  const [currentTurn, setCurrentTurn] = useState(0);
  const [log, setLog] = useState({ history: [] } as Log);
  const [roundInfo, setRoundInfo] = useState(
    createNewRoundInfo(NUM_OF_PLAYERS, 0)
  );
  const [handInProgress, setHandInProgress] = useState(false);
  const [handCount, setHandCount] = useState(0);
  const [handFirstTurn, setHandFirstTurn] = useState(0);

  let deal = () => {
    let { remainingDeck, updatedPlayers } = distributeCardsFromDeck(
      shuffleDeck(createDeck()),
      players
    );
    flushSync(() => {
      setDeck(remainingDeck);
      setPlayers(updatedPlayers);
      setHandInProgress(true);
      setHandCount((hc) => hc + 1);
      setCurrentTurn(handFirstTurn);
      setLog({
        history: [
          ...log.history,
          {
            handNumber: handCount + 1,
            roundHistories: []
          }
        ]
      });
    });
    stepPlayCard(0, createDummyCardToNeverBeUsed, true);
  };

  let createDummyCardToNeverBeUsed: CardType = {
    suit: "diamonds",
    value: "A"
  };

  const stepPlayCard = async (
    pid: PlayerType["id"],
    card: CardType,
    advanceAIPlayersOnly: boolean = false
  ) => {
    let updatedPlayers = players;
    let updatedRoundInfo = roundInfo;
    let updatedCurrentTurn = currentTurn;
    let updatedLog = log;

    if (!advanceAIPlayersOnly) {
      // let { updatedPlayers, updatedRoundInfo, updatedCurrentTurn, updatedLog } =
      //   await playCardHelper(pid, card)(roundInfo, players, currentTurn, log);

      let updates = await playCardHelper(pid, card)(
        updatedRoundInfo,
        updatedPlayers,
        updatedCurrentTurn,
        updatedLog
      );
      updatedPlayers = updates.updatedPlayers;
      updatedRoundInfo = updates.updatedRoundInfo;
      updatedCurrentTurn = updates.updatedCurrentTurn;
      updatedLog = updates.updatedLog;

      flushSync(() => {
        setCurrentTurn(updatedCurrentTurn);
      });
      flushSync(() => {
        setPlayers(updatedPlayers);
      });
      flushSync(() => {
        setRoundInfo(updatedRoundInfo);
      });
      flushSync(() => {
        setLog(updatedLog);
      });
    }
    let handOver = false;

    while (
      (updatedCurrentTurn != 0 || updatedRoundInfo.winner != undefined) &&
      !handOver
    ) {
      if (updatedRoundInfo.winner != undefined) {
        await delay(RESOLVE_WINNER_DELAY);
        let updates = adjudicateFinishedRound(
          updatedRoundInfo,
          updatedPlayers,
          updatedLog
        );

        updatedPlayers = updates.updatedPlayers;
        updatedRoundInfo = updates.updatedRoundInfo;
        updatedCurrentTurn = updates.updatedCurrentTurn;
        updatedLog = updates.updatedLog;
        flushSync(() => {
          setCurrentTurn(updatedCurrentTurn);
        });
        flushSync(() => {
          setPlayers(updatedPlayers);
        });
        flushSync(() => {
          setRoundInfo(updatedRoundInfo);
        });
        flushSync(() => {
          setLog(updatedLog);
        });

        handOver = updatedPlayers.every((p) => p.hand.length == 0);
        console.log(
          "Check if HandOver",
          handOver,
          updatedPlayers.map((p) => p.hand)
        );

        continue;
      }

      await delay(AI_MOVE_DELAY);
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

      flushSync(() => {
        setCurrentTurn(updatedCurrentTurn);
      });
      flushSync(() => {
        setPlayers(updatedPlayers);
      });
      flushSync(() => {
        setRoundInfo(updatedRoundInfo);
      });
      flushSync(() => {
        setLog(updatedLog);
      });
    }
    console.log("Check if HandOver", handOver);
    console.log(
      "player hands",
      updatedPlayers.map((p) => p.hand)
    );
    if (handOver) {
      //End Game, wait for next hand
      flushSync(() => {
        setHandInProgress(false);
        setHandFirstTurn((hft) => (hft + 1) % 4);
      });
    }
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
          {!handInProgress ? (
            <button onClick={deal}>Deal Cards</button>
          ) : (
            <h1>Hand #{handCount}</h1>
          )}
          <Players
            currentTurn={currentTurn}
            players={players}
            setHand={setHand}
          />
        </div>
      </PlayCardContext.Provider>
      <div className={styles.rightPanel}>
        <h3>Round {roundInfo.roundNumber + 1}</h3>
        <div className={styles.rightPanelPoolAndLog}>
          <PoolView roundInfo={roundInfo} />
          <LogView log={log} />
        </div>
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
