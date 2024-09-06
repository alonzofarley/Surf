import { Controls, State } from "@/utils/stocksTypes";
import { Accordion, Button, Card, Modal } from "react-bootstrap";

// https://react-bootstrap.netlify.app/docs/components/offcanvas
type StocksShopProps = {
    visible: boolean, 
    controls: Controls, 
    state: State
}

type ShopItem = {
    name: string, 
    cost: number
}

export function StocksShop(props: StocksShopProps) {
    let visible = props.visible;
    let controls = props.controls;
    let state = props.state;


    let shopItems: ShopItem[] = [{
        name: "Item 1", 
        cost: 2
    }, {
        name:"item 2", 
        cost: 5
    }, {
        name: "item 3", 
        cost: 1
    }];

    return <Modal show={visible} onHide={() => {}} backdrop="static" centered>
    <Modal.Header>
      <Modal.Title>Shop</Modal.Title>
    </Modal.Header>
    <Modal.Body>
        <Card>
            <Card.Header>
                You have ${state.stats.currentShopBalance} to spend
            </Card.Header>
            <Card.Body>
                <Accordion>
                    {shopItems.map((shopItem, i) => {
                        return <Accordion.Item eventKey={i.toString()} key={i.toString()}>
                            <Accordion.Header>{shopItem.name}</Accordion.Header>
                            <Accordion.Body>{shopItem.cost}</Accordion.Body>
                        </Accordion.Item>
                    })})
                </Accordion>
            </Card.Body>
        </Card>
    </Modal.Body>
    <Modal.Footer>
      <Button variant="secondary" onClick={() => controls.shopEnded()}>
        Close
      </Button>
    </Modal.Footer>
  </Modal>
}

