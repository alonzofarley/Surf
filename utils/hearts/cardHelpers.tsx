import { CardText } from "react-bootstrap";
import {
  AttachedId,
  CardEdition,
  CardType,
  Changes,
  EditionRarityType,
  EditionTypeType,
  FullGameState,
  HandHistory,
  Log,
  NoEdition,
  PlayCardUpdates,
  PlayerControl,
  PlayerInventory,
  PlayerType,
  PoolType,
  RoundHistory,
  RoundInfo,
  Suit,
  UpdateAccumulator,
  UpdateAction
} from "./types";

export const ACE_IS_HIGH = true;
export const ACE_IS_NOT_HIGH = false;
export const NUM_OF_PLAYERS = 4;
export const MAX_HEALTH = 52;
export const STARTING_COINS = 100;
export const LOCAL_STORAGE_GAME_KEY_STRING = "heartsGameState";

export const cardValueToNum = (cardValue: string, aceIsHigh: boolean) => {
  let numberVal = Number(cardValue);
  if (!Number.isNaN(numberVal)) {
    return numberVal;
  }
  if (cardValue == "J") return 11;
  if (cardValue == "Q") return 12;
  if (cardValue == "K") return 13;
  if (cardValue == "A") return aceIsHigh ? 14 : 1;
  console.error(["invalid cardval", cardValue]);
  throw Error("invalid cardval");
};

export const getSuitValue = (suitValue: string) => {
  if (suitValue == "diamonds") return 0;
  if (suitValue == "spades") return 1;
  if (suitValue == "hearts") return 2;
  if (suitValue == "clubs") return 3;
  console.error(["invalid suitValue", suitValue]);
  throw Error("invalid suitValue");
};

export const getImagePathForCard = (card: CardType) => {
  return `/hearts/${card.value}_of_${card.suit}.png`;
};

export const textOfCard = (card: CardType) => {
  return `${card.value} of ${card.suit}`;
};

export const displayPlayerNumber = (player: PlayerType) => {
  return displayPlayerNumberFromId(player.id);
};

export const displayPlayerNumberFromId = (playerId: PlayerType["id"]) => {
  return playerId + 1;
};

export const getPoolPids: (pool: PoolType) => PlayerType["id"][] = (
  pool: PoolType
) => {
  return Object.keys(pool).map((key) => Number(key));
};

export const sortHand = (sortType: "suit" | "value", hand: CardType[]) => {
  let newHand = [...hand];
  if (sortType == "suit") {
    console.log("Sorting by suit", [...hand]);
    return newHand.sort(cardComparatorBySuitThenValue(ACE_IS_NOT_HIGH));
  } else if (sortType == "value") {
    console.log("Sorting by value", [...hand]);
    return newHand.sort(cardComparatorByValue(ACE_IS_NOT_HIGH));
  } else {
    console.error(["invalid sort criteria", sortType]);
    throw Error("invalid sort criteria");
  }
};

export const cardComparatorByValue =
  (aceIsHigh: boolean) => (c1: CardType, c2: CardType) => {
    return (
      cardValueToNum(c1.value, aceIsHigh) - cardValueToNum(c2.value, aceIsHigh)
    );
  };

export const cardComparatorBySuitThenValue =
  (aceIsHigh: boolean) => (c1: CardType, c2: CardType) => {
    if (c1.suit == c2.suit) return cardComparatorByValue(aceIsHigh)(c1, c2);
    return getSuitValue(c1.suit) - getSuitValue(c2.suit);
  };

// if compare (a, b) < 0 sort a higher than b
export const cardComparatorForRound =
  (leadingSuit: Suit | "none") => (c1: CardType, c2: CardType) => {
    if (c1.suit != leadingSuit && c2.suit != leadingSuit) {
      return 0;
    }
    if (c1.suit != leadingSuit) {
      return 1;
    }
    if (c2.suit != leadingSuit) {
      return -1;
    }
    return -cardComparatorByValue(ACE_IS_HIGH)(c1, c2);
  };

