import { CardEdition, CardType, PlayersState } from "@/utils/hearts/types";
import { AssignEditionsSelectForm } from "./assignEditionsSelectForm";
import { displayCard } from "./card";
import { usePlayersStateContext } from "./gameboard";

type AssignEditionsCardViewProps = {};

export const AssignEditionsCardView = (props: AssignEditionsCardViewProps) => {
  let playersState = usePlayersStateContext();
  let player = playersState.players[0];

  let editions = player.inventory.editions;
  let cards = player.hand;
  return cards.map((card, i) => {
    return (
      <div style={{ display: "flex", flexDirection: "row" }}>
        {displayCard(card)}
        <AssignEditionsSelectForm
          playersState={playersState}
          editions={editions}
          card={card}
          i={i}
        />
      </div>
    );
  });
};
