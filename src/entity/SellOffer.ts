import { MarketOffer } from "entity/MarketOffer";
import { Entity, getRepository } from "typeorm";

@Entity()
export class SellOffer extends MarketOffer
{

}

export const SellOfferRepository = getRepository(SellOffer);