export const cardComparatorForRoundInverted =
  (leadingSuit: Suit | "none") => (c1: CardType, c2: CardType) => {
    return cardComparatorForRound(leadingSuit)(c2, c1);
  };

export const sortPlayersByLeadingPlayer = (
  pids: PlayerType["id"][],
  firstPid: PlayerType["id"]
): PlayerType["id"][] => {
  const firstPidIdx = pids.indexOf(firstPid);
  if (firstPidIdx === -1) {
    throw new Error("First player ID not found in the list of player IDs");
  }

  return [...pids.slice(firstPidIdx), ...pids.slice(0, firstPidIdx)];
};

export const createDeck = () => {
  const suits: Suit[] = ["hearts", "diamonds", "clubs", "spades"];
  const values = [
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "J",
    "Q",
    "K",
    "A"
  ];
  let deck: CardType[] = [];
  for (let suit of suits) {
    for (let value of values) {
      deck.push({ suit, value, edition: getNoEdition() });
    }
  }
  return deck;
};

export const shuffleDeck = (deck: CardType[]) => {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
};

export const createPlayers = (numPlayers: number) => {
  let players: PlayerType[] = [];
  for (let i = 0; i < numPlayers; i++) {
    let typeOfPlayer: PlayerControl = i == 0 ? "User" : "AI";
    players.push({
      id: i,
      hand: [],
      typeOfPlayer: typeOfPlayer,
      health: MAX_HEALTH,
      coins: STARTING_COINS,
      inventory: {
        unassignedEditions: [],
        storedEditions: []
      }
    });
  }
  return players;
};

export const createInitialPool = (numPlayers: number) => {
  const pool: PoolType = {};
  for (let i = 0; i < numPlayers; i++) {
    pool[i] = undefined;
  }
  return pool;
};

export const distributeCardsFromDeck = (
  deck: CardType[],
  players: PlayerType[]
) => {
  let newDeck = [...deck];
  let newPlayers: PlayerType[] = JSON.parse(JSON.stringify(players));
  for (let i = 0; i < 52; i++) {
    let card: CardType = newDeck.pop() as CardType;
    newPlayers[i % 4].hand.push(card);
  }

  return {
    remainingDeck: newDeck,
    updatedPlayers: newPlayers
  };
};

export const determinePoolWinner = (roundInfo: RoundInfo) => {
  let pool = roundInfo.pool;
  let pids = getPoolPids(pool);
  if (pids.some((pid) => pool[pid] == undefined))
    throw Error("Every player needs to play a card");

  let entries = pids.map((pid) => {
    let card = pool[pid] as CardType;
    return { playerId: pid, card: card };
  });

  let sortedEntries = entries.sort((entry1, entry2) => {
    if (roundInfo.leading.card == undefined) {
      throw Error("Leading card is undefined for this round.");
    }
    return cardComparatorForRound(roundInfo.leading.card.suit)(
      entry1.card,
      entry2.card
    );
  });

  let winner = sortedEntries[0];
  console.log(
    `Winner is ${displayPlayerNumberFromId(winner.playerId)} with the ${textOfCard(winner.card)}`
  );
  return winner;
};

export const createNewRoundInfo = (
  numberOfPlayers: number,
  roundNumber: number
) => {
  return {
    pool: createInitialPool(numberOfPlayers),
    roundNumber: roundNumber,
    leading: {
      player: undefined,
      card: undefined
    }
  } as RoundInfo;
};

export const removeCardFromPlayer = (
  player: PlayerType,
  playedCard: CardType
) => {
  console.log(
    `Removing ${textOfCard(playedCard)} from Player ${displayPlayerNumberFromId(player.id)}`
  );

  let newHand = [...player.hand].filter((card) => card != playedCard);

  return {
    ...player,
    hand: [...newHand]
  };
};

