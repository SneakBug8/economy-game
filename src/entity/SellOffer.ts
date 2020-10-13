import { MarketOffer } from "./MarketOffer";
import { Connection } from "DB";

export class SellOffer extends MarketOffer
{

}

export const SellOfferRepository = Connection("SellOffers");