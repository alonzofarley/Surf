import React from "react";
import Image from "next/image";
import styles from "./../../styles/hearts.module.css";
import { useCardSelectionControl } from "./player";
import { CardType } from "@/utils/hearts/types";
import { getImagePathForCard, textOfCard } from "@/utils/hearts/cardHelpers";
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
  onMouseLeave?: () => void
) => {
  return (
    <div
      className={className ?? styles.card}
      onClick={onClick ?? (() => {})}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* <Tooltip
        content={getCardToolTipText(card)}
        color={"danger"}
        delay={50}
        offset={20}
        className={styles.cardToolTip}
      > */}
      <Image
        className={styles.cardImage}
        src={getImagePathForCard(card)}
        alt={textOfCard(card)}
        height={0}
        width={0}
        unoptimized
      ></Image>
      {/* </Tooltip> */}
    </div>
  );
};

const getCardToolTipText = (card: CardType) => {
  return "";
  if (card.edition.type != "none") {
    return "Edition: " + card.edition.type + " " + card.edition.rarity;
  }
  return "No Edition";
};

export default Card;
