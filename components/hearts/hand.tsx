import styles from "./../../styles/hearts.module.css";
import { HandSortPanel } from "./handSortPanel";
import { DisplayHand } from "./displayHand";

type HandProps = {};

export const Hand = (props: HandProps) => {
  //const [hand, setHand] = useState(props.hand);

  return (
    <div className={styles.handContainer}>
      <DisplayHand />
      <HandSortPanel />
    </div>
  );
};
