import { MarketOffer } from "./MarketOffer";
import { Entity, getRepository } from "typeorm";

@Entity()
export class BuyOffer extends MarketOffer
{
}

export const BuyOfferRepository = getRepository(BuyOffer);