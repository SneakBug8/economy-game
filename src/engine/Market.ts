import { BuyOffer } from "entity/BuyOffer";
import { SellOffer } from "entity/SellOffer";
import { Good } from "entity/Good";
import { MarketActor } from "entity/MarketActor";
import { Player } from "entity/Player";
import * as Entity from "entity/Market";
import { Storage } from "entity/Storage";

export class Market
{
    public static DefaultMarket;
    public static async Run(): Promise<void>
    {
        this.DefaultMarket = Entity.Market.GetById(1);

        for (const market of await Entity.Market.All()) {
            for (const good of await Good.All()) {

                const buyoffers = await BuyOffer.GetWithGoodOrdered(good);
                const selloffers = await SellOffer.GetWithGoodOrdered(good);
                /*const consumptions = await ConsumptionRepository.find(
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
                });*/

                while (buyoffers.length && selloffers.length) {
                    const buy = buyoffers[0];
                    const sell = selloffers[0];

                    if (buy.price >= sell.price) {

                        const transactionsize = Math.min(sell.amount, buy.amount);
                        const transactioncost = transactionsize * sell.price;
                        sell.amount -= transactionsize;
                        buy.amount -= transactionsize;
                        this.TransferCash(sell.MarketActor, transactioncost);
                        const buyerplayer = await Player.GetWithActor(buy.id);
                        Storage.AddGoodTo(buyerplayer.Factory, good, transactionsize);

                        const extracash = (buy.price - sell.price) * transactionsize;
                        this.TransferCash(buy.MarketActor, extracash);
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
            }

        }
    }

    /*public static async AddToStorage(actor: MarketActor): Promise<void>
    {
        const player = await Player.GetWithActor(actor.id);

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

    //}
/*
    public static async RemoveFromStorage(): Promise<boolean>
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

    //}*/

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

    public static async AddSellOffer(actor: MarketActor, good: Good, amount: number)
    {
        const player = await Player.GetWithActor(actor.id);
        const res = await Storage.TakeGoodFrom(player.Factory, good, amount);

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