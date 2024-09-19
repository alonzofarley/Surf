import { CardType } from "@/utils/hearts/types";
import { sortHand } from "@/utils/hearts/cardHelpers";
import styles from "./../../styles/hearts.module.css";
import { useHandControlContext } from "./players";

type HandSortPanelProps = {};

export const HandSortPanel = (props: HandSortPanelProps) => {
  const handControl = useHandControlContext();
  const hand = handControl.hand;
  const setHand = handControl.setHand;
  return (
    <div className={styles.sortPanel}>
      <label>Sort by</label>
      <div className={styles.sortPanelButtonGroup}>
        <button
          className={styles.sortPanelButton}
          onClick={() => {
            setHand(sortHand("suit", hand));
          }}
        >
          Suit
        </button>
        <button
          className={styles.sortPanelButton}
          onClick={() => {
            setHand(sortHand("value", hand));
          }}
        >
          Value
        </button>
      </div>
    </div>
  );
};
