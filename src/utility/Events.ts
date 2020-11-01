import { TypedEvent } from "./TypedEvent";
import { BuyOffer } from "entity/BuyOffer";
import { SellOffer } from "entity/SellOffer";

export const Events = {
    onNewBuyOffer: new TypedEvent<BuyOffer>(),
    onNewSellOffer: new TypedEvent<SellOffer>()
}