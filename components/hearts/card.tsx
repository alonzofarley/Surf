import React from "react";
import Image from "next/image";
import styles from "./../../styles/hearts.module.css";
import { useCardSelectionControl } from "./player";
import { CardType } from "@/utils/hearts/types";
import { getImagePathForCard, textOfCard } from "@/utils/hearts/cardHelpers";
import { Tooltip } from "@nextui-org/tooltip";

type CardProps = {
  card: CardType;
};
const Card = (props: CardProps) => {
  const card = props.card;
  const cardSelectionControl = useCardSelectionControl();

  if (cardSelectionControl.selectedCard == card) {
    return displayCard(
      card,
      `${styles.cardSelected} ${styles.card} ${styles.cardSelectable}`,
      () => cardSelectionControl.unselectCard(card)
    );
  }

  return displayCard(card, `${styles.card} ${styles.cardSelectable}`, () =>
    cardSelectionControl.selectCard(card)
  );
};

export const displayCard = (
  card: CardType,
  className?: string,
  onClick?: () => void,
  selectable?: boolean
) => {
  return (
    <div className={className ?? styles.card} onClick={onClick ?? (() => {})}>
      <Tooltip
        content={textOfCard(card)}
        color={"primary"}
        delay={500}
        offset={20}
        className={styles.cardToolTip}
      >
        <Image
          className={styles.cardImage}
          src={getImagePathForCard(card)}
          alt={textOfCard(card)}
          height={0}
          width={0}
          unoptimized
        ></Image>
      </Tooltip>
    </div>
  );
};

export default Card;
