import {
  attachIdToData,
  editionKeyString,
  extractDataFromAttachedId,
  getEditionFromKeyString
} from "@/utils/hearts/cardHelpers";
import {
  AttachedId,
  CardEdition,
  CardType,
  PlayersState
} from "@/utils/hearts/types";

type AssignEditionsSelectFormProps = {
  playersState: PlayersState;
  editions: (CardEdition & { number: number })[];
  card: CardType;
  i: number;
};

export const AssignEditionsSelectForm = (
  props: AssignEditionsSelectFormProps
) => {
  let card = props.card;
  return (
    <select
      onChange={handleSelectChange(props.playersState, props.editions, {
        ...card,
        id: props.i
      })}
      value={editionKeyString(card.edition)}
    >
      <option value={"none"} key={-1}>
        None
      </option>
      {props.editions.map((edition) => {
        if (
          edition.number < 1 &&
          !(
            card.edition.type == edition.type &&
            card.edition.rarity == edition.rarity
          )
        ) {
          return <></>;
        }
        return (
          <option
            value={editionKeyString(edition)}
            key={editionKeyString(edition)}
          >
            {editionKeyString(edition)}
          </option>
        );
      })}
    </select>
  );
};

const handleSelectChange =
  (
    playersState: PlayersState,
    editions: (CardEdition & { number: number })[],
    selectedCard: AttachedId<CardType>
  ) =>
  (e: any) => {
    let editionKeyString = e.target.value;
    let edition: CardEdition = getEditionFromKeyString(editionKeyString);

    playersState.setPlayers((_players) => {
      return _players.map((p, i) => {
        if (i != 0) {
          return p;
        }

        let newEditions = editions.map((e) => {
          if (e.type == edition.type && e.rarity == edition.rarity) {
            return { ...e, number: e.number - 1 };
          }
          return e;
        });

        let currentCardEdition = selectedCard.edition;
        if (currentCardEdition.type != "none") {
          newEditions = newEditions.map((e) => {
            if (
              e.type == currentCardEdition.type &&
              e.rarity == currentCardEdition.rarity
            ) {
              return { ...e, number: e.number + 1 };
            }
            return e;
          });
        }

        return {
          ...p,
          inventory: {
            ...p.inventory,
            editions: newEditions
          },
          hand: p.hand
            .map((c, j) => {
              return attachIdToData(c, j);
            })
            .map((c) => {
              if (c.id != selectedCard.id) return c;
              return {
                ...c,
                edition: edition
              };
            })
            .map((c) => {
              return extractDataFromAttachedId(c);
            })
        };
      });
    });
  };
