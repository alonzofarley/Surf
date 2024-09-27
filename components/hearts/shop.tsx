import { Card, Offcanvas } from "react-bootstrap";
import styles from "./../../styles/hearts.module.css";
import {
  CardEdition,
  Changes,
  EditionConst,
  EditionRarity,
  EditionRarityType
} from "@/utils/hearts/types";
import { useEffect, useState } from "react";

type ShopProps = {
  showShop: boolean;
  setShowShop: (b: boolean) => void;
  coins: number;
  submitChanges: (c: Changes) => void;
};

export const Shop = (props: ShopProps) => {
  let [shopOptions, setOptions] = useState(
    undefined as ShopOptions | undefined
  );
  let [changes, setChanges] = useState({
    coinsLeft: props.coins,
    newEditions: []
  } as Changes);
  useEffect(() => {
    if (props.showShop) {
      setOptions(generateShopOptions());
    }
  }, [props.showShop]);

  const endShop = () => {
    props.setShowShop(false);
    props.submitChanges(changes);
  };

  const buy = (item: ShopOption) => () => {
    setChanges((c) => {
      return {
        coinsLeft: c.coinsLeft - item.coinCost,
        newEditions: [...c.newEditions, item.cardEdition]
      };
    });
    let idx = shopOptions?.options.findIndex((opt) => opt == item);
    if (idx == -1 || idx == undefined)
      throw Error("will implement error later");
    setOptions({
      options: [
        ...shopOptions!.options.slice(0, idx),
        ...shopOptions!.options.slice(idx + 1, shopOptions!.options.length)
      ]
    });
  };

  if (!shopOptions) {
    return (
      <>
        <button
          onClick={() => props.setShowShop(true)}
          className={styles.hideShopButton}
        >
          Show Shop
        </button>
      </>
    );
  }

  let rarityClass = (rarity: EditionRarityType) => {
    if (rarity == "common") return styles.common;
    if (rarity == "uncommon") return styles.uncommon;
    if (rarity == "rare") return styles.rare;
    if (rarity == "legendary") return styles.legendary;
  };

  return (
    <>
      <button
        onClick={() => props.setShowShop(true)}
        className={styles.hideShopButton}
      >
        Show Shop
      </button>

      <Offcanvas
        show={props.showShop}
        className={`${styles.shopContainer} ${styles.offCanvasDiv}`}
      >
        <Offcanvas.Header>
          <h4>Shop</h4>
        </Offcanvas.Header>
        <Offcanvas.Body className={`${styles.shopBody}`}>
          <div>Current Balance: {props.coins}</div>
          <div className={`${styles.shopOptions}`}>
            {shopOptions.options.map((option) => {
              return (
                <Card className={`${styles.shopOptionCard}`}>
                  <Card.Header>
                    <h6
                      className={`${styles.shopOptionEdition} + ${rarityClass(option.cardEdition.rarity)}`}
                    >
                      {option.cardEdition.type}
                    </h6>
                  </Card.Header>
                  <Card.Body>Cost: {option.coinCost} Coins</Card.Body>
                  <Card.Footer>
                    <button
                      disabled={changes.coinsLeft < option.coinCost}
                      onClick={buy(option)}
                    >
                      Buy
                    </button>
                  </Card.Footer>
                </Card>
              );
            })}
          </div>
          <button onClick={endShop} className={styles.hideShopButton}>
            Close Shop
          </button>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

type ShopOptions = {
  options: ShopOption[];
};

type ShopOption = {
  cardEdition: CardEdition;
  coinCost: number;
};

const generateShopOptions: () => ShopOptions = () => {
  return {
    options: getRandomOptions(3)
  };
};

const getRandomOptions = (n: number) => {
  let options: ShopOption[] = [];

  while (n > 0) {
    let randomEdition =
      EditionConst[Math.floor(Math.random() * EditionConst.length)];

    let randomRarity = getRandomEditionRarity(EditionRarity);
    let cardEdition = attachRarityToEdition(randomEdition, randomRarity);
    options.push({
      cardEdition: cardEdition,
      coinCost: getRarityCost(cardEdition.rarity)
    });
    n--;
  }

  return options;
};

const getRarityCost = (rarity: EditionRarityType) => {
  switch (rarity) {
    case "common":
      return 20;
    case "uncommon":
      return 30;
    case "rare":
      return 40;
    case "legendary":
      return 50;
  }
};

const attachRarityToEdition = (
  edition: (typeof EditionConst)[number],
  rarity: EditionRarityType
): CardEdition => {
  switch (edition) {
    case "extra_damage":
      switch (rarity) {
        case "common":
          return {
            type: "extra_damage",
            damageScalar: 1.5,
            rarity: rarity
          };
        case "uncommon":
          return {
            type: "extra_damage",
            damageScalar: 2,
            rarity: rarity
          };
        case "rare":
          return {
            type: "extra_damage",
            damageScalar: 3,
            rarity: rarity
          };
        case "legendary":
          return {
            type: "extra_damage",
            damageScalar: 1.5,
            rarity: rarity
          };
      }
    case "extra_chips":
      switch (rarity) {
        case "common":
          return {
            type: "extra_chips",
            chipsScalar: 5,
            rarity: rarity
          };
        case "uncommon":
          return {
            type: "extra_chips",
            chipsScalar: 10,
            rarity: rarity
          };
        case "rare":
          return {
            type: "extra_chips",
            chipsScalar: 20,
            rarity: rarity
          };
        case "legendary":
          return {
            type: "extra_chips",
            chipsScalar: 30,
            rarity: rarity
          };
      }
    case "switch_cards":
      switch (rarity) {
        case "common":
          return {
            type: "switch_cards",
            direction: "clockwise",
            rarity: "common"
          };
        case "uncommon":
          return {
            type: "switch_cards",
            direction: "clockwise",
            rarity: "common"
          };
        case "rare":
          return {
            type: "switch_cards",
            direction: "clockwise",
            rarity: "common"
          };
        case "legendary":
          return {
            type: "switch_cards",
            direction: "clockwise",
            rarity: "common"
          };
      }
    default:
      throw Error("not valid card edition");
  }
};

function getRandomEditionRarity(editionRarities: typeof EditionRarity) {
  const totalChance = editionRarities.reduce(
    (sum, item) => sum + item.relativeChance,
    0
  );

  const random = Math.random() * totalChance;
  let cumulativeChance = 0;

  for (const itemWithChance of editionRarities) {
    cumulativeChance += itemWithChance.relativeChance;
    if (random < cumulativeChance) {
      return itemWithChance.type;
    }
  }
  throw Error("Error in random rarity selection");
}
