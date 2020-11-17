import { BuyOffer } from "entity/BuyOffer";
import { SellOffer } from "entity/SellOffer";
import { Good } from "entity/Good";
import { MarketActor } from "entity/MarketActor";
import { Player } from "entity/Player";
import { Storage } from "entity/Storage";
import { Consumption } from "entity/Consumption";
import { Production } from "entity/Production";
import { TurnsService } from "./TurnsService";
import { Market } from "entity/Market";
import { PriceRecord } from "entity/PriceRecord";
import { EventsList } from "events/EventsList";
import { ITradeEvent, TradeEventType } from "events/types/TradeEvent";
import { PlayerService } from "./PlayerService";
import { Config } from "config";

export class MarketService
{
    public static async Init(): Promise<void>
    {
        Market.DefaultMarket = await Market.GetById(1);
    }

    public static async Run(): Promise<void>
    {

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
                        const buyactor = await buy.getActor();
                        const sellactor = await sell.getActor();
                        const buyerplayer = await Player.GetWithActor(buyactor);
                        const sellerplayer = await Player.GetWithActor(sellactor);

                        const transactionsize = Math.min(sell.amount, buy.amount);
                        const transactioncost = transactionsize * sell.price;

                        if (!await Player.HasCash(buyerplayer.id, transactioncost)) {
                            buyoffers.shift();
                            BuyOffer.Delete(buy.id);
                            continue;
                        }

                        if (transactionsize < 1) {
                            return;
                        }

                        sell.amount -= transactionsize;
                        buy.amount -= transactionsize;

                        // Take taxes for market trading from seller
                        const taxcost = Math.round(transactioncost * Config.MarketTaxPercent);

                        await this.TransferCash(buyactor, sellactor, transactioncost - taxcost);
                        await buyerplayer.payCashToState(taxcost);
                        await Storage.AddGoodTo(buyactor.id, good.id, transactionsize);

                        PlayerService.SendOffline(sellerplayer.id,
                            `Sold ${transactionsize} ${good.name} for ${transactioncost} to ${buyerplayer.username}, tax: ${taxcost}`);
                        PlayerService.SendOffline(buyerplayer.id,
                            `Bought ${transactionsize} ${good.name} for ${transactioncost} from ${sellerplayer.username}. tax: ${taxcost}`);

                        EventsList.onTrade.emit({
                            Type: TradeEventType.ToPlayer,
                            Actor: sellactor,
                            Good: good,
                            Amount: transactionsize,
                            Price: sell.price,
                        });
                        EventsList.onTrade.emit({
                            Type: TradeEventType.FromPlayer,
                            Actor: buyactor,
                            Good: good,
                            Amount: transactionsize,
                            Price: sell.price,
                        });
                    }
                    else {
                        break;
                    }

                    if (buy.amount === 0) {
                        buyoffers.shift();
                        BuyOffer.Delete(buy.id);
                    }
                    else {
                        BuyOffer.Update(buy);
                    }

