import { Offcanvas } from "react-bootstrap";
import styles from "./../../styles/hearts.module.css";
import {
  AttachedId,
  CardEdition,
  CardType,
  Edition,
  EditionRarityType,
  EditionTypeType,
  NoEdition,
  PlayerType,
  PlayersState
} from "@/utils/hearts/types";
import { displayCard } from "./card";
import { usePlayersStateContext } from "./gameboard";
import {
  attachIdToData,
  editionKeyString,
  extractDataFromAttachedId,
  getEditionFromKeyString,
  getNoEdition
} from "@/utils/hearts/cardHelpers";
import { AssignEditionsSelectForm } from "./assignEditionsSelectForm";
import { AssignEditionsCardView } from "./assignEditionsCardView";
import { AssignEditionsEditionView } from "./assignEditionsEditionView";

type AssignEditionsViewProps = {
  showAssignEditions: boolean;
  setShowAssignEditions: (b: boolean) => void;
  player: PlayerType;
};
export const AssignEditionsView = (props: AssignEditionsViewProps) => {
  let playersState = usePlayersStateContext();

  if (playersState.players[0].hand.length < 1) {
    return <></>;
  }

  return (
    <>
      <ToggleAssignEditionsButton
        setShowAssignEditions={props.setShowAssignEditions}
        show={true}
      />
      <Offcanvas
        show={props.showAssignEditions}
        className={`${styles.assignEditionsView} ${styles.offCanvasDiv}`}
      >
        <Offcanvas.Header>
          <h4>Assign Editions To Cards</h4>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <div className={styles.assignEditionsBody}>
            <h3>Editions in Inventory</h3>
            <AssignEditionsEditionView />
            <h3>Cards In Hand</h3>
            <AssignEditionsCardView />
          </div>
        </Offcanvas.Body>
        <ToggleAssignEditionsButton
          setShowAssignEditions={props.setShowAssignEditions}
          show={false}
        />
      </Offcanvas>
    </>
  );
};

const ToggleAssignEditionsButton = (props: {
  setShowAssignEditions: (b: boolean) => void;
  show: boolean;
}) => {
  return (
    <button
      onClick={() => props.setShowAssignEditions(props.show)}
      className={styles.setShowAssignEditionsButton}
    >
      {props.show ? "Assign Editions" : "Close"}
    </button>
  );
};
