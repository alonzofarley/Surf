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
  RoundInfo,
  Suit
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
  getNewInventory,
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
  AUTO_PROGRESS_GAME_DELAY,
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
  let [players, setPlayers]: [
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
  const [gameInProgress, setGameInProgess] = useState(false);

  console.log([...players]);

  const loadState = () => {
    let GameState = localStorage.getItem(LOCAL_STORAGE_GAME_KEY_STRING);
    if (GameState) {
      let parsedGameState = JSON.parse(GameState);
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

  let startGame = () => {
    setGameInProgess(true);
    let updatedPlayers = dealCards();
    startNewHand(updatedPlayers);
  };

  let dealCards = () => {
    let _updatedPlayers = undefined;
    flushSync(() => {
      setPlayers((_players) => {
        console.log([..._players]);
        let { remainingDeck, updatedPlayers } = distributeCardsFromDeck(
          shuffleDeck(createDeck()),
          _players
        );
        console.log([...updatedPlayers]);
        _updatedPlayers = updatedPlayers;
        return updatedPlayers;
      });
    });
    return _updatedPlayers;
  };

  let startNewHand = (updatedPlayers?: PlayerType[]) => {
    let newHandCount = handCount + 1;
    let newLog = {
      history: [
        ...log.history,
        {
          handNumber: newHandCount,
          roundHistories: []
        }
      ]
    };
    let newRoundInfo: RoundInfo = { ...roundInfo, roundNumber: 0 };
    let newCurrentTurn = handFirstTurn;
    let newPlayers = updatedPlayers ? updatedPlayers : players;

    flushSync(() => {
      //setDeck(remainingDeck);
      //setPlayers(updatedPlayers);

      setHandInProgress(true);
      setHandCount(newHandCount);
      setCurrentTurn(newCurrentTurn);
      setRoundInfo(newRoundInfo);
      setLog(newLog);
    });
    stepPlayCard(
      0,
      createDummyCardToNeverBeUsed,
      newPlayers,
      newRoundInfo,
      newCurrentTurn,
      newLog,
      true
    );
  };

  let createDummyCardToNeverBeUsed: CardType = {
    suit: "diamonds",
    value: "A",
    edition: getNoEdition()
  };

  const stepPlayCard = async (
    pid: PlayerType["id"],
    card: CardType,
    previousPlayers: PlayerType[],
    previousRoundInfo: RoundInfo,
    previousTurn: number,
    previousLog: Log,
    advanceAIPlayersOnly: boolean = false
  ) => {
    let updatedPlayers = previousPlayers;
    let updatedRoundInfo = previousRoundInfo;
    let updatedCurrentTurn = previousTurn;
    let updatedLog = previousLog;

    if (!advanceAIPlayersOnly) {
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
        setPlayers(updatedPlayers);
        setRoundInfo(updatedRoundInfo);
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
          setPlayers(updatedPlayers);
          setRoundInfo(updatedRoundInfo);
          setLog(updatedLog);
        });

        handOver = updatedPlayers.every((p) => p.hand.length == 0);
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
        setPlayers(updatedPlayers);
        setRoundInfo(updatedRoundInfo);
        setLog(updatedLog);
      });
    }
    if (handOver) {
      await delay(AUTO_PROGRESS_GAME_DELAY);

      //End Game, wait for next hand
      flushSync(() => {
        setHandInProgress(false);
        setHandFirstTurn((hft) => (hft + 1) % 4);
        setShowShop(true);
      });
    }
  };

  const playCard: PlayCardCallback = (pid) => async (card) => {
    await stepPlayCard(pid, card, players, roundInfo, currentTurn, log);
  };

  const setHand: (p: PlayerType) => (h: CardType[]) => void =
    (p: PlayerType) => (h: CardType[]) => {
      setPlayers((_players) => {
        return [...players].map((player) => {
          if (player.id != p.id) {
            return player;
          }
          return { ...player, hand: [...h] };
        });
      });
    };

  const submitShopChanges = (changes: Changes) => {
    flushSync(() => {
      setPlayers((_players) => {
        return _players.map((p, i) => {
          if (i != 0) return p;
          let newEditionsInventory = getNewInventory(changes, p);
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
    });
  };

  return (
    <div className={styles.gameboard}>
      <div className={styles.gameboardMain}>
        <PlayCardStateContext.Provider
          value={{
            playCardCallback: playCard,
            leadingSuit: roundInfo.leading.card?.suit
          }}
        >
          <div className={`${styles.playersPanel} ${styles.leftPanel}`}>
            <h1>Hearts Game</h1>
            <button onClick={startGame}>Start Game</button>
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
        </PlayCardStateContext.Provider>
        <div className={styles.rightPanel}>
          {!handInProgress ? (
            <></>
          ) : (
            <>
              <h3>
                Hand {handCount} - Round {roundInfo.roundNumber + 1}
              </h3>

              <div className={styles.rightPanelPoolAndLog}>
                <CurrentHighlightedCardContext.Provider
                  value={{ highlightedCard, setHighlightedCard }}
                >
                  <PoolView roundInfo={roundInfo} />
                </CurrentHighlightedCardContext.Provider>
              </div>
            </>
          )}
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
          onShopEnd={async () => {
            await delay(AUTO_PROGRESS_GAME_DELAY);
            flushSync(() => {
              setShowAssignEditions(true);
            });
            //dealCards();
          }}
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
            onAssignEnd={async () => {
              await delay(AUTO_PROGRESS_GAME_DELAY);
              //startNewHand();
            }}
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

type PlayCardState = {
  playCardCallback: PlayCardCallback;
  leadingSuit: Suit | undefined;
};

export const PlayCardStateContext = createContext<PlayCardState | undefined>(
  undefined
);
export const usePlayCardStateContext = () => {
  const playCardState = useContext(PlayCardStateContext);
  if (playCardState == undefined) {
    throw Error(
      "usePlayCardStateContext must be used within a PlayCarPlayCardStateContextdContext.Provider"
    );
  }
  return playCardState;
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
