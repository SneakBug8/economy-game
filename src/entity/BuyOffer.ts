import { MarketOffer } from "./MarketOffer";
import { Connection } from "DB";

export class BuyOffer extends MarketOffer
{
}

export const BuyOfferRepository = Connection("BuyOffers");