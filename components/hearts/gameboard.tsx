import React, { Dispatch, createContext, useContext, useState } from "react";
import styles from "./../../styles/hearts.module.css";
import {
  CardType,
  Changes,
  Log,
  PlayCardUpdates,
  PlayerInventory,
  PlayerType,
  PlayersState,
  RoundInfo,
  Suit,
  UpdateAccumulator,
  UpdateAction
} from "@/utils/hearts/types";
import { PoolView } from "./pool";
import {
  LOCAL_STORAGE_GAME_KEY_STRING,
  NUM_OF_PLAYERS,
  adjudicateFinishedRound,
  adjudicateUpdateAction,
  createDeck,
  createNewRoundInfo,
  createPlayers,
  distributeCardsFromDeck,
  getNewInventory,
  getNoEdition,
  getUpdateActions,
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
  const [updateAccum, setUpdateAccum] = useState({
    totalDamageBase: 0,
    totalDamageScalar: 1,
    totalCoinsBase: 0,
    totalCoinsScalar: 1
  } as UpdateAccumulator);
  const [updateAccumDoneCalculating, setUpdateAccumDoneCalculating] =
    useState(false);
  const [currentScoringAction, setCurrentScoringAction] = useState(
    undefined as UpdateAction | undefined
  );

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
        let { remainingDeck, updatedPlayers } = distributeCardsFromDeck(
          shuffleDeck(createDeck()),
          _players
        );
        _updatedPlayers = updatedPlayers;
        return updatedPlayers;
      });
    });
    return _updatedPlayers;
  };

  let resetUpdateAccum = () => {
    setUpdateAccum({
      totalDamageBase: 0,
      totalDamageScalar: 1,
      totalCoinsBase: 0,
      totalCoinsScalar: 1
    });
    setUpdateAccumDoneCalculating(false);
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
      setHandInProgress(true);
      setHandCount(newHandCount);
      setCurrentTurn(newCurrentTurn);
      setRoundInfo(newRoundInfo);
      setLog(newLog);
    });
    let previousUpdates: PlayCardUpdates = {
      players: newPlayers,
      roundInfo: newRoundInfo,
      currentTurn: newCurrentTurn,
      log: newLog
    };
    stepPlayCard(0, dummyCardToNeverBeUsed, previousUpdates, true);
  };

  let dummyCardToNeverBeUsed: CardType = {
    suit: "diamonds",
    value: "A",
    edition: getNoEdition()
  };

  const submitPlayCardUpdates = async (updates: PlayCardUpdates) => {
    flushSync(() => {
      setCurrentTurn(updates.currentTurn);
      setPlayers(updates.players);
      setRoundInfo(updates.roundInfo);
      setLog(updates.log);
    });
  };

  const stepPlayCard = async (
    pid: PlayerType["id"],
    card: CardType,
    previousUpdates: PlayCardUpdates,
    advanceAIPlayersOnly: boolean = false
  ) => {
    let currentUpdates: PlayCardUpdates = previousUpdates;

    if (!advanceAIPlayersOnly) {
      let updates = await playCardHelper(pid, card)(currentUpdates);
      submitPlayCardUpdates(updates);
      currentUpdates = updates;
    }

    let handOver = false;
    while (
      (currentUpdates.currentTurn != 0 ||
        currentUpdates.roundInfo.winner != undefined) &&
      !handOver
    ) {
      if (currentUpdates.roundInfo.winner != undefined) {
        await delay(RESOLVE_WINNER_DELAY * 2);
        let updateActions = getUpdateActions(currentUpdates);
        let i = 0;
        let _updateAccum = updateAccum;
        while (i < updateActions.length) {
          await delay(RESOLVE_WINNER_DELAY * 2);
          let nextAction = updateActions[i];
          flushSync(() => {
            console.log("currently Scoring ", nextAction.sourceCard);
            setCurrentScoringAction(nextAction);
          });
          await delay(RESOLVE_WINNER_DELAY * 2);

          _updateAccum = adjudicateUpdateAction(_updateAccum, nextAction);
          flushSync(() => {
            setUpdateAccum(_updateAccum);
          });
          i = i + 1;
        }
        flushSync(() => {
          setUpdateAccumDoneCalculating(true);
          setCurrentScoringAction(undefined);
        });

        await delay(RESOLVE_WINNER_DELAY * 5);

        console.log("updateAccum", _updateAccum);
        let updates = adjudicateFinishedRound(currentUpdates, _updateAccum);
        submitPlayCardUpdates(updates);
        currentUpdates = updates;
        await delay(RESOLVE_WINNER_DELAY * 2);

        handOver = currentUpdates.players.every((p) => p.hand.length == 0);
        resetUpdateAccum();
        continue;
      }

      await delay(AI_MOVE_DELAY);
      let aiPlayer = currentUpdates.players[currentUpdates.currentTurn];
      let playedCard = aiPlay(aiPlayer, currentUpdates.roundInfo);
      let updates = await playCardHelper(
        aiPlayer.id,
        playedCard
      )(currentUpdates);
      submitPlayCardUpdates(updates);
      currentUpdates = updates;
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
    let previousUpdates: PlayCardUpdates = {
      players: players,
      roundInfo: roundInfo,
      currentTurn: currentTurn,
      log: log
    };
    await stepPlayCard(pid, card, previousUpdates);
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
              unassignedEditions: [...newEditionsInventory],
              storedEditions: [...newEditionsInventory]
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
            <h1>Heartz </h1>
            {!gameInProgress ? (
              <button onClick={startGame}>Start Game</button>
            ) : (
              <></>
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
                <CurrentScoringActionContext.Provider
                  value={{ currentScoringAction, setCurrentScoringAction }}
                >
                  <CurrentHighlightedCardContext.Provider
                    value={{ highlightedCard, setHighlightedCard }}
                  >
                    <PoolView roundInfo={roundInfo} />
                  </CurrentHighlightedCardContext.Provider>
                </CurrentScoringActionContext.Provider>
              </div>
              {updateAccumDoneCalculating ? (
                <div className={styles.updateAccumDiv}>
                  {roundInfo.winner ? (
                    <label>Player {roundInfo.winner + 1} takes...</label>
                  ) : (
                    <></>
                  )}
                  <p>
                    Dmg:{" "}
                    {updateAccum.totalDamageBase *
                      updateAccum.totalDamageScalar}{" "}
                    Damage
                  </p>
                  <p>
                    Coins:{" "}
                    {updateAccum.totalCoinsBase * updateAccum.totalCoinsScalar}{" "}
                    Coins
                  </p>
                </div>
              ) : (
                <div className={styles.updateAccumDiv}>
                  {roundInfo.winner ? (
                    <label>Player {roundInfo.winner + 1} wins!</label>
                  ) : (
                    <></>
                  )}
                  <p>
                    Dmg: {updateAccum.totalDamageBase} x{" "}
                    {updateAccum.totalDamageScalar}
                  </p>
                  <p>
                    Coins: {updateAccum.totalCoinsBase} x{" "}
                    {updateAccum.totalCoinsScalar}
                  </p>
                </div>
              )}
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
            dealCards();
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
              startNewHand();
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

export const CurrentScoringActionContext = createContext<
  | {
      currentScoringAction: UpdateAction | undefined;
      setCurrentScoringAction: (ua: UpdateAction | undefined) => void;
    }
  | undefined
>(undefined);

export const useCurrentScoringActionContext = () => {
  const currentScoringActionState = useContext(CurrentScoringActionContext);
  if (currentScoringActionState == undefined) {
    throw Error(
      "useCurrentScoringActionContext must be used within a CurrentScoringActionContext.Provider"
    );
  }
  return currentScoringActionState;
};
