import { MarketRepository } from "entity/Market";
import { GoodRepository } from "entity/Good";
import { BuyOfferRepository, BuyOffer } from "entity/BuyOffer";
import { SellOfferRepository, SellOffer } from "entity/SellOffer";
import { ConsumptionRepository } from "entity/Consumption";
import { ProductionRepository } from "entity/Production";
import { Good } from "entity/Good";
import { MarketActor } from "entity/MarketActor";
import { StorageRepository } from "entity/Storage";
import { PlayerRepository, Player } from "entity/Player";
import { FactoryRepository } from "entity/Factory";
import * as Entity from "entity/Market";

export class Market
{
    public static DefaultMarket;
    public static async Run(): Promise<void>
    {
        this.DefaultMarket = Entity.Market.GetById(1);

        for (const market of await Entity.Market.All()) {
            for (const good of await Good.All()) {
                /*const buyoffers = await BuyOfferRepository.find({
                    where: { good }, order: {
                        price: "DESC"
                    }
                });
                const selloffers = await SellOfferRepository.find({
                    where: { good }, order: {
                        price: "ASC"
                    }
                });
                const consumptions = await ConsumptionRepository.find(
                    {
                        where: { good },
                        order: {
                            maxprice: "DESC"
                        }
                    });
                const productions = await ProductionRepository.find({
                    where: { good }, order: {
                        minprice: "ASC"
                    }
                });

                while (buyoffers.length && selloffers.length) {
                    const buy = buyoffers[0];
                    const sell = selloffers[0];

                    if (buy.price >= sell.price) {

                        const transactionsize = Math.min(sell.amount, buy.amount);
                        const transactioncost = transactionsize * sell.price;
                        sell.amount -= transactionsize;
                        buy.amount -= transactionsize;
                        this.TransferCash(sell.MarketActor, transactioncost);
                        this.AddToStorage(buy.MarketActor, good, transactionsize);

                        const extracash = (buy.price - sell.price) * transactionsize;
                        this.TransferCash(buy.MarketActor, extracash);
                        // add buyer goods
                    }
                    else {
                        break;
                    }

                    if (buy.amount === 0) {
                        buyoffers.shift();
                        BuyOffer.Delete(buy.id);
                    }

                    if (sell.amount === 0) {
                        selloffers.shift();
                        SellOffer.Delete(sell.id);
                    }

                }
        */

            }

        }
    }

    public static async AddToStorage(actor: MarketActor, good: Good, amount: number): Promise<void>
    {
        const player = await Player.GetWithActor(actor.id);
        const factory = player.Factory;

        /*const record = await StorageRepository.findOne({
            where: {
                Factory: factory,
                Good: good,
            },
        });

        if (record) {
            record.amount += amount;
        } else {
            StorageRepository.create({
                Factory: factory,
                Good: good,
                amount,
            });
        }*/

    }

    public static async RemoveFromStorage(actor: MarketActor, good: Good, amount: number): Promise<boolean>
    {
        return false;
        /*const player = await PlayerRepository.findOne({
            where: {
                Actor: actor,
            },
        });

        const factory = player.Factory;

        const record = await StorageRepository.findOne({
            where: {
                Factory: factory,
                Good: good,
            },
        });

        if (!record || record.amount < amount) {
            return false;
        } else {
            record.amount -= amount;
        }*/

    }

    public static async TransferCash(actor: MarketActor, amount: number): Promise<void>
    {
        const player = await Player.GetWithActor(actor.id);

        player.cash += amount;
    }




    public static async AddBuyOffer(actor: MarketActor, good: Good, amount: number, price: number)
    {
        const player = await Player.GetWithActor(actor.id);

        if (player.cash < amount * price) {
            return;
        }

        this.TransferCash(player.Actor, -amount * price);

        const offer = new BuyOffer();
        offer.Market = this.DefaultMarket;
        offer.Good = good;
        offer.amount = amount;
        offer.MarketActor = actor;

        SellOffer.Insert(offer);
    }

    public static async AddSellOffer(actor: MarketActor, good: Good, amount: number, price: number)
    {
        const player = await Player.GetWithActor(actor.id);

        const res = await this.RemoveFromStorage(actor, good, amount);

        if (!res) {
            return;
        }

        const offer = new SellOffer();
        offer.Market = this.DefaultMarket;
        offer.Good = good;
        offer.amount = amount;
        offer.MarketActor = actor;

        SellOffer.Insert(offer);
    }
}