import { TypedEvent } from "./TypedEvent";
import { BuyOffer } from "entity/BuyOffer";
import { SellOffer } from "entity/SellOffer";
import { ProductionEvent } from "./types/ProductionEvent";
import { ITradeEvent } from "./types/TradeEvent";
import { Turn } from "entity/Turn";

export const EventsList = {
    onNewBuyOffer: new TypedEvent<BuyOffer>(),
    onNewSellOffer: new TypedEvent<SellOffer>(),
    onProduction: new TypedEvent<ProductionEvent>(),
    onTrade: new TypedEvent<ITradeEvent>(),
    onTurn: new TypedEvent<Turn>(),
};
