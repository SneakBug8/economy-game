import { MarketOffer } from "./MarketOffer";
import { Entity, getRepository } from "typeorm";

@Entity()
export class SellOffer extends MarketOffer
{

}

export const SellOfferRepository = getRepository(SellOffer);