                    if (sell.amount === 0) {
                        selloffers.shift();
                        SellOffer.Delete(sell.id);
                    }
                    else {
                        SellOffer.Update(sell);
                    }
                }

                // Buyers vs production
                while (buyoffers.length && productions.length) {
                    const buy = buyoffers[0];
                    const production = productions[0];
                    const buyactor = await buy.getActor();

                    if (buy.price >= production.minprice) {
                        const transactionsize = Math.min(buy.amount, production.amount);
                        const transactioncost = transactionsize * buy.price;

                        const buyerplayer = await Player.GetWithActor(buyactor);

                        if (buyerplayer.cash < transactioncost || transactionsize < 1) {
                            return;
                        }

                        const transactionres = await buyerplayer.payCashToState(transactioncost);
                        if (!transactionres) {
                            return;
                        }

                        buy.amount -= transactionsize;
                        production.amount -= transactionsize;

                        await Storage.AddGoodTo(buyactor.id, good.id, transactionsize);

                        PlayerService.SendOffline(buyerplayer.id,
                            `Bought ${transactionsize} ${good.name} for ${transactioncost} from State`);

                        EventsList.onTrade.emit({
                            Type: TradeEventType.FromGovernment,
                            Actor: buyactor,
                            Good: good,
                            Amount: transactionsize,
                            Price: buy.price,
                        });
                    }
                    else {
                        break;
                    }

                    if (buy.amount === 0) {
                        buyoffers.shift();
                        BuyOffer.Delete(buy.id);
                    }
                    else {
                        BuyOffer.Update(buy);
                    }

                    if (production.amount === 0) {
                        productions.shift();
                    }
                }

                // Sellers vs consumption
                while (selloffers.length && consumptions.length) {
                    const sell = selloffers[0];
                    const consumption = consumptions[0];

                    const sellactor = await sell.getActor();
                    const sellerplayer = await Player.GetWithActor(sellactor);

                    if (sell.price <= consumption.maxprice) {
                        const transactionsize = Math.min(sell.amount, consumption.amount);
                        const transactioncost = transactionsize * sell.price;

                        sell.amount -= transactionsize;
                        consumption.amount -= transactionsize;

                        const taxcost = Math.round(transactioncost * Config.MarketTaxPercent);
                        await sellerplayer.takeCashFromState(transactioncost - taxcost);

                        PlayerService.SendOffline(sellerplayer.id,
                            `Sold ${transactionsize} ${good.name} for ${transactioncost} to State, tax: ${taxcost}`);

                        EventsList.onTrade.emit({
                            Type: TradeEventType.ToGovernment,
                            Actor: sellactor,
                            Good: good,
                            Amount: transactionsize,
                            Price: sell.price,
                        });
                    }
                    else {
                        break;
                    }

                    if (sell.amount === 0) {
                        selloffers.shift();
                        SellOffer.Delete(sell.id);
                    }
                    else {
                        SellOffer.Update(sell);
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

    public static async TransferCash(from: MarketActor, to: MarketActor, amount: number): Promise<void>
    {
        const playerfrom = await Player.GetWithActor(from);
        const playerto = await Player.GetWithActor(to);

        playerfrom.payCash(playerto, amount);
    }

    public static async RedeemSellOffer(buyactor: MarketActor, sell: SellOffer, size: number = null)
    {
        const buyplayer = await Player.GetWithActor(buyactor);
        const sellactor = await sell.getActor();
        const sellerplayer = await Player.GetWithActor(sellactor);

        if (buyactor.id === sellactor.id) {
            return "Can't trade with yourself";
        }

        let transactionsize = sell.amount;
        if (size) {
            transactionsize = Math.min(sell.amount, size);
        }
        const transactioncost = transactionsize * sell.price;

        if (buyplayer.cash < transactioncost) {
            return "Not enough cash";
        }

        const good = await sell.getGood();

        sell.amount -= transactionsize;

        const taxcost = Math.round(transactioncost * Config.MarketTaxPercent);
        await buyplayer.payCash(sellerplayer, transactioncost - taxcost);
        await buyplayer.payCashToState(taxcost);
        await Storage.AddGoodTo(buyactor.id, good.id, transactionsize);

        PlayerService.SendOffline(sellerplayer.id,
            `Sold ${transactionsize} ${good.name} for ${transactioncost} to ${buyplayer.username}, tax: ${taxcost}`);
        PlayerService.SendOffline(buyplayer.id,
            `Bought ${transactionsize} ${good.name} for ${transactioncost} from ${sellerplayer.username}. tax: ${taxcost}`);

        EventsList.onTrade.emit({
            Type: TradeEventType.ToPlayer,
            Actor: sellactor,
            Good: good,
            Amount: transactionsize,
            Price: sell.price,
        });
        EventsList.onTrade.emit({
            Type: TradeEventType.FromPlayer,
            Actor: buyactor,
            Good: good,
            Amount: transactionsize,
            Price: sell.price,
        });

        if (sell.amount === 0) {
            SellOffer.Delete(sell.id);
        }
        else {
            SellOffer.Update(sell);
        }
    }

    public static async RedeemBuyOffer(sellactor: MarketActor, buy: SellOffer, size: number = null)
    {
        const sellerplayer = await Player.GetWithActor(sellactor);
        const buyactor = await buy.getActor();
        const buyplayer = await Player.GetWithActor(buyactor);

        if (buyactor.id === sellactor.id) {
            return "Can't trade with yourself";
        }

        let transactionsize = buy.amount;
        if (size) {
            transactionsize = Math.min(buy.amount, size);
        }
        const transactioncost = transactionsize * buy.price;

        const good = await buy.getGood();

        if (buyplayer.cash < transactioncost) {
            return "Buyer doesn't have enough cash";
        }

        if (!Storage.Has(sellactor, good, transactionsize)) {
            return "Not enough resources";
        }

        buy.amount -= transactionsize;

        const taxcost = Math.round(transactioncost * Config.MarketTaxPercent);
        await buyplayer.payCash(sellerplayer, transactioncost - taxcost);
        await buyplayer.payCashToState(taxcost);
        await Storage.AddGoodTo(buyactor.id, good.id, transactionsize);

        PlayerService.SendOffline(sellerplayer.id,
            `Sold ${transactionsize} ${good.name} for ${transactioncost} to ${buyplayer.username}, tax: ${taxcost}`);
        PlayerService.SendOffline(buyplayer.id,
            `Bought ${transactionsize} ${good.name} for ${transactioncost} from ${sellerplayer.username}. tax: ${taxcost}`);

        EventsList.onTrade.emit({
            Type: TradeEventType.ToPlayer,
            Actor: sellactor,
            Good: good,
            Amount: transactionsize,
            Price: buy.price,
        });
        EventsList.onTrade.emit({
            Type: TradeEventType.FromPlayer,
            Actor: buyactor,
            Good: good,
            Amount: transactionsize,
            Price: buy.price,
        });


        if (buy.amount === 0) {
            BuyOffer.Delete(buy.id);
        }
        else {
            BuyOffer.Update(buy);
        }
    }

    public static async AddBuyOffer(actor: MarketActor, good: Good, amount: number, price: number)
    {
        return await BuyOffer.Create(good, amount, price, actor);
    }

    public static async AddSellOffer(actor: MarketActor, good: Good, amount: number, price: number)
    {
        return await SellOffer.Create(good, amount, price, actor);
    }

    public static async CountDemand(good: Good)
    {
        let demand = 0;
        const offers = await BuyOffer.GetWithGoodOrdered(good);

        for (const entry of offers) {
            demand += entry.amount;
        }

        const consumptions = await Consumption.GetWithGood(good);

        for (const entry of consumptions) {
            demand += entry.amount;
        }

        return demand;
    }

    public static async CountSupply(good: Good)
    {
        let supply = 0;
        const offers = await SellOffer.GetWithGoodOrdered(good);

        for (const entry of offers) {
            supply += entry.amount;
        }

        const productions = await Production.GetWithGood(good);

        for (const entry of productions) {
            supply += entry.amount;
        }

        return supply;
    }


}