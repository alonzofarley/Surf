import { CardEdition, CardType, PlayersState } from "@/utils/hearts/types";
import { AssignEditionsSelectForm } from "./assignEditionsSelectForm";
import { displayCard } from "./card";
import { editionKeyString } from "@/utils/hearts/cardHelpers";
import { usePlayersStateContext } from "./gameboard";

type AssignEditionsEditionViewProps = {};

export const AssignEditionsEditionView = (
  props: AssignEditionsEditionViewProps
) => {
  let playersState = usePlayersStateContext();

  let player = playersState.players[0];

  let unassignedEditions = player.inventory.unassignedEditions;
  return unassignedEditions.map((edition) => {
    if (edition.number < 1) return <></>;
    return (
      <div>
        <div>{editionKeyString(edition)}</div>
        <div>Amount in Inventory: {edition.number}</div>
      </div>
    );
  });
};
