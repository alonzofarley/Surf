import { displayCard } from "./card";
import { useCurrentHighlightedCardContext } from "./gameboard";
import styles from "./../../styles/hearts.module.css";

type DisplayCardInfoProps = {};
export const DisplayCardInfo = (props: DisplayCardInfoProps) => {
  let currentHighlightedState = useCurrentHighlightedCardContext();
  let highlightedCard = currentHighlightedState.highlightedCard;
  if (!highlightedCard) return <></>;
  return (
    <div className={styles.displayCardInfo}>
      <h2>Card Info </h2>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "start",
          gap: "30px"
        }}
      >
        <div>
          <h6>Card</h6>
          <div>{displayCard(highlightedCard)}</div>
        </div>
        <div>
          <h6>Edition </h6>
          <div>
            {highlightedCard.edition.type}{" "}
            {highlightedCard.edition.type == "none"
              ? ""
              : highlightedCard.edition.rarity}
          </div>
        </div>
      </div>
    </div>
  );
};
