export type CardType = {
  suit: Suit;
  value: string;
};

export type PlayerControl = "User" | "AI";

export type PlayerType = {
  id: number;
  hand: CardType[];
  typeOfPlayer: PlayerControl;
};

export type PoolType = {
  [playerId: PlayerType["id"]]: CardType | undefined;
};

export type Suit = "hearts" | "diamonds" | "clubs" | "spades";

export type RoundHistory = {
  roundInfo: RoundInfo;
  winner: PlayerType["id"];
};

export type RoundInfo = {
  pool: PoolType;
  roundNumber: number;
  leading: {
    player: PlayerType["id"] | undefined;
    card: CardType | undefined;
  };
};
