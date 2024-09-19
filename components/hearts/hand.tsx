import { CardType } from "@/utils/hearts/types";
import styles from "./../../styles/hearts.module.css";
import { HandSortPanel } from "./handSortPanel";
import { DisplayHand } from "./displayHand";

type HandProps = {
  hand: CardType[];
  setHand: (h: CardType[]) => void;
};

export const Hand = (props: HandProps) => {
  //const [hand, setHand] = useState(props.hand);

  return (
    <div className={styles.hand}>
      <DisplayHand hand={props.hand} />
      <HandSortPanel hand={props.hand} setHand={props.setHand} />
    </div>
  );
};
