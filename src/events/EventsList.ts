import { TypedEvent } from "./TypedEvent";
import { BuyOffer } from "entity/BuyOffer";
import { SellOffer } from "entity/SellOffer";
import { ProductionEvent } from "./types/ProductionEvent";
import { ITradeEvent } from "./types/TradeEvent";
import { Turn } from "entity/Turn";
import { RGOGainEvent } from "./types/RGOGainEvent";

export const EventsList = {
    onNewBuyOffer: new TypedEvent<BuyOffer>(),
    onNewSellOffer: new TypedEvent<SellOffer>(),
    onProduction: new TypedEvent<ProductionEvent>(),
    onRGOGain: new TypedEvent<RGOGainEvent>(),
    beforeMarket: new TypedEvent<void>(),
    afterMarket: new TypedEvent<void>(),
    onTrade: new TypedEvent<ITradeEvent>(),
    onAfterNewTurn: new TypedEvent<Turn>(),
    onBeforeNewTurn: new TypedEvent<Turn>(),
};
