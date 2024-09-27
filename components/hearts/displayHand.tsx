import { CardType } from "@/utils/hearts/types";
import Card from "./card";
import styles from "./../../styles/hearts.module.css";
import { useHandControlContext } from "./players";

type displayHandProps = {};
export const DisplayHand = (props: displayHandProps) => {
  const handControl = useHandControlContext();
  const hand = handControl.hand;

  return (
    <div className={styles.hand}>
      {hand.map((card: CardType, index) => (
        <Card key={index} card={card} />
      ))}
    </div>
  );
};