export const determineDamage = (roundInfo: RoundInfo) => {
  let totalDamage = 0;
  let damageScalar = 1;

  let cards = getPoolPids(roundInfo.pool).map((pid) => {
    return roundInfo.pool[pid];
  });
  if (cards.some((card) => card == undefined))
    throw Error("determineDamage() requires no card in round be undefined");
  cards.forEach((card) => {
    if (card?.suit == "hearts") totalDamage += 1;
    if (card?.suit == "spades" && card.value == "Q") {
      totalDamage += 13;
    }
    if (card?.edition.type == "extra_damage") {
      damageScalar = damageScalar * 2;
    }
  });
  totalDamage = totalDamage * damageScalar;
  return totalDamage;
};

export const determineDamageFromCard = (card: CardType) => {
  if (card?.suit == "hearts") {
    return 1;
  }
  if (card?.suit == "spades" && card.value == "Q") {
    return 13;
  }
  return 0;
};

export const determineCoinsFromCard = (card: CardType) => {
  if (
    card?.suit != "hearts" &&
    !(card?.suit == "spades" && card.value == "Q")
  ) {
    return 1;
  }
  return 0;
};

export const determineCoins = (roundInfo: RoundInfo) => {
  let totalCoins = 0;
  let cards = getPoolPids(roundInfo.pool).map((pid) => {
    return roundInfo.pool[pid];
  });
  if (cards.some((card) => card == undefined))
    throw Error("determineDamage() requires no card in round be undefined");
  cards.forEach((card) => {
    if (
      card?.suit != "hearts" &&
      !(card?.suit == "spades" && card.value == "Q")
    ) {
      totalCoins += 1;
    }
    // if (card?.edition.type == "extra_") {
    //   damageScalar = damageScalar * 2;
    // }
  });

  return totalCoins;
};

export const adjudicateFinishedRound = (
  previousUpdates: PlayCardUpdates,
  updateAccum: UpdateAccumulator
) => {
  if (previousUpdates.roundInfo.winner == undefined) {
    throw Error(
      "'adjudicateFinishedRound()' should only be called if there was a winner determined last round"
    );
  }

  //TODO: should probably change how this is done later.
  let currentRoundHistory = previousUpdates.log.history.slice(-1)[0];

  currentRoundHistory = {
    ...currentRoundHistory,
    roundHistories: [
      ...currentRoundHistory.roundHistories,
      {
        roundInfo: {
          ...previousUpdates.roundInfo,
          winner: previousUpdates.roundInfo.winner
        }
      }
    ]
  };

  let updatedLog: Log = {
    history: [...previousUpdates.log.history.slice(0, -1), currentRoundHistory]
  };

  let updatedCurrentTurn = previousUpdates.roundInfo.winner;

  let updatedRoundInfo = createNewRoundInfo(
    NUM_OF_PLAYERS,
    previousUpdates.roundInfo.roundNumber + 1
  );

  let updatedPlayers = previousUpdates.players.map((player) => {
    if (player.id == previousUpdates.roundInfo.winner) {
      return {
        ...player,
        health:
          player.health -
          updateAccum.totalDamageBase * updateAccum.totalDamageScalar,
        coins:
          player.coins +
          updateAccum.totalCoinsBase * updateAccum.totalCoinsScalar
      };
    } else {
      return player;
    }
  });

  return {
    players: updatedPlayers,
    roundInfo: updatedRoundInfo,
    currentTurn: updatedCurrentTurn,
    log: updatedLog
  } as PlayCardUpdates;
};

export const adjudicateUpdateAction = (
  updateAccum: UpdateAccumulator,
  updateAction: UpdateAction
) => {
  if (updateAction.type == "add_damage") {
    return {
      ...updateAccum,
      totalDamageBase: updateAccum.totalDamageBase + updateAction.amount
    } as UpdateAccumulator;
  }
  if (updateAction.type == "add_coins") {
    return {
      ...updateAccum,
      totalCoinsBase: updateAccum.totalCoinsBase + updateAction.amount
    } as UpdateAccumulator;
  }
  if (updateAction.type == "mult_damage") {
    return {
      ...updateAccum,
      totalDamageScalar: updateAccum.totalDamageScalar * updateAction.scalar
    } as UpdateAccumulator;
  }
  return {
    ...updateAccum
  } as UpdateAccumulator;
};

