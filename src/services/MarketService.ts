import { BuyOffer } from "entity/BuyOffer";
import { SellOffer } from "entity/SellOffer";
import { Good } from "entity/Good";
import { MarketActor } from "entity/MarketActor";
import { Player } from "entity/Player";
import { Storage } from "entity/Storage";
import { Consumption } from "entity/Consumption";
import { Production } from "entity/Production";
import { Turn } from "entity/Turn";
import { TurnsService } from "./TurnsService";
import { Market } from "entity/Market";

export class MarketService
{
    public static async Run(): Promise<void>
    {
        Market.DefaultMarket = await Market.GetById(1);

        for (const market of await Market.All()) {
            for (const good of await Good.All()) {

                const buyoffers = await BuyOffer.GetWithGoodOrdered(good);
                const selloffers = await SellOffer.GetWithGoodOrdered(good);

                const consumptions = await Consumption.GetWithGood(good);
                const productions = await Production.GetWithGood(good);

                // Offers vs offers
                while (buyoffers.length && selloffers.length) {
                    const buy = buyoffers[0];
                    const sell = selloffers[0];

                    if (buy.price >= sell.price) {

                        const buyerplayer = await Player.GetWithActor(buy.id);

                        const transactionsize = Math.min(sell.amount, buy.amount);
                        const transactioncost = transactionsize * sell.price;

                        if (!Player.HasCash(buyerplayer.id, transactioncost)) {
                            buyoffers.shift();
                            BuyOffer.Delete(buy.id);
                            continue;
                        }

                        sell.amount -= transactionsize;
                        buy.amount -= transactionsize;

                        this.TransferCash(buy.MarketActor, -transactioncost);
                        this.TransferCash(sell.MarketActor, transactioncost);
                        Storage.AddGoodTo(buyerplayer.Factory, good, transactionsize);
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

                // Buyers vs production
                while (buyoffers.length && productions.length) {
                    const buy = buyoffers[0];
                    const production = productions[0];

                    if (buy.price >= production.minprice) {
                        const transactionsize = Math.min(buy.amount, production.amount);
                        const transactioncost = transactionsize * buy.price;

                        buy.amount -= transactionsize;
                        production.amount -= transactionsize;

                        this.TransferCash(buy.MarketActor, -transactioncost);
                        Turn.CurrentTurn.ModifyFreeCash(transactioncost);
                        const buyerplayer = await Player.GetWithActor(buy.id);
                        Storage.AddGoodTo(buyerplayer.Factory, good, transactionsize);
                    }
                    else {
                        break;
                    }

                    if (buy.amount === 0) {
                        buyoffers.shift();
                        BuyOffer.Delete(buy.id);
                    }

                    if (production.amount === 0) {
                        productions.shift();
                    }
                }

                // Sellers vs consumption
                while (selloffers.length && consumptions.length) {
                    const sell = selloffers[0];
                    const consumption = consumptions[0];

                    if (sell.price <= consumption.maxprice) {
                        const transactionsize = Math.min(sell.amount, consumption.amount);
                        const transactioncost = transactionsize * sell.price;

                        sell.amount -= transactionsize;
                        consumption.amount -= transactionsize;

                        this.TransferCash(sell.MarketActor, transactioncost);
                        Turn.CurrentTurn.ModifyFreeCash(-transactioncost);
                    }
                    else {
                        break;
                    }

                    if (sell.amount === 0) {
                        selloffers.shift();
                        SellOffer.Delete(sell.id);
                    }

                    if (consumption.amount === 0) {
                        consumptions.shift();
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

        Player.Update(player);
    }

    public static async AddBuyOffer(actor: MarketActor, good: Good, amount: number, price: number)
    {
        const player = await Player.GetWithActor(actor.id);

        if (player.cash < amount * price) {
            return;
        }

        const offer = new BuyOffer();
        offer.Market = Market.DefaultMarket;
        offer.Good = good;
        offer.amount = amount;
        offer.MarketActor = actor;

        SellOffer.Insert(offer);
    }

    public static async AddSellOffer(actor: MarketActor, good: Good, amount: number)
    {
        const player = await Player.GetWithActor(actor.id);
        const res = await Storage.Has(player.Factory, good, amount);

        if (!res) {
            return;
        }

        const offer = new SellOffer();
        offer.Market = Market.DefaultMarket;
        offer.Good = good;
        offer.amount = amount;
        offer.MarketActor = actor;

        SellOffer.Insert(offer);
    }
}