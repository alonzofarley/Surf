import React from "react";

export let EditionConst = [
  "extra_damage",
  "switch_cards",
  "extra_coins",
  "swap_low_and_high",
  "healing"
] as const;

export let EditionRarity = [
  { type: "common", relativeChance: 59 },
  { type: "uncommon", relativeChance: 29 },
  { type: "rare", relativeChance: 10 },
  { type: "legendary", relativeChance: 10 }
] as const;

export type EditionRarityType = (typeof EditionRarity)[number]["type"];

export type Edition = {
  rarity: EditionRarityType;
};

export type ExtraDamageEdition = {
  type: "extra_damage";
} & Edition;

export type SwapCardsEdition = {
  type: "switch_cards";
} & Edition;

export type SwapLowAndHighEdition = {
  type: "swap_low_and_high";
} & Edition;

export type ExtraChips = {
  type: "extra_coins";
} & Edition;

export type NoEdition = {
  type: "none";
} & Edition;

export type HealEdition = {
  type: "healing";
} & Edition;

export type CardEdition =
  | ExtraDamageEdition
  | SwapCardsEdition
  | ExtraChips
  | HealEdition
  | SwapLowAndHighEdition
  | NoEdition;

export type EditionTypeType = CardEdition["type"];

export type CardType = {
  suit: Suit;
  value: string;
  edition: CardEdition;
};

export type PlayerInventory = {
  unassignedEditions: EditionsInventory;
  storedEditions: EditionsInventory;
};

export type EditionsInventory = {
  type: CardEdition["type"];
  rarity: EditionRarityType;
  number: number;
}[];

export type PlayerControl = "User" | "AI";

export type PlayerType = {
  id: number;
  hand: CardType[];
  typeOfPlayer: PlayerControl;
  health: number;
  coins: number;
  inventory: PlayerInventory;
};

export type PoolType = {
  [playerId: PlayerType["id"]]: CardType | undefined;
};

export type Suit = "hearts" | "diamonds" | "clubs" | "spades";

export type RoundHistory = {
  roundInfo: RoundInfo;
};

export type RoundInfo = {
  pool: PoolType;
  roundNumber: number;
  leading: {
    player: PlayerType["id"] | undefined;
    card: CardType | undefined;
  };
  winner: PlayerType["id"] | undefined;
};

export type HandHistory = {
  handNumber: number;
  roundHistories: RoundHistory[];
};

export type Log = {
  history: HandHistory[];
};

export type Changes = {
  coinsLeft: number;
  newEditions: CardEdition[];
};

export type PlayersState = {
  players: PlayerType[];
  setPlayers: React.Dispatch<React.SetStateAction<PlayerType[]>>;
};

export type AttachedId<T> = T & { id: number };

export type FullGameState = {
  deck: CardType[];
  players: PlayerType[];
  currentTurn: number;
  log: Log;
  roundInfo: RoundInfo;
  handInProgress: boolean;
  handCount: number;
  handFirstTurn: number;
  showLog: boolean;
  showDisplayTakenCards: boolean;
  showShop: boolean;
  showAssignEditions: boolean;
  highlightedCard: CardType | undefined;
};

export type PlayCardUpdates = {
  players: PlayerType[];
  roundInfo: RoundInfo;
  currentTurn: number;
  log: Log;
};

type UpdateActionSource = {
  sourcePlayer: number;
  sourceCard: CardType;
};

export type UpdateAccumulator = {
  totalDamageBase: number;
  totalDamageScalar: number;
  totalCoinsBase: number;
  totalCoinsScalar: number;
};

export type UpdateAction = (
  | {
      type: "add_damage";
      amount: number;
    }
  | {
      type: "add_coins";
      amount: number;
    }
  | {
      type: "mult_damage";
      scalar: number;
    }
  | { type: "mult_chips"; scalar: number }
) &
  UpdateActionSource;