export const getUpdateActions = (previousUpdates: PlayCardUpdates) => {
  if (previousUpdates.roundInfo.winner == undefined) {
    throw Error(
      "'getUpdateActions()' should only be called if there was a winner determined last round"
    );
  }

  let leadingPlayerNumber: number | undefined =
    previousUpdates.roundInfo.leading.player;
  if (leadingPlayerNumber == undefined) {
    throw Error(
      "'getUpdateActions()' should only be called if there was a winner determined last round"
    );
  }
  let nextPlayerNumber = leadingPlayerNumber;
  let count = 0;
  let updateActions: UpdateAction[] = [];
  while (count < 4) {
    let playedCard = previousUpdates.roundInfo.pool[nextPlayerNumber];
    if (playedCard == undefined)
      throw Error(
        "'getUpdateActions()' should only be called if every player played a card during the round"
      );
    let damage = determineDamageFromCard(playedCard);
    let chips = determineCoinsFromCard(playedCard);
    if (damage > 0) {
      updateActions.push({
        type: "add_damage",
        amount: damage,
        sourcePlayer: nextPlayerNumber,
        sourceCard: playedCard
      });
    }
    if (chips > 0) {
      updateActions.push({
        type: "add_coins",
        amount: chips,
        sourcePlayer: nextPlayerNumber,
        sourceCard: playedCard
      });
    }
    if (playedCard.edition.type == "extra_damage") {
      updateActions.push({
        type: "mult_damage",
        scalar: 2,
        sourcePlayer: nextPlayerNumber,
        sourceCard: playedCard
      });
    }
    if (playedCard.edition.type == "extra_coins") {
      updateActions.push({
        type: "add_coins",
        amount: 50,
        sourcePlayer: nextPlayerNumber,
        sourceCard: playedCard
      });
    }
    nextPlayerNumber = (nextPlayerNumber + 1) % 4;
    count = count + 1;
  }

  console.log("updateActions", updateActions);
  return updateActions as UpdateAction[];
};

