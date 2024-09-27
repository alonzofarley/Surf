// src/components/GameBoard.js
import React, { Dispatch, createContext, useContext, useState } from "react";
import styles from "./../../styles/hearts.module.css";
import {
  CardType,
  Changes,
  Log,
  PlayerInventory,
  PlayerType,
  PlayersState,
  RoundInfo
} from "@/utils/hearts/types";
import { PoolView } from "./pool";
import {
  LOCAL_STORAGE_GAME_KEY_STRING,
  NUM_OF_PLAYERS,
  adjudicateFinishedRound,
  createDeck,
  createNewRoundInfo,
  createPlayers,
  distributeCardsFromDeck,
  getNoEdition,
  playCardHelper,
  safeJSONParse,
  saveState,
  shuffleDeck
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
import { DisplayTakenCards } from "./displayTakenCards";
import { Shop } from "./shop";
import { AssignEditionsView } from "./assignEditionsView";
import { DisplayCardInfo } from "./displayCardInfo";

export type PlayCardCallback = (
  pid: PlayerType["id"]
) => (card: CardType) => void;

export const GameBoard = () => {
  const [deck, setDeck] = useState([] as CardType[]);
  const [players, setPlayers]: [
    PlayerType[],
    Dispatch<React.SetStateAction<PlayerType[]>>
  ] = useState(createPlayers(NUM_OF_PLAYERS));
  const [currentTurn, setCurrentTurn] = useState(0);
  const [log, setLog] = useState({ history: [] } as Log);
  const [roundInfo, setRoundInfo] = useState(
    createNewRoundInfo(NUM_OF_PLAYERS, 0)
  );
  const [handInProgress, setHandInProgress] = useState(false);
  const [handCount, setHandCount] = useState(0);
  const [handFirstTurn, setHandFirstTurn] = useState(0);
  const [showLog, setShowLog] = useState(false);
  const [showDisplayTakenCards, setShowDisplayTakenCards] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [showAssignEditions, setShowAssignEditions] = useState(false);
  const [highlightedCard, setHighlightedCard] = useState(
    undefined as CardType | undefined
  );

  const loadState = () => {
    let GameState = localStorage.getItem(LOCAL_STORAGE_GAME_KEY_STRING);
    if (GameState) {
      let parsedGameState = JSON.parse(GameState);
      console.log(parsedGameState.handInProgress);
      flushSync(() => {
        setDeck(parsedGameState.deck);
        setPlayers(parsedGameState.players);
        setCurrentTurn(parsedGameState.currentTurn);
        setLog(parsedGameState.log);
        setRoundInfo(parsedGameState.roundInfo);
        setHandInProgress(parsedGameState.handInProgress);
        setHandCount(parsedGameState.handCount);
        setHandFirstTurn(parsedGameState.handFirstTurn);
        setShowLog(parsedGameState.showLog);
        setShowDisplayTakenCards(parsedGameState.showDisplayTakenCards);
        setShowShop(parsedGameState.showShop);
        setShowAssignEditions(parsedGameState.showAssignEditions);
        setHighlightedCard(parsedGameState.highlightedCard);
      });
      console.log("correctly parsed");
      alert("Correctly parsed");
    }
  };

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
    value: "A",
    edition: getNoEdition()
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

  const submitShopChanges = (changes: Changes) => {
    setPlayers((_players) => {
      return _players.map((p, i) => {
        if (i != 0) return p;

        let newEditionsInventory = [...p.inventory.editions];

        changes.newEditions.forEach((newEdition) => {
          if (newEdition.type != "none") {
            let existingEdition = newEditionsInventory.find((e) => {
              return e.type == newEdition.type && e.rarity == newEdition.rarity;
            });
            if (existingEdition != undefined) {
              existingEdition.number = existingEdition.number + 1;
            } else {
              newEditionsInventory.push({
                type: newEdition.type,
                rarity: newEdition.rarity,
                number: 1
              });
            }
          }
        });

        return {
          ...p,
          coins: changes.coinsLeft,
          inventory: {
            ...p.inventory,
            editions: newEditionsInventory
          }
        };
      });
    });
  };

  return (
    <div className={styles.gameboard}>
      <div className={styles.gameboardMain}>
        <PlayCardContext.Provider value={playCard}>
          <div className={`${styles.playersPanel} ${styles.leftPanel}`}>
            <h1>Hearts Game</h1>
            {!handInProgress ? (
              <button onClick={deal}>Deal Cards</button>
            ) : (
              <h1>Hand #{handCount}</h1>
            )}
            <CurrentHighlightedCardContext.Provider
              value={{ highlightedCard, setHighlightedCard }}
            >
              <Players
                currentTurn={currentTurn}
                players={players}
                setHand={setHand}
              />
            </CurrentHighlightedCardContext.Provider>
          </div>
        </PlayCardContext.Provider>
        <div className={styles.rightPanel}>
          <h3>Round {roundInfo.roundNumber + 1}</h3>
          <div className={styles.rightPanelPoolAndLog}>
            <CurrentHighlightedCardContext.Provider
              value={{ highlightedCard, setHighlightedCard }}
            >
              <PoolView roundInfo={roundInfo} />
            </CurrentHighlightedCardContext.Provider>
          </div>
        </div>
        <CurrentHighlightedCardContext.Provider
          value={{ highlightedCard, setHighlightedCard }}
        >
          <DisplayCardInfo />
        </CurrentHighlightedCardContext.Provider>
      </div>
      <div className={styles.gameboardFooter}>
        <LogView log={log} showLog={showLog} setShowLog={setShowLog} />
        <DisplayTakenCards
          log={log}
          showDisplayTakenCards={showDisplayTakenCards}
          setShowDisplayTakenCards={setShowDisplayTakenCards}
        />
        <Shop
          showShop={showShop}
          setShowShop={setShowShop}
          coins={players[0].coins}
          submitChanges={submitShopChanges}
        />
        <PlayersContext.Provider
          value={{
            players: players,
            setPlayers: setPlayers
          }}
        >
          <AssignEditionsView
            player={players[0]}
            setShowAssignEditions={setShowAssignEditions}
            showAssignEditions={showAssignEditions}
          />
        </PlayersContext.Provider>
        <button
          onClick={() => {
            saveState({
              deck,
              players,
              currentTurn,
              log,
              roundInfo,
              handInProgress,
              handCount,
              handFirstTurn,
              showLog,
              showDisplayTakenCards,
              showShop,
              showAssignEditions,
              highlightedCard
            });
          }}
        >
          Save Game
        </button>
        <button
          onClick={() => {
            loadState();
          }}
        >
          Load Game
        </button>
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

export const PlayersContext = createContext<PlayersState | undefined>(
  undefined
);
export const usePlayersStateContext = () => {
  const playersState = useContext(PlayersContext);
  if (playersState == undefined) {
    throw Error(
      "usePlayersStateContext must be used within a PlayersStateContext.Provider"
    );
  }
  return playersState;
};

export const CurrentHighlightedCardContext = createContext<
  | {
      highlightedCard: CardType | undefined;
      setHighlightedCard: (c: CardType | undefined) => void;
    }
  | undefined
>(undefined);

export const useCurrentHighlightedCardContext = () => {
  const highlightedCardState = useContext(CurrentHighlightedCardContext);
  if (highlightedCardState == undefined) {
    throw Error(
      "useCurrentHighlightedCardContext must be used within a CurrentHighlightedCardContext.Provider"
    );
  }
  return highlightedCardState;
};
