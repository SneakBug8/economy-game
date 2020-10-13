import { MarketOffer } from "entity/MarketOffer";
import { Good } from "entity/Good";
import { Market } from "entity/Market";
import { Entity, getRepository } from "typeorm";

@Entity()
export class BuyOffer extends MarketOffer
{
}

export const BuyOfferRepository = getRepository(BuyOffer);