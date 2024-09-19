import { CardType } from "@/utils/hearts/types";
import { sortHand } from "@/utils/hearts/cardHelpers";
import styles from "./../../styles/hearts.module.css";

type HandSortPanelProps = {
  setHand: (h: CardType[]) => void;
  hand: CardType[];
};

export const HandSortPanel = (props: HandSortPanelProps) => {
  //const hand = useHandContext();
  const hand = props.hand;

  return (
    <div className={styles.sortPanel}>
      <label>Sort by</label>
      <div className={styles.sortPanelButtonGroup}>
        <button
          className={styles.sortPanelButton}
          onClick={() => {
            props.setHand(sortHand("suit", hand));
          }}
        >
          Suit
        </button>
        <button
          className={styles.sortPanelButton}
          onClick={() => {
            props.setHand(sortHand("value", hand));
          }}
        >
          Value
        </button>
      </div>
    </div>
  );
};
