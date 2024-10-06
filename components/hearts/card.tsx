import React from "react";
import Image from "next/image";
import styles from "./../../styles/hearts.module.css";
import { useCardSelectionControl } from "./player";
import { CardType, UpdateAction } from "@/utils/hearts/types";
import {
  getImagePathForCard,
  getTextForUpdateAction,
  textOfCard
} from "@/utils/hearts/cardHelpers";
import { Tooltip } from "@nextui-org/tooltip";
import { useCurrentHighlightedCardContext } from "./gameboard";

//https://www.dextrous.com.au/blog/free-printable-card-templates

type CardProps = {
  card: CardType;
};
const Card = (props: CardProps) => {
  const card = props.card;
  const cardSelectionControl = useCardSelectionControl();
  const highlightedCardState = useCurrentHighlightedCardContext();

  let onMouseEnter = () => {
    highlightedCardState.setHighlightedCard(card);
  };

  let onMouseLeave = () => {
    highlightedCardState.setHighlightedCard(undefined);
  };

  if (cardSelectionControl.selectedCard == card) {
    return displayCard(
      card,
      `${styles.cardSelected} ${styles.card} ${styles.cardSelectable}`,
      () => cardSelectionControl.unselectCard(card),
      onMouseEnter,
      onMouseLeave
    );
  }

  return displayCard(
    card,
    `${styles.card} ${styles.cardSelectable}`,
    () => cardSelectionControl.selectCard(card),
    onMouseEnter,
    onMouseLeave
  );
};

export const displayCard = (
  card: CardType,
  className?: string,
  onClick?: () => void,
  onMouseEnter?: () => void,
  onMouseLeave?: () => void,
  currentScoringAction?: UpdateAction
) => {
  let divClassName = className ?? styles.card;
  let currentScoredCard = currentScoringAction?.sourceCard;
  let currentlyBeingScored =
    card.suit == currentScoredCard?.suit &&
    card.value == currentScoredCard.value;
  if (currentlyBeingScored) {
    divClassName = divClassName + " " + styles.currentlyScoredCard;
  }

  return (
    <>
      <div
        className={divClassName}
        onClick={onClick ?? (() => {})}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {currentlyBeingScored && currentScoringAction ? (
          <div className={styles.currentlyScoredCardScoring}>
            {getTextForUpdateAction(currentScoringAction)}
          </div>
        ) : (
          <></>
        )}
        <Image
          className={styles.cardImage}
          src={getImagePathForCard(card)}
          alt={textOfCard(card)}
          height={0}
          width={0}
          unoptimized
        ></Image>
      </div>
    </>
  );
};

export default Card;
