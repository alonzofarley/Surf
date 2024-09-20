import {
  ACE_IS_HIGH,
  cardComparatorForRound,
  cardComparatorForRoundInverted,
  cardValueToNum
} from "./cardHelpers";
import { CardType, PlayerType, RoundInfo } from "./types";

export const AI_MOVE_DELAY = 1500;
export const RESOLVE_WINNER_DELAY = 3000;

export const aiPlay: (
  aiPlayer: PlayerType,
  roundInfo: RoundInfo
) => CardType = (aiPlayer: PlayerType, roundInfo: RoundInfo) => {
  //Check that the player is not the user
  if (aiPlayer.id !== 0) {
    if (!roundInfo.leading.card) {
      let chosenCardToPlay = [...aiPlayer.hand].sort(
        cardComparatorForRound("none")
      )[0];

      return chosenCardToPlay as CardType;
    } else {
      let leadingSuit = roundInfo.leading.card!.suit;
      //Check what cards have already been played
      let opponentBestPlayedCard = Object.values(roundInfo.pool)
        .filter((c) => c != undefined)
        .map((c) => c as CardType)
        .sort(cardComparatorForRound(leadingSuit))[0];

      let aiCardsOfLeadingSuit = aiPlayer.hand
        .filter((c) => c.suit == leadingSuit)
        .sort(cardComparatorForRound(leadingSuit));

      if (aiCardsOfLeadingSuit.length > 0) {
        let bestCard = [...aiPlayer.hand].sort(
          cardComparatorForRound(leadingSuit)
        )[0];

        if (
          cardValueToNum(opponentBestPlayedCard.value, ACE_IS_HIGH) >
          cardValueToNum(bestCard.value, ACE_IS_HIGH)
        ) {
          let chosenCardToPlay =
            aiCardsOfLeadingSuit[aiCardsOfLeadingSuit.length - 1];
          return chosenCardToPlay as CardType;
        }

        let chosenCardToPlay = aiCardsOfLeadingSuit[0];
        return chosenCardToPlay as CardType;
      }

      //Doesnt have that suit, play lowest card
      let chosenCardToPlay = [...aiPlayer.hand].sort(
        cardComparatorForRoundInverted(leadingSuit)
      )[0];

      return chosenCardToPlay as CardType;
    }
  }
  throw Error("Not AI's turn");
};

export const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));