export const playCardHelper =
  (pid: PlayerType["id"], card: CardType) =>
  async (previousUpdates: PlayCardUpdates) => {
    let isLeadingPlay = Object.values(previousUpdates.roundInfo.pool).every(
      (playedCard) => playedCard == undefined
    );
    const newPool = { ...previousUpdates.roundInfo.pool, [pid]: card };
    console.log(
      `Player ${displayPlayerNumberFromId(pid)} played ${textOfCard(card)}`
    );
    let updatedRoundInfo = {
      ...previousUpdates.roundInfo,
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
    let updatedPlayers = previousUpdates.players.map((player) => {
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

    let updatedCurrentTurn = (previousUpdates.currentTurn + 1) % 4;
    let updatedLog = previousUpdates.log;
    updatedRoundInfo = {
      ...updatedRoundInfo,
      winner: winner?.playerId
    };

    return {
      players: updatedPlayers,
      roundInfo: updatedRoundInfo,
      currentTurn: updatedCurrentTurn,
      log: updatedLog
    } as PlayCardUpdates;
  };

export const reverseList = (list: any[]): any[] => {
  return list.slice().reverse();
};

type CurrentWonCards = {
  [playerId: PlayerType["id"]]: CardType[];
};

type CurrentWonCardsByRound = {
  [playerId: PlayerType["id"]]: {
    roundNumber: number;
    cards: CardType[];
  }[];
};

export const getWonCardByEachPlayer: (
  HandHistory: HandHistory
) => CurrentWonCards = (handHistory: HandHistory) => {
  let currentWonCards: CurrentWonCards = {};
  handHistory.roundHistories.forEach((rh) => {
    let roundInfo = rh.roundInfo;
    if (roundInfo.winner != undefined) {
      let cards: CardType[] = getPoolPids(roundInfo.pool)
        .map((key: PlayerType["id"]) => {
          return roundInfo.pool[key];
        })
        .filter((value) => value != undefined) as CardType[];
      if (!currentWonCards[roundInfo.winner]) {
        currentWonCards[roundInfo.winner] = cards;
      } else {
        currentWonCards[roundInfo.winner] = [
          ...currentWonCards[roundInfo.winner],
          ...cards
        ];
        cards;
      }
    }
  });
  return currentWonCards;
};

export const getWonCardByEachPlayerByRound: (
  HandHistory: HandHistory
) => CurrentWonCardsByRound = (handHistory: HandHistory) => {
  let currentWonCardsByRound: CurrentWonCardsByRound = {};
  handHistory.roundHistories.forEach((rh) => {
    let roundInfo = rh.roundInfo;
    if (roundInfo.winner != undefined) {
      let cards: CardType[] = getPoolPids(roundInfo.pool)
        .map((key: PlayerType["id"]) => {
          return roundInfo.pool[key];
        })
        .filter((value) => value != undefined) as CardType[];
      if (!currentWonCardsByRound[roundInfo.winner]) {
        currentWonCardsByRound[roundInfo.winner] = [
          {
            roundNumber: roundInfo.roundNumber,
            cards: cards
          }
        ];
      } else {
        currentWonCardsByRound[roundInfo.winner] = [
          ...currentWonCardsByRound[roundInfo.winner],
          {
            roundNumber: roundInfo.roundNumber,
            cards: cards
          }
        ];
      }
    }
  });
  return currentWonCardsByRound;
};

export function extractDataFromAttachedId<T>(attachedId: AttachedId<T>): T {
  let { id, ...data } = attachedId;
  return data as T;
}

export function attachIdToData<T>(data: T, id: number): AttachedId<T> {
  return { id, ...data };
}

export const getNoEdition = () => {
  return { type: "none", rarity: "common" } as NoEdition;
};

export let editionKeyString = (ed: any) => {
  return `${ed.type} ${ed.rarity}`;
};

export let getEditionFromKeyString = (keyString: string) => {
  if (keyString == "none") return getNoEdition();
  let elements = keyString.split(" ");
  let type: EditionTypeType = elements[0] as EditionTypeType;
  let rarity: EditionRarityType = elements[1] as EditionRarityType;

  return {
    type,
    rarity
  } as CardEdition;
};

export const safeJSONParse = (json: string) => {
  return json == undefined ? undefined : JSON.parse(json);
};

export const saveState = (fullGameState: FullGameState) => {
  let GameState = JSON.stringify(fullGameState);

  localStorage.setItem(LOCAL_STORAGE_GAME_KEY_STRING, GameState);
  console.log("saved", GameState);
  alert("saved game to browser localStorage");
};

export const getEditionDescription = (edition: CardEdition) => {
  if (edition.type == "extra_coins") {
    return "Gives extra chips to the winner of the round in which this card was played.";
  } else if (edition.type == "healing") {
    return "Gives healing to the winner of the round in which this card was played.";
  } else if (edition.type == "swap_low_and_high") {
    return "For the round in which this card is played, low cards win instead of high cards.";
  } else if (edition.type == "extra_damage") {
    return "For the round in which this card is played, if the winner would take damage, they will take extra damage.";
  } else if (edition.type == "switch_cards") {
    return "For the round in which this card is played, each player takes the played card of the player to their right instead.";
  }
  return "No effect.";
};

export const getNewInventory = (changes: Changes, p: PlayerType) => {
  let newEditionsInventory = [...p.inventory.storedEditions];

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
  return newEditionsInventory;
};

export const getTextForUpdateAction = (updateAction: UpdateAction) => {
  switch (updateAction.type) {
    case "add_coins":
      return `+${updateAction.amount} Coins`;
    case "add_damage":
      return `+${updateAction.amount} Damage`;
    case "mult_chips":
      return `x${updateAction.scalar} Coins`;
    case "mult_damage":
      return `x${updateAction.scalar} Damage`;
    default:
      throw Error("Not Implemented for updateAction Type");
  }
};
